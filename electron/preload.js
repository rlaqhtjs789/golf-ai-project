/**
 * Preload 스크립트 (통합)
 * 기존 API + 스윙 분석 API
 */

const { contextBridge, ipcRenderer } = require('electron');

// 기존 updater API
contextBridge.exposeInMainWorld('updater', {
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download-update'),
  quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install'),
  
  onUpdateAvailable: (callback) => {
    const handler = (event, info) => callback(info);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },
  
  onUpdateDownloaded: (callback) => {
    const handler = (event, info) => callback(info);
    ipcRenderer.on('update-downloaded', handler);
    return () => ipcRenderer.removeListener('update-downloaded', handler);
  },
  
  onDownloadProgress: (callback) => {
    const handler = (event, progress) => callback(progress);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },
  
  onUpdateError: (callback) => {
    const handler = (event, error) => callback(error);
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  },
});

// 스윙 분석 API
contextBridge.exposeInMainWorld('swingAnalysis', {
  // 세션 시작
  startSession: (sessionUuid, totalSwingCount) => {
    return ipcRenderer.invoke('analysis:start-session', { sessionUuid, totalSwingCount });
  },
  
  // 세션 중지
  stopSession: () => {
    return ipcRenderer.invoke('analysis:stop-session');
  },
  
  // 상태 조회
  getStatus: () => {
    return ipcRenderer.invoke('analysis:get-status');
  },

  // 헬스 상태 조회
  getHealth: () => {
    return ipcRenderer.invoke('analysis:get-health');
  },

  // 수동 재연결
  reconnect: () => {
    return ipcRenderer.invoke('analysis:reconnect');
  },
  
  // 진행 상황 구독
  onProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('analysis:progress', handler);
    return () => ipcRenderer.removeListener('analysis:progress', handler);
  },
  
  // 샷 완료 이벤트 구독
  onShotComplete: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('analysis:shot-complete', handler);
    return () => ipcRenderer.removeListener('analysis:shot-complete', handler);
  },

  // 샷 데이터 수신
  onShotData: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('swing-analysis:shot-data', handler);
    return () => ipcRenderer.removeListener('swing-analysis:shot-data', handler);
  },

  // 영상 분석 결과 수신
  onVideoResult: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('swing-analysis:video-result', handler);
    return () => ipcRenderer.removeListener('swing-analysis:video-result', handler);
  },

  // 세션 진행 상황 수신
  onSessionProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('swing-analysis:session-progress', handler);
    return () => ipcRenderer.removeListener('swing-analysis:session-progress', handler);
  },

  // ========== 영상 분석 상태 이벤트 ==========
  
  // 영상 분석 시작
  onVideoAnalysisStart: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:video-analysis-start', handler);
    return () => ipcRenderer.removeListener('engine:video-analysis-start', handler);
  },

  // 영상 분석 진행 상황
  onVideoAnalysisProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:video-analysis-progress', handler);
    return () => ipcRenderer.removeListener('engine:video-analysis-progress', handler);
  },

  // 영상 분석 완료
  onVideoAnalysisComplete: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:video-analysis-complete', handler);
    return () => ipcRenderer.removeListener('engine:video-analysis-complete', handler);
  },

  // 영상 분석 에러
  onVideoAnalysisError: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:video-analysis-error', handler);
    return () => ipcRenderer.removeListener('engine:video-analysis-error', handler);
  },

  // ========== 샷 데이터 이벤트 ==========
  
  // 새로운 샷 데이터 수신
  onNewShot: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('swing-analysis:shot-data', handler);
    return () => ipcRenderer.removeListener('swing-analysis:shot-data', handler);
  },

  // ========== 엔진 헬스 이벤트 ==========
  
  // 연결 끊김
  onConnectionLost: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:connection-lost', handler);
    return () => ipcRenderer.removeListener('engine:connection-lost', handler);
  },

  // 재연결 시도
  onReconnectAttempt: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:reconnect-attempt', handler);
    return () => ipcRenderer.removeListener('engine:reconnect-attempt', handler);
  },

  // 재연결 성공
  onReconnectSuccess: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:reconnect-success', handler);
    return () => ipcRenderer.removeListener('engine:reconnect-success', handler);
  },

  // 재연결 실패
  onReconnectFailed: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:reconnect-failed', handler);
    return () => ipcRenderer.removeListener('engine:reconnect-failed', handler);
  },

  // 연결 복구
  onConnectionRestored: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('engine:connection-restored', handler);
    return () => ipcRenderer.removeListener('engine:connection-restored', handler);
  },
});

// 앱 제어 API
contextBridge.exposeInMainWorld('app', {
  quit: () => ipcRenderer.invoke('app:quit'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  
  // 최대화 상태 변경 이벤트
  onIsMaximized: (callback) => {
    const handler = (event, isMaximized) => callback(isMaximized);
    ipcRenderer.on('window:is-maximized', handler);
    return () => ipcRenderer.removeListener('window:is-maximized', handler);
  },
});

