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

      // 타임스탬프 추출 (파일명에서)
      const timestampMatch = filename.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2})-(\d{2})-(\d{2})/);
      
      return {
        filename,
        fullPath,
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
    // 타임스탬프 기반 매칭 (가장 가까운 시간)
    const keys = Array.from(this.pendingShots.keys());
    
    if (keys.length === 0) {
      // 아직 비디오가 없으면 새로 생성
      const key = Date.now().toString();
      this.pendingShots.set(key, { videos: [], shotData });
      console.log(`   [Pending] (${key}): Videos 0, Shot Data ✓`);
    } else {
      // 가장 최근 것에 매칭
      const latestKey = keys[keys.length - 1];
      const pending = this.pendingShots.get(latestKey);
      pending.shotData = shotData;
      console.log(`   [Pending] (${latestKey}): Videos ${pending.videos.length}, Shot Data ✓`);
    }
  }

  /**
   * 완료된 샷 처리
   */
  _processPendingShots() {
    // 수집 모드가 아니면 emit하지 않음
    if (!this.isCollecting) {
      // console.log('   ⚠️  수집 모드 비활성화 - 이벤트 발생 안 함 (startSession 호출 필요)');
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

    for (const [key, pending] of sortedPending) {
      // 첫 번째 샷: 샷데이터만 있으면 바로 처리 (비디오는 선택사항, 있으면 백그라운드 분석)
      if (this.processedShotCount === 0) {
        if (pending.shotData) {
          console.log(`\n${'='.repeat(40)}`);
          console.log(`[Sensor] First shot data complete!`);
          console.log(`   ID: ${key}`);
          console.log(`   Videos: ${pending.videos.length} (optional, will be analyzed in background if available)`);
          console.log(`   Shot Data: ✓`);
          console.log(`${'='.repeat(40)}\n`);
          
          // 비디오가 있으면 포함 (없어도 됨)
          const frontVideo = pending.videos.find(v => v.type === 'front');
          const sideVideo = pending.videos.find(v => v.type === 'side');
          const impactVideo = pending.videos.find(v => v.type === 'impact');

          this.emit('newShot', {
            shotId: key,
            shotNumber: this.processedShotCount + 1,
            isFirstShot: true,
            videos: (frontVideo || sideVideo || impactVideo) ? {
              front: frontVideo,
              side: sideVideo,
              impact: impactVideo,
            } : null, // 비디오가 없어도 됨
            shotData: pending.shotData,
          });

          this.processedShotCount++;
          this.pendingShots.delete(key);
          break; // 한 번에 하나씩만 처리
        }
      } else {
        // 두 번째 샷 이후: 샷데이터만 있으면 즉시 처리
        if (pending.shotData) {
          console.log(`\n${'='.repeat(40)}`);
          console.log(`[Sensor] Shot ${this.processedShotCount + 1} data complete!`);
          console.log(`   ID: ${key}`);
          console.log(`   Videos: Not required (2nd shot onwards)`);
          console.log(`   Shot Data: ✓`);
          console.log(`${'='.repeat(40)}\n`);

          this.emit('newShot', {
            shotId: key,
            shotNumber: this.processedShotCount + 1,
            isFirstShot: false,
            videos: null, // 비디오 없음
            shotData: pending.shotData,
          });

          this.processedShotCount++;
          this.pendingShots.delete(key);
          break; // 한 번에 하나씩만 처리
        }
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

