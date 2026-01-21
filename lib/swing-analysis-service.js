/**
 * 스윙 분석 통합 서비스
 * 센서 데이터 수신 → 영상 분석 → 백엔드 전달
 */

const { createEngine } = require('./gfengine-factory');
const SensorMonitor = require('./sensor-monitor');
const EngineHealthMonitor = require('./engine-health-monitor');
const videoProcessor = require('./video-processor');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
// aiAnalysisApi는 렌더러 프로세스에서 호출 (Node.js 환경에서 TypeScript 모듈 import 불가)

class SwingAnalysisService {
  constructor(mainWindow = null) {
    this.engine = null;
    this.monitor = null;
    this.healthMonitor = null;
    this.mainWindow = mainWindow;
    this.sessionUuid = null;
    this.currentSwingCount = 0;
    this.totalSwingCount = 0;
    this.isActive = false;
  }

  /**
   * 세션 시작
   */
  async startSession(sessionUuid, totalSwingCount = 10) {
    if (this.isActive) {
      throw new Error('이미 활성화된 세션이 있습니다');
    }

    console.log(`\n🏌️  스윙 분석 세션 시작`);
    console.log(`   세션 ID: ${sessionUuid}`);
    console.log(`   목표 스윙: ${totalSwingCount}회`);

    this.sessionUuid = sessionUuid;
    this.currentSwingCount = 0;
    this.totalSwingCount = totalSwingCount;
    this.isActive = true;

    // 엔진 초기화
    await this._initializeEngine();

    // 센서 모니터링 시작 (또는 수집 활성화)
    this._startMonitoring();

    console.log(`✅ 세션 준비 완료! 스윙을 시작하세요.\n`);
  }

  /**
   * 앱 시작 시 센서 모니터링만 시작 (데이터 수집 안함)
   */
  startMonitoringOnly() {
    if (this.monitor && this.monitor.isMonitoring) {
      console.log('⚠️  이미 모니터링 중입니다.');
      return;
    }

    console.log('\n🔍 센서 폴더 감지 시작 (앱 초기화)');
    
    // 모니터링만 시작
    this.monitor = new SensorMonitor();
    this.monitor.start(); // 감지만 시작, 수집 안함
    
    console.log('✅ 센서 폴더 감지 준비 완료\n');
  }

  /**
   * 세션 중지
   */
  async stopSession() {
    if (!this.isActive) return;

    console.log('\n🛑 세션 중지 중...');

    // 모니터링 중지
    if (this.monitor) {
      this.monitor.stop();
      this.monitor = null;
    }

    // 헬스 모니터 중지
    if (this.healthMonitor) {
      this.healthMonitor.stop();
      this.healthMonitor = null;
    }

    // 엔진 정리
    if (this.engine) {
      await this.engine.dispose();
      this.engine = null;
    }

    this.isActive = false;
    console.log('✅ 세션 종료 완료\n');
  }

  /**
   * 수동 재연결
   */
  async manualReconnect() {
    if (this.healthMonitor) {
      await this.healthMonitor.manualReconnect();
    }
  }

  /**
   * 헬스 상태 조회
   */
  getHealthStatus() {
    if (this.healthMonitor) {
      return this.healthMonitor.getStatus();
    }
    return {
      isMonitoring: false,
      isHealthy: false,
    };
  }

  /**
   * 엔진 초기화
   */
  async _initializeEngine() {
    console.log('🔧 GFEngine2D 초기화 중...');
    
    this.engine = createEngine();
    await this.engine.load();
    await this.engine.initialize(0, 0, 0); // Front, Driver, RightHanded
    
    const version = await this.engine.version();
    console.log(`✅ 엔진 준비 완료 (버전: ${version})`);
    
    // 헬스 모니터 시작
    this._startHealthMonitoring();
  }

  /**
   * 헬스 모니터링 시작
   */
  _startHealthMonitoring() {
    if (!this.engine) return;

    this.healthMonitor = new EngineHealthMonitor(this.engine, {
      checkInterval: 5000,           // 5초마다 체크
      maxConsecutiveFailures: 3,     // 3번 연속 실패
      maxReconnectAttempts: 5,       // 최대 5번 재연결
    });

    // 연결 끊김 이벤트
    this.healthMonitor.on('connection-lost', (data) => {
      console.error('❌ 영상 분석 시스템 연결 끊김');
      this._notifyRenderer('connection-lost', data);
    });

    // 재연결 시도 이벤트
    this.healthMonitor.on('reconnecting', (data) => {
      console.log(`🔄 재연결 시도 중 (${data.attempt}/${data.maxAttempts})...`);
      this._notifyRenderer('reconnect-attempt', data);
    });

    // 재연결 성공 이벤트
    this.healthMonitor.on('reconnect-success', (data) => {
      console.log('✅ 재연결 성공!');
      this._notifyRenderer('reconnect-success', data);
    });

    // 재연결 실패 이벤트
    this.healthMonitor.on('reconnect-failed', (data) => {
      console.error('❌ 재연결 실패 (최대 시도 횟수 초과)');
      this._notifyRenderer('reconnect-failed', data);
    });

    // 연결 복구 이벤트
    this.healthMonitor.on('connection-restored', (data) => {
      console.log('✅ 연결 복구됨');
      this._notifyRenderer('connection-restored', data);
    });

    this.healthMonitor.start();
  }

