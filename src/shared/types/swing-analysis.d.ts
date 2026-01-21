/**
 * Swing Analysis API 타입 정의
 */

interface SwingAnalysisAPI {
  // 세션 관리
  startSession: (sessionUuid: string, totalSwingCount: number) => Promise<{ success: boolean; error?: string }>;
  stopSession: () => Promise<{ success: boolean; error?: string }>;
  getStatus: () => Promise<any>;
  getHealth: () => Promise<any>;
  reconnect: () => Promise<any>;

  // 이벤트 리스너
  onProgress: (callback: (data: any) => void) => () => void;
  onShotComplete: (callback: (data: any) => void) => () => void;
  onShotData: (callback: (data: any) => void) => () => void;
  onVideoResult: (callback: (data: any) => void) => () => void;
  onSessionProgress: (callback: (data: any) => void) => () => void;

  // 영상 분석 상태 이벤트 (실시간 모니터링)
  onVideoAnalysisStart: (callback: (data: { videoType: 'front' | 'side'; filename: string }) => void) => () => void;
  onVideoAnalysisProgress: (callback: (data: { videoType: 'front' | 'side'; stage: string; progress: number }) => void) => () => void;
  onVideoAnalysisComplete: (callback: (data: { videoType: 'front' | 'side'; result: any }) => void) => () => void;
  onVideoAnalysisError: (callback: (data: { videoType: 'front' | 'side'; error: string }) => void) => () => void;

  // 샷 데이터 이벤트
  onNewShot: (callback: (data: any) => void) => () => void;

  // 헬스 모니터링
  onConnectionLost: (callback: (data?: any) => void) => () => void;
  onReconnectAttempt: (callback: (data?: any) => void) => () => void;
  onReconnectSuccess: (callback: (data?: any) => void) => () => void;
  onReconnectFailed: (callback: (data?: any) => void) => () => void;
  onConnectionRestored: (callback: (data?: any) => void) => () => void;
}

declare global {
  interface Window {
    swingAnalysis: SwingAnalysisAPI;
  }
}

export {};

