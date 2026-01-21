# 🏥 엔진 헬스 모니터링 가이드

Python 서버 연결 상태 자동 체크 및 재연결 시스템

---

## 🎯 기능 개요

### 자동으로 처리되는 것들

1. ✅ **주기적 헬스체크** - 5초마다 Python 서버 상태 확인
2. ✅ **연결 끊김 자동 감지** - 3번 연속 실패 시 연결 끊김으로 판단
3. ✅ **자동 재연결** - 최대 5번까지 자동 재연결 시도
4. ✅ **사용자 알림** - 모달로 연결 상태 실시간 표시
5. ✅ **수동 재연결** - 사용자가 직접 재연결 버튼 클릭 가능

---

## 🏗️ 시스템 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                         │
│                                                           │
│  SwingAnalysisService                                    │
│         │                                                 │
│         └─► EngineHealthMonitor                         │
│                  │                                        │
│                  ├─ 5초마다 checkHealth() 호출          │
│                  ├─ 3번 연속 실패 → connection-lost     │
│                  ├─ 자동 재연결 시도 (최대 5번)         │
│                  └─ 이벤트 → Renderer Process           │
│                                                           │
└─────────────────────────────────────────────────────────┘
                            ↓ IPC Events
┌─────────────────────────────────────────────────────────┐
│                   Renderer Process                       │
│                                                           │
│  EngineConnectionModal (React Component)                │
│         │                                                 │
│         ├─ connection-lost → 모달 표시                  │
│         ├─ reconnecting → 진행률 표시                   │
│         ├─ reconnect-success → 모달 숨김               │
│         └─ reconnect-failed → 수동 재연결 버튼          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 연결 상태 시나리오

### ✅ 시나리오 1: 정상 작동

```
[00:00] 헬스체크: healthy (응답 시간: 45ms)
[00:05] 헬스체크: healthy (응답 시간: 42ms)
[00:10] 헬스체크: healthy (응답 시간: 48ms)
...
```

**사용자 경험:** 아무 모달도 표시되지 않음 (정상 작동)

---

### ⚠️ 시나리오 2: Python 프로세스 크래시

```
[00:00] 헬스체크: healthy
[00:05] 헬스체크: unhealthy (1/3) - Health check timeout
[00:10] 헬스체크: unhealthy (2/3) - Health check timeout
[00:15] 헬스체크: unhealthy (3/3) - Health check timeout
[00:15] ❌ 연결 끊김 감지
[00:15] 🔄 재연결 시도 1/5
[00:17] ✅ 재연결 성공!
[00:17] 헬스체크: healthy
```

**사용자 경험:**
1. 모달 표시: "영상 분석 시스템과의 연결이 끊어졌습니다"
2. 자동 재연결 진행률 표시: "1/5"
3. 재연결 성공 → 모달 자동 닫힘

---

### ❌ 시나리오 3: 재연결 실패

```
[00:00] ❌ 연결 끊김 감지
[00:00] 🔄 재연결 시도 1/5 → 실패
[00:02] 🔄 재연결 시도 2/5 → 실패
[00:04] 🔄 재연결 시도 3/5 → 실패
[00:06] 🔄 재연결 시도 4/5 → 실패
[00:08] 🔄 재연결 시도 5/5 → 실패
[00:08] ❌ 재연결 실패 (최대 시도 횟수 초과)
```

**사용자 경험:**
1. 진행률 표시: "1/5", "2/5", ... "5/5"
2. 최종 실패 메시지 표시
3. **"재연결 시도"** 버튼 활성화
4. **"앱 재시작"** 버튼 활성화

---

## 🎨 모달 UI

### 상태 1: 자동 재연결 중

```
┌─────────────────────────────────────────────┐
│ 🔄  영상 분석 시스템 연결 상태              │
├─────────────────────────────────────────────┤
│                                               │
│ 영상 분석 시스템에 재연결을 시도하고       │
│ 있습니다...                                  │
│                                               │
│ 재연결 시도 중            3 / 5              │
│ ████████████░░░░░░ 60%                       │
│                                               │
└─────────────────────────────────────────────┘
```

### 상태 2: 재연결 실패

```
┌─────────────────────────────────────────────┐
│ ⚠️  영상 분석 시스템 연결 상태              │
├─────────────────────────────────────────────┤
│                                               │
│ 영상 분석 시스템과의 연결이 끊어졌습니다.  │
│                                               │
│ 자동 재연결이 실패했습니다. 아래 버튼을    │
│ 눌러 수동으로 재연결을 시도하거나,          │
│ 앱을 재시작해주세요.                        │
│                                               │
│ ┌──────────────┐  ┌──────────────┐         │
│ │ 재연결 시도  │  │  앱 재시작   │         │
│ └──────────────┘  └──────────────┘         │
│                                               │
│ 💡 연결이 계속 끊어진다면:                  │
│ • Python이 설치되어 있는지 확인하세요      │
│ • DLL 파일이 올바른 위치에 있는지 확인     │
│ • 다른 프로그램을 종료해보세요             │
│                                               │
└─────────────────────────────────────────────┘
```

