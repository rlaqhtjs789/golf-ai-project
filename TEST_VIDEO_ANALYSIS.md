# 영상 분석 단독 테스트 가이드

샷 데이터 없이 **영상 파일만 분석**하여 결과를 확인하는 방법입니다.

## 🎯 사용 목적

- 영상 분석이 정상 작동하는지 확인
- Python 엔진 응답 속도 측정
- 분석 결과 코드 및 문제점 확인
- 프레임 추출 상태 모니터링

---

## ⚠️ 사전 준비: FFmpeg 설치 (필수)

영상 분석을 위해서는 **FFmpeg**가 필요합니다.

### Windows 설치 방법

#### **방법 1: Chocolatey 사용 (권장)**

PowerShell을 **관리자 권한**으로 실행 후:

```powershell
# Chocolatey가 없다면 먼저 설치
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# FFmpeg 설치
choco install ffmpeg -y
```

#### **방법 2: 수동 설치**

1. **다운로드**: https://www.gyan.dev/ffmpeg/builds/
   - `ffmpeg-release-essentials.zip` 다운로드

2. **압축 해제**: 
   - `C:\ffmpeg\` 폴더에 압축 해제

3. **환경 변수 추가**:
   - 시스템 속성 → 고급 → 환경 변수
   - `Path` 변수에 `C:\ffmpeg\bin` 추가

4. **설치 확인**:
```powershell
ffmpeg -version
ffprobe -version
```

### 설치 확인

```bash
# FFmpeg 버전 확인
ffmpeg -version

# FFprobe 버전 확인 (영상 메타데이터 추출용)
ffprobe -version
```

둘 다 버전 정보가 출력되면 설치 완료입니다! ✅

---

## 📝 사용 방법

### **1단계: 영상 파일 찾기**

```bash
node find-video-files.js
```

**출력 예시:**
```
🔍 영상 파일 검색
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 검색 경로: D:\GTSGolf\Signature\app\SVAgent\@video\train

✅ 총 8개의 영상 파일 발견

🎯 테스트용 최신 영상:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📹 정면 영상:
   파일명: FRONT_20250120_143022.mp4
   경로: D:\GTSGolf\Signature\app\SVAgent\@video\train\FRONT_20250120_143022.mp4
   크기: 4.32 MB
   생성: 2025. 1. 20. 오후 2:30:22

📹 측면 영상:
   파일명: SIDE_20250120_143022.mp4
   경로: D:\GTSGolf\Signature\app\SVAgent\@video\train\SIDE_20250120_143022.mp4
   크기: 3.87 MB
   생성: 2025. 1. 20. 오후 2:30:23

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 복사하여 test-video-analysis-only.js에 붙여넣으세요:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TEST_VIDEOS = {
  front: 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train\\FRONT_20250120_143022.mp4',
  side: 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train\\SIDE_20250120_143022.mp4',
};
```

### **2단계: 테스트 스크립트 수정**

1. `test-video-analysis-only.js` 파일 열기
2. 상단의 `TEST_VIDEOS` 객체를 **1단계에서 출력된 코드로 교체**

```javascript
// 이 부분을 수정하세요
const TEST_VIDEOS = {
  front: 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train\\FRONT_20250120_143022.mp4',
  side: 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train\\SIDE_20250120_143022.mp4'
};
```

### **3단계: 영상 분석 실행**

```bash
node test-video-analysis-only.js
```

**출력 예시:**
```
🎬 영상 분석 단독 테스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Python 엔진 초기화 중...

✅ Python 엔진 준비 완료!

📂 영상 파일 확인 중...
   ✅ 정면 영상: FRONT_20250120_143022.mp4
   ✅ 측면 영상: SIDE_20250120_143022.mp4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 영상 분석 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   📹 정면 영상 분석: FRONT_20250120_143022.mp4
      🎬 프레임 추출 시작...
      📊 메타데이터: 1920x1080, 30.00fps, 5.20초
      ⏳ 프레임 추출 진행: 10%
      ⏳ 프레임 추출 진행: 20%
      ⏳ 프레임 추출 진행: 30%
      ⏳ 프레임 추출 진행: 40%
      ⏳ 프레임 추출 진행: 50%
      ⏳ 프레임 추출 진행: 60%
      ⏳ 프레임 추출 진행: 70%
      ⏳ 프레임 추출 진행: 80%
      ⏳ 프레임 추출 진행: 90%
      ⏳ 프레임 추출 진행: 100%
      ✅ 프레임 156개 추출 완료
      🔍 Python 엔진 분석 시작...
      ✅ Python 엔진 분석 완료 (소요: 2.34초)
   ✅ 정면 분석 완료 (문제점: 3개)

   📹 측면 영상 분석: SIDE_20250120_143022.mp4
      🎬 프레임 추출 시작...
      📊 메타데이터: 1920x1080, 30.00fps, 5.15초
      ⏳ 프레임 추출 진행: 10%
      ...
      ✅ 프레임 154개 추출 완료
      🔍 Python 엔진 분석 시작...
      ✅ Python 엔진 분석 완료 (소요: 2.28초)
   ✅ 측면 분석 완료 (문제점: 2개)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 분석 결과 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  총 소요 시간: 12.45초

