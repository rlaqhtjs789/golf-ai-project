# 🔄 자동 업데이트 가이드

Electron 앱에 자동 업데이트 기능이 내장되어 있습니다.

---

## ✨ 기능

- ✅ GitHub Releases 자동 연동
- ✅ 백그라운드 다운로드
- ✅ 진행률 표시
- ✅ 사용자 확인 후 설치

---

## 🚀 사용 방법

### React 컴포넌트에서

```tsx
import UpdateNotification from '@/components/UpdateNotification';

function App() {
  return (
    <>
      {/* 다른 컴포넌트들 */}
      <UpdateNotification />
    </>
  );
}
```

끝! 자동으로 업데이트를 확인하고 알림을 표시합니다.

---

## 🎨 동작 방식

1. **앱 시작 5초 후** → 자동으로 업데이트 확인
2. **새 버전 발견** → 사용자에게 알림
3. **사용자가 "다운로드" 클릭** → 백그라운드 다운로드
4. **다운로드 완료** → 재시작 확인
5. **사용자가 "재시작" 클릭** → 앱 재시작 및 업데이트 설치

---

## ⚙️ 설정

### package.json

```json
{
  "version": "1.0.0",
  "build": {
    "publish": {
      "provider": "github",
      "owner": "YOUR_USERNAME",
      "repo": "YOUR_REPO"
    }
  }
}
```

---

## 📦 배포 방법

### 1. 버전 업데이트

```bash
# package.json의 version 수정
"version": "1.1.0"
```

### 2. 빌드

```bash
npm run electron:build:win
```

### 3. GitHub Release 생성

1. GitHub Repository → Releases → New Release
2. Tag: `v1.1.0`
3. 빌드된 파일 업로드: `dist-electron/GTSN Golf AI Setup 1.1.0.exe`
4. Publish release

### 4. 완료!

기존 사용자들에게 자동으로 업데이트 알림이 갑니다.

---

## 🧪 수동 업데이트 확인

```tsx
import { useUpdater } from '@/shared/hooks/useUpdater';

function Settings() {
  const { checkForUpdates } = useUpdater();
  
  return (
    <button onClick={checkForUpdates}>
      업데이트 확인
    </button>
  );
}
```

---

## 🐛 문제 해결

### "업데이트를 확인할 수 없습니다"
→ GitHub Repository 설정 확인

### "다운로드 실패"
→ 인터넷 연결 확인

---

**자동 업데이트로 항상 최신 버전 유지! 🚀**


