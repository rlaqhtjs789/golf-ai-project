# 🔧 문제 해결 가이드

## 1️⃣ 타이틀바 버튼 작동 확인

### 개발자 도구에서 확인

앱 실행 후 `F12` 또는 `Ctrl+Shift+I`로 개발자 도구 열기

```javascript
// 콘솔에서 확인
console.log('window.app:', window.app);
console.log('window.app.minimize:', typeof window.app?.minimize);
console.log('window.app.maximize:', typeof window.app?.maximize);
console.log('window.app.close:', typeof window.app?.close);
```

### 예상 출력

```
🔧 CustomTitleBar 마운트
   window.app 존재: true
   window.app.minimize 존재: function
   window.app.maximize 존재: function
   window.app.close 존재: function
```

### 버튼 클릭 시 로그

```
🔽 최소화 버튼 클릭
   window.app: {minimize: ƒ, maximize: ƒ, close: ƒ, quit: ƒ}
🔽 창 최소화 요청
✅ 창 최소화 완료
✅ 최소화 완료
```

---

## 2️⃣ 스윙 페이지 로그 확인

### 기대되는 로그 순서

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 GTS AI Analysis 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 스윙 분석 서비스 준비 완료

[swing] 첫번째 useEffect, currentStep: swing-first phase: initial
[swing] 조건 만족! 계속 진행.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 센서 폴더 초기 스캔 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📹 비디오 폴더: D:\GTSGolf\Signature\app\SVAgent\@video\train
   총 X개 파일 발견

📊 샷 데이터 폴더: D:\GTSGolf\Signature\app\GTS_v2_Data\StreamingAssets\Data\ShotData
   총 X개 파일 발견

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 초기 스캔 완료 - 모니터링 시작
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 센서 폴더 체크 중... (비디오: X개, 샷데이터: X개, 대기: 0개)
```

---

## 3️⃣ 문제 진단

### 타이틀바 버튼이 작동하지 않는 경우

**원인 1**: `window.app`이 정의되지 않음
- **확인**: 개발자 도구에서 `console.log(window.app)` 실행
- **해결**: `electron/preload.js`가 제대로 로드되었는지 확인

**원인 2**: IPC 핸들러가 등록되지 않음
- **확인**: 메인 프로세스 로그에 "창 최소화 요청" 등이 나오는지
- **해결**: `electron/main.js`의 IPC 핸들러 확인

**원인 3**: 개발 모드 vs 프로덕션 모드
- **개발 모드**: `npm run electron:dev`로 실행 시 preload가 제대로 로드되지 않을 수 있음
- **해결**: 빌드된 `.exe` 파일로 테스트

### 스윙 페이지 로그가 안 나오는 경우

**원인 1**: 세션이 시작되지 않음
- **확인**: "분석 시작하기" 버튼을 눌렀는지
- **해결**: `/analysis/start` 페이지에서 세션 시작

**원인 2**: `sessionUuid`가 없음
- **확인**: URL에 `?session=xxxxx` 파라미터가 있는지
- **해결**: 세션 시작 후 자동으로 리다이렉트됨

**원인 3**: 센서 폴더가 존재하지 않음
- **확인**: 타석 PC에 실제 폴더가 있는지
  ```
  D:\GTSGolf\Signature\app\SVAgent\@video\train
  D:\GTSGolf\Signature\app\GTS_v2_Data\StreamingAssets\Data\ShotData
  ```
- **해결**: 폴더가 없으면 경고 로그가 나옴

---

## 4️⃣ 로그 확인 방법

### Windows 콘솔 로그 (메인 프로세스)

빌드된 `.exe` 파일은 콘솔 창이 없으므로 로그 파일로 확인:

```
C:\Users\[사용자]\AppData\Roaming\gts-ai-analysis\logs\
```

### 개발자 도구 (렌더러 프로세스)

앱에서 `F12` 눌러서 콘솔 확인

---

## 5️⃣ 테스트 체크리스트

### 빌드 후 테스트

- [ ] `.exe` 파일 실행됨
- [ ] 앱 창이 열림 (타이틀바 없음)
- [ ] 커스텀 타이틀바 보임
- [ ] 최소화 버튼 클릭 → 작업표시줄로 최소화됨
- [ ] 최대화 버튼 클릭 → 전체화면으로 전환됨
- [ ] 닫기 버튼 클릭 → 앱 종료됨
- [ ] 개발자 도구 (`F12`) 열림
- [ ] 콘솔에 초기 로그 보임

### 세션 시작 테스트

- [ ] 성별, 나이, 핸디, 클럽 선택
- [ ] "분석 시작하기" 버튼 클릭
- [ ] `/analysis/swing?session=xxxxx`로 이동됨
- [ ] 콘솔에 `[swing] 첫번째 useEffect` 로그 보임
- [ ] 센서 폴더 스캔 로그 보임
- [ ] 2초 후 "평소 리듬으로 스윙..." 화면 사라짐
- [ ] 스윙 진행 화면으로 전환됨

### 센서 데이터 테스트 (타석)

- [ ] 센서 폴더 존재 확인
- [ ] 초기 파일 목록 로그 보임
- [ ] 10초마다 체크 로그 보임
- [ ] 스윙 시 새 파일 감지 로그 보임
- [ ] 샷 데이터 상세 정보 로그 보임
- [ ] 백엔드 전송 로그 보임
- [ ] 화면에 실시간 데이터 표시됨
- [ ] 체크박스 업데이트됨

---

## 6️⃣ 빠른 해결 방법

### 문제: 버튼이 전혀 반응하지 않음

```bash
# 1. 완전히 재빌드
cd D:\dev\gstAI
npm run build
npm run electron:build:win

# 2. 기존 앱 삭제
# 설치된 앱 제거 (제어판)

# 3. 새로 설치
dist-electron\GTSN Golf AI Setup 0.0.0.exe
```

### 문제: 로그가 안 보임

**개발자 도구가 자동으로 열리지 않으면:**

1. 앱 실행 후 `F12` 누르기
2. 또는 `Ctrl+Shift+I` 누르기
3. Console 탭 확인

**그래도 안 보이면:**

```javascript
// 개발자 도구 콘솔에서 직접 실행
console.log('테스트:', window.swingAnalysis);
console.log('앱 API:', window.app);
```

---

## 7️⃣ 연락처

문제가 계속되면:

1. 개발자 도구 스크린샷
2. 콘솔 로그 복사
3. 어떤 버튼을 눌렀는지
4. 어떤 화면에서 문제가 발생했는지

위 정보를 제공해주세요!


