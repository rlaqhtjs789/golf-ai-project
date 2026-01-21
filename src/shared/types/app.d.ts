/**
 * Electron App API 타입 정의
 */

interface AppApi {
  quit: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
}

declare global {
  interface Window {
    app: AppApi;
  }
}

export {};


