/**
 * 분석 서비스
 * IPC 핸들러를 등록하고 영상 분석 요청을 처리합니다.
 */

const { dialog, app } = require('electron');
const path = require('path');
const os = require('os');
const { getEngine } = require('./gfengine-wrapper');
const videoProcessor = require('./video-processor');

/**
 * IPC 핸들러 설정
 * @param {Electron.IpcMain} ipcMain - IpcMain 인스턴스
 */
function setupAnalysisHandlers(ipcMain) {
  const engine = getEngine();

  // ==========================================
  // 엔진 초기화 및 기본 정보
  // ==========================================

  /**
   * 엔진 초기화
   */
  ipcMain.handle('gfengine:initialize', async (event, { direction, clubType, handedId }) => {
    try {
      console.log('엔진 초기화 요청:', { direction, clubType, handedId });
      
      const success = await engine.initialize(direction, clubType, handedId);
      
      return {
        success,
        message: success ? '초기화 성공' : '초기화 실패',
      };
    } catch (error) {
      console.error('엔진 초기화 에러:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  });

  /**
   * 버전 정보
   */
  ipcMain.handle('gfengine:version', async () => {
    try {
      return engine.getVersion();
    } catch (error) {
      console.error('버전 조회 에러:', error);
      return 'Unknown';
    }
  });

  /**
   * 라이선스 체크
   */
  ipcMain.handle('gfengine:check-license', async () => {
    try {
      return await engine.checkLicense();
    } catch (error) {
      console.error('라이선스 체크 에러:', error);
      return { isValid: false };
    }
  });

  // ==========================================
  // 영상 분석
  // ==========================================

  /**
   * 비디오 분석
   */
  ipcMain.handle('gfengine:analyze-video', async (event, { videoPath, options }) => {
    const sender = event.sender;
    const tempDir = path.join(os.tmpdir(), `gfengine-${Date.now()}`);

    try {
      console.log('비디오 분석 시작:', videoPath);

      // 1단계: 비디오 메타데이터 추출
      sender.send('gfengine:progress', {
        progress: 5,
        stage: '비디오 정보 확인 중',
      });

      const metadata = await videoProcessor.getVideoMetadata(videoPath);
      console.log('비디오 메타데이터:', metadata);

      // 2단계: 프레임 추출
      sender.send('gfengine:progress', {
        progress: 10,
        stage: '프레임 추출 중',
      });

      const framePaths = await videoProcessor.extractFrames(
        videoPath,
        tempDir,
        {
          fps: 30, // 초당 30프레임
          quality: 2,
        },
        (frameProgress) => {
          // 프레임 추출 진행률: 10% ~ 40%
          const progress = 10 + (frameProgress.percent / 100) * 30;
          sender.send('gfengine:progress', {
            progress: Math.floor(progress),
            stage: `프레임 추출 중 (${frameProgress.frames || 0}개)`,
          });
        }
      );

      console.log(`프레임 추출 완료: ${framePaths.length}개`);

      // 3단계: 영상 분석 (GFEngine2D)
      sender.send('gfengine:progress', {
        progress: 45,
        stage: '영상 분석 중',
      });

      const analysisResult = await engine.analyzeVideo(
        videoPath,
        options,
        (analysisProgress) => {
          // 영상 분석 진행률: 45% ~ 90%
          const progress = 45 + (analysisProgress.progress / 100) * 45;
          sender.send('gfengine:progress', {
            progress: Math.floor(progress),
            stage: analysisProgress.stage || '영상 분석 중',
          });
        }
      );

      // 4단계: 결과 생성
      sender.send('gfengine:progress', {
        progress: 95,
        stage: '결과 생성 중',
      });

      // 메타데이터 추가
      analysisResult.videoMetadata = {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        totalFrames: framePaths.length,
      };

      // 5단계: 임시 파일 정리
      await videoProcessor.cleanupTempDir(tempDir);

      sender.send('gfengine:progress', {
        progress: 100,
        stage: '완료',
      });

      // 완료 이벤트 발송
      sender.send('gfengine:analysis-complete', analysisResult);

      console.log('비디오 분석 완료');
      return analysisResult;

    } catch (error) {
      console.error('비디오 분석 에러:', error);
      
      // 에러 이벤트 발송
      sender.send('gfengine:error', {
        message: error.message,
        stack: error.stack,
      });

      // 임시 파일 정리
      try {
        await videoProcessor.cleanupTempDir(tempDir);
      } catch (cleanupError) {
        console.error('임시 파일 정리 실패:', cleanupError);
      }

      throw error;
    }
  });

  /**
   * 분석 취소
   */
  ipcMain.handle('gfengine:cancel-analysis', async () => {
    try {
      engine.cancelAnalysis();
      return true;
    } catch (error) {
      console.error('분석 취소 에러:', error);
      return false;
    }
  });

  // ==========================================
  // 파일 시스템
  // ==========================================

  /**
   * 비디오 파일 선택 다이얼로그
   */
  ipcMain.handle('gfengine:select-video-file', async () => {
    const result = await dialog.showOpenDialog({
      title: '비디오 파일 선택',
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'wmv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { cancelled: true };
    }

    return {
      cancelled: false,
      filePath: result.filePaths[0],
    };
  });

  // ==========================================
  // 유틸리티
  // ==========================================

  /**
   * 앱 버전 정보
   */
  ipcMain.handle('app:version', async () => {
    return app.getVersion();
  });

  /**
   * 로그 메시지
   */
  ipcMain.on('app:log', (event, { level, message }) => {
    const logFn = console[level] || console.log;
    logFn(`[Renderer] ${message}`);
  });

  console.log('IPC 핸들러 등록 완료');
}

module.exports = {
  setupAnalysisHandlers,
};

