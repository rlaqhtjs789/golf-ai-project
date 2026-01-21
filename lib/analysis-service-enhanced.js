/**
 * 분석 서비스 (Enhanced - 별도 프로세스 사용)
 * 
 * GFEngine Process를 사용하여 영상 분석 처리
 */

const { dialog, app } = require('electron');
const path = require('path');
const os = require('os');
const GFEngineProcess = require('./gfengine-process-enhanced');
const videoProcessor = require('./video-processor');

// 엔진 인스턴스 (싱글톤)
let engineInstance = null;
let engineReady = false;

/**
 * 엔진 시작
 */
async function startEngine() {
  if (!engineInstance) {
    engineInstance = new GFEngineProcess();
    
    // 프로세스 재시작 처리
    engineInstance.on('exit', async (code) => {
      console.warn(`엔진 프로세스 종료 (코드: ${code}), 재시작 중...`);
      engineReady = false;
      
      if (code !== 0) {
        // 비정상 종료 시 재시작
        try {
          await engineInstance.start();
          engineReady = true;
          console.log('엔진 재시작 성공');
        } catch (error) {
          console.error('엔진 재시작 실패:', error);
        }
      }
    });
  }

  if (!engineReady) {
    await engineInstance.start();
    engineReady = true;
    console.log('GFEngine 프로세스 시작됨');
  }

  return engineInstance;
}

/**
 * 엔진 종료
 */
async function stopEngine() {
  if (engineInstance) {
    await engineInstance.stop();
    engineInstance = null;
    engineReady = false;
    console.log('GFEngine 프로세스 종료됨');
  }
}

/**
 * IPC 핸들러 설정
 */
function setupAnalysisHandlers(ipcMain) {
  // ==========================================
  // 엔진 제어
  // ==========================================

  /**
   * 엔진 시작
   */
  ipcMain.handle('gfengine:start', async () => {
    try {
      const engine = await startEngine();
      return { success: true };
    } catch (error) {
      console.error('엔진 시작 실패:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  });

  /**
   * 엔진 초기화
   */
  ipcMain.handle('gfengine:initialize', async (event, { direction, clubType, handedId }) => {
    try {
      const engine = await startEngine();
      const result = await engine.initialize(direction, clubType, handedId);
      
      return result;
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
      const engine = await startEngine();
      return await engine.getVersion();
    } catch (error) {
      console.error('버전 조회 에러:', error);
      return 'Unknown';
    }
  });

  /**
   * Ping 테스트
   */
  ipcMain.handle('gfengine:ping', async () => {
    try {
      if (!engineReady) return false;
      return await engineInstance.ping();
    } catch (error) {
      console.error('Ping 에러:', error);
      return false;
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

    try {
      console.log('비디오 분석 시작:', videoPath);

      const engine = await startEngine();

      // 진행 상황 전달
      engine.on('progress', (data) => {
        sender.send('gfengine:progress', data);
      });

      // 1단계: 비디오 메타데이터
      sender.send('gfengine:progress', {
        progress: 5,
        stage: '비디오 정보 확인 중',
      });

      const metadata = await videoProcessor.getVideoMetadata(videoPath);
      console.log('비디오 메타데이터:', metadata);

      // 2단계: 분석 실행 (GFEngine Process)
      sender.send('gfengine:progress', {
        progress: 10,
        stage: '영상 분석 시작',
      });

      const analysisResult = await engine.analyzeVideo(videoPath, options);

      // 메타데이터 추가
      analysisResult.videoMetadata = {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
      };

      // 완료
      sender.send('gfengine:progress', {
        progress: 100,
        stage: '완료',
      });

      sender.send('gfengine:analysis-complete', analysisResult);

      console.log('비디오 분석 완료');
      return analysisResult;

    } catch (error) {
      console.error('비디오 분석 에러:', error);
      
      sender.send('gfengine:error', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      throw error;
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

  console.log('IPC 핸들러 등록 완료 (Enhanced)');
}

// 앱 종료 시 엔진 정리
app.on('before-quit', async () => {
  await stopEngine();
});

module.exports = {
  setupAnalysisHandlers,
  startEngine,
  stopEngine,
};


