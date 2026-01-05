# GTSN AI - 프로젝트 구조 가이드

골프 스윙 분석 AI 키오스크 프로젝트의 간결한 구조 가이드

## 🚀 기술 스택

### Core
- React 19 + TypeScript 5.9
- Vite 7 (빌드 도구)
- React Router v7 (라우팅)

### Styling & UI
- Tailwind CSS v4
- HeadlessUI (접근성 UI)
- Heroicons (아이콘)

### Features
- **Zustand** - 상태 관리 (골프 세션 데이터)
- **Recharts** - 차트 라이브러리 (비거리/구질 시각화)
- **Swiper** - 슬라이더 (구질 추이 표시)
- **i18next** - 다국어 (한/영/일)

## 📁 프로젝트 구조 (FSD 기반)

```
src/
├── app/                          # 앱 진입점 및 전역 설정
│   ├── App.tsx                  # 메인 앱 (라우팅, 클릭 애니메이션)
│   ├── config/
│   │   ├── layouts.ts           # 페이지별 레이아웃 설정
│   │   └── routes.ts            # 인증 필요 페이지 설정
│   ├── providers/
│   │   ├── AuthGuard.tsx        # 인증 가드
│   │   └── LayoutSwitcher.tsx   # 레이아웃 전환
│   ├── types/
│   │   └── route.ts             # 라우트 타입
│   └── styles/
│       └── index.css            # Tailwind CSS v4 설정
│
├── pages/                        # 📄 페이지 (자동 라우팅)
│   ├── index.tsx                # / - 홈
│   ├── login.tsx                # /login - 로그인
│   ├── select.tsx               # /select - 정보 입력
│   ├── swing.tsx                # /swing - 스윙 분석 (10회)
│   ├── solution.tsx             # /solution - 솔루션 (비디오/차트)
│   └── complete.tsx             # /complete - 완료
│
├── widgets/                      # 🧩 복합 UI 블록
│   └── layout/
│       ├── MainLayout.tsx       # 메인 레이아웃
│       ├── AuthLayout.tsx       # 인증 레이아웃
│       └── BlankLayout.tsx      # 빈 레이아웃
│
├── features/                     # ⚡ 도메인 비즈니스 로직
│   └── golf-session/            # 골프 세션 관리
│       ├── model/
│       │   └── store.ts         # Zustand 스토어 (스윙 데이터)
│       ├── types/
│       │   └── index.ts         # 세션 타입
│       └── ui/
│           └── VideoContentModal.tsx  # 영상 모달
│
└── shared/                       # 🔧 공통 리소스
    ├── ui/                      # 공용 컴포넌트
    │   ├── Alert.tsx           # 광역 알림 다이얼로그
    │   ├── AlertContext.tsx    # Alert 전역 상태
    │   ├── Button.tsx          # 버튼
    │   ├── ContentModal.tsx    # 범용 모달
    │   ├── LanguageSelector.tsx # 언어 선택
    │   └── index.ts            # 전체 export
    │
    ├── layout/                  # 레이아웃 컴포넌트
    │   ├── MainHeader.tsx      # 메인 헤더 (홈/나가기/언어)
    │   └── index.ts
    │
    ├── theme/                   # 테마 관리
    │   ├── colors.ts           # 브랜드 색상 가이드
    │   ├── ThemeContext.tsx
    │   ├── ThemeProvider.tsx
    │   ├── hooks.ts
    │   └── index.ts
    │
    ├── i18n/                    # 다국어
    │   ├── config.ts
    │   ├── hooks.ts
    │   ├── index.ts
    │   └── locales/
    │       ├── ko.json         # 한국어
    │       ├── en.json         # 영어
    │       └── ja.json         # 일본어
    │
    ├── lib/                     # 유틸리티
    ├── api/                     # API 클라이언트
    ├── types/                   # 전역 타입
    └── constants/               # 전역 상수
```

## 🎯 FSD (Feature-Sliced Design) 아키텍처

### 레이어 구조 (상위 → 하위)

1. **app** - 앱 초기화, 라우팅, 전역 설정
2. **pages** - URL 경로에 매핑되는 페이지
3. **widgets** - 복합 UI 블록 (레이아웃)
4. **features** - 도메인별 비즈니스 로직
5. **shared** - 전체에서 재사용되는 공통 코드

### 핵심 규칙

- ✅ 상위 레이어는 하위 레이어만 import 가능
- ❌ 같은 레이어 간 import 금지
- ✅ `shared`는 모든 레이어에서 사용 가능
- ❌ 하위 레이어는 상위 레이어 import 불가

### Features 도메인 구조

