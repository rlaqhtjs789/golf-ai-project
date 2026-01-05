# GTSN AI - 골프 스윙 분석 AI 키오스크

React + Vite + TypeScript + Tailwind CSS v4 기반의 골프 스윙 분석 키오스크 애플리케이션

## 🎯 프로젝트 소개

GTSN AI는 골프 스윙을 분석하고 개인 맞춤형 솔루션을 제공하는 AI 기반 키오스크 시스템입니다.

### 주요 기능
- 🏌️ **실시간 스윙 분석**: 10회 스윙 데이터 수집 및 분석
- 📊 **데이터 시각화**: Recharts 기반 비거리/구질 차트 제공
- 🎥 **맞춤 솔루션**: 분석 기반 개선 영상 제공
- 🎮 **게임스러운 UX**: 인터랙티브 클릭 애니메이션 및 부드러운 전환 효과
- 🌍 **다국어 지원**: 한국어, 영어, 일본어
- 📱 **반응형 디자인**: 키오스크 최적화 UI

## 🚀 기술 스택

### Core
- **React 19** - 최신 UI 라이브러리
- **Vite 7** - 빠른 개발 서버 및 빌드 도구
- **TypeScript 5.9** - 타입 안정성
- **React Router v7** - 클라이언트 사이드 라우팅

### Styling & UI
- **Tailwind CSS v4** - 차세대 유틸리티 CSS 프레임워크
- **HeadlessUI** - 접근성 보장 UI 컴포넌트
- **Heroicons** - 아이콘 라이브러리

### Features
- **Recharts** - 데이터 시각화 차트 라이브러리
- **Swiper** - 터치 슬라이더
- **Zustand** - 경량 상태 관리
- **i18next** - 다국어 지원
- **vite-plugin-pages** - 파일 기반 자동 라우팅

## 📁 프로젝트 구조 (FSD 아키텍처)

```
src/
├── app/                      # 🎯 Application Layer
│   ├── App.tsx              # 메인 앱 (라우팅, 클릭 애니메이션)
│   ├── config/              # 레이아웃 설정, 라우트 설정
│   ├── providers/           # AuthGuard, LayoutSwitcher
│   ├── types/               # 라우트 타입
│   └── styles/              # Tailwind CSS v4 설정
│
├── pages/                    # 📄 Pages Layer (자동 라우팅)
│   ├── index.tsx            # / - 홈페이지
│   ├── login.tsx            # /login - 로그인
│   ├── select.tsx           # /select - 정보 입력 (성별/연령/핸디캡/클럽)
│   ├── swing.tsx            # /swing - 스윙 화면 (10회 측정)
│   ├── solution.tsx         # /solution - 솔루션 화면 (비디오/차트)
│   └── complete.tsx         # /complete - 완료 화면
│
├── widgets/                  # 🧩 Widgets Layer
│   └── layout/
│       ├── MainLayout.tsx   # 메인 레이아웃
│       ├── AuthLayout.tsx   # 인증 레이아웃
│       └── BlankLayout.tsx  # 빈 레이아웃
│
├── features/                 # ⚡ Features Layer
│   └── golf-session/        # 골프 세션 관리
│       ├── model/           # 상태 관리 (Zustand)
│       ├── types/           # 타입 정의
│       └── ui/              # 도메인 컴포넌트 (VideoContentModal)
│
└── shared/                   # 🔧 Shared Layer
    ├── ui/                  # 공통 UI 컴포넌트
    │   ├── Alert.tsx       # 광역 알림 다이얼로그
    │   ├── Button.tsx      # 버튼 컴포넌트
    │   ├── ContentModal.tsx # 범용 모달
    │   └── LanguageSelector.tsx
    ├── layout/              # 레이아웃 컴포넌트 (MainHeader)
    ├── theme/               # 테마 시스템 (colors, ThemeProvider)
    ├── i18n/                # 다국어 (ko, en, ja)
    ├── lib/                 # 유틸리티
    ├── api/                 # API 클라이언트
    ├── types/               # 전역 타입
    └── constants/           # 전역 상수
```

### 🎨 FSD (Feature-Sliced Design) 원칙

**레이어 구조** (상위 → 하위):
1. **app** - 애플리케이션 초기화, 라우팅, 전역 설정
2. **pages** - 페이지 컴포넌트 (URL 경로와 매핑)
3. **widgets** - 복합 UI 블록 (레이아웃 조합)
4. **features** - 도메인별 비즈니스 로직
5. **shared** - 재사용 가능한 공통 코드

**핵심 규칙**:
- ✅ 상위 레이어는 하위 레이어만 import 가능
- ❌ 같은 레이어 간 import 금지
- ✅ `shared`는 모든 레이어에서 사용 가능

