# ⛳ GTSN Golf AI

골프 스윙 분석을 위한 Electron 기반 데스크톱 애플리케이션입니다.

---

## ✨ 주요 기능

- 🎥 **영상 분석**: GFEngine2D를 통한 골프 스윙 분석
- 📊 **샷 데이터 분석**: API 기반 백엔드 분석
- 🔄 **자동 업데이트**: GitHub Releases 연동
- 🌐 **다국어 지원**: 한국어/영어

---

## 🚀 빠른 시작

```bash
# 1. 설치
npm install

# 2. 개발 모드 실행 (관리자 권한)
npm run electron:dev

# 3. 프로덕션 빌드
npm run electron:build:win
```

---

## 📚 문서

### 🎯 필수 문서 (이것만 보세요!)

1. **[시작 가이드](START_GUIDE.md)** 🚀
   - 설치 방법
   - 빠른 시작
   - 프로젝트 구조

2. **[통합 가이드](INTEGRATION_GUIDE.md)** 🔧
   - DLL 통합 3가지 방법
   - 방식별 상세 가이드
   - 선택 가이드

3. **[업데이트 가이드](UPDATE_GUIDE.md)** 🔄
   - 자동 업데이트 설정
   - 배포 방법

### 📖 API 참고 문서

- [API 레퍼런스](docs/API_REFERENCE.md) - DLL 함수 목록
- [데이터 포맷](docs/DATA_FORMAT.md) - 데이터 구조

---

## 🎯 DLL 통합 방식

프로젝트는 3가지 DLL 통합 방식을 지원합니다:

| 방식 | 추천도 | 특징 |
|------|--------|------|
| **ffi-napi 래퍼** | ⭐⭐⭐⭐ | 83개 함수 완벽 지원, 즉시 사용 |
| **N-API Addon** | ⭐⭐⭐⭐⭐ | 최고 성능, C++ 컴파일러 필요 |
| **Python 브릿지** | ⭐⭐⭐ | 빌드 불필요, 간편함 |

**자세한 내용:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

---

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Desktop**: Electron
- **분석 엔진**: GFEngine2D (DLL)
- **빌드**: Vite, electron-builder
- **업데이트**: electron-updater

---

## 📁 프로젝트 구조

```
gstAI/
├── electron/           # Electron 메인 프로세스
├── src/               # React 소스
│   ├── pages/         # 페이지
│   ├── components/    # 컴포넌트
│   └── shared/        # 공유 코드
├── lib/               # DLL 통합 로직
├── bin/               # DLL 파일들
├── docs/              # API 문서
└── examples/          # 예제 코드
```

---

## 🔧 명령어

```bash
# 개발
npm run dev              # Vite 개발 서버
npm run electron:dev     # Electron 개발 모드

# 빌드
npm run build            # Vite 빌드
npm run electron:build   # Electron 빌드

# 플랫폼별 빌드
npm run electron:build:win     # Windows
npm run electron:build:mac     # macOS
npm run electron:build:linux   # Linux
```

---

## ⚠️ 주의사항

- 관리자 권한으로 실행 필요
- Windows 전용 (DLL 의존성)
- DLL 파일들을 `bin/` 폴더에 준비

---

## 📄 라이센스

Private

---

## 🤝 기여

이 프로젝트는 비공개 프로젝트입니다.

---

**시작하려면 [START_GUIDE.md](START_GUIDE.md)를 참고하세요! 🚀**
