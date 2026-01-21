# 영상 분석 디버깅 가이드

## 📍 로그 확인 위치

### 1. **Electron 메인 프로세스 콘솔**
- **앱 실행 후 `F12`** 누르면 개발자 도구 오픈
- **Console 탭**에서 다음 로그 확인:
  - `🎬 영상 분석 시작` → 분석 시작
  - `⏳ 프레임 추출 진행` → 진행률
  - `✅ 정면/측면 분석 완료` → 성공
  - `❌ 정면/측면 분석 실패` → 에러 (상세 메시지 포함)

### 2. **프론트엔드 화면**
- 스윙 화면 → 3번 스윙 완료 후
- **"영상 분석 중..."** 화면에서 실시간 상태 확인:
  ```
  📹 정면 영상
  프레임 추출 중...
  [===========     ] 45%
  ```

### 3. **Python 엔진 로그** (고급)
- Python 엔진은 `dist-python/gfengine-server-srcimages.exe`로 실행됨
- 에러 발생 시 Electron 콘솔에 Python 에러 메시지 출력:
  ```
  ❌ Python 엔진 에러:
  Traceback (most recent call last):
    File "gfengine-server-srcimages.py", line 123
    ...
  ```

## 🔍 주요 에러 유형

### 1. **프레임 추출 실패**
```bash
❌ 정면 분석 실패: 프레임 추출 실패
```
**원인:**
- 영상 파일 손상
- ffmpeg 라이브러리 누락
- 디스크 공간 부족

**해결:**
1. 영상 파일이 정상적으로 생성되었는지 확인
2. `D:\GTSGolf\Signature\app\SVAgent\@video\train` 경로 확인
3. 영상을 VLC 등으로 재생 가능한지 테스트

### 2. **Python 엔진 응답 없음**
```bash
❌ Python 엔진 응답 없음 (5초 타임아웃)
```
**원인:**
- Python 엔진 프로세스 크래시
- DLL 파일 누락 (`libGFEngine2D.dll`, `tensorflow.dll`)
- 메모리 부족

**해결:**
1. `bin/` 폴더에 DLL 파일 확인:
   - `libGFEngine2D.dll`
   - `tensorflow.dll`
   - `libgcc_s_seh-1.dll`
   - `libstdc++-6.dll`
   - `libwinpthread-1.dll`
2. 작업 관리자에서 `gfengine-server-srcimages.exe` 프로세스 확인
3. 앱 재시작

### 3. **영상 분석 결과 코드 ≠ 0**
```bash
✅ 정면 분석 완료 (결과 코드: 1)
```
**결과 코드 의미:**
- `0`: 분석 성공
- `1`: 영상에서 스윙 동작 감지 실패
- `2`: 포즈 추정 실패
- `3`: 프레임 품질 불량
- `-1`: 알 수 없는 에러

**해결:**
1. 카메라 위치/각도 조정
2. 조명 개선 (너무 어둡거나 밝지 않게)
3. 배경에 방해 물체 제거

## 🛠️ 수동 테스트 방법

### 1. **Python 엔진 단독 실행**
```bash
# 1. 명령 프롬프트 열기
cd d:\dev\gstAI\dist-python

# 2. 엔진 실행
gfengine-server-srcimages.exe

# 3. 출력 확인 (정상이면 대기 상태)
✅ Python 엔진 준비 완료
```

### 2. **영상 파일 직접 테스트**
```bash
# Node.js로 영상 분석 테스트
cd d:\dev\gstAI
node examples/video-analysis-python-example.js
```

### 3. **센서 데이터 + 영상 통합 테스트**
```bash
node test-engine-full.js
```

## 📊 성능 체크리스트

| 항목 | 정상 범위 | 확인 |
|------|----------|------|
| 프레임 추출 시간 | 5초 이내 | ⬜ |
| 정면 영상 분석 시간 | 10초 이내 | ⬜ |
| 측면 영상 분석 시간 | 10초 이내 | ⬜ |
| 메모리 사용량 | < 500MB | ⬜ |
| CPU 사용률 | < 70% | ⬜ |

## 🚨 긴급 대응

### 영상 분석이 30초 이상 걸리거나 무한 대기
1. **Electron 콘솔** 확인 → 마지막 로그 메시지
2. **작업 관리자** → `gfengine-server-srcimages.exe` 프로세스 강제 종료
3. **앱 재시작**
4. 여전히 문제 시 → `d:\dev\gstAI\bin\GFEngine2DLog` 파일 확인

### 계속 에러가 발생할 경우
```bash
# Python 엔진 재빌드
npm run build:python

# 전체 재빌드
npm run build:all

# Electron 앱 재빌드
npm run electron:build:win
```

## 📞 추가 지원

영상 분석 관련 문제는 다음 정보와 함께 문의:
1. Electron 콘솔 스크린샷 (F12)
2. `GFEngine2DLog` 파일 내용
3. 문제 발생 시 영상 파일 (가능하면)
