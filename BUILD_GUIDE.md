# 🏗️ Electron 빌드 가이드 (Python 포함)

Python 서버와 DLL을 포함한 Electron 앱 빌드 가이드

---

## 🎯 빌드 전략

### 옵션 1: Python 실행 파일 포함 (권장 ✅)

Python 스크립트를 `.exe`로 변환하여 Electron에 포함

**장점:**
- ✅ **사용자 PC에 Python 설치 완전 불필요!** 
- ✅ **Python 런타임이 exe에 포함됨**
- ✅ 의존성 문제 없음
- ✅ 배포 간단
- ✅ 어떤 Windows PC에서도 실행

**단점:**
- ⚠️ 빌드 파일 크기 증가 (~80MB)
  - Python 런타임: ~30MB
  - 라이브러리: ~50MB

**중요:** PyInstaller가 만든 exe는 **Python 인터프리터를 포함**하고 있어서
사용자 PC에 Python이 전혀 설치되어 있지 않아도 정상 작동합니다!

---

### 옵션 2: Python 설치 전제 조건

사용자 PC에 Python이 설치되어 있다고 가정

**장점:**
- ✅ 빌드 파일 작음
- ✅ 개발 환경과 동일

**단점:**
- ❌ 사용자가 Python 설치 필요
- ❌ 버전 불일치 가능성

---

## 📦 옵션 1: Python 실행 파일 만들기 (권장)

### 1단계: PyInstaller 설치

```bash
pip install pyinstaller
```

### 2단계: Python 서버를 EXE로 빌드

```bash
cd D:\dev\gstAI

# 단일 파일로 빌드
pyinstaller --onefile ^
  --add-data "bin/libGFEngine2D.dll;." ^
  --add-data "bin/tensorflow.dll;." ^
  --add-data "bin/libgcc_s_seh-1.dll;." ^
  --add-data "bin/libstdc++-6.dll;." ^
  --add-data "bin/libwinpthread-1.dll;." ^
  --hidden-import=ctypes ^
  --hidden-import=json ^
  --hidden-import=sys ^
  bin/gfengine-server-improved.py
```

**결과:** `dist/gfengine-server-improved.exe` 생성

### 3단계: Node.js 래퍼 수정

```javascript
// lib/gfengine-process-python.js
const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');

class GFEngineProcessPython {
  constructor() {
    // 프로덕션: exe 사용, 개발: python 스크립트 사용
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      this.pythonCommand = 'python';
      this.pythonScript = path.join(__dirname, '../bin/gfengine-server-improved.py');
    } else {
      // 프로덕션: exe 사용
      this.pythonCommand = path.join(
        process.resourcesPath, 
        'bin/gfengine-server-improved.exe'
      );
      this.pythonScript = null;
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      const args = this.pythonScript ? [this.pythonScript] : [];
      
      this.process = spawn(this.pythonCommand, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.pythonScript 
          ? path.join(__dirname, '../bin')
          : path.join(process.resourcesPath, 'bin'),
      });
      
      // ... 나머지 로직
    });
  }
}
```

### 4단계: electron-builder 설정

```json
// package.json
{
  "build": {
    "appId": "com.yourcompany.gstai",
    "productName": "GTS AI Analysis",
    "directories": {
      "buildResources": "build",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "lib/**/*",
      "bin/**/*",
      "!bin/*.py",
      "!bin/__pycache__",
      "node_modules/**/*"
    ],
    "extraResources": [
      {
        "from": "dist-python/gfengine-server-improved.exe",
        "to": "bin/gfengine-server-improved.exe"
      },
      {
        "from": "bin/libGFEngine2D.dll",
        "to": "bin/libGFEngine2D.dll"
      },
      {
        "from": "bin/tensorflow.dll",
        "to": "bin/tensorflow.dll"
      },
      {
        "from": "bin/libgcc_s_seh-1.dll",
        "to": "bin/libgcc_s_seh-1.dll"
      },
      {
        "from": "bin/libstdc++-6.dll",
        "to": "bin/libstdc++-6.dll"
      },
      {
        "from": "bin/libwinpthread-1.dll",
        "to": "bin/libwinpthread-1.dll"
      }
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

---

## 🛠️ 빌드 스크립트

### build-all.bat (Windows)

```bat
@echo off
echo ========================================
echo GTS AI Analysis 빌드 스크립트
echo ========================================

echo.
echo [1/5] Python 서버 빌드 중...
echo ========================================
pyinstaller --onefile ^
  --add-data "bin/libGFEngine2D.dll;." ^
  --add-data "bin/tensorflow.dll;." ^
  --add-data "bin/libgcc_s_seh-1.dll;." ^
  --add-data "bin/libstdc++-6.dll;." ^
  --add-data "bin/libwinpthread-1.dll;." ^
  --hidden-import=ctypes ^
  --hidden-import=json ^
  --hidden-import=sys ^
  --distpath dist-python ^
  bin/gfengine-server-improved.py

if %errorlevel% neq 0 (
    echo Python 빌드 실패!
    exit /b %errorlevel%
)

echo.
echo [2/5] React 앱 빌드 중...
echo ========================================
call npm run build

if %errorlevel% neq 0 (
    echo React 빌드 실패!
    exit /b %errorlevel%
)

echo.
echo [3/5] Electron 빌드 중...
echo ========================================
call npm run electron:build

if %errorlevel% neq 0 (
    echo Electron 빌드 실패!
    exit /b %errorlevel%
)

