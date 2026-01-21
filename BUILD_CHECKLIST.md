# 🚀 빌드 체크리스트

## 📦 빌드 진행 중...

```bash
npm run build:all
```

---

## ✅ 빌드 단계

### 1️⃣ Python 서버 빌드
```bash
npm run build:python
```
- **입력:** `bin/gfengine-server-improved.py`
- **출력:** `dist-python/gfengine-server-improved.exe`
- **포함:** Python 런타임 + ctypes + DLL
- **크기:** ~80MB

### 2️⃣ React 앱 빌드
```bash
npm run build
```
- **입력:** `src/` (TypeScript + React)
- **출력:** `dist/` (정적 파일)
- **최적화:** Minify + Tree-shaking

### 3️⃣ Electron 앱 빌드
```bash
npm run electron:build:win
```
- **입력:** `dist/` + `electron/` + `dist-python/`
- **출력:** `dist-electron/GTS AI Analysis Setup.exe`
- **포함:** 
  - React 앱
  - Electron 런타임
  - Python 서버 exe
  - DLL 파일들

---

## 📂 빌드 결과물

### 최종 설치 파일
```
dist-electron/
└── GTS AI Analysis Setup.exe  ← 이 파일을 배포!
```

### 크기 예상
- **설치 파일:** ~200MB
- **설치 후:** ~300MB

---

## 🧪 빌드 후 테스트

### 로컬 테스트
```bash
# 설치 파일 실행
.\dist-electron\GTS AI Analysis Setup.exe
```

### 확인 사항
- [ ] 프로그램 설치 완료
- [ ] 프로그램 실행 (frameless 창)
- [ ] 세션 시작 폼 표시
- [ ] 센서 데이터 감지
- [ ] 스윙 화면 정상 작동
- [ ] 나가기 버튼 작동

---

## 🏌️ 타석 테스트 가이드

### 1. USB 드라이브에 복사
```
GTS AI Analysis Setup.exe  (200MB)
```

### 2. 타석 PC에 설치
- Setup.exe 실행
- 설치 위치 선택
- 설치 완료

### 3. GTS 센서 폴더 확인
```
D:\GTSGolf\Signature\app\SVAgent\@video\train
D:\GTSGolf\Signature\app\GTS_v2_Data\StreamingAssets\Data\ShotData
```

### 4. 프로그램 실행
- GTS AI Analysis 실행
- 성별, 나이, 핸디, 클럽 선택
- "분석 시작하기" 클릭

### 5. 스윙 테스트
- GTS 센서로 10회 스윙
- 화면에 실시간 데이터 표시 확인
- 10회 완료 후 솔루션 페이지 이동 확인

---

## ⚠️ 문제 해결

### Python 설치 필요?
❌ **불필요!** exe에 Python 런타임 포함됨

### DLL 파일 누락?
✅ `bin/` 폴더의 모든 DLL이 자동 포함됨

### 센서 데이터 인식 안됨?
1. 센서 폴더 경로 확인
2. 관리자 권한으로 실행
3. 로그 확인 (DevTools)

### 앱이 시작 안됨?
- Windows 10/11 확인
- Visual C++ 재배포 패키지 설치
- 백신 예외 추가

---

## 📝 빌드 로그 확인

터미널에서 빌드 진행 상황을 확인하세요:

```
✅ Python 서버 빌드 완료
✅ React 앱 빌드 완료
✅ Electron 앱 빌드 완료
📦 설치 파일 생성: dist-electron/GTS AI Analysis Setup.exe
```

---

## 🎉 완료!

빌드가 완료되면:

```bash
# 설치 파일 위치
dist-electron\GTS AI Analysis Setup.exe
```

이 파일을 USB에 복사해서 타석 PC에서 테스트하세요! 🏌️‍♂️