```
features/{domain}/
├── model/        # 상태 관리 (Zustand, 비즈니스 로직)
├── types/        # 타입 정의
├── ui/           # 도메인 전용 컴포넌트
├── hooks/        # 도메인 전용 훅 (선택)
└── utils/        # 도메인 전용 유틸 (선택)
```

## 📝 코딩 컨벤션

### 파일명
- **컴포넌트**: `PascalCase.tsx`
  - 예: `VideoContentModal.tsx`, `MainHeader.tsx`
- **유틸리티**: `camelCase.ts`
  - 예: `formatDate.ts`
- **페이지**: `kebab-case.tsx`
  - 예: `swing.tsx`, `solution.tsx`
- **타입**: `camelCase.type.ts`
  - 예: `swingData.type.ts`
- **Store**: `store.ts`

### 파일 상단 주석

**페이지:**
```tsx
/**
 * 스윙 분석 페이지 (10회 측정)
 *
 * @route /swing
 */
```

**UI 컴포넌트:**
```tsx
/**
 * 광역 알림/확인 다이얼로그 컴포넌트
 *
 * HeadlessUI Dialog 기반
 * @see https://headlessui.com/react/dialog
 */
```

### Import 순서
```tsx
// 1. React
import { useState, useEffect } from 'react'

// 2. 외부 라이브러리
import { Link } from 'react-router-dom'

// 3. 내부 모듈 (@/)
import { Button } from '@/shared/ui'

// 4. 상대 경로
import { Header } from './Header'

// 5. 타입
import type { SwingData } from '@/features/golf-session/types'
```

### 컴포넌트 구조
```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types
interface Props {
  title: string
}

// 3. Component
export function MyComponent({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Handlers
  const handleClick = () => {}

  // 6. Render
  return <div>{title}</div>
}
```

## 🎨 테마 색상 시스템

### 색상 정의 위치
- **`tailwind.config.js`** - 실제 색상값 정의
- **`src/shared/theme/colors.ts`** - 사용 가이드

### 브랜드 컬러

```css
/* Green - 메인 브랜드 */
--color-brand-primary-400: #4ade80
--color-brand-primary-500: #22c55e
--color-brand-primary-600: #16a34a

/* Emerald & Teal - 액센트 */
--color-brand-accent-emerald: #10b981
--color-brand-accent-teal: #14b8a6

/* Background - 다크 테마 */
--color-bg-primary: #0f172a (slate-900)
--color-bg-secondary: #1e293b (slate-800)

/* Danger - 위험/삭제 */
--color-danger-500: #ef4444
```

### 사용 예시

```tsx
// ❌ 하드코딩
className="bg-green-500 text-emerald-400"

// ✅ 테마 사용
className="bg-brand-primary-500 text-brand-accent-400"
```

## 🔔 광역 Alert 시스템

HeadlessUI Dialog 기반 전역 알림/확인 다이얼로그

### 사용법

```tsx
import { useAlert } from '@/shared/ui'

function MyComponent() {
  const { showAlert, showConfirm } = useAlert()

  // 알림
  showAlert({
    title: '알림',
    subtitle: '내용',
    okBtnName: '확인',
  })

  // 확인
  showConfirm({
    title: '확인',
    subtitle: '삭제하시겠습니까?',
    okBtnName: '삭제',
    cancelBtnName: '취소',
    okBtnVariant: 'danger',
    callback: (result) => {
      if (result === 'ok') {
        // 확인 클릭
      }
    }
  })
}
```

### 버튼 Variant
- `primary` - 기본 (그린)
- `success` - 성공 (그린)
- `danger` - 위험 (레드)

## 🎭 레이아웃 시스템

### 레이아웃 종류
- **main** - 기본 (MainHeader + Content)
- **auth** - 인증 (Header 없음, 중앙 정렬)
- **blank** - 빈 레이아웃

### 레이아웃 설정

**파일:** `src/app/config/layouts.ts`

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
      showLanguageSelector: true,
    },
  },
  '/login': {
    layout: 'auth',
  },
}
```

### MainHeader 옵션
```typescript
{
  mainHeader: {
    showHomeButton?: boolean        // 홈 버튼 (기본: true)
    showExitButton?: boolean        // 나가기 버튼 (기본: true)
    showLanguageSelector?: boolean  // 언어 선택 (기본: true)
  }
}
```

## 🌍 다국어 (i18n)

### 지원 언어
- 🇰🇷 한국어 (기본)
- 🇺🇸 영어
- 🇯🇵 일본어

### 번역 파일
```
src/shared/i18n/locales/
├── ko.json  # 한국어
├── en.json  # 영어
└── ja.json  # 일본어
```

### 사용법

```tsx
import { useTranslation } from '@/shared/i18n/hooks'