echo.
echo [4/5] 빌드 결과 확인...
echo ========================================
dir release

echo.
echo [5/5] 완료!
echo ========================================
echo.
echo 빌드 파일 위치: release\
echo.
pause
```

### package.json에 스크립트 추가

```json
{
  "scripts": {
    "build": "vite build",
    "electron:build": "electron-builder --win --x64",
    "build:all": "build-all.bat",
    "prebuild:all": "npm run build"
  }
}
```

---

## 🌐 웹뷰 설정 (도메인에서 로드)

### 개발 vs 프로덕션

```javascript
// electron/main-updated.js
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // 개발: 로컬 Vite 서버
    mainWindow.loadURL('http://localhost:5174');
  } else {
    // 프로덕션: 웹 도메인에서 로드
    mainWindow.loadURL('https://your-domain.com');
    
    // 또는 로컬 빌드 파일 사용
    // mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}
```

### CORS 설정 (웹 도메인 사용 시)

```javascript
// electron/main-updated.js
app.whenReady().then(() => {
  // CORS 우회 (개발용)
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders,
      },
    });
  });

  createWindow();
});
```

---

## 📋 빌드 체크리스트

### 빌드 전 확인사항

- [ ] Python 3.x 설치
- [ ] PyInstaller 설치 (`pip install pyinstaller`)
- [ ] 모든 DLL 파일 `bin/` 폴더에 존재
- [ ] `package.json`에 `electron-builder` 설정 추가
- [ ] 웹 도메인 설정 (프로덕션)
- [ ] 아이콘 파일 준비 (`build/icon.ico`)

### 빌드 단계

```bash
# 1. 의존성 설치
npm install

# 2. Python 서버 빌드
pyinstaller --onefile ... bin/gfengine-server-improved.py

# 3. React 빌드
npm run build

# 4. Electron 빌드
npm run electron:build
```

### 빌드 결과

```
release/
├── GTS AI Analysis Setup 1.0.0.exe    # 설치 파일
├── GTS AI Analysis 1.0.0.exe          # 포터블 버전
└── win-unpacked/                       # 압축 해제된 앱
    ├── GTS AI Analysis.exe
    ├── resources/
    │   ├── app.asar                    # 앱 코드
    │   └── bin/
    │       ├── gfengine-server-improved.exe
    │       ├── libGFEngine2D.dll
    │       └── ... (기타 DLL)
    └── ...
```

---

## 🔍 옵션 2: Python 설치 전제 조건

### 설치 파일에 Python 체크 추가

```javascript
// electron/main-updated.js
const { exec } = require('child_process');

app.whenReady().then(async () => {
  // Python 설치 확인
  const hasPython = await checkPythonInstalled();
  
  if (!hasPython) {
    dialog.showErrorBox(
      'Python 미설치',
      'Python 3.8 이상이 설치되어 있어야 합니다.\n\nhttps://www.python.org/downloads/'
    );
    app.quit();
    return;
  }

  createWindow();
});

function checkPythonInstalled() {
  return new Promise((resolve) => {
    exec('python --version', (error, stdout) => {
      if (error) {
        resolve(false);
      } else {
        const version = stdout.match(/Python (\d+\.\d+)/);
        resolve(version && parseFloat(version[1]) >= 3.8);
      }
    });
  });
}
```

---

## 📊 비교표

| 항목 | 옵션 1 (exe 포함) | 옵션 2 (Python 전제) |
|------|-------------------|----------------------|
| 빌드 크기 | ~150MB | ~50MB |
| 사용자 설치 | 간편 | Python 설치 필요 |
| 의존성 관리 | 자동 | 수동 |
| 배포 | 쉬움 | 어려움 |
| **권장도** | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 🎯 최종 권장 방법

### 1. Python 서버를 EXE로 빌드
```bash
pyinstaller --onefile bin/gfengine-server-improved.py
```

### 2. Electron에 포함
```json
"extraResources": [
  "dist-python/gfengine-server-improved.exe",
  "bin/*.dll"
]
```

### 3. 프로덕션에서 EXE 사용
```javascript
const exePath = path.join(process.resourcesPath, 'bin/gfengine-server-improved.exe');
spawn(exePath, []);
```

---

## 🚀 빌드 실행

```bash
# 전체 빌드 (Python + React + Electron)
npm run build:all

# 또는 단계별
pyinstaller --onefile bin/gfengine-server-improved.py
npm run build
npm run electron:build
```

**결과:** `release/GTS AI Analysis Setup 1.0.0.exe` 생성! 🎉

---

## 💡 추가 팁

### 빌드 크기 최적화

```json
// package.json
"build": {
  "asar": true,
  "compression": "maximum",
  "files": [
    "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/node_modules/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}"
  ]
}
```

### 자동 업데이트 설정

이미 구현된 `electron-updater`가 작동합니다!

```bash
# 업데이트 서버에 배포
release/GTS AI Analysis Setup 1.0.0.exe -> S3/GitHub Releases
```

---

## ✅ 체크리스트

빌드 전:
- [ ] PyInstaller 설치
- [ ] DLL 파일 확인
- [ ] `package.json` 빌드 설정
- [ ] 웹 도메인 설정 (프로덕션)
- [ ] 아이콘 준비

빌드 후:
- [ ] Python 서버 실행 확인
- [ ] 영상 분석 작동 확인
- [ ] 센서 연동 테스트
- [ ] 자동 업데이트 테스트

**완료!** 🎉

