/**
 * 스윙 분석 Preload 스크립트
 * 렌더러 프로세스에 분석 API 노출
 */

const { contextBridge, ipcRenderer } = require('electron');

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
});


