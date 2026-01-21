const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { setupAnalysisHandlers } = require('../lib/analysis-service');
const AppUpdater = require('./updater');
const SwingAnalysisService = require('../lib/swing-analysis-service');
const log = require('electron-log');

// Configure electron-log
log.transports.file.level = 'info';
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.console.level = 'info';

// Log file location
const logPath = log.transports.file.getFile().path;
console.log(`📝 Log file: ${logPath}`);

// Override console methods to also write to file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = (...args) => {
  originalConsoleLog(...args);
  log.info(...args);
};

console.error = (...args) => {
  originalConsoleError(...args);
  log.error(...args);
};

console.warn = (...args) => {
  originalConsoleWarn(...args);
  log.warn(...args);
};

// Windows 콘솔 인코딩을 UTF-8로 설정 (한글 깨짐 방지)
// 로그는 영어로 출력하도록 변경하여 인코딩 문제 방지
if (process.platform === 'win32') {
  try {
    require('child_process').execSync('chcp 65001 >nul 2>&1', { stdio: 'ignore' });
  } catch (error) {
    // 무시
  }
}

let mainWindow;
let appUpdater;
let analysisService = null;

function createWindow() {
  // 캐시 디렉토리 설정 (액세스 거부 에러 방지)
  app.setPath('userData', path.join(app.getPath('appData'), 'gts-ai-analysis'));
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // 프레임 제거 (타이틀바 + 메뉴바 완전 제거)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // webSecurity는 기본값(true) 사용
      // allowRunningInsecureContent 제거 (보안 경고 방지)
    },
  });

  // 메뉴바 완전 제거
  mainWindow.setMenu(null);
  
  const isDev = process.env.NODE_ENV === 'development';
  
  // User-Agent를 일반 Chrome 브라우저로 설정
  mainWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // 앱 시작 시 세션 캐시 클리어
  const session = mainWindow.webContents.session;
  session.clearCache().then(() => {
    console.log('✅ 브라우저 캐시 클리어 완료');
  }).catch(err => {
    console.error('❌ 캐시 클리어 실패:', err);
  });

  // 쿠키도 필요시 클리어 (선택사항)
  // session.clearStorageData({
  //   storages: ['cookies', 'localstorage', 'sessionstorage', 'cachestorage']
  // });
  
  // IPC 테스트 모드
  const testMode = process.argv.includes('--test-ipc');
  
  if (testMode) {
    mainWindow.loadFile(path.join(__dirname, '../test-ipc.html'));
    mainWindow.webContents.openDevTools();
    console.log('🧪 IPC 테스트 모드');
  } else {
    // ai.playgts.com으로 연결 (버전 파라미터 추가로 캐시 우회)
    const version = app.getVersion();
    const timestamp = Date.now();
    const url = `https://ai.playgts.com?v=${version}&t=${timestamp}`;
    
    mainWindow.loadURL(url, {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHeaders: 'pragma: no-cache\nCache-Control: no-cache, no-store, must-revalidate\n'
    });
    console.log('🌐 웹뷰 연결:', url);
    
    // F12 키로 DevTools 열 수 있음 (프로덕션 포함)
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // 로딩 에러 디버깅
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ 로딩 실패:', errorCode, errorDescription, validatedURL);
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ 페이지 로딩 완료');
    
    // 헤더를 드래그 가능하게 만드는 CSS 주입
    mainWindow.webContents.insertCSS(`
      /* 헤더 영역을 드래그 가능하게 설정 */
      header {
        -webkit-app-region: drag;
      }
      
      /* 버튼, 링크, 인풋 등은 클릭 가능하게 설정 */
      header button,
      header a,
      header input,
      header select,
      header textarea,
      header [role="button"],
      header .clickable {
        -webkit-app-region: no-drag;
      }
    `);
  });

  // 최대화/복원 상태 변경 시 렌더러에 알림
  mainWindow.on('maximize', () => {
    console.log('✅ 창 최대화 이벤트 발생');
    mainWindow.webContents.send('window:is-maximized', true);
  });
  
  mainWindow.on('unmaximize', () => {
    console.log('✅ 창 복원 이벤트 발생');
    mainWindow.webContents.send('window:is-maximized', false);
  });

  // F12 키로 개발자 도구 열기/닫기 (프로덕션 포함)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // 자동 업데이트 활성화
  appUpdater = new AppUpdater(mainWindow);
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
  
  // 스윙 분석 서비스 초기화 (mainWindow 전달)
  analysisService = new SwingAnalysisService(mainWindow);
  console.log('✅ Swing analysis service ready');
  
  // Start sensor folder detection on app startup (monitoring only, no data collection)
  try {
    analysisService.startMonitoringOnly();
    console.log('✅ Sensor folder detection started (background)');
  } catch (error) {
    console.error('⚠️  Failed to start sensor folder detection:', error.message);
  }
  
  // 기존 IPC 핸들러 설정
  setupAnalysisHandlers(ipcMain);
  
  // ==================== 스윙 분석 IPC 핸들러 ====================
  
  // Start analysis session
  ipcMain.handle('analysis:start-session', async (event, { sessionUuid, totalSwingCount }) => {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📡 [IPC] SESSION START REQUEST RECEIVED`);
      console.log(`${'='.repeat(60)}`);
      console.log(`📡 [IPC] Session UUID: ${sessionUuid}`);
      console.log(`📡 [IPC] Total Swings: ${totalSwingCount}`);
      console.log(`📡 [IPC] analysisService exists: ${!!analysisService}`);
      console.log(`📡 [IPC] analysisService.isActive: ${analysisService?.isActive}`);
      
      if (!analysisService) {
        console.error('📡 [IPC] ❌ analysisService is null!');
        return { success: false, error: 'Analysis service not initialized' };
      }
      
      await analysisService.startSession(sessionUuid, totalSwingCount);
      
      console.log(`📡 [IPC] ✅ Session started successfully`);
      console.log(`📡 [IPC] analysisService.isActive: ${analysisService.isActive}`);
      console.log(`📡 [IPC] analysisService.monitor.isCollecting: ${analysisService.monitor?.isCollecting}`);
      console.log(`${'='.repeat(60)}\n`);
      
      return { success: true };
    } catch (error) {
      console.error('📡 [IPC] ❌ Session start failed:', error);
      console.error('📡 [IPC] Error stack:', error.stack);
      return { success: false, error: error.message };
    }
  });

  // 분석 세션 중지
  ipcMain.handle('analysis:stop-session', async () => {
    try {
      await analysisService.stopSession();
      return { success: true };
    } catch (error) {
      console.error('세션 중지 실패:', error);
      return { success: false, error: error.message };
    }
  });

  // 분석 상태 조회
  ipcMain.handle('analysis:get-status', () => {
    return analysisService.getStatus();
  });

  // 헬스 상태 조회
  ipcMain.handle('analysis:get-health', () => {
    return analysisService.getHealthStatus();
  });

  // 수동 재연결
  ipcMain.handle('analysis:reconnect', async () => {
    try {
      await analysisService.manualReconnect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  // ==================== 업데이터 IPC 핸들러 ====================
  
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

    // 앱 종료 핸들러
    ipcMain.handle('app:quit', () => {
      console.log('🚪 앱 종료 요청');
      app.quit();
    });

    // 창 최소화/최대화/닫기
    ipcMain.handle('window:minimize', () => {
      console.log('🔽 창 최소화 요청');
      if (mainWindow) {
        mainWindow.minimize();
        console.log('✅ 창 최소화 완료');
      }
    });

    ipcMain.handle('window:maximize', () => {
      console.log('🔼 창 최대화/복원 요청');
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
          console.log('✅ 창 복원 완료');
          return { isMaximized: false };
        } else {
          mainWindow.maximize();
          console.log('✅ 창 최대화 완료');
          return { isMaximized: true };
        }
      }
      return { isMaximized: false };
    });

    ipcMain.handle('window:close', () => {
      console.log('❌ 창 닫기 요청');
      if (mainWindow) {
        mainWindow.close();
        console.log('✅ 창 닫기 완료');
      }
    });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 윈도우가 닫혔을 때
app.on('window-all-closed', async () => {
  // 분석 서비스 정리
  if (analysisService) {
    await analysisService.stopSession();
    analysisService = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 앱 종료 전 정리 작업
app.on('before-quit', async () => {
  console.log('애플리케이션 종료 중...');
  
  // 분석 서비스 정리
  if (analysisService) {
    await analysisService.stopSession();
  }
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

