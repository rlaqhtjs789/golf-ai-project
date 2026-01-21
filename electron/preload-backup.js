const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload 스크립트
 * 렌더러 프로세스(웹뷰)에서 안전하게 Node.js API를 사용할 수 있도록 브릿지 역할
 */

// 웹뷰에서 사용할 API를 window.gfengine으로 노출
contextBridge.exposeInMainWorld('gfengine', {
  // ==========================================
  // 엔진 초기화 및 기본 정보
  // ==========================================
  
  /**
   * GFEngine2D 엔진 초기화
   * @param {number} direction - 촬영 방향 (0: Front, 1: Side)
   * @param {number} clubType - 클럽 타입 (0: Driver, 1: Iron, 2: Putter)
   * @param {number} handedId - 손잡이 (0: RightHanded, 1: LeftHanded)
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  initialize: (direction, clubType, handedId) => 
    ipcRenderer.invoke('gfengine:initialize', { direction, clubType, handedId }),
  
  /**
   * 엔진 버전 정보 조회
   * @returns {Promise<string>} 버전 문자열
   */
  getVersion: () => 
    ipcRenderer.invoke('gfengine:version'),
  
  /**
   * 엔진 라이선스 체크
   * @returns {Promise<{isValid: boolean, expiryDate?: string}>}
   */
  checkLicense: () => 
    ipcRenderer.invoke('gfengine:check-license'),
  
  // ==========================================
  // 영상 분석
  // ==========================================
  
  /**
   * 비디오 파일 분석 요청
   * @param {string} videoPath - 비디오 파일 경로
   * @param {object} options - 분석 옵션
   * @param {number} options.direction - 촬영 방향
   * @param {number} options.clubType - 클럽 타입
   * @param {number} options.handedId - 손잡이
   * @returns {Promise<object>} 분석 결과
   */
  analyzeVideo: (videoPath, options) => 
    ipcRenderer.invoke('gfengine:analyze-video', { videoPath, options }),
  
  /**
   * 분석 취소
   * @returns {Promise<boolean>}
   */
  cancelAnalysis: () => 
    ipcRenderer.invoke('gfengine:cancel-analysis'),
  
  // ==========================================
  // 진행 상황 이벤트 리스너
  // ==========================================
  
  /**
   * 분석 진행 상황 구독
   * @param {function} callback - 진행 상황을 받을 콜백 (data: {progress: number, stage: string})
   * @returns {function} 구독 해제 함수
   */
  onProgress: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('gfengine:progress', listener);
    
    // 구독 해제 함수 반환
    return () => {
      ipcRenderer.removeListener('gfengine:progress', listener);
    };
  },
  
  /**
   * 분석 완료 이벤트 구독
   * @param {function} callback - 완료 시 호출될 콜백
   * @returns {function} 구독 해제 함수
   */
  onAnalysisComplete: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('gfengine:analysis-complete', listener);
    
    return () => {
      ipcRenderer.removeListener('gfengine:analysis-complete', listener);
    };
  },
  
  /**
   * 에러 이벤트 구독
   * @param {function} callback - 에러 발생 시 호출될 콜백
   * @returns {function} 구독 해제 함수
   */
  onError: (callback) => {
    const listener = (event, error) => callback(error);
    ipcRenderer.on('gfengine:error', listener);
    
    return () => {
      ipcRenderer.removeListener('gfengine:error', listener);
    };
  },
  
  // ==========================================
  // 파일 시스템 (비디오 파일 선택 등)
  // ==========================================
  
  /**
   * 파일 선택 다이얼로그 열기
   * @returns {Promise<{filePath: string, cancelled: boolean}>}
   */
  selectVideoFile: () => 
    ipcRenderer.invoke('gfengine:select-video-file'),
  
  // ==========================================
  // 유틸리티
  // ==========================================
  
  /**
   * 앱 버전 정보
   * @returns {Promise<string>}
   */
  getAppVersion: () => 
    ipcRenderer.invoke('app:version'),
  
  /**
   * 로그 메시지 전송 (디버깅용)
   * @param {string} level - 로그 레벨 (info, warn, error)
   * @param {string} message - 로그 메시지
   */
  log: (level, message) => 
    ipcRenderer.send('app:log', { level, message }),
});

// 개발 모드 여부도 노출
contextBridge.exposeInMainWorld('electron', {
  isDev: process.env.NODE_ENV === 'development',
  platform: process.platform,
});

// 업데이터 API 노출
contextBridge.exposeInMainWorld('updater', {
  /**
   * 업데이트 확인
   */
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  
  /**
   * 업데이트 다운로드
   */
  downloadUpdate: () => ipcRenderer.invoke('updater:download-update'),
  
  /**
   * 앱 재시작 및 업데이트 설치
   */
  quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install'),
  
  /**
   * 업데이터 메시지 구독
   */
  onMessage: (callback) => {
    const listener = (event, message) => callback(message);
    ipcRenderer.on('updater-message', listener);
    
    return () => {
      ipcRenderer.removeListener('updater-message', listener);
    };
  },
});

console.log('Preload script loaded successfully');

