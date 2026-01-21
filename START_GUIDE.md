# 🚀 GTSN Golf AI - 시작 가이드

## 📌 빠른 시작 (3단계)

### 1️⃣ 설치

```bash
# 프로젝트 클론
git clone https://github.com/rlaqhtjs789/golf-ai-project.git
cd golf-ai-project

# 의존성 설치
npm install

# DLL 파일을 bin/ 폴더에 복사
# - libGFEngine2D.dll
# - tensorflow.dll
# - 기타 필요한 DLL들
```

### 2️⃣ 실행 (관리자 권한 필요)

```bash
# 개발 모드
npm run electron:dev

# 프로덕션 빌드
npm run electron:build:win
```

### 3️⃣ 완료! 🎉

앱이 실행되면 골프 스윙 분석을 시작할 수 있습니다.

---

## 🎯 DLL 통합 방식 선택

프로젝트에는 3가지 DLL 통합 방식이 준비되어 있습니다:

| 방식 | 장점 | 단점 | 추천 대상 |
|------|------|------|----------|
| **1. Python 브릿지** | • **빌드 불필요**<br>• 즉시 사용 가능<br>• Node.js 22.x 완벽 지원 | • 성능 중간<br>• Python 필요 | ✅ **대부분의 경우** |
| **2. N-API Addon** | • 최고 성능<br>• 메모리 안전 | • C++ 컴파일러 필요<br>• 빌드 시간 오래 걸림 | 고성능 필요 시 |
| **3. ffi-napi 래퍼** | • 83개 함수 완벽 지원<br>• 클래스 기반 API | • **Node.js 22.x 빌드 실패**<br>• 복잡한 환경 필요 | ❌ 추천 안 함 |

**👉 추천: 1번 (Python 브릿지)** - 빌드 불필요, 즉시 작동!

---

## 📁 주요 파일 구조

```
gstAI/
├── 📖 README.md                    # 프로젝트 개요
├── 🚀 START_GUIDE.md              # ⭐ 이 파일 (시작하기)
├── 🔧 INTEGRATION_GUIDE.md        # 상세 통합 가이드
├── 🔄 UPDATE_GUIDE.md             # 업데이트 기능
│
├── electron/                       # Electron 메인 프로세스
│   ├── main.js
│   ├── preload.js
│   └── updater.js
│
├── src/                           # React 소스
│   ├── pages/                     # 페이지들
│   ├── components/                # 컴포넌트들
│   └── shared/
│       ├── hooks/                 # React Hooks
│       └── types/                 # TypeScript 타입
│
├── lib/                           # DLL 통합 로직
│   ├── gfengine-wrapper-complete.js   # 🌟 ffi-napi 래퍼 (추천)
│   ├── gfengine-addon/                # N-API Addon
│   └── gfengine-process-python.js     # Python 브릿지
│
├── bin/                           # DLL 파일들
│   └── libGFEngine2D.dll
│
├── docs/                          # API 문서
│   ├── API_REFERENCE.md           # DLL 함수 레퍼런스
│   └── DATA_FORMAT.md             # 데이터 구조
│
└── examples/                      # 예제 코드
    └── test-complete-wrapper.js
```

---

## 🎓 다음 단계

### 방법 1: Python 브릿지 사용 (추천)

**빌드 불필요! 즉시 실행:**

```bash
# 그냥 실행하면 됩니다!
node test-python-bridge.js
```

```javascript
const GFEngineProcess = require('./lib/gfengine-process-python');

async function analyze() {
  const engine = new GFEngineProcess();
  
  // 서버 시작
  await engine.start();
  
  // 초기화
  await engine.initialize(0, 0, 0);
  
  // 버전
  const version = await engine.getVersion();
  console.log('버전:', version);
  
  // 종료
  await engine.stop();
}

analyze();
```

**더 자세한 내용**: `INTEGRATION_GUIDE.md` 참고

---

### 방법 2: N-API Addon (고성능)

```bash
# 1. Visual Studio Build Tools 설치 필요
# 2. 빌드
cd lib/gfengine-addon
node-gyp rebuild --release

# 3. 테스트
node examples/test-napi-addon.js
```

**더 자세한 내용**: `INTEGRATION_GUIDE.md` → N-API 섹션

---

### 방법 3: ffi-napi 래퍼 (작동 안 함)

⚠️ **Node.js 22.x에서 빌드 실패합니다!**

Python 브릿지나 N-API Addon을 사용하세요.

**더 자세한 내용**: `INTEGRATION_GUIDE.md`

---

## 🔄 자동 업데이트

자동 업데이트 기능이 내장되어 있습니다.

```tsx
import UpdateNotification from '@/components/UpdateNotification';

function App() {
  return <UpdateNotification />;
}
```

**더 자세한 내용**: `UPDATE_GUIDE.md` 참고

---

## 📚 문서 목록

### 필수 문서
1. **README.md** - 프로젝트 개요
2. **START_GUIDE.md** - 👈 지금 보고 계신 문서
3. **INTEGRATION_GUIDE.md** - DLL 통합 상세 가이드
4. **UPDATE_GUIDE.md** - 자동 업데이트 가이드

### API 참고 문서
- **docs/API_REFERENCE.md** - DLL 함수 레퍼런스
- **docs/DATA_FORMAT.md** - 데이터 구조 및 포맷

**⚠️ 다른 문서들은 무시하세요!**

---

## 🆘 문제 해결

### "npm install 실패"
→ 관리자 권한으로 실행

### "DLL을 찾을 수 없습니다"
→ `bin/` 폴더에 모든 DLL 파일 확인

### "ffi-napi 빌드 실패"
→ Visual Studio Build Tools 설치 필요

### "앱이 실행 안됨"
→ 관리자 권한으로 실행: `npm run electron:dev`

---

## ✅ 체크리스트

시작하기 전에 확인:
- [ ] Node.js 18+ 설치
- [ ] npm install 완료
- [ ] DLL 파일들 bin/ 폴더에 준비
- [ ] (ffi-napi 사용 시) Visual Studio Build Tools 설치
- [ ] 관리자 권한으로 실행

---

**그럼 시작해볼까요? 🚀⛳**

문제가 생기면 `INTEGRATION_GUIDE.md`를 참고하거나 GitHub Issues에 질문하세요!

