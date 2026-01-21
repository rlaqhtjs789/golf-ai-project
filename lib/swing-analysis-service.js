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
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏌️  STARTING SWING ANALYSIS SESSION`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Session ID: ${sessionUuid}`);
    console.log(`   Target Swings: ${totalSwingCount}`);
    console.log(`   Current isActive: ${this.isActive}`);
    
    if (this.isActive) {
      console.log(`   ⚠️ Session already active, but continuing...`);
      // Don't throw - just continue to enable data collection
    }

    // Set session state FIRST (before any async operations that might fail)
    this.sessionUuid = sessionUuid;
    this.currentSwingCount = 0;
    this.totalSwingCount = totalSwingCount;
    this.isActive = true; // Set to true immediately

    console.log(`   ✅ Session state initialized (isActive: ${this.isActive})`);

    // Initialize engine (optional - only needed for video analysis)
    // Even if this fails, we can still process shot data
    console.log(`   🔧 Initializing engine (optional for video analysis)...`);
    try {
      await this._initializeEngine();
      console.log(`   ✅ Engine initialized`);
    } catch (error) {
      console.warn(`   ⚠️ Engine initialization failed (will continue without video analysis):`, error.message);
      console.warn(`   ℹ️  Shot data processing will still work without engine`);
      // Continue without engine - shot data processing doesn't require engine
      // Don't throw - we want to continue with shot data processing
    }

    // Start sensor monitoring (or enable data collection)
    // This is critical - must succeed for shot data processing
    try {
      console.log(`   📊 Starting sensor monitoring...`);
      this._startMonitoring();
      console.log(`   ✅ Sensor monitoring started`);
    } catch (error) {
      console.error(`   ❌ Sensor monitoring failed:`, error.message);
      // This is critical - if monitoring fails, we can't process shot data
      // But don't throw - let the session continue and try again later
    }

    console.log(`\n✅ SESSION READY! Start swinging.`);
    console.log(`   isActive: ${this.isActive}`);
    console.log(`   isCollecting: ${this.monitor?.isCollecting || false}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Return success even if engine failed - shot data processing is more important
    return { success: true };
  }

  /**
   * 앱 시작 시 센서 모니터링만 시작 (데이터 수집 안함)
   */
  startMonitoringOnly() {
    if (this.monitor && this.monitor.isMonitoring) {
      console.log('⚠️  이미 모니터링 중입니다.');
      return;
    }

    console.log('\n🔍 Starting sensor folder detection (app initialization)');
    
    // Start monitoring only (no data collection)
    this.monitor = new SensorMonitor();
    
    // Register event listeners even in monitoring-only mode
    this.monitor.on('newShot', async (shotInfo) => {
      console.log('[SwingAnalysis] 🎯 newShot event received (monitoring mode), calling _handleNewShot...');
      await this._handleNewShot(shotInfo);
    });
    
    // 첫 번째 샷 영상이 나중에 들어온 경우 처리
    this.monitor.on('firstShotVideoArrived', async (data) => {
      console.log('[SwingAnalysis] 🎬 First shot video arrived later - starting video analysis...');
      if (this.currentSwingCount === 1 && data.videos && (data.videos.front || data.videos.side)) {
        if (this.engine) {
          console.log('[SwingAnalysis] ✅ Engine available - starting video analysis for first shot');
          this._analyzeVideos(data.videos)
            .then((analysisResults) => {
              if (analysisResults) {
                console.log('[SwingAnalysis] ✅ Video analysis complete (late arrival), sending results...');
                return this._sendAnalysisResults(analysisResults);
              }
            })
            .then(() => {
              console.log('[SwingAnalysis] ✅ Video analysis results sent (late arrival)');
            })
            .catch((error) => {
              console.error('[SwingAnalysis] ❌ Video analysis failed (late arrival):', error.message);
              console.error(error.stack);
            });
        } else {
          console.warn('[SwingAnalysis] ⚠️  Engine not initialized - video analysis skipped (late arrival)');
        }
      }
    });
    
    this.monitor.on('pendingShotsWaiting', (data) => {
      console.log(`[SwingAnalysis] ⚠️ Pending shots waiting but collection disabled (${data.count} shots)`);
      console.log(`[SwingAnalysis] 🔄 Attempting to enable collection mode...`);
      console.log(`[SwingAnalysis] Current state: isActive=${this.isActive}, isMonitoring=${this.monitor?.isMonitoring}, isCollecting=${this.monitor?.isCollecting}`);
      
      // 세션이 활성화되어 있으면 수집 모드 활성화
      if (this.isActive && this.monitor && this.monitor.isMonitoring && !this.monitor.isCollecting) {
        console.log(`[SwingAnalysis] ✅ Session is active, enabling collection mode...`);
        this.monitor.startCollecting();
      } else if (!this.isActive && this.monitor && this.monitor.isMonitoring && !this.monitor.isCollecting) {
        // 세션이 비활성화되어 있지만 모니터링 중이면, 수집 모드만 활성화 (샷 데이터만 처리)
        console.log(`[SwingAnalysis] ⚠️ Session not active, but enabling collection mode for shot data processing...`);
        console.log(`[SwingAnalysis] ℹ️  Note: Video analysis will not work without active session`);
        this.monitor.startCollecting();
      } else {
        console.log(`[SwingAnalysis] ⚠️ Cannot enable collection: isActive=${this.isActive}, isMonitoring=${this.monitor?.isMonitoring}, isCollecting=${this.monitor?.isCollecting}`);
      }
    });
    
    this.monitor.start(); // Detection only, no collection
    
    console.log('✅ Sensor folder detection ready\n');
  }

  /**
   * 세션 중지
   */
  async stopSession() {
    if (!this.isActive) return;

    console.log('\n🛑 Stopping session...');

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
    console.log('✅ Session stopped.\n');
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
      console.error('❌ Video analysis system connection lost!');
      this._notifyRenderer('connection-lost', data);
    });

    // 재연결 시도 이벤트
    this.healthMonitor.on('reconnecting', (data) => {
      console.log(`🔄 재연결 시도 중 (${data.attempt}/${data.maxAttempts})...`);
      this._notifyRenderer('reconnect-attempt', data);
    });

    // 재연결 성공 이벤트
    this.healthMonitor.on('reconnect-success', (data) => {
      console.log('✅ Reconnection successful!');
      this._notifyRenderer('reconnect-success', data);
    });

    // 재연결 실패 이벤트
    this.healthMonitor.on('reconnect-failed', (data) => {
      console.error('❌ Reconnection failed (max attempts exceeded)');
      this._notifyRenderer('reconnect-failed', data);
    });

    // 연결 복구 이벤트
    this.healthMonitor.on('connection-restored', (data) => {
        console.log('✅ Connection restored');
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
    console.log('\n[SwingAnalysis] ========== _startMonitoring called ==========');
    console.log(`[SwingAnalysis] Monitor exists: ${!!this.monitor}`);
    console.log(`[SwingAnalysis] isMonitoring: ${this.monitor?.isMonitoring}`);
    console.log(`[SwingAnalysis] isCollecting: ${this.monitor?.isCollecting}`);
    
    // If already monitoring, just enable data collection
    if (this.monitor && this.monitor.isMonitoring) {
      console.log('[SwingAnalysis] 📊 Enabling data collection on existing monitor');
      
      // Ensure event listeners are registered
      if (!this.monitor.listenerCount('newShot')) {
        this.monitor.on('newShot', async (shotInfo) => {
          console.log('[SwingAnalysis] 🎯 newShot event received, calling _handleNewShot...');
          await this._handleNewShot(shotInfo);
        });
      }
      
      if (!this.monitor.listenerCount('firstShotVideoArrived')) {
        this.monitor.on('firstShotVideoArrived', async (data) => {
          console.log('[SwingAnalysis] 🎬 First shot video arrived later - starting video analysis...');
          if (this.currentSwingCount === 1 && data.videos && (data.videos.front || data.videos.side)) {
            if (this.engine) {
              console.log('[SwingAnalysis] ✅ Engine available - starting video analysis for first shot');
              this._analyzeVideos(data.videos)
                .then((analysisResults) => {
                  if (analysisResults) {
                    console.log('[SwingAnalysis] ✅ Video analysis complete (late arrival), sending results...');
                    return this._sendAnalysisResults(analysisResults);
                  }
                })
                .then(() => {
                  console.log('[SwingAnalysis] ✅ Video analysis results sent (late arrival)');
                })
                .catch((error) => {
                  console.error('[SwingAnalysis] ❌ Video analysis failed (late arrival):', error.message);
                  console.error(error.stack);
                });
            } else {
              console.warn('[SwingAnalysis] ⚠️  Engine not initialized - video analysis skipped (late arrival)');
            }
          }
        });
      }
      
      if (!this.monitor.listenerCount('pendingShotsWaiting')) {
        this.monitor.on('pendingShotsWaiting', (data) => {
          console.log(`[SwingAnalysis] ⚠️ Pending shots waiting but collection disabled (${data.count} shots)`);
          console.log(`[SwingAnalysis] 🔄 Attempting to enable collection mode...`);
          console.log(`[SwingAnalysis] Current state: isActive=${this.isActive}, isMonitoring=${this.monitor?.isMonitoring}, isCollecting=${this.monitor?.isCollecting}`);
          
          // 세션이 활성화되어 있으면 수집 모드 활성화
          if (this.isActive && this.monitor && this.monitor.isMonitoring && !this.monitor.isCollecting) {
            console.log(`[SwingAnalysis] ✅ Session is active, enabling collection mode...`);
            this.monitor.startCollecting();
          } else if (!this.isActive && this.monitor && this.monitor.isMonitoring && !this.monitor.isCollecting) {
            // 세션이 비활성화되어 있지만 모니터링 중이면, 수집 모드만 활성화 (샷 데이터만 처리)
            console.log(`[SwingAnalysis] ⚠️ Session not active, but enabling collection mode for shot data processing...`);
            console.log(`[SwingAnalysis] ℹ️  Note: Video analysis will not work without active session`);
            this.monitor.startCollecting();
          } else {
            console.log(`[SwingAnalysis] ⚠️ Cannot enable collection: isActive=${this.isActive}, isMonitoring=${this.monitor?.isMonitoring}, isCollecting=${this.monitor?.isCollecting}`);
          }
        });
      }
      
      const beforeCollecting = this.monitor.isCollecting;
      this.monitor.startCollecting();
      const afterCollecting = this.monitor.isCollecting;
      console.log(`[SwingAnalysis] isCollecting: ${beforeCollecting} → ${afterCollecting}`);
      this.monitor.processedShotCount = 0; // Reset count
      console.log(`[SwingAnalysis] ✅ Data collection enabled, pending shots: ${this.monitor.pendingShots?.size || 0}`);
      return;
    }

    // Start new monitoring
    console.log('[SwingAnalysis] 📊 Starting new sensor monitoring');
    this.monitor = new SensorMonitor();

    this.monitor.on('newShot', async (shotInfo) => {
      console.log('[SwingAnalysis] 🎯 newShot event received, calling _handleNewShot...');
      await this._handleNewShot(shotInfo);
    });
    
    // 첫 번째 샷 영상이 나중에 들어온 경우 처리
    this.monitor.on('firstShotVideoArrived', async (data) => {
      console.log('[SwingAnalysis] 🎬 First shot video arrived later - starting video analysis...');
      if (this.currentSwingCount === 1 && data.videos && (data.videos.front || data.videos.side)) {
        if (this.engine) {
          console.log('[SwingAnalysis] ✅ Engine available - starting video analysis for first shot');
          this._analyzeVideos(data.videos)
            .then((analysisResults) => {
              if (analysisResults) {
                console.log('[SwingAnalysis] ✅ Video analysis complete (late arrival), sending results...');
                return this._sendAnalysisResults(analysisResults);
              }
            })
            .then(() => {
              console.log('[SwingAnalysis] ✅ Video analysis results sent (late arrival)');
            })
            .catch((error) => {
              console.error('[SwingAnalysis] ❌ Video analysis failed (late arrival):', error.message);
              console.error(error.stack);
            });
        } else {
          console.warn('[SwingAnalysis] ⚠️  Engine not initialized - video analysis skipped (late arrival)');
        }
      }
    });
    
    // 샷 데이터가 대기 중인데 수집 모드가 비활성화된 경우
    this.monitor.on('pendingShotsWaiting', (data) => {
      console.log(`[SwingAnalysis] ⚠️ Pending shots waiting but collection disabled (${data.count} shots)`);
      console.log(`[SwingAnalysis] 🔄 Attempting to enable collection mode...`);
      console.log(`[SwingAnalysis] Current state: isActive=${this.isActive}, isMonitoring=${this.monitor?.isMonitoring}, isCollecting=${this.monitor?.isCollecting}`);
      
      // 세션이 활성화되어 있으면 수집 모드 활성화
      if (this.isActive && this.monitor && this.monitor.isMonitoring && !this.monitor.isCollecting) {
        console.log(`[SwingAnalysis] ✅ Session is active, enabling collection mode...`);
        this.monitor.startCollecting();
      } else if (!this.isActive && this.monitor && this.monitor.isMonitoring && !this.monitor.isCollecting) {
        // 세션이 비활성화되어 있지만 모니터링 중이면, 수집 모드만 활성화 (샷 데이터만 처리)
        console.log(`[SwingAnalysis] ⚠️ Session not active, but enabling collection mode for shot data processing...`);
        console.log(`[SwingAnalysis] ℹ️  Note: Video analysis will not work without active session`);
        this.monitor.startCollecting();
      } else {
        console.log(`[SwingAnalysis] ⚠️ Cannot enable collection: isActive=${this.isActive}, isMonitoring=${this.monitor?.isMonitoring}, isCollecting=${this.monitor?.isCollecting}`);
      }
    });

    this.monitor.start();
    console.log('[SwingAnalysis] ✅ Monitor started, calling startCollecting...');
    this.monitor.startCollecting(); // Start collection immediately
    
    console.log(`[SwingAnalysis] ✅ Monitoring started, isCollecting: ${this.monitor.isCollecting}`);
    console.log(`[SwingAnalysis] ================================================\n`);
  }

  /**
   * 새로운 샷 처리
   */
  async _handleNewShot(shotInfo) {
    try {
      this.currentSwingCount++;

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 Swing ${this.currentSwingCount}/${this.totalSwingCount}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // 1. Send shot data to backend (process immediately - shot data is required)
      console.log('\n[1/1] 📤 Sending shot data...');
      await this._sendShotData(shotInfo.shotData);
      console.log(`\n✅ Swing ${this.currentSwingCount} shot data sent!`);

      // 2. Video analysis (only for first shot if video data exists, background processing)
      // Video analysis is optional - proceed with shot data only if no video
      if (this.currentSwingCount === 1) {
        if (shotInfo.videos && (shotInfo.videos.front || shotInfo.videos.side)) {
          // 엔진이 초기화되었는지 확인
          if (!this.engine) {
            console.warn('\n[Background] ⚠️  Engine not initialized - video analysis skipped');
            console.warn('\n[Background] ⏭️  No video data - proceeding with shot data only (video analysis skipped)');
          } else {
            console.log('\n[Background] 🎬 Video data available - starting video analysis (async)...');
            
            // Run video analysis in background (no await - doesn't block shot data processing)
            this._analyzeVideos(shotInfo.videos)
              .then((analysisResults) => {
                if (analysisResults) {
                  console.log('\n[Background] ✅ Video analysis complete, sending results...');
                  return this._sendAnalysisResults(analysisResults);
                }
              })
              .then(() => {
                console.log('\n[Background] ✅ Video analysis results sent');
              })
              .catch((error) => {
                console.error('\n[Background] ❌ Video analysis failed:', error.message);
                console.error(error.stack);
              });
          }
        } else {
          console.log('\n[Background] ⏭️  No video data - proceeding with shot data only (video analysis skipped)');
        }
      } else {
        console.log('\n[Background] ⏭️  Video analysis skipped (only first shot is analyzed)');
      }

      // Check if target reached
      if (this.currentSwingCount >= this.totalSwingCount) {
        console.log(`\n🎉 Target swings (${this.totalSwingCount}) reached!`);
        await this.stopSession();
      }

    } catch (error) {
      console.error('\n❌ Shot processing failed:', error.message);
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
        faceAngle: shotData.faceAngle || 0,
        azimuth: shotData.azimuth || 0,
        apex: shotData.apex || shotData.Apex || 0,
        sideSpin: shotData.sideSpin || 0,
        backSpin: shotData.backSpin || 0,
        carry: shotData.carry || shotData.carry_distance || 0,
        dist: shotData.dist || shotData.total_distance || 0,
        TargetDist: shotData.TargetDist || shotData.target_distance || 0,
        shot_shape: shotData.shotShape || shotData.shot_shape || 'straight',
        _Positions: shotData._Positions || [], // 볼 궤적 데이터
      };

      console.log('\n   ┌─────────────────────────────────────');
      console.log('   │ 📊 Shot Data Details');
      console.log('   ├─────────────────────────────────────');
      console.log(`   │ Club: ${payload.club_type} (${payload.club})`);
      console.log(`   │ Ball Speed: ${payload.ballSpeed} m/s`);
      console.log(`   │ Club Speed: ${payload.clubSpeed} m/s`);
      console.log(`   │ Launch Angle: ${payload.launchAngle}°`);
      console.log(`   │ Azimuth: ${payload.azimuth}°`);
      console.log(`   │ Side Spin: ${payload.sideSpin} rpm`);
      console.log(`   │ Back Spin: ${payload.backSpin} rpm`);
      console.log(`   │ Carry: ${payload.carry} m`);
      console.log(`   │ Total Distance: ${payload.dist} m`);
      console.log(`   │ Shot Shape: ${payload.shot_shape}`);
      if (payload._Positions && Array.isArray(payload._Positions)) {
        console.log(`   │ Trajectory Points: ${payload._Positions.length} (excluded from logs)`);
      }
      console.log('   └─────────────────────────────────────\n');

      // Send to renderer process (renderer calls API)
      console.log('   🔍 Checking mainWindow before sending event...');
      console.log('   🔍 mainWindow exists:', !!this.mainWindow);
      console.log('   🔍 mainWindow.webContents exists:', !!(this.mainWindow && this.mainWindow.webContents));
      console.log('   🔍 mainWindow.isDestroyed:', this.mainWindow ? this.mainWindow.isDestroyed() : 'N/A');
      
      if (this.mainWindow && this.mainWindow.webContents && !this.mainWindow.isDestroyed()) {
        console.log('   📤 Sending to backend (via renderer process)...');
        const eventData = {
          sessionUuid: this.sessionUuid,
          data: payload,
        };
        // 궤적 데이터를 제외한 로그 출력
        const logData = { ...eventData };
        if (logData.data && logData.data._Positions) {
          logData.data = { ...logData.data, _Positions: `[${logData.data._Positions.length}개 좌표]` };
        }
        console.log('   📦 Event data to send (궤적 제외):', JSON.stringify(logData, null, 2));
        try {
          this.mainWindow.webContents.send('swing-analysis:shot-data', eventData);
          console.log('   ✅ Backend transmission complete (via renderer process)');
          console.log('   📡 Event "swing-analysis:shot-data" sent to renderer');
        } catch (error) {
          console.error('   ❌ Error sending event to renderer:', error);
        }
      } else {
        console.warn('   ⚠️  Renderer process not available - transmission failed');
        console.warn('   ⚠️  mainWindow:', this.mainWindow ? 'exists' : 'null');
        console.warn('   ⚠️  webContents:', this.mainWindow && this.mainWindow.webContents ? 'exists' : 'null');
        console.warn('   ⚠️  isDestroyed:', this.mainWindow ? this.mainWindow.isDestroyed() : 'N/A');
      }

    } catch (error) {
      console.error('   ❌ Failed to send shot data:', error.message);
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
      console.log(`   📹 Analyzing front video: ${videos.front.filename}`);
      this._notifyRenderer('video-analysis-start', { videoType: 'front', filename: videos.front.filename });
      
      try {
        const result = await this._analyzeVideoWithFrames(videos.front, 0); // Front
        results.front = result;
        console.log(`   ✅ Front analysis complete (Problems: ${result.value?.problems?.length || 0})`);
        this._notifyRenderer('video-analysis-complete', { videoType: 'front', result });
      } catch (error) {
        console.error(`   ❌ Front analysis failed: ${error.message}`);
        console.error(error.stack);
        this._notifyRenderer('video-analysis-error', { videoType: 'front', error: error.message });
      }
    }

    // 측면 영상 분석
    if (videos.side) {
      console.log(`   📹 Analyzing side video: ${videos.side.filename}`);
      this._notifyRenderer('video-analysis-start', { videoType: 'side', filename: videos.side.filename });
      
      try {
        const result = await this._analyzeVideoWithFrames(videos.side, 1); // Side
        results.side = result;
        console.log(`   ✅ Side analysis complete (Problems: ${result.value?.problems?.length || 0})`);
        this._notifyRenderer('video-analysis-complete', { videoType: 'side', result });
      } catch (error) {
        console.error(`   ❌ Side analysis failed: ${error.message}`);
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
      if (!this.engine) {
        throw new Error('Engine not initialized - cannot analyze video');
      }
      
      console.log(`      🤖 DLL analysis started...`);
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
      console.log(`      ✅ DLL analysis complete`);
      
      // Python 엔진에서 반환된 전체 결과 로깅
      console.log(`      📋 Python 엔진 분석 결과 전체:`);
      console.log(`         - result_code: ${result?.result_code || result?.resultCode || 'N/A'}`);
      console.log(`         - value 존재: ${!!result?.value}`);
      if (result?.value) {
        console.log(`         - problems 배열 존재: ${!!result.value.problems}`);
        console.log(`         - problems 개수: ${result.value.problems?.length || 0}`);
        if (result.value.problems && Array.isArray(result.value.problems)) {
          console.log(`         - problems 상세:`);
          result.value.problems.forEach((p, idx) => {
            console.log(`            [${idx + 1}] typeName: ${p.typeName || p.type_name || 'N/A'}, severity: ${p.severity || 'N/A'}, score: ${p.score || 'N/A'}`);
          });
        }
      }
      
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
      console.log('\n[VideoAnalysis] ========================================');
      console.log('[VideoAnalysis] 📤 영상 분석 결과 전송 시작');
      console.log('[VideoAnalysis] Session UUID:', this.sessionUuid);
      console.log('[VideoAnalysis] Results 구조:', {
        hasFront: !!results.front,
        hasSide: !!results.side,
        frontProblems: results.front?.value?.problems?.length || 0,
        sideProblems: results.side?.value?.problems?.length || 0,
      });
      
      // 세션 UUID가 없으면 전송하지 않음
      if (!this.sessionUuid) {
        console.warn('[VideoAnalysis] ⚠️  Session UUID is null - cannot send results (session not started yet)');
        return;
      }
      
      // 렌더러 프로세스로 전송
      if (this.mainWindow && this.mainWindow.webContents) {
        if (this.mainWindow.isDestroyed()) {
          console.error('[VideoAnalysis] ❌ Main window is destroyed - cannot send results');
          return;
        }
        
        const payload = {
          sessionUuid: this.sessionUuid,
          results: results,
        };
        
        console.log('[VideoAnalysis] 📡 IPC 이벤트 전송: swing-analysis:video-result');
        console.log('[VideoAnalysis] 📦 Payload:', JSON.stringify(payload, null, 2).substring(0, 500) + '...');
        
        this.mainWindow.webContents.send('swing-analysis:video-result', payload);
        
        console.log('[VideoAnalysis] ✅ Analysis results sent to renderer');
        if (results.front) {
          console.log(`[VideoAnalysis]    정면: ${results.front.value?.problems?.length || 0}개 문제점 감지`);
        }
        if (results.side) {
          console.log(`[VideoAnalysis]    측면: ${results.side.value?.problems?.length || 0}개 문제점 감지`);
        }
        console.log('[VideoAnalysis] ========================================\n');
      } else {
        console.error('[VideoAnalysis] ❌ Main window or webContents is null');
        console.log('[VideoAnalysis] ========================================\n');
      }

    } catch (error) {
      console.error('[VideoAnalysis] ❌ Failed to send analysis results:', error.message);
      console.error('[VideoAnalysis] Error stack:', error.stack);
      console.log('[VideoAnalysis] ========================================\n');
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

