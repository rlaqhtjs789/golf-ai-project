/**
 * Electron Updater Type Definitions
 */

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

interface UpdaterAPI {
  /**
   * 업데이트 확인
   */
  checkForUpdates: () => Promise<void>;

  /**
   * 업데이트 다운로드
   */
  downloadUpdate: () => Promise<void>;

  /**
   * 앱 재시작 및 업데이트 설치
   */
  quitAndInstall: () => Promise<void>;

  /**
   * 업데이터 메시지 구독
   */
  onMessage: (callback: (message: {
    type: string;
    data: any;
  }) => void) => () => void;
}

interface Window {
  updater?: UpdaterAPI;
}


