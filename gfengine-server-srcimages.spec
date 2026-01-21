# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['bin\\gfengine-server-srcimages.py'],
    pathex=[],
    binaries=[],
    datas=[('bin/libGFEngine2D.dll', '.'), ('bin/tensorflow.dll', '.'), ('bin/libgcc_s_seh-1.dll', '.'), ('bin/libstdc++-6.dll', '.'), ('bin/libwinpthread-1.dll', '.')],
    hiddenimports=['ctypes', 'json', 'sys', 'PIL', 'PIL.Image'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='gfengine-server-srcimages',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
