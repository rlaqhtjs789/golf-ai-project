# DLL 파일 디렉토리

이 디렉토리에는 GFEngine2D 영상 분석 엔진에 필요한 DLL 파일들을 배치합니다.

## 필수 파일 목록

다음 파일들을 이 디렉토리에 복사해주세요:

```
bin/
├── libGFEngine2D.dll          ✅ 필수 - 메인 엔진 DLL
├── tensorflow.dll              ✅ 필수 - TensorFlow 라이브러리
├── libgcc_s_seh-1.dll         ✅ 필수 - GCC 런타임
├── libstdc++-6.dll            ✅ 필수 - C++ 표준 라이브러리
├── libwinpthread-1.dll        ✅ 필수 - POSIX 스레드 라이브러리
├── hasp_rt.exe                ✅ 필수 - HASP 라이선스 런타임
└── haspvlib_25670.dll         ✅ 필수 - HASP 라이선스 라이브러리
```

## 주의사항

1. **파일 누락**: 위 파일 중 하나라도 누락되면 엔진이 작동하지 않을 수 있습니다.
2. **버전 호환성**: 파일들은 서로 호환되는 버전이어야 합니다.
3. **라이선스**: 라이선스가 유효한지 확인하세요 (hasp_rt.exe).
4. **빌드 포함**: Electron 빌드 시 이 폴더의 내용이 자동으로 포함됩니다.

## 개발 모드

개발 모드에서는 DLL 파일이 없어도 실행되며, 더미 데이터를 반환합니다.

## 프로덕션 모드

프로덕션 빌드 전에 반드시 이 디렉토리에 필요한 DLL 파일들을 배치하세요.

```bash
# 빌드 전 파일 확인
ls -la bin/

# 빌드 실행
npm run electron:build
```

## 문제 해결

DLL 로딩 오류가 발생하면:

1. 모든 파일이 bin/ 디렉토리에 있는지 확인
2. 파일 권한 확인 (실행 권한 필요)
3. Windows Defender나 안티바이러스가 차단하는지 확인
4. 로그 확인 (Electron 콘솔)