---

## 🔧 설정

### 헬스체크 설정 변경

```javascript
// lib/swing-analysis-service.js
this.healthMonitor = new EngineHealthMonitor(this.engine, {
  checkInterval: 5000,           // 체크 간격 (ms)
  healthCheckTimeout: 3000,      // 타임아웃 (ms)
  maxConsecutiveFailures: 3,     // 연속 실패 허용 횟수
  maxReconnectAttempts: 5,       // 최대 재연결 시도 횟수
  reconnectDelay: 2000,          // 재연결 대기 시간 (ms)
});
```

### 추천 설정

| 환경 | checkInterval | maxConsecutiveFailures | maxReconnectAttempts |
|------|---------------|------------------------|----------------------|
| **개발** | 3초 | 2번 | 3번 |
| **프로덕션** | 5초 | 3번 | 5번 |
| **불안정한 네트워크** | 10초 | 5번 | 10번 |

---

## 🧪 테스트

### 1. 자동 헬스체크 테스트

```bash
node test-engine-health.js
```

**출력 예시:**
```
🧪 엔진 헬스 모니터 테스트

🔧 엔진 시작 중...
✅ Python Bridge 사용
✅ 엔진 준비 완료

💡 모니터링 중입니다. Ctrl+C로 종료하세요.
💡 Python 프로세스를 강제 종료하면 재연결을 시도합니다.

[10:30:00] 헬스체크: healthy
[10:30:03] 헬스체크: healthy
[10:30:06] 헬스체크: healthy
```

### 2. 재연결 테스트

1. `test-engine-health.js` 실행
2. **작업 관리자**에서 `python.exe` 프로세스 강제 종료
3. 자동 재연결 확인

**예상 출력:**
```
[10:30:09] 헬스체크: unhealthy (1/2)
[10:30:12] 헬스체크: unhealthy (2/2)

❌ 연결 끊김 감지!
🔄 재연결 시도 중 (1/3)...
✅ 재연결 성공!

[10:30:15] 헬스체크: healthy
```

---

## 📱 React 컴포넌트 사용

### App.tsx에 모달 추가

```tsx
import { EngineConnectionModal } from './components/EngineConnectionModal';

function App() {
  return (
    <Router>
      {/* 전역 모달 */}
      <EngineConnectionModal />
      
      {/* 라우트 */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
```

### 커스텀 이벤트 핸들러

```tsx
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    if (!window.swingAnalysis) return;

    // 연결 끊김
    const unsubLost = window.swingAnalysis.onConnectionLost((data) => {
      console.error('연결 끊김:', data);
      // 커스텀 로직 (예: 분석 중단)
    });

    // 재연결 성공
    const unsubSuccess = window.swingAnalysis.onReconnectSuccess(() => {
      console.log('재연결 성공!');
      // 커스텀 로직 (예: 분석 재개)
    });

    return () => {
      unsubLost();
      unsubSuccess();
    };
  }, []);
}
```

---

## 🔍 트러블슈팅

### 문제 1: 모달이 표시되지 않음

**확인 사항:**
```tsx
// App.tsx에 모달이 추가되었는지 확인
<EngineConnectionModal />
```

### 문제 2: 재연결이 계속 실패함

**확인 사항:**
```bash
# Python 설치 확인
python --version

# DLL 파일 확인
ls D:\dev\gstAI\bin\libGFEngine2D.dll

# Python 서버 수동 실행
python bin/gfengine-server-improved.py
```

### 문제 3: 헬스체크가 작동하지 않음

**확인 사항:**
```javascript
// electron/main-updated.js
analysisService = new SwingAnalysisService(mainWindow); // mainWindow 전달 확인

// lib/gfengine-process-python.js
async checkHealth() {
  // 이 메서드가 구현되어 있는지 확인
}
```

---

## 📝 이벤트 목록

| 이벤트 | 설명 | 데이터 |
|--------|------|--------|
| `connection-lost` | 연결 끊김 | `{ consecutiveFailures, timestamp }` |
| `reconnecting` | 재연결 시도 중 | `{ attempt, maxAttempts }` |
| `reconnect-success` | 재연결 성공 | `{ attempt }` |
| `reconnect-failed` | 재연결 실패 | `{ attempts, maxAttempts }` |
| `connection-restored` | 연결 복구 | `{ responseTime }` |

---

## ✅ 체크리스트

Electron 앱에 통합하기 전:

- [ ] `electron/main-updated.js` 사용 중
- [ ] `electron/preload-updated.js` 사용 중
- [ ] `App.tsx`에 `<EngineConnectionModal />` 추가
- [ ] `test-engine-health.js` 테스트 성공
- [ ] Python 프로세스 강제 종료 후 재연결 확인

---

## 🎉 완료!

이제 Python 서버가 크래시되거나 연결이 끊어져도:

1. ✅ 자동으로 감지
2. ✅ 사용자에게 모달로 알림
3. ✅ 자동으로 재연결 시도
4. ✅ 실패 시 수동 재연결 옵션 제공

**안정적인 영상 분석 시스템 완성!** 🏌️‍♂️