  /**
   * 렌더러에 이벤트 전송
   */
  _notifyRenderer(event, data) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(`engine:${event}`, data);
    }
  }

  /**
   * 센서 모니터링 시작 (또는 데이터 수집 활성화)
   */
  _startMonitoring() {
    // 이미 모니터링 중이면 데이터 수집만 활성화
    if (this.monitor && this.monitor.isMonitoring) {
      console.log('📊 기존 모니터링에 데이터 수집 활성화');
      this.monitor.startCollecting();
      this.monitor.processedShotCount = 0; // 카운트 초기화
      return;
    }

    // 새로 모니터링 시작
    this.monitor = new SensorMonitor();

    this.monitor.on('newShot', async (shotInfo) => {
      await this._handleNewShot(shotInfo);
    });

    this.monitor.start();
    this.monitor.startCollecting(); // 즉시 수집 시작
  }

  /**
   * 새로운 샷 처리
   */
  async _handleNewShot(shotInfo) {
    try {
      this.currentSwingCount++;

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 스윙 ${this.currentSwingCount}/${this.totalSwingCount}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // 1. 샷 데이터 백엔드 전달 (즉시 처리)
      console.log('\n[1/1] 📤 샷 데이터 전송 중...');
      await this._sendShotData(shotInfo.shotData);
      console.log(`\n✅ 스윙 ${this.currentSwingCount} 샷 데이터 전송 완료!`);

      // 2. 영상 분석 (첫 번째 샷만, 백그라운드 처리)
      if (this.currentSwingCount === 1 && shotInfo.videos && (shotInfo.videos.front || shotInfo.videos.side)) {
        console.log('\n[백그라운드] 🎬 영상 분석 시작 (첫 번째 샷, 비동기 처리)...');
        
        // 백그라운드에서 영상 분석 실행 (await 없음)
        this._analyzeVideos(shotInfo.videos)
          .then((analysisResults) => {
            if (analysisResults) {
              console.log('\n[백그라운드] ✅ 영상 분석 완료, 결과 전송 중...');
              return this._sendAnalysisResults(analysisResults);
            }
          })
          .then(() => {
            console.log('\n[백그라운드] ✅ 영상 분석 결과 전송 완료');
          })
          .catch((error) => {
            console.error('\n[백그라운드] ❌ 영상 분석 실패:', error.message);
            console.error(error.stack);
          });
      } else if (this.currentSwingCount === 1) {
        console.log('\n[백그라운드] ⏭️  영상 없음 - 분석 스킵');
      } else {
        console.log('\n[백그라운드] ⏭️  영상 분석 스킵 (첫 번째 샷만 분석)');
      }

      // 목표 달성 확인
      if (this.currentSwingCount >= this.totalSwingCount) {
        console.log(`\n🎉 목표 스윙 ${this.totalSwingCount}회 달성!`);
        await this.stopSession();
      }

    } catch (error) {
      console.error('\n❌ 샷 처리 실패:', error.message);
      console.error(error.stack);
    }
  }

  /**
   * 샷 데이터 렌더러로 전송 (렌더러에서 API 호출)
   */
  async _sendShotData(shotData) {
    try {
      const payload = {
        club: shotData.club !== undefined ? shotData.club : 0, // 클럽 번호 (0-18, API 문서에 맞춤)
        club_type: this._mapClubType(shotData.club), // 참고용 (API에는 club 사용)
        ballSpeed: shotData.ballSpeed || 0, // API 문서: camelCase
        clubSpeed: shotData.clubSpeed || 0,
        launchAngle: shotData.launchAngle || 0,
        sideSpin: shotData.sideSpin || 0,
        backSpin: shotData.backSpin || 0,
        carry: shotData.carry || 0,
        dist: shotData.dist || 0,
        TargetDist: shotData.TargetDist || 0,
        shot_shape: shotData.shotShape || shotData.shot_shape || 'straight',
      };

      console.log('\n   ┌─────────────────────────────────────');
      console.log('   │ 📊 샷 데이터 상세 정보');
      console.log('   ├─────────────────────────────────────');
      console.log(`   │ 클럽: ${payload.club_type}`);
      console.log(`   │ 볼 스피드: ${payload.ball_speed} m/s`);
      console.log(`   │ 클럽 스피드: ${payload.club_speed} m/s`);
      console.log(`   │ 발사각: ${payload.launch_angle}°`);
      console.log(`   │ 방향각: ${payload.azimuth}°`);
      console.log(`   │ 사이드 스핀: ${payload.side_spin} rpm`);
      console.log(`   │ 백스핀: ${payload.back_spin} rpm`);
      console.log(`   │ 캐리: ${payload.carry_distance} m`);
      console.log(`   │ 총 거리: ${payload.total_distance} m`);
      console.log(`   │ 스매시 팩터: ${payload.smash_factor.toFixed(2)}`);
      console.log('   └─────────────────────────────────────\n');

      // 렌더러 프로세스로 전송 (렌더러에서 API 호출)
      if (this.mainWindow && this.mainWindow.webContents) {
        console.log('   📤 백엔드로 전송 중...');
        this.mainWindow.webContents.send('swing-analysis:shot-data', {
          sessionUuid: this.sessionUuid,
          data: payload,
        });
        console.log('   ✅ 백엔드 전송 완료 (렌더러 프로세스 경유)');
      } else {
        console.warn('   ⚠️  렌더러 프로세스 없음 - 전송 실패');
      }

    } catch (error) {
      console.error('   ❌ 샷 데이터 전송 실패:', error.message);
      throw error;
    }
  }

  /**
   * 영상 분석 (프레임 추출 포함)
   */
  async _analyzeVideos(videos) {
    const results = {};

    // 정면 영상 분석
    if (videos.front) {
      console.log(`   📹 정면 영상 분석: ${videos.front.filename}`);
      this._notifyRenderer('video-analysis-start', { videoType: 'front', filename: videos.front.filename });
      
      try {
        const result = await this._analyzeVideoWithFrames(videos.front, 0); // Front
        results.front = result;
        console.log(`   ✅ 정면 분석 완료 (문제점: ${result.value?.problems?.length || 0}개)`);
        this._notifyRenderer('video-analysis-complete', { videoType: 'front', result });
      } catch (error) {
        console.error(`   ❌ 정면 분석 실패: ${error.message}`);
        console.error(error.stack);
        this._notifyRenderer('video-analysis-error', { videoType: 'front', error: error.message });
      }
    }

    // 측면 영상 분석
    if (videos.side) {
      console.log(`   📹 측면 영상 분석: ${videos.side.filename}`);
      this._notifyRenderer('video-analysis-start', { videoType: 'side', filename: videos.side.filename });
      
      try {
        const result = await this._analyzeVideoWithFrames(videos.side, 1); // Side
        results.side = result;
        console.log(`   ✅ 측면 분석 완료 (문제점: ${result.value?.problems?.length || 0}개)`);
        this._notifyRenderer('video-analysis-complete', { videoType: 'side', result });
      } catch (error) {
        console.error(`   ❌ 측면 분석 실패: ${error.message}`);
        console.error(error.stack);
        this._notifyRenderer('video-analysis-error', { videoType: 'side', error: error.message });
      }
    }

    return results;
  }

  /**
   * 프레임 추출 후 영상 분석
   */
  async _analyzeVideoWithFrames(videoInfo, direction) {
    const tempDir = path.join(os.tmpdir(), `gfengine-frames-${Date.now()}`);
    
    try {
      console.log(`      🎬 프레임 추출 시작...`);
      
      // 1. 비디오 메타데이터 가져오기
      const metadata = await videoProcessor.getVideoMetadata(videoInfo.fullPath);
      console.log(`      📊 메타데이터: ${metadata.width}x${metadata.height}, ${metadata.fps.toFixed(2)}fps, ${metadata.duration.toFixed(2)}초`);
      
      // 2. 프레임 추출
      const framePaths = await videoProcessor.extractFrames(
        videoInfo.fullPath,
        tempDir,
        {
          fps: metadata.fps, // 원본 FPS 유지
          quality: 2, // 고품질
        },
        (progress) => {
          if (progress % 10 === 0) {
            console.log(`      ⏳ 프레임 추출 진행: ${progress}%`);
            this._notifyRenderer('video-analysis-progress', { 
              videoType: direction === 0 ? 'front' : 'side',
              stage: 'frame-extraction',
              progress 
            });
          }
        }
      );
      
      console.log(`      ✅ 프레임 추출 완료: ${framePaths.length}개`);
      
      // 3. 이미지를 Base64로 변환
      console.log(`      🔄 이미지 변환 중...`);
      const frameImages = await Promise.all(
        framePaths.map(async (framePath) => {
          const buffer = await fs.readFile(framePath);
          return buffer.toString('base64');
        })
      );
      console.log(`      ✅ 이미지 변환 완료: ${frameImages.length}개`);
      
      // 4. 엔진으로 분석
      console.log(`      🤖 DLL 분석 시작...`);
      const result = await this.engine.analyzeVideo(videoInfo.fullPath, {
        direction,
        clubType: 0,  // Driver
        frameImages,  // Base64 이미지 배열
        frameCount: frameImages.length,
        fps: metadata.fps,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration,
      });
      console.log(`      ✅ DLL 분석 완료`);
      
      // 5. 문제점에 해당하는 프레임 이미지 추출
      if (result?.value?.problems && Array.isArray(result.value.problems)) {
        console.log(`      📸 문제점 프레임 추출 중... (${result.value.problems.length}개)`);
        result.value.problems = result.value.problems.map((problem) => {
          const evidenceStepId = problem.evidenceStepId;
          
          // frameIndex에서 해당 stepId의 프레임 번호 찾기
          const frameIndex = result.value.frameIndex;
          let frameNumber = null;
          
          if (frameIndex) {
            // evidenceStepId에 해당하는 스윙 단계의 프레임 번호 찾기
            const steps = ['address', 'takeAway', 'backSwing', 'top', 'downSwing', 'impact', 'followThrough', 'finish'];
            if (evidenceStepId >= 0 && evidenceStepId < steps.length) {
              const stepName = steps[evidenceStepId];
              frameNumber = frameIndex[stepName];
            }
          }
          
          // 해당 프레임의 이미지 추가 (Base64)
          let evidenceImage = null;
          if (frameNumber !== null && frameNumber >= 0 && frameNumber < frameImages.length) {
            evidenceImage = frameImages[frameNumber];
            console.log(`        ✓ ${problem.typeName}: 프레임 ${frameNumber} 추출`);
          }
          
          return {
            ...problem,
            evidenceFrameNumber: frameNumber,
            evidenceImage: evidenceImage, // Base64 이미지
          };
        });
      }
      
      return result;
      
    } finally {
      // 5. 임시 파일 정리
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log(`      🧹 임시 파일 정리 완료`);
      } catch (cleanupError) {
        console.warn(`      ⚠️ 임시 파일 정리 실패:`, cleanupError.message);
      }
    }
  }

  /**
   * 분석 결과 렌더러로 전송 (렌더러에서 API 호출)
   */
  async _sendAnalysisResults(results) {
    try {
      // 렌더러 프로세스로 전송
      if (this.mainWindow && this.mainWindow.webContents) {
        this.mainWindow.webContents.send('swing-analysis:video-result', {
          sessionUuid: this.sessionUuid,
          results: results,
        });
        
        console.log('   ✅ 분석 결과 렌더러로 전송 완료');
        if (results.front) {
          console.log(`      정면: ${results.front.value?.problems?.length || 0}개 문제점 감지`);
        }
        if (results.side) {
          console.log(`      측면: ${results.side.value?.problems?.length || 0}개 문제점 감지`);
        }
      }

    } catch (error) {
      console.error('   ❌ 분석 결과 전송 실패:', error.message);
      throw error;
    }
  }

  /**
   * 클럽 타입 매핑
   */
  _mapClubType(clubNumber) {
    // GTS 센서의 클럽 번호를 백엔드 API의 클럽 타입으로 변환
    const mapping = {
      0: 'DRIVER',      // 드라이버
      1: 'DRIVER',
      2: 'WOOD_3',      // 3우드
      3: 'WOOD_3',
      4: 'WOOD_5',      // 5우드
      5: 'WOOD_5',
      17: 'IRON_7',     // 7번 아이언 (예시)
      18: 'IRON_8',
      19: 'IRON_9',
    };

    return mapping[clubNumber] || 'IRON_7';
  }

  /**
   * 상태 확인
   */
  getStatus() {
    return {
      isActive: this.isActive,
      sessionUuid: this.sessionUuid,
      currentSwingCount: this.currentSwingCount,
      totalSwingCount: this.totalSwingCount,
      progress: this.totalSwingCount > 0 
        ? Math.round((this.currentSwingCount / this.totalSwingCount) * 100) 
        : 0,
      monitorStatus: this.monitor ? this.monitor.getStatus() : null,
    };
  }

  /**
   * 렌더러 프로세스로 이벤트 전송
   */
  _notifyRenderer(eventName, data) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(`engine:${eventName}`, data);
    }
  }
}

module.exports = SwingAnalysisService;

