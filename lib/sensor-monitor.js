/**
 * 센서 데이터 폴더 모니터링 서비스
 * 비디오 및 샷 데이터 자동 감지
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class SensorMonitor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      videoPath: config.videoPath || 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train',
      shotDataPath: config.shotDataPath || 'D:\\GTSGolf\\Signature\\app\\GTS_v2_Data\\StreamingAssets\\Data\\ShotData',
      pollInterval: config.pollInterval || 1000, // 1초마다 체크
    };
    
    this.knownVideoFiles = new Set();
    this.knownShotFiles = new Set();
    this.pendingShots = new Map(); // 파일명 -> { videos: [], shotData: null }
    this.isMonitoring = false;
    this.isCollecting = false; // 데이터 수집 여부
    this.intervalId = null;
    this.processedShotCount = 0; // 처리된 샷 개수 추적
    this._lastCheckLog = 0; // 마지막 체크 로그 시간
    this._lastPendingShotsEvent = 0; // 마지막 pendingShotsWaiting 이벤트 발생 시간 (디바운싱용)
  }

  /**
   * 모니터링 시작 (폴더 감지만, 데이터 수집 안함)
   */
  start() {
    if (this.isMonitoring) {
      console.log('[Sensor] Already monitoring.');
      return;
    }

    console.log('[Sensor] Starting folder monitoring (waiting for data collection)...');
    console.log(`   Video: ${this.config.videoPath}`);
    console.log(`   Shot Data: ${this.config.shotDataPath}`);

    // 초기 파일 목록은 저장하지 않음 (스윙 모드 진입 시점 기준으로 설정)

    this.isMonitoring = true;
    this.isCollecting = false; // 수집은 아직 시작 안함
    this.intervalId = setInterval(() => this._checkForNewFiles(), this.config.pollInterval);

    this.emit('started');
  }

  /**
   * 데이터 수집 시작 (이 시점의 파일 목록을 기준으로 설정)
   */
  startCollecting() {
    if (!this.isMonitoring) {
      console.log('[Sensor] Monitoring not started. Call start() first.');
      return;
    }
    
    if (this.isCollecting) {
      console.log('[Sensor] Already collecting data.');
      return;
    }

    console.log('[Sensor] Data collection started!');
    console.log('[Sensor] Initializing known files at collection start...');
    
    // 스윙 모드 진입 시점의 현재 파일 목록을 기준으로 설정
    // 이후에 새로 추가되는 파일만 처리
    this._initializeKnownFiles();
    
    this.isCollecting = true;
    this.processedShotCount = 0; // 수집 시작 시 카운트 초기화
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`[Sensor] ✅ DATA COLLECTION ACTIVATED!`);
    console.log(`[Sensor]    isCollecting = ${this.isCollecting}`);
    console.log(`[Sensor]    processedShotCount = ${this.processedShotCount}`);
    console.log(`[Sensor]    Current pending shots: ${this.pendingShots.size}`);
    console.log(`${'='.repeat(50)}\n`);
    
    // Process pending shots immediately after collection starts
    if (this.pendingShots.size > 0) {
      console.log(`[Sensor] 🔄 Processing ${this.pendingShots.size} pending shots immediately...`);
      this._processPendingShots();
    } else {
      console.log(`[Sensor] ℹ️  No pending shots to process`);
    }
  }

  /**
   * 데이터 수집 중지 (감지는 계속)
   */
  stopCollecting() {
    if (!this.isCollecting) return;
    
    console.log('[Sensor] Data collection stopped (monitoring continues)');
    this.isCollecting = false;
  }

  /**
   * 모니터링 완전 중지
   */
  stop() {
    if (!this.isMonitoring) return;

    console.log('[Sensor] Monitoring stopped');
    clearInterval(this.intervalId);
    this.isMonitoring = false;
    this.isCollecting = false;
    this.emit('stopped');
  }

  /**
   * 초기 파일 목록 저장
   */
  _initializeKnownFiles() {
    // 비디오 파일
    if (fs.existsSync(this.config.videoPath)) {
      const videoFiles = fs.readdirSync(this.config.videoPath)
        .filter(f => f.endsWith('.mp4'));
      videoFiles.forEach(f => this.knownVideoFiles.add(f));
      console.log(`   Existing videos: ${videoFiles.length}`);
    }

    // 샷 데이터 파일
    if (fs.existsSync(this.config.shotDataPath)) {
      const shotFiles = fs.readdirSync(this.config.shotDataPath)
        .filter(f => f.endsWith('.json'));
      shotFiles.forEach(f => this.knownShotFiles.add(f));
      console.log(`   Existing shot data: ${shotFiles.length}`);
    }
  }

  /**
   * 새로운 파일 체크
   */
  _checkForNewFiles() {
    // 주기적인 체크 로그 (10초마다만 출력)
    if (!this._lastCheckLog || Date.now() - this._lastCheckLog > 10000) {
      console.log(`[Sensor] Checking folders... (Videos: ${this.knownVideoFiles.size}, Shot Data: ${this.knownShotFiles.size}, Pending: ${this.pendingShots.size})`);
      this._lastCheckLog = Date.now();
    }
    
    this._checkNewVideos();
    this._checkNewShotData();
    this._processPendingShots();
  }

  /**
   * 새로운 비디오 파일 체크
   */
  _checkNewVideos() {
    if (!fs.existsSync(this.config.videoPath)) return;

    const currentFiles = fs.readdirSync(this.config.videoPath)
      .filter(f => f.endsWith('.mp4'));

    currentFiles.forEach(file => {
      if (!this.knownVideoFiles.has(file)) {
        const filePath = path.join(this.config.videoPath, file);
        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`\n${'='.repeat(40)}`);
        console.log(`[Sensor] New video detected!`);
        console.log(`   Filename: ${file}`);
        console.log(`   Size: ${fileSizeMB} MB`);
        console.log(`   Path: ${filePath}`);
        console.log(`   Total videos: ${this.knownVideoFiles.size + 1}`);
        
        this.knownVideoFiles.add(file);

        const videoInfo = this._parseVideoFilename(file);
        if (videoInfo) {
          console.log(`   Video type: ${videoInfo.type} (${videoInfo.type === 'front' ? 'front' : videoInfo.type === 'side' ? 'side' : 'impact'})`);
          this._addPendingVideo(videoInfo, file);
        } else {
          console.log(`   Warning: Filename parse failed - ignored`);
        }
        console.log(`${'='.repeat(40)}\n`);
      }
    });
  }

  /**
   * 새로운 샷 데이터 파일 체크
   */
  _checkNewShotData() {
    if (!fs.existsSync(this.config.shotDataPath)) return;

    const currentFiles = fs.readdirSync(this.config.shotDataPath)
      .filter(f => f.endsWith('.json'));

    currentFiles.forEach(file => {
      if (!this.knownShotFiles.has(file)) {
        const filePath = path.join(this.config.shotDataPath, file);
        const stats = fs.statSync(filePath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`\n${'='.repeat(40)}`);
        console.log(`[Sensor] New shot data detected!`);
        console.log(`   Filename: ${file}`);
        console.log(`   Size: ${fileSizeKB} KB`);
        console.log(`   Path: ${filePath}`);
        console.log(`   Total shot data files: ${this.knownShotFiles.size + 1}`);
        
        this.knownShotFiles.add(file);

        const shotData = this._parseShotDataFile(file);
        if (shotData) {
          // 클럽 타입 변환 (실제 GTS enum 정의에 따름)
          const clubNames = [
            'W1(Driver)', 'W2', 'W3', 'W4', 'W5', 'W7',  // 0-5
            'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9',       // 6-12
            'PW', 'AW', 'SW', 'LW', 'PT(Putter)', 'U(Utility)'   // 13-18
          ];
          const clubName = shotData.club !== undefined && shotData.club !== null 
            ? (clubNames[shotData.club] || `Club(${shotData.club})`)
            : 'N/A';
          
          console.log(`   Club: ${clubName}`);
          console.log(`   Ball Speed: ${shotData.ballSpeed || 0} m/s`);
          console.log(`   Club Speed: ${shotData.clubSpeed || 0} m/s`);
          console.log(`   Distance: ${shotData.dist || 0} m`);
          console.log(`   User: ${shotData.isGuest ? 'Guest' : `ID ${shotData.userId}`}`);
          this._addPendingShotData(shotData, file);
        } else {
          console.log(`   Warning: File parse failed - ignored`);
        }
        console.log(`${'='.repeat(40)}\n`);
      }
    });
  }

  /**
   * 비디오 파일명 파싱
   * 예: 250828152512,08BFB8C8FD4D,hare208,W1,61.1,0.0,10.9,2.9,-450.0,3512.0,204.1,212.0,1.3,pushdraw, ,0,0,f.mp4
   */
  _parseVideoFilename(filename) {
    const match = filename.match(/^([\d]+),.*,(f|s|club)\.mp4$/);
    if (!match) return null;

    const timestamp = match[1];
    const type = match[2];

    return {
      timestamp,
      type: type === 'f' ? 'front' : type === 's' ? 'side' : 'impact',
      filename,
      fullPath: path.join(this.config.videoPath, filename),
    };
  }

  /**
   * 샷 데이터 JSON 파일 파싱
   */
  _parseShotDataFile(filename) {
    try {
      const fullPath = path.join(this.config.shotDataPath, filename);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);

      // 타임스탬프 추출 (파일명에서: GTSshot_Guest_2026-01-20 11-32-28 오전.json)
      let timestamp = null;
      const timestampMatch = filename.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2})-(\d{2})-(\d{2})/);
      if (timestampMatch) {
        // Date 객체로 변환 후 타임스탬프로 변환
        const [year, month, day, hour, minute, second] = timestampMatch.slice(1).map(Number);
        const date = new Date(year, month - 1, day, hour, minute, second);
        timestamp = date.getTime();
      } else {
        // 파일명에서 타임스탬프를 추출할 수 없으면 파일 수정 시간 사용
        const stats = fs.statSync(fullPath);
        timestamp = stats.mtime.getTime();
      }
      
      return {
        filename,
        fullPath,
        timestamp, // 타임스탬프 추가 (비디오와 매칭용)
        userId: data.playerinfo?.user_id || 'guest',
        gender: data.playerinfo?.gender || 'M',
        isGuest: !data.playerinfo?.user_id || data.playerinfo?.user_id === '',
        club: data.club,
        ballSpeed: data.ballSpeed,
        clubSpeed: data.clubSpeed,
        launchAngle: data.launchAngle,
        faceAngle: data.faceAngle,
        azimuth: data.azimuth,
        apex: data.Apex,
        sideSpin: data.sideSpin,
        backSpin: data.backSpin,
        carry: data.carry,
        run: data.run,
        dist: data.dist,
        targetDist: data.TargetDist,
        shotShape: data.shotShape || data.shot_shape,
        _Positions: data._Positions || data.positions || [], // 볼 궤적 데이터
        rawData: data,
      };
    } catch (error) {
      console.error(`샷 데이터 파싱 실패: ${filename}`, error.message);
      return null;
    }
  }

  /**
   * 대기 중인 비디오 추가
   */
  _addPendingVideo(videoInfo, filename) {
    // 기존에 샷 데이터만 있는 경우 매칭
    const keys = Array.from(this.pendingShots.keys());
    let matchedKey = null;
    
    // 샷 데이터는 있지만 비디오가 없는 것 찾기
    for (const key of keys) {
      const pending = this.pendingShots.get(key);
      if (pending.shotData && pending.videos.length === 0) {
        matchedKey = key;
        break;
      }
    }
    
    if (matchedKey) {
      // 기존 샷 데이터에 비디오 추가
      const pending = this.pendingShots.get(matchedKey);
      pending.videos.push(videoInfo);
      console.log(`   [Match] Complete (${matchedKey}): Videos ${pending.videos.length}, Shot Data ✓`);
    } else {
      // 새로 생성
      const key = videoInfo.timestamp;
      if (!this.pendingShots.has(key)) {
        this.pendingShots.set(key, { videos: [], shotData: null });
      }
      const pending = this.pendingShots.get(key);
      pending.videos.push(videoInfo);
      console.log(`   [Pending] (${key}): Videos ${pending.videos.length}, Shot Data ${pending.shotData ? '✓' : '✗'}`);
    }
  }

  /**
   * 대기 중인 샷 데이터 추가
   */
  _addPendingShotData(shotData, filename) {
    console.log(`[Sensor] _addPendingShotData called: isCollecting=${this.isCollecting}, processedShotCount=${this.processedShotCount}`);
    console.log(`[Sensor] Shot data timestamp: ${shotData.timestamp || 'N/A'}`);
    
    // 타임스탬프 기반 매칭
    const shotTimestamp = shotData.timestamp;
    let matchedKey = null;
    
    if (shotTimestamp) {
      // 비디오 타임스탬프와 가장 가까운 것 찾기
      const keys = Array.from(this.pendingShots.keys());
      if (keys.length > 0) {
        let minDiff = Infinity;
        for (const key of keys) {
          const videoTimestamp = parseInt(key);
          if (!isNaN(videoTimestamp)) {
            const diff = Math.abs(shotTimestamp - videoTimestamp);
            if (diff < minDiff) {
              minDiff = diff;
              matchedKey = key;
            }
          }
        }
        // 5초 이내 차이면 매칭, 아니면 새로 생성
        if (minDiff > 5000) {
          matchedKey = null;
        }
      }
    }
    
    if (!matchedKey) {
      // 매칭되는 비디오가 없으면 샷 데이터 타임스탬프를 키로 사용
      const key = shotTimestamp ? shotTimestamp.toString() : Date.now().toString();
      this.pendingShots.set(key, { videos: [], shotData });
      console.log(`   [Pending] (${key}): Videos 0, Shot Data ✓ (new entry created)`);
    } else {
      // 기존 비디오에 샷 데이터 추가
      const pending = this.pendingShots.get(matchedKey);
      pending.shotData = shotData;
      console.log(`   [Pending] (${matchedKey}): Videos ${pending.videos.length}, Shot Data ✓ (added to existing)`);
    }
    
    // 샷 데이터 추가 후 즉시 처리 시도
    this._processPendingShots();
  }

  /**
   * 완료된 샷 처리
   */
  _processPendingShots() {
    // 수집 모드가 아니면 emit하지 않음
    if (!this.isCollecting) {
      if (this.pendingShots.size > 0) {
        // 이벤트 중복 발생 방지 (5초마다 한 번만)
        const now = Date.now();
        if (!this._lastPendingShotsEvent || now - this._lastPendingShotsEvent > 5000) {
          console.log(`[Sensor] Collection mode disabled - ${this.pendingShots.size} pending shots found but not processed (startSession required)`);
          // 수집 모드가 비활성화되어 있지만 샷 데이터가 있으면 이벤트 발생 (서비스에서 처리)
          this.emit('pendingShotsWaiting', {
            count: this.pendingShots.size,
            shots: Array.from(this.pendingShots.entries()).map(([key, pending]) => ({
              key,
              hasShotData: !!pending.shotData,
              hasVideos: pending.videos.length > 0,
            })),
          });
          this._lastPendingShotsEvent = now;
        }
      }
      return;
    }

    const now = Date.now();

    // 대기 중인 샷들을 시간 순으로 정렬
    const sortedPending = Array.from(this.pendingShots.entries())
      .sort((a, b) => {
        const timeA = isNaN(a[0]) ? 0 : parseInt(a[0]);
        const timeB = isNaN(b[0]) ? 0 : parseInt(b[0]);
        return timeA - timeB;
      });

    if (sortedPending.length > 0) {
      console.log(`[Sensor] Processing ${sortedPending.length} pending shots... (processed: ${this.processedShotCount})`);
    }

    for (const [key, pending] of sortedPending) {
      console.log(`[Sensor] Checking pending shot ${key}: videos=${pending.videos.length}, shotData=${pending.shotData ? '✓' : '✗'}`);
      
      // Process shot if shot data exists (video is optional)
      if (pending.shotData) {
        const isFirstShot = this.processedShotCount === 0;
        
        console.log(`\n${'='.repeat(40)}`);
        console.log(`[Sensor] Shot ${this.processedShotCount + 1} data complete!`);
        console.log(`   ID: ${key}`);
        console.log(`   Shot Data: ✓ (required)`);
        console.log(`   Videos: ${pending.videos.length} (optional - ${isFirstShot ? 'will be analyzed if available' : 'not required for 2nd+ shots'})`);
        console.log(`${'='.repeat(40)}\n`);
        
        // Extract videos if available (only for first shot)
        let videos = null;
        if (isFirstShot && pending.videos.length > 0) {
          const frontVideo = pending.videos.find(v => v.type === 'front');
          const sideVideo = pending.videos.find(v => v.type === 'side');
          const impactVideo = pending.videos.find(v => v.type === 'impact');
          
          if (frontVideo || sideVideo || impactVideo) {
            videos = {
              front: frontVideo,
              side: sideVideo,
              impact: impactVideo,
            };
            console.log(`[Sensor] Video data available: front=${!!frontVideo}, side=${!!sideVideo}, impact=${!!impactVideo}`);
          } else {
            console.log(`[Sensor] No valid video data found (proceeding with shot data only)`);
          }
        } else if (isFirstShot) {
          console.log(`[Sensor] No video data for first shot (proceeding with shot data only)`);
        }

        this.emit('newShot', {
          shotId: key,
          shotNumber: this.processedShotCount + 1,
          isFirstShot: isFirstShot,
          videos: videos, // null if no videos (will proceed with shot data only)
          shotData: pending.shotData,
        });

        this.processedShotCount++;
        this.pendingShots.delete(key);
        break; // Process one shot at a time
      } else {
        console.log(`[Sensor] ⏳ Waiting for shot data... (videos: ${pending.videos.length})`);
      }
    }
  }

  /**
   * 상태 확인
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      knownVideoFiles: this.knownVideoFiles.size,
      knownShotFiles: this.knownShotFiles.size,
      pendingShots: this.pendingShots.size,
      processedShotCount: this.processedShotCount,
    };
  }
}

module.exports = SensorMonitor;

