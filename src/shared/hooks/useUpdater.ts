/**
 * Electron Auto Updater Hook
 */

import { useEffect, useState, useCallback } from 'react';

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

interface UpdaterMessage {
  type: string;
  data: any;
}

interface UpdaterState {
  checking: boolean;
  updateAvailable: boolean;
  updateInfo: UpdateInfo | null;
  downloading: boolean;
  downloadProgress: UpdateProgress | null;
  downloaded: boolean;
  error: string | null;
}

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({
    checking: false,
    updateAvailable: false,
    updateInfo: null,
    downloading: false,
    downloadProgress: null,
    downloaded: false,
    error: null,
  });

  useEffect(() => {
    // @ts-ignore - window.updater는 preload에서 노출
    if (!window.updater) {
      console.warn('Updater API가 사용 불가능합니다.');
      return;
    }

    // @ts-ignore
    const unsubscribe = window.updater.onMessage((message: UpdaterMessage) => {
      switch (message.type) {
        case 'update-checking':
          setState(prev => ({
            ...prev,
            checking: true,
            error: null,
          }));
          break;

        case 'update-available':
          setState(prev => ({
            ...prev,
            checking: false,
            updateAvailable: true,
            updateInfo: message.data,
          }));
          break;

        case 'update-not-available':
          setState(prev => ({
            ...prev,
            checking: false,
            updateAvailable: false,
            updateInfo: message.data,
          }));
          break;

        case 'update-download-progress':
          setState(prev => ({
            ...prev,
            downloading: true,
            downloadProgress: message.data,
          }));
          break;

        case 'update-downloaded':
          setState(prev => ({
            ...prev,
            downloading: false,
            downloaded: true,
            updateInfo: message.data,
          }));
          break;

        case 'update-error':
          setState(prev => ({
            ...prev,
            checking: false,
            downloading: false,
            error: message.data.message,
          }));
          break;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const checkForUpdates = useCallback(() => {
    // @ts-ignore
    if (window.updater) {
      // @ts-ignore
      window.updater.checkForUpdates();
    }
  }, []);

  const downloadUpdate = useCallback(() => {
    // @ts-ignore
    if (window.updater) {
      // @ts-ignore
      window.updater.downloadUpdate();
    }
  }, []);

  const quitAndInstall = useCallback(() => {
    // @ts-ignore
    if (window.updater) {
      // @ts-ignore
      window.updater.quitAndInstall();
    }
  }, []);

  return {
    ...state,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
  };
}