## 🎮 사용자 플로우

```
홈 (/)
  ↓
로그인 (/login) [선택]
  ↓
정보 입력 (/select) - 성별, 연령대, 핸디캡, 클럽 선택
  ↓
┌─────────────────────────────────┐
│ 스윙 분석 루프 (반복 가능)       │
│  ↓                              │
│ 1차 스윙 (/swing) - 10회 측정   │
│  ↓                              │
│ 솔루션 비디오 (/solution)       │
│  ↓                              │
│ 2차 스윙 (/swing) - 10회 측정   │
│  ↓                              │
│ 솔루션 차트 (/solution) - 비교  │
│  ↓ (다시 스윙하기 버튼 클릭)     │
│  └─────────────────────────────┘
  ↓
완료 (/complete)
```

## 🎨 디자인 시스템

### 브랜드 컬러 테마

```css
/* Green 계열 - 메인 브랜드 */
--color-brand-primary-400: #4ade80
--color-brand-primary-500: #22c55e
--color-brand-primary-600: #16a34a

/* Emerald & Teal - 액센트 */
--color-brand-accent-emerald: #10b981
--color-brand-accent-teal: #14b8a6

/* Dark Background */
--color-bg-primary: #0f172a (slate-900)
--color-bg-secondary: #1e293b (slate-800)
```

### 클릭 애니메이션 효과

전역 클릭 시 게임스러운 애니메이션 제공:
- 🎯 중심 펄스 효과 (그린/틸 그라디언트)
- 🌊 다중 동심원 리플
- ✨ 8방향 파티클 버스트
- 💫 글로우 효과

위치: `src/app/App.tsx` (handleClick)

## 🌍 다국어 지원 (i18n)

### 지원 언어
- 🇰🇷 한국어 (기본)
- 🇺🇸 영어
- 🇯🇵 일본어

### 번역 파일 구조
```
src/shared/i18n/locales/
├── ko.json  # 한국어
├── en.json  # 영어
└── ja.json  # 일본어
```

### 사용 예시
```tsx
import { useTranslation } from '@/shared/i18n/hooks'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('common.welcome')}</h1>
}
```

## 🎭 레이아웃 시스템

### 레이아웃 종류
- **main**: 기본 레이아웃 (MainHeader + Content)
- **auth**: 인증 레이아웃 (Header 없음, 중앙 정렬)
- **blank**: 레이아웃 없음 (순수 페이지)

### 레이아웃 설정 (`src/app/config/layouts.ts`)

```typescript
export const LAYOUT_CONFIG = {
  '/': {
    layout: 'main',
    mainHeader: {
      showHomeButton: false,
      showExitButton: false,
    },
  },
  '/swing': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
      showExitButton: true,
    },
  },
}
```

## 📊 상태 관리

### Zustand Store

```typescript
// features/golf-session/model/store.ts
- 스윙 데이터 관리
- 세션 정보 저장
- 분석 결과 보관
```

## 🔔 광역 Alert 시스템

HeadlessUI 기반 전역 알림/확인 다이얼로그

```tsx
import { useAlert } from '@/shared/ui'

function MyComponent() {
  const { showAlert, showConfirm } = useAlert()

  // 알림 표시
  showAlert({
    title: '알림',
    subtitle: '내용',
    okBtnName: '확인',
  })

  // 확인 다이얼로그
  showConfirm({
    title: '확인',
    subtitle: '정말 삭제하시겠습니까?',
    okBtnName: '삭제',
    cancelBtnName: '취소',
    okBtnVariant: 'danger',
    callback: (result) => {
      if (result === 'ok') {
        // 삭제 처리
      }
    }
  })
}
```

## 🛠️ 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
개발 서버: http://localhost:5173/

### 빌드
```bash
npm run build
```

### 프로덕션 프리뷰
```bash
npm run preview
```

### 린트 체크
```bash
npm run lint
```

## 🗺️ 파일 기반 라우팅

`src/pages/` 폴더 구조가 자동으로 라우트로 변환됩니다.

| 파일 경로 | URL | 설명 |
|----------|-----|------|
| `pages/index.tsx` | `/` | 홈페이지 |
| `pages/login.tsx` | `/login` | 로그인 |
| `pages/select.tsx` | `/select` | 정보 입력 |
| `pages/swing.tsx` | `/swing` | 스윙 분석 |
| `pages/solution.tsx` | `/solution` | 솔루션 제공 |
| `pages/complete.tsx` | `/complete` | 완료 화면 |

### 페이지 파일 명명 규칙

**kebab-case 사용** (소문자 + 하이픈)
```
pages/
├── index.tsx          # /
├── login.tsx          # /login
├── select.tsx         # /select
└── swing.tsx          # /swing
```

