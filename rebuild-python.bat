@echo off
chcp 65001 > nul
echo ========================================
echo 🔧 Python 서버 재빌드 (콘솔 숨김)
echo ========================================
echo.

echo [1/2] 기존 빌드 삭제...
if exist dist-python rmdir /s /q dist-python
if exist build-python rmdir /s /q build-python
if exist gfengine-server-improved.spec del /q gfengine-server-improved.spec
echo ✅ 삭제 완료
echo.

echo [2/2] Python 서버 빌드 중...
python -m PyInstaller --onefile --noconsole ^
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

echo.
if exist dist-python\gfengine-server-improved.exe (
    echo ========================================
    echo ✅ 빌드 완료!
    echo ========================================
    echo.
    echo 파일: dist-python\gfengine-server-improved.exe
    echo.
    dir dist-python\gfengine-server-improved.exe
    echo.
    echo 💡 이제 실행해도 콘솔 창이 보이지 않습니다!
) else (
    echo ========================================
    echo ❌ 빌드 실패!
    echo ========================================
)

echo.
pause


