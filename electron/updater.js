/**
 * Electron Auto Updater
 * 
 * 자동 업데이트 기능 관리
 */

const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('electron-log');

// 로그 설정
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

class AppUpdater {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  setupAutoUpdater() {
    // 자동 다운로드 비활성화 (사용자 확인 후 다운로드)
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // 업데이트 확인 가능
    autoUpdater.on('checking-for-update', () => {
      log.info('업데이트 확인 중...');
      this.sendToRenderer('update-checking');
    });

    // 업데이트 사용 가능
    autoUpdater.on('update-available', (info) => {
      log.info('업데이트 사용 가능:', info.version);
      
      this.sendToRenderer('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });

      // 사용자에게 업데이트 다운로드 확인
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: '업데이트 사용 가능',
        message: `새로운 버전 ${info.version}이(가) 있습니다.`,
        detail: '지금 다운로드하시겠습니까?',
        buttons: ['다운로드', '나중에'],
        defaultId: 0,
        cancelId: 1,
      }).then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
    });

    // 업데이트 없음
    autoUpdater.on('update-not-available', (info) => {
      log.info('최신 버전입니다:', info.version);
      this.sendToRenderer('update-not-available', {
        version: info.version,
      });
    });

    // 다운로드 진행 상황
    autoUpdater.on('download-progress', (progressObj) => {
      const message = `다운로드 속도: ${progressObj.bytesPerSecond} - ${progressObj.percent.toFixed(2)}% 완료 (${progressObj.transferred}/${progressObj.total})`;
      log.info(message);
      
      this.sendToRenderer('update-download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond,
      });

      // 프로그레스 바 업데이트
      if (this.mainWindow) {
        this.mainWindow.setProgressBar(progressObj.percent / 100);
      }
    });

    // 다운로드 완료
    autoUpdater.on('update-downloaded', (info) => {
      log.info('업데이트 다운로드 완료:', info.version);
      
      this.sendToRenderer('update-downloaded', {
        version: info.version,
      });

      // 프로그레스 바 완료
      if (this.mainWindow) {
        this.mainWindow.setProgressBar(-1);
      }

      // 설치 확인
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: '업데이트 설치',
        message: '업데이트가 다운로드되었습니다.',
        detail: '앱을 재시작하여 업데이트를 설치하시겠습니까?',
        buttons: ['재시작', '나중에'],
        defaultId: 0,
        cancelId: 1,
      }).then(result => {
        if (result.response === 0) {
          // 즉시 재시작 및 설치
          setImmediate(() => autoUpdater.quitAndInstall(false, true));
        }
      });
    });

    // 에러
    autoUpdater.on('error', (error) => {
      log.error('업데이트 에러:', error);
      
      this.sendToRenderer('update-error', {
        message: error.message,
      });

      dialog.showErrorBox('업데이트 에러', error.message);
    });
  }

  /**
   * 렌더러 프로세스로 메시지 전송
   */
  sendToRenderer(channel, data = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('updater-message', {
        type: channel,
        data,
      });
    }
  }

  /**
   * 업데이트 확인
   */
  checkForUpdates() {
    autoUpdater.checkForUpdates();
  }

  /**
   * 수동 업데이트 다운로드
   */
  downloadUpdate() {
    autoUpdater.downloadUpdate();
  }

  /**
   * 즉시 설치 (다운로드 완료 후)
   */
  quitAndInstall() {
    autoUpdater.quitAndInstall(false, true);
  }
}

module.exports = AppUpdater;