📹 정면 영상 분석 결과:
   결과 코드: 0
   프레임 수: 156개
   문제점: 3개
      1. 백스윙 톱에서 왼팔이 굽혀져 있습니다
      2. 임팩트 시 체중이 뒤에 남아있습니다
      3. 피니쉬 자세가 불안정합니다
   원본 결과: {
     "result_code": 0,
     "analysis_result": {
       "backswing": { "score": 7.5, "issues": [...] },
       "impact": { "score": 6.8, "issues": [...] },
       "follow_through": { "score": 7.2, "issues": [...] }
     }
   }

📹 측면 영상 분석 결과:
   결과 코드: 0
   프레임 수: 154개
   문제점: 2개
      1. 다운스윙 시 조기 릴리스
      2. 임팩트 후 체중 이동 부족
   원본 결과: {
     "result_code": 0,
     "analysis_result": {
       "downswing": { "score": 6.9, "issues": [...] },
       "impact": { "score": 7.1, "issues": [...] }
     }
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 테스트 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛑 Python 엔진 종료 중...
✅ 정리 완료
```

---

## 🔍 결과 코드 의미

| 코드 | 의미 | 설명 |
|------|------|------|
| `0` | ✅ 성공 | 정상적으로 분석 완료 |
| `1` | ⚠️ 스윙 미감지 | 영상에서 스윙 동작을 찾지 못함 |
| `2` | ⚠️ 포즈 추정 실패 | 사람의 자세를 인식하지 못함 |
| `3` | ⚠️ 프레임 품질 불량 | 영상이 너무 어둡거나 흐림 |
| `-1` | ❌ 에러 | 알 수 없는 오류 발생 |

---

## ⚠️ 문제 해결

### **1. "폴더가 존재하지 않습니다"**
```bash
❌ 폴더가 존재하지 않습니다!
```
**해결:**
- 센서 프로그램이 설치되어 있는지 확인
- `D:\GTSGolf\Signature\app\SVAgent\@video\train` 경로가 맞는지 확인
- 필요시 `find-video-files.js`의 `VIDEO_PATH` 수정

### **2. "영상 파일이 없습니다"**
```bash
⚠️  영상 파일이 없습니다.
```
**해결:**
- 센서 프로그램을 실행하고 스윙을 1회 실행
- 영상이 자동으로 생성되면 다시 1단계부터 진행

### **3. "Python 엔진 초기화 실패"**
```bash
❌ Python 엔진 초기화 실패: spawn python ENOENT
```
**해결:**
```bash
# Python 엔진 재빌드
npm run build:python

# 다시 테스트
node test-video-analysis-only.js
```

### **4. "프레임 추출 실패"**
```bash
❌ 정면 분석 실패: 프레임 추출 실패
```
**해결:**
- 영상 파일을 VLC 등으로 재생 가능한지 확인
- 디스크 공간 확인 (최소 500MB 이상)
- 영상 파일이 손상되지 않았는지 확인

### **5. "Python 엔진 응답 없음"**
```bash
❌ Python 엔진 응답 없음 (타임아웃)
```
**해결:**
- 작업 관리자에서 `gfengine-server-srcimages.exe` 프로세스 강제 종료
- DLL 파일 확인 (`bin/` 폴더):
  - `libGFEngine2D.dll`
  - `tensorflow.dll`
  - `libgcc_s_seh-1.dll`
  - `libstdc++-6.dll`
  - `libwinpthread-1.dll`
- 앱 재시작 후 다시 테스트

---

## 📊 성능 벤치마크

### **정상 범위**
- **프레임 추출**: 3~5초
- **정면 영상 분석**: 2~4초
- **측면 영상 분석**: 2~4초
- **총 소요 시간**: 10~15초

### **성능 저하 원인**
- ❌ CPU 사용률 70% 이상
- ❌ 메모리 부족 (사용 가능 RAM < 2GB)
- ❌ 디스크 I/O 병목 (HDD 사용 시)
- ❌ Python 엔진 프로세스 누수

---

## 🛠️ 고급 옵션

### **특정 영상만 테스트**
```javascript
// 정면 영상만
const TEST_VIDEOS = {
  front: 'D:\\GTSGolf\\...\\FRONT_20250120_143022.mp4'
  // side 제거
};

// 측면 영상만
const TEST_VIDEOS = {
  side: 'D:\\GTSGolf\\...\\SIDE_20250120_143022.mp4'
  // front 제거
};
```

### **여러 영상 순차 테스트**
1. `find-video-files.js`로 영상 목록 확인
2. `test-video-analysis-only.js`에서 경로만 변경하여 반복 실행

---

## 📞 추가 지원

영상 분석 문제 발생 시 다음 정보와 함께 문의:
1. 콘솔 출력 전체 복사
2. 영상 파일 정보 (크기, 생성 시간)
3. `bin/GFEngine2DLog` 파일 내용
