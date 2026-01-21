const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { setupAnalysisHandlers } = require('../lib/analysis-service');
const AppUpdater = require('./updater');

let mainWindow;
let appUpdater;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    autoHideMenuBar: true, // 메뉴바 자동 숨김
    // fullscreen: true, // 필요시 전체화면
  });

  // 개발 모드와 프로덕션 모드 구분
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 개발 모드: Vite 개발 서버 로드
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools(); // 개발자 도구 자동 열기
  } else {
    // 프로덕션 모드: 빌드된 정적 파일 로드
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 윈도우 닫기 이벤트
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 업데이터 초기화
  appUpdater = new AppUpdater(mainWindow);
  
  // 개발 모드가 아닐 때만 자동 업데이트 확인
  if (!isDev) {
    // 앱 시작 5초 후 업데이트 확인
    setTimeout(() => {
      appUpdater.checkForUpdates();
    }, 5000);
  }
}

// Electron 준비 완료
app.whenReady().then(() => {
  createWindow();
  
  // IPC 핸들러 설정 (영상 분석 관련)
  setupAnalysisHandlers(ipcMain);
  
  // 업데이트 IPC 핸들러
  ipcMain.handle('updater:check-for-updates', () => {
    if (appUpdater) {
      appUpdater.checkForUpdates();
    }
  });
  
  ipcMain.handle('updater:download-update', () => {
    if (appUpdater) {
      appUpdater.downloadUpdate();
    }
  });
  
  ipcMain.handle('updater:quit-and-install', () => {
    if (appUpdater) {
      appUpdater.quitAndInstall();
    }
  });
  
  app.on('activate', () => {
    // macOS에서 독 아이콘 클릭 시 윈도우 재생성
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 윈도우가 닫혔을 때
app.on('window-all-closed', () => {
  // macOS가 아니면 앱 종료
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱 종료 전 정리 작업
app.on('before-quit', () => {
  console.log('애플리케이션 종료 중...');
  // 필요시 리소스 정리
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

