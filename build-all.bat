@echo off
chcp 65001 > nul
echo ========================================
echo 🏗️  GTS AI Analysis 빌드 스크립트
echo ========================================

echo.
echo [1/5] 📦 Python 서버 빌드 중...
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
  --workpath build-python ^
  --clean ^
  bin/gfengine-server-improved.py

if %errorlevel% neq 0 (
    echo ❌ Python 빌드 실패!
    pause
    exit /b %errorlevel%
)
echo ✅ Python 서버 빌드 완료

echo.
echo [2/5] ⚛️  React 앱 빌드 중...
echo ========================================
call npm run build

if %errorlevel% neq 0 (
    echo ❌ React 빌드 실패!
    pause
    exit /b %errorlevel%
)
echo ✅ React 앱 빌드 완료

echo.
echo [3/5] 🖥️  Electron 앱 빌드 중...
echo ========================================
call npm run electron:build

if %errorlevel% neq 0 (
    echo ❌ Electron 빌드 실패!
    pause
    exit /b %errorlevel%
)
echo ✅ Electron 앱 빌드 완료

echo.
echo [4/5] 📋 빌드 결과 확인...
echo ========================================
echo.
echo 📁 Python 서버:
dir dist-python\gfengine-server-improved.exe
echo.
echo 📁 Electron 앱:
dir release\*.exe

echo.
echo [5/5] ✅ 완료!
echo ========================================
echo.
echo 📦 빌드 파일 위치:
echo   - Python 서버: dist-python\gfengine-server-improved.exe
echo   - 설치 파일:   release\GTS AI Analysis Setup 1.0.0.exe
echo   - 포터블:      release\GTS AI Analysis 1.0.0.exe
echo.
echo 🎉 빌드 성공!
echo.
pause