## 📝 코딩 컨벤션

### 파일명 규칙
- **컴포넌트**: `PascalCase.tsx`
  - 예: `VideoContentModal.tsx`, `MainHeader.tsx`
- **유틸리티**: `camelCase.ts`
  - 예: `formatDate.ts`, `validateForm.ts`
- **페이지**: `kebab-case.tsx`
  - 예: `index.tsx`, `swing.tsx`, `solution.tsx`
- **타입 파일**: `camelCase.type.ts`
  - 예: `swingData.type.ts`
- **Store**: `store.ts` (Zustand)

### Import 순서
```tsx
// 1. React 관련
import { useState, useEffect } from 'react'

// 2. 외부 라이브러리
import { Link } from 'react-router-dom'

// 3. 내부 모듈 (alias)
import { Button } from '@/shared/ui'
import { useGolfSession } from '@/features/golf-session'

// 4. 상대 경로
import { Header } from './Header'

// 5. 타입
import type { SwingData } from '@/features/golf-session/types'
```

## 📦 주요 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | ^19.2.0 | UI 라이브러리 |
| react-router-dom | ^7.10.1 | 라우팅 |
| tailwindcss | ^4.1.17 | CSS 프레임워크 |
| vite | ^7.2.4 | 빌드 도구 |
| typescript | ~5.9.3 | 타입 체크 |
| zustand | ^5.0.9 | 상태 관리 |
| recharts | ^3.6.0 | 차트 라이브러리 |
| swiper | ^12.0.3 | 슬라이더 |
| i18next | ^25.7.3 | 다국어 지원 |
| @headlessui/react | ^2.2.9 | UI 컴포넌트 |

## 🔍 유용한 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린트 체크
npm run lint

# Vite 캐시 삭제 (문제 발생 시)
rm -rf node_modules/.vite
```

## 📚 추가 리소스

### 프로젝트 문서
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 간결한 프로젝트 구조 가이드
- **[CLAUDE.md](./CLAUDE.md)** - 개발 가이드 및 작업 로그

### 공식 문서
- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Tailwind CSS v4 문서](https://tailwindcss.com)
- [HeadlessUI 공식 문서](https://headlessui.com)
- [React Router 문서](https://reactrouter.com)
- [Zustand 문서](https://zustand-demo.pmnd.rs)
- [Recharts 문서](https://recharts.org)
- [Swiper 문서](https://swiperjs.com/react)
- [i18next 문서](https://www.i18next.com)

## 🐛 트러블슈팅

### Tailwind 스타일이 적용되지 않을 때
```bash
# Vite 캐시 삭제 후 재시작
rm -rf node_modules/.vite
npm run dev
```

### 라우팅이 작동하지 않을 때
- `src/pages/` 폴더에 파일이 있는지 확인
- 파일이 `export default`로 컴포넌트를 내보내는지 확인
- 개발 서버 재시작

### TypeScript 에러
```bash
# 타입 체크
npx tsc --noEmit
```

## 📄 라이선스

MIT

## 👥 Contributors

**Made with ❤️ by GTSN Team**

---

## ⚙️ 주요 설정값

### 스윙 횟수 설정

스윙 측정 횟수는 중앙 상수 파일에서 관리됩니다.

**파일 위치:** `src/shared/constants/swing.ts`

```typescript
// 한 번의 스윙 세션에서 측정할 스윙 횟수
export const SWING_COUNT_PER_SESSION = 3  // 기본값: 3회
```

**변경 방법:**
1. `src/shared/constants/swing.ts` 파일 열기
2. `SWING_COUNT_PER_SESSION` 값 수정 (예: 10으로 변경)
3. 저장 후 개발 서버 자동 재시작

**사용되는 곳:**
- `src/pages/swing.tsx` - 스윙 측정 페이지
- `src/features/golf-session/model/sessionStore.ts` - 세션 상태 관리

**참고:**
- 프로덕션 배포 시에는 10회로 변경 권장
- 개발/테스트 시에는 3회로 빠른 테스트 가능

---

## 🎯 개발 현황

### ✅ 구현 완료
- [x] 홈 페이지
- [x] 로그인 페이지
- [x] 정보 입력 페이지 (성별/연령/핸디캡/클럽)
- [x] 스윙 분석 페이지 (10회 측정)
- [x] 솔루션 페이지 (비디오/차트)
- [x] 완료 페이지
- [x] 레이아웃 시스템
- [x] 다국어 지원 (i18n)
- [x] 광역 Alert 시스템
- [x] 클릭 애니메이션 효과
- [x] 상태 관리 (Zustand)

### 🚧 진행 중
- [ ] API 연동
- [ ] 실시간 영상 분석
- [ ] 고급 차트 인터랙션
