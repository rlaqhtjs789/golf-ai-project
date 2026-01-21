# 🔄 자동 업데이트 서버 설정 가이드

## 📦 업데이트 파일 구조

빌드 후 `dist-electron/` 폴더에 다음 파일들이 생성됩니다:

```
dist-electron/
├── GTSN Golf AI Setup 0.0.0.exe          # 설치 파일
├── GTSN Golf AI Setup 0.0.0.exe.blockmap # 블록맵 (증분 업데이트용)
└── latest.yml                             # 최신 버전 정보
```

---

## 🌐 서버 설정

### 1️⃣ 업데이트 서버 URL 설정

`package.json`에서 URL 수정:

```json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "https://your-update-server.com/updates/"
    }
  }
}
```

### 2️⃣ 서버에 파일 업로드

업데이트 서버의 `/updates/` 경로에 다음 파일들을 업로드:

```
https://your-update-server.com/updates/
├── GTSN Golf AI Setup 0.0.0.exe
├── GTSN Golf AI Setup 0.0.0.exe.blockmap
└── latest.yml
```

### 3️⃣ `latest.yml` 파일 예시

```yaml
version: 0.0.1
files:
  - url: GTSN Golf AI Setup 0.0.1.exe
    sha512: [자동 생성됨]
    size: 534523669
path: GTSN Golf AI Setup 0.0.1.exe
sha512: [자동 생성됨]
releaseDate: '2026-01-14T07:27:00.000Z'
```

---

## 🔧 업데이트 프로세스

### 앱 시작 시 자동 확인 (5초 후)

```javascript
// electron/main.js
appUpdater = new AppUpdater(mainWindow);

if (!isDev) {
  setTimeout(() => {
    appUpdater.checkForUpdates(); // 업데이트 확인
  }, 5000);
}
```

### 사용자 경험

1. **앱 실행**
2. **5초 후 자동으로 업데이트 확인**
3. **새 버전 발견 시:**
   - 다이얼로그: "새로운 버전 0.0.1이(가) 있습니다."
   - 버튼: [다운로드] [나중에]
4. **다운로드 진행 중:**
   - 진행률 표시
   - 윈도우 작업 표시줄에 진행률 표시
5. **다운로드 완료 시:**
   - 다이얼로그: "업데이트가 다운로드되었습니다."
   - 버튼: [재시작] [나중에]
6. **재시작 선택 시:**
   - 앱 종료 → 업데이트 설치 → 자동 재실행

---

## 🚀 버전 업데이트 배포 절차

### 1️⃣ 버전 업데이트

```json
// package.json
{
  "version": "0.0.1"  // 0.0.0 → 0.0.1로 변경
}
```

### 2️⃣ 빌드

```bash
npm run electron:build:win
```

### 3️⃣ 생성된 파일 확인

```
dist-electron/
├── GTSN Golf AI Setup 0.0.1.exe          # 새 버전
├── GTSN Golf AI Setup 0.0.1.exe.blockmap
└── latest.yml                             # 새 버전 정보
```

### 4️⃣ 서버에 업로드

```bash
# FTP, SCP, S3 등으로 업로드
scp dist-electron/GTSN* user@server:/var/www/updates/
scp dist-electron/latest.yml user@server:/var/www/updates/
```

### 5️⃣ 사용자 앱 자동 업데이트

- 사용자가 앱 실행 시 자동으로 새 버전 감지
- 다운로드 후 설치

---

## 📋 서버 요구사항

### HTTPS 필수

Electron Auto Updater는 보안상 HTTPS만 지원합니다!

```
❌ http://updates.example.com   (작동 안 함)
✅ https://updates.example.com  (정상 작동)
```

### CORS 설정 (선택)

브라우저에서 직접 다운로드 시 필요:

```nginx
# Nginx 예시
location /updates/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET;
}
```

---

## 🧪 테스트 방법

### 1️⃣ 로컬 테스트 서버

```bash
# dist-electron 폴더에서 간단한 HTTP 서버 실행
npx http-server -p 8080 --cors
```

### 2️⃣ package.json에서 URL 변경

```json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "http://localhost:8080/"
    }
  }
}
```

### 3️⃣ 버전 올려서 재빌드

```json
{
  "version": "0.0.1"  // 버전 up
}
```

```bash
npm run electron:build:win
```

### 4️⃣ 이전 버전 실행

- 이전 버전(0.0.0) 앱 실행
- 5초 후 업데이트 다이얼로그 확인

---

## 💡 실전 예시

### AWS S3 사용

```json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "https://your-bucket.s3.amazonaws.com/golf-ai-updates/"
    }
  }
}
```

### 자체 서버 (Nginx)

```json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "https://updates.gtsgolf.com/"
    }
  }
}
```

### CDN (CloudFront, Cloudflare)

```json
{
  "build": {
    "publish": {
      "provider": "generic",
      "url": "https://cdn.gtsgolf.com/updates/"
    }
  }
}
```

---

## ⚠️ 주의사항

1. **HTTPS 필수**: HTTP는 작동하지 않습니다
2. **파일 권한**: 서버에 업로드한 파일은 public read 권한 필요
3. **버전 형식**: Semantic Versioning 준수 (0.0.0, 0.0.1, 1.0.0 등)
4. **latest.yml**: 항상 최신 버전 정보를 반영해야 함
5. **blockmap**: 증분 업데이트를 위해 함께 업로드 필수

---

## 🔐 보안

### 코드 서명 (선택, Windows)

```json
{
  "build": {
    "win": {
      "certificateFile": "cert.pfx",
      "certificatePassword": "password"
    }
  }
}
```

코드 서명이 있으면:
- Windows Defender 경고 없음
- 사용자 신뢰도 향상

---

## 📞 문제 해결

### "업데이트 확인 실패"

1. 서버 URL이 HTTPS인지 확인
2. `latest.yml` 파일이 접근 가능한지 확인
3. 네트워크 연결 확인

### "다운로드 실패"

1. `.exe` 파일이 서버에 있는지 확인
2. 파일 권한 확인 (public read)
3. 파일 크기가 `latest.yml`과 일치하는지 확인

### "설치 실패"

1. 관리자 권한으로 실행 필요할 수 있음
2. 기존 앱이 실행 중이면 종료 후 설치

---

## ✅ 빠른 체크리스트

배포 전 확인:

- [ ] `package.json` 버전 증가
- [ ] `publish.url`이 올바른 HTTPS URL
- [ ] 빌드 완료 (`npm run electron:build:win`)
- [ ] 3개 파일 생성 확인 (.exe, .blockmap, latest.yml)
- [ ] 서버에 업로드
- [ ] 브라우저에서 `https://your-url/updates/latest.yml` 접근 테스트
- [ ] 이전 버전 앱에서 업데이트 테스트

---

**설정 완료 후 `package.json`의 URL만 실제 서버로 변경하면 됩니다!**