function MyComponent() {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
    </div>
  )
}
```

### 번역 추가

```json
// ko.json
{
  "common": {
    "welcome": "환영합니다"
  }
}

// en.json
{
  "common": {
    "welcome": "Welcome"
  }
}
```

## 📊 상태 관리 (Zustand)

### Golf Session Store

**파일:** `features/golf-session/model/store.ts`

```typescript
// 스윙 데이터 관리
- 10회 스윙 데이터 저장
- 세션 정보 (성별, 연령, 핸디캡, 클럽)
- 분석 결과 보관
- 반복 스윙 데이터 누적 (최대 5개 유지)
```

### 사용법

```tsx
import { useGolfSession } from '@/features/golf-session/model/store'

function MyComponent() {
  const { swingData, addSwing } = useGolfSession()

  const handleSwing = () => {
    addSwing({
      distance: 250,
      direction: 'straight',
      // ...
    })
  }
}
```

## 🎮 클릭 애니메이션

**위치:** `src/app/App.tsx`

전역 클릭 시 게임스러운 애니메이션:
- 🎯 중심 펄스 효과 (그린/틸 그라디언트)
- 🌊 다중 동심원 리플 (2개)
- ✨ 8방향 파티클 버스트
- 💫 글로우 효과

```tsx
// App.tsx의 handleClick 함수
- 클릭 좌표 수집
- 파티클 생성 (8방향)
- 0.8초 후 자동 제거
```

## 🗺️ 라우팅

### 자동 라우팅 (파일 기반)

`src/pages/` 폴더 구조 = URL 경로

| 파일 | URL | 설명 |
|------|-----|------|
| `index.tsx` | `/` | 홈 |
| `login.tsx` | `/login` | 로그인 |
| `select.tsx` | `/select` | 정보 입력 |
| `swing.tsx` | `/swing` | 스윙 분석 |
| `solution.tsx` | `/solution` | 솔루션 |
| `complete.tsx` | `/complete` | 완료 |

### 페이지 추가

1. `src/pages/` 폴더에 `.tsx` 파일 생성
2. `kebab-case`로 파일명 작성
3. `export default` 컴포넌트
4. 자동 라우트 생성!

## 📦 주요 패키지

| 패키지 | 용도 |
|--------|------|
| react ^19.2.0 | UI 라이브러리 |
| vite ^7.2.4 | 빌드 도구 |
| typescript ~5.9.3 | 타입 체크 |
| react-router-dom ^7.10.1 | 라우팅 |
| tailwindcss ^4.1.17 | CSS |
| zustand ^5.0.9 | 상태 관리 |
| recharts ^3.6.0 | 차트 |
| swiper ^12.0.3 | 슬라이더 |
| i18next ^25.7.3 | 다국어 |
| @headlessui/react ^2.2.9 | UI |

## 🛠️ 명령어

```bash
npm install      # 설치
npm run dev      # 개발 서버
npm run build    # 빌드
npm run preview  # 프리뷰
npm run lint     # 린트
```

## ⚙️ 주요 설정값

### 스윙 횟수 설정

**파일:** `src/shared/constants/swing.ts`

```typescript
export const SWING_COUNT_PER_SESSION = 3  // 현재: 3회 (테스트용)
```

**변경 방법:**
1. `src/shared/constants/swing.ts` 파일 열기
2. 값 수정 (프로덕션: 10회 권장)
3. 저장 후 자동 재시작

**사용 위치:**
- `pages/swing.tsx` - 스윙 측정
- `features/golf-session/model/sessionStore.ts` - 상태 관리

---

## 🎯 사용자 플로우

```
홈 (/)
  ↓
로그인 (/login) [선택]
  ↓
정보 입력 (/select)
  ↓
┌────────────────────────┐
│ 스윙 루프 (반복 가능)   │
│  ↓                     │
│ 1차 스윙 (/swing)      │
│  ↓                     │
│ 솔루션 비디오          │
│  ↓                     │
│ 2차 스윙 (/swing)      │
│  ↓                     │
│ 솔루션 차트 (비교)     │
│  ↓ (다시 스윙하기)      │
│  └────────────────────┘
  ↓
완료 (/complete)
```

## 📚 참고 문서

- **[README.md](./README.md)** - 상세 프로젝트 문서
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)** - 백엔드 API 명세서 ⭐
- **[CLAUDE.md](./CLAUDE.md)** - 개발 가이드 및 작업 로그
- [Tailwind CSS v4](https://tailwindcss.com)
- [HeadlessUI](https://headlessui.com)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Recharts](https://recharts.org)
- [Swiper](https://swiperjs.com/react)

---

**Made with ❤️ by GTSN Team**
