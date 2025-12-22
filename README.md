# GTSN-AI

React + Vite + TypeScript + Tailwind CSS v4 기반의 현대적인 웹 애플리케이션

## 🚀 기술 스택

- **React 19** - 최신 UI 라이브러리
- **Vite 7** - 빠른 개발 서버 및 빌드 도구
- **TypeScript** - 타입 안정성
- **Tailwind CSS v4** - 차세대 유틸리티 CSS 프레임워크
- **React Router v6** - 클라이언트 사이드 라우팅
- **vite-plugin-pages** - 파일 기반 자동 라우팅
- **i18next** - 다국어 지원 (한국어, 영어, 일본어)
- **HeadlessUI** - 접근성 보장 UI 컴포넌트 라이브러리

## 📁 프로젝트 구조 (FSD 아키텍처)

```
src/
├── app/                      # 🎯 Application Layer
│   ├── App.tsx              # 메인 앱 컴포넌트 (라우팅 설정)
│   └── styles/
│       └── index.css        # Tailwind CSS v4 설정
│
├── pages/                    # 📄 Pages Layer (자동 라우팅)
│   ├── index.tsx            # / - 홈페이지
│   └── about.tsx            # /about - 소개 페이지
│
├── widgets/                  # 🧩 Widgets Layer
│   └── layout/
│       └── MainLayout.tsx   # 메인 레이아웃 (Header+Footer 조립)
│
├── features/                 # ⚡ Features Layer (도메인별 비즈니스 로직)
│   ├── auth/                # 인증 도메인
│   │   ├── api/            # API 서비스
│   │   │   ├── authService.ts
│   │   │   └── tokenService.ts
│   │   ├── types/          # 서비스별 타입 (1:1 매핑)
│   │   │   ├── authService.type.ts
│   │   │   └── tokenService.type.ts
│   │   ├── constants/      # enum, 상수
│   │   ├── ui/             # 도메인 전용 컴포넌트
│   │   ├── hooks/          # 도메인 전용 훅 (선택)
│   │   └── utils/          # 도메인 전용 유틸 (선택)
│   └── ...                 # 다른 도메인들
│
└── shared/                   # 🔧 Shared Layer
    ├── ui/                  # 공통 UI 컴포넌트 (Button, Input 등)
    ├── layout/              # 레이아웃 컴포넌트 (Header, Footer)
    ├── lib/                 # 전역 유틸리티
    ├── api/                 # API 공통 설정
    ├── types/               # 전역 타입
    └── constants/           # 전역 상수
```

### 🎨 FSD (Feature-Sliced Design) 원칙

**레이어 구조** (상위 → 하위):
1. **app** - 애플리케이션 초기화, 라우팅, 전역 설정
2. **pages** - 페이지 컴포넌트 (URL 경로와 매핑)
3. **widgets** - 복합 UI 블록 (레이아웃 조합)
4. **features** - 도메인별 비즈니스 로직 (API 도메인 기준)
5. **shared** - 재사용 가능한 공통 코드

**핵심 규칙**:
- ✅ 상위 레이어는 하위 레이어만 import 가능
- ❌ 같은 레이어 간 import 금지 (features 간 직접 참조 불가)
- ✅ `shared`는 모든 레이어에서 사용 가능

**Features 도메인 구조**:
```
features/{domain}/
├── api/                    # 필수: API 서비스
│   └── xxxService.ts
├── types/                  # 필수: 서비스별 타입 (1:1 매핑)
│   └── xxxService.type.ts  # Request/Response 함께 관리
├── constants/              # 선택: enum, 필터 옵션
├── ui/                     # 선택: 도메인 전용 컴포넌트
├── hooks/                  # 선택: 도메인 전용 훅
└── utils/                  # 선택: 도메인 전용 유틸
```

**Import 방식** (Public API 없음):
```tsx
// ✅ 서비스와 타입을 명확하게 import
import { authService } from '@/features/auth/api/authService'
import type { 
  LoginRequest, 
  LoginResponse 
} from '@/features/auth/types/authService.type'
```

## 🌍 다국어 지원 (i18n)

이 프로젝트는 **i18next**를 사용하여 다국어를 지원합니다.

### 지원 언어
- 🇰🇷 한국어 (기본)
- 🇺🇸 영어
- 🇯🇵 일본어

### 번역 파일 구조
```
src/shared/i18n/
├── config.ts              # i18n 초기화 설정
├── hooks.ts               # useTranslation 훅
├── locales/
│   ├── ko.json           # 한국어 번역
│   ├── en.json           # 영어 번역
│   └── ja.json           # 일본어 번역
└── components/
    └── LanguageSelector.tsx  # 언어 선택 드롭다운
```

### 번역 사용하기

```tsx
import { useTranslation } from '@/shared/i18n/hooks'

export function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('home.hero.subtitle')}</p>
    </div>
  )
}
```

### 새 번역 키 추가하기

1. **번역 파일 수정** (3개 언어 모두)
```json
// src/shared/i18n/locales/ko.json
{
  "mySection": {
    "title": "제목",
    "description": "설명"
  }
}

// src/shared/i18n/locales/en.json
{
  "mySection": {
    "title": "Title",
    "description": "Description"
  }
}

// src/shared/i18n/locales/ja.json
{
  "mySection": {
    "title": "タイトル",
    "description": "説明"
  }
}
```

2. **컴포넌트에서 사용**
```tsx
const { t } = useTranslation()
<h1>{t('mySection.title')}</h1>
```

### 언어 변경

```tsx
import { useTranslation } from '@/shared/i18n/hooks'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  return (
    <button onClick={() => i18n.changeLanguage('en')}>
      English
    </button>
  )
}
```

### 번역 파일 구조 예시

```json
{
  "common": {
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다",
    "save": "저장",
    "cancel": "취소"
  },
  "navigation": {
    "home": "홈",
    "about": "소개"
  },
  "home": {
    "hero": {
      "title": "환영합니다",
      "subtitle": "혁신적인 서비스"
    }
  }
}
```

### 특징
- ✅ **자동 언어 감지**: 브라우저 언어 자동 인식
- ✅ **localStorage 저장**: 새로고침 후에도 선택한 언어 유지
- ✅ **실시간 변경**: 언어 변경 시 즉시 UI 업데이트

---

## 🎨 레이아웃 시스템

이 프로젝트는 **중앙화된 레이아웃 설정**을 사용하여 페이지별로 다른 레이아웃을 쉽게 적용할 수 있습니다.

### 레이아웃 종류

- **main**: 기본 레이아웃 (Header + Content)
- **auth**: 인증 레이아웃 (Header 없음, 중앙 정렬)
- **blank**: 레이아웃 없음 (순수 페이지만)

### 레이아웃 설정 방법

#### 📍 중앙 설정 파일: `src/app/config/layouts.ts`

```typescript
export const LAYOUT_CONFIG: Record<string, RouteMetadata> = {
  // 홈 페이지
  '/': {
    layout: 'main',
    mainHeader: {
      showHomeButton: false,
      showExitButton: false,
    },
  },

  // 로그인 페이지
  '/login': {
    layout: 'auth',
  },

  // 대시보드 페이지
  '/dashboard': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
      showExitButton: true,
      showLanguageSelector: true,
    },
  },
}
```

### 새 페이지 추가하기

#### 1️⃣ **페이지 파일 생성** (자동 라우팅)

```tsx
// src/pages/dashboard.tsx
function DashboardPage() {
  return (
    <div>
      <h1>대시보드</h1>
    </div>
  )
}

export default DashboardPage
```

#### 2️⃣ **레이아웃 설정 추가** (layouts.ts)

```typescript
// src/app/config/layouts.ts
export const LAYOUT_CONFIG = {
  '/dashboard': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
      showExitButton: true,
    },
  },
}
```

#### 3️⃣ **끝!** ✨

파일 기반 라우팅(`vite-plugin-pages`)이 자동으로 `/dashboard` 경로를 생성하고,
`layouts.ts` 설정에 따라 레이아웃이 자동으로 적용됩니다.

### MainHeader 옵션

```typescript
{
  mainHeader: {
    showHomeButton?: boolean        // 홈 버튼 표시 (기본값: true)
    showExitButton?: boolean        // 나가기 버튼 표시 (기본값: true)
    showLanguageSelector?: boolean  // 언어 선택 표시 (기본값: true)
  }
}
```

### 기본 레이아웃 설정

`LAYOUT_CONFIG`에 정의되지 않은 페이지는 기본 설정을 사용합니다.

```typescript
// src/app/config/layouts.ts
export const DEFAULT_LAYOUT: RouteMetadata = {
  layout: 'main',
  mainHeader: {
    showHomeButton: true,
    showExitButton: true,
    showLanguageSelector: true,
  },
}
```

### 동적 라우트 지원

동적 경로도 설정 가능합니다.

```typescript
export const LAYOUT_CONFIG = {
  '/blog/:id': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
    },
  },
}
```

### 특징
- ✅ **중앙 관리**: 모든 레이아웃 설정이 한 곳에 집중
- ✅ **자동 라우팅**: pages 폴더 구조 그대로 유지
- ✅ **타입 안전**: TypeScript로 완벽한 타입 체크
- ✅ **간단한 페이지**: 각 페이지는 UI만 작성

---

## 🎨 디자인 시스템

Tailwind CSS v4의 `@theme`을 사용하여 디자인 토큰을 중앙에서 관리합니다.

### 디자인 토큰 관리

**파일 구조:**
```
src/app/styles/
├── index.css          # 전역 스타일, 유틸리티, 애니메이션
└── variables.css      # 디자인 토큰 (색상, 폰트, 효과 등)

src/shared/ui/
├── Button.tsx         # 버튼 컴포넌트 + 스타일 포함
├── Card.tsx           # 카드 컴포넌트 + 스타일 포함
└── ...
```

#### SCSS vs Tailwind CSS 비교

**기존 SCSS 방식:**
```scss
// _variables.scss
$primary-color: #10b981;
$font-size-xl: 1.25rem;

// 사용
.button {
  color: $primary-color;
  font-size: $font-size-xl;
}
```

**Tailwind CSS v4 방식:**
```css
/* index.css */
@theme {
  --color-brand-primary-500: #22c55e;
  --font-size-xl: 1.25rem;
}

/* 사용 */
<button class="text-brand-primary-500 text-xl">
```

### 정의된 디자인 토큰

#### 🎨 브랜드 컬러
```css
@theme {
  /* Primary - 메인 브랜드 컬러 (Green) */
  --color-brand-primary-400: #4ade80;
  --color-brand-primary-500: #22c55e;
  --color-brand-primary-600: #16a34a;

  /* Accent - 강조 컬러 */
  --color-brand-accent-emerald: #10b981;
  --color-brand-accent-teal: #14b8a6;

  /* Background - 배경 */
  --color-bg-primary: #0f172a;      /* slate-900 */
  --color-bg-secondary: #1e293b;    /* slate-800 */

  /* Text - 텍스트 */
  --color-text-primary: #f8fafc;    /* 주 텍스트 */
  --color-text-secondary: #cbd5e1;  /* 부 텍스트 */
  --color-text-tertiary: #94a3b8;   /* 설명 텍스트 */

  /* Status - 상태 */
  --color-status-success: #22c55e;
  --color-status-error: #ef4444;
  --color-status-warning: #f59e0b;
}
```

**사용 예시:**
```tsx
<div className="bg-brand-primary-500 text-white">
  <h1 className="text-brand-primary-400">Title</h1>
</div>
```

#### 📝 타이포그래피
```css
@theme {
  /* Font Sizes */
  --font-size-6xl: 3.75rem;     /* 메인 타이틀 */
  --font-size-3xl: 1.875rem;    /* 섹션 제목 */
  --font-size-xl: 1.25rem;      /* 본문 강조 */

  /* Font Weights */
  --font-weight-black: 900;     /* 메인 타이틀 */
  --font-weight-bold: 700;      /* 강조 */
  --font-weight-semibold: 600;  /* 버튼, 링크 */
}
```

**사용 예시:**
```tsx
<h1 className="text-6xl font-black">메인 제목</h1>
<h2 className="text-3xl font-bold">섹션 제목</h2>
```

#### 🎭 효과 (Effects)
```css
@theme {
  /* Shadows */
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Glow Effects - 프로젝트 특징 */
  --shadow-glow-green: 0 0 20px rgba(74, 222, 128, 0.5);

  /* Transitions */
  --transition-base: 200ms;
}
```

### UI 컴포넌트 (스타일 포함)

컴포넌트에 스타일이 직접 포함되어 있습니다. 별도의 CSS 파일이 필요하지 않습니다.

```tsx
// src/shared/ui/Button.tsx
export function Button({ variant = 'primary', size = 'md' }) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-primary-500 ...',
    secondary: 'bg-brand-primary-100 ...',
  }
  // 컴포넌트 안에 스타일 정의
}
```

**사용 예시:**
```tsx
import { Button } from '@/shared/ui'

<Button variant="primary" size="lg">시작하기</Button>
<Button variant="outline" size="md">취소</Button>
```

**장점:**
- ✅ 컴포넌트와 스타일이 한 곳에 (응집도)
- ✅ import만 하면 스타일도 자동 포함
- ✅ 사용하지 않는 컴포넌트 스타일은 번들에서 제외 (트리쉐이킹)

### 디자이너가 왔을 때 작업 방법

#### 1️⃣ 디자인 가이드 받기
```
예: Figma Design System
- Primary Color: #FF6B6B
- Font: Pretendard
- Border Radius: 8px
```

#### 2️⃣ variables.css의 @theme 수정
```css
// src/app/styles/variables.css
@theme {
  /* 기존 */
  --color-brand-primary-500: #22c55e;

  /* 변경 */
  --color-brand-primary-500: #FF6B6B;

  /* 폰트 추가 */
  --font-sans: 'Pretendard', system-ui, sans-serif;
}
```

#### 3️⃣ 새 컴포넌트 추가 (필요 시)
```tsx
// src/shared/ui/Badge.tsx
export function Badge({ variant }) {
  const styles = {
    success: 'bg-status-success text-white',
    error: 'bg-status-error text-white',
  }
  // 컴포넌트에 스타일 포함
}
```

#### 4️⃣ 전체 프로젝트에 자동 적용 ✨
- `variables.css`만 수정하면 전체 프로젝트에 반영
- 컴포넌트 스타일은 각 컴포넌트 파일에서 관리
- Tailwind 클래스도 자동으로 업데이트

### 특징
- ✅ **중앙 관리**: 디자인 토큰은 `variables.css` 한 곳에서 관리
- ✅ **컴포넌트 응집도**: 각 UI 컴포넌트가 자체 스타일 포함
- ✅ **CSS 변수**: 런타임에서도 동적 변경 가능
- ✅ **타입 안전**: TypeScript + Tailwind 클래스 자동완성
- ✅ **트리쉐이킹**: 사용하지 않는 컴포넌트 스타일은 번들에서 제외
- ✅ **확장성**: 디자이너 가이드를 쉽게 적용 가능

---

## 🌓 다크모드 (준비됨, 미적용)

다크모드 시스템이 **구조만 준비**되어 있습니다. 실제 다크모드 스타일은 아직 적용되지 않았습니다.

### 준비된 것
```
src/shared/theme/
├── ThemeContext.tsx       # 테마 Context
├── ThemeProvider.tsx      # 테마 Provider
├── hooks.ts               # useTheme 훅
└── index.ts               # Public exports
```

### 다크모드 활성화 방법 (나중에 할 일)

#### 1️⃣ App에 ThemeProvider 추가
```tsx
// src/app/App.tsx
import { ThemeProvider } from '@/shared/theme'

function App() {
  return (
    <ThemeProvider>
      {/* 기존 내용 */}
    </ThemeProvider>
  )
}
```

#### 2️⃣ 다크모드 토글 버튼 만들기
```tsx
import { useTheme } from '@/shared/theme'

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme()
  
  return (
    <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? '☀️ 라이트' : '🌙 다크'}
    </button>
  )
}
```

#### 3️⃣ 컴포넌트에 다크모드 스타일 추가
```tsx
// ❌ 현재 (다크모드 미지원)
<div className="bg-white text-black">
  내용
</div>

// ✅ 다크모드 지원 추가
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  내용
</div>
```

### Tailwind 다크모드 클래스

| 라이트 모드 | 다크모드 추가 | 설명 |
|------------|--------------|------|
| `bg-white` | `dark:bg-gray-900` | 배경색 |
| `text-black` | `dark:text-white` | 텍스트 색상 |
| `border-gray-200` | `dark:border-gray-700` | 테두리 |
| `bg-blue-500` | `dark:bg-blue-600` | 컬러 |

### 다크모드 작동 원리

1. **사용자가 테마 선택** → `setTheme('dark')`
2. **ThemeProvider가 HTML에 클래스 추가** → `<html class="dark">`
3. **Tailwind가 `dark:` 접두사 스타일 활성화**
4. **localStorage에 저장** → 새로고침 후에도 유지

### 테마 옵션
- `light`: 라이트 모드
- `dark`: 다크 모드
- `system`: 운영체제 설정 따라가기

---

## 🎭 페이지별 레이아웃 설정

Vue/Nuxt의 `definePageMeta`와 동일한 방식으로 페이지별로 다른 레이아웃을 적용할 수 있습니다.

### 사용 가능한 레이아웃

| 레이아웃 | 설명 | 사용 예 |
|---------|------|--------|
| `main` | 기본 레이아웃 (Header + Footer) | 홈, About 등 일반 페이지 |
| `auth` | 인증 레이아웃 (중앙 정렬 카드) | 로그인, 회원가입 |
| `admin` | 관리자 레이아웃 (사이드바 + Header) | 대시보드, 관리자 페이지 |
| `blank` | 레이아웃 없음 (순수 페이지) | 랜딩, 404 페이지 |

### 페이지에서 레이아웃 지정하기

```tsx
// src/pages/login.tsx

function LoginPage() {
  return <div>로그인 페이지</div>
}

// 🔥 컴포넌트에 meta 속성 추가 (Vue의 definePageMeta와 동일)
LoginPage.meta = {
  layout: 'auth',  // auth 레이아웃 사용
}

export default LoginPage
```

### 레이아웃별 예시

#### 기본 레이아웃 (main) - 설정 생략 시 기본값
```tsx
// src/pages/about.tsx
export default function AboutPage() {
  return <div>About 페이지</div>
}
// layout 미지정 시 자동으로 'main' 레이아웃 적용
```

#### 인증 레이아웃 (auth)
```tsx
// src/pages/login.tsx
function LoginPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1>로그인</h1>
      {/* 로그인 폼 */}
    </div>
  )
}

LoginPage.meta = {
  layout: 'auth',
}

export default LoginPage
```

#### 관리자 레이아웃 (admin)
```tsx
// src/pages/admin/dashboard.tsx
function DashboardPage() {
  return <div>대시보드</div>
}

DashboardPage.meta = {
  layout: 'admin',
}

export default DashboardPage
```

#### 레이아웃 없음 (blank)
```tsx
// src/pages/landing.tsx
function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 완전 커스텀 페이지 */}
    </div>
  )
}

LandingPage.meta = {
  layout: 'blank',
}

export default LandingPage
```

### 새 레이아웃 추가하기

1. **레이아웃 컴포넌트 생성**
```tsx
// src/widgets/layout/CustomLayout.tsx
import { type ReactNode } from 'react'

export function CustomLayout({ children }: { children: ReactNode }) {
  return (
    <div className="custom-layout">
      {/* 커스텀 레이아웃 구조 */}
      {children}
    </div>
  )
}
```

2. **index.ts에 export 추가**
```tsx
// src/widgets/layout/index.ts
export { CustomLayout } from './CustomLayout'
```

3. **타입 정의에 추가**
```tsx
// src/app/types/route.ts
export type LayoutType = 'main' | 'auth' | 'admin' | 'blank' | 'custom'
```

4. **LayoutSwitcher에 등록**
```tsx
// src/app/providers/LayoutSwitcher.tsx
const layouts = {
  main: MainLayout,
  auth: AuthLayout,
  admin: AdminLayout,
  blank: BlankLayout,
  custom: CustomLayout,  // 추가
}
```

5. **페이지에서 사용**
```tsx
function MyPage() {
  return <div>내용</div>
}

MyPage.meta = {
  layout: 'custom',
}

export default MyPage
```

### 메타데이터 추가 옵션

레이아웃 외에 다른 메타데이터도 추가 가능합니다:

```tsx
MyPage.meta = {
  layout: 'custom',
}

export default MyPage
```

### 인증 가드 (간단 버전)

인증이 필요한 페이지는 **`src/app/config/routes.ts`**의 배열에 추가만 하면 됩니다.

#### 1. 인증 필요 페이지 추가

```tsx
// src/app/config/routes.ts
export const PROTECTED_ROUTES = [
  '/profile',
  '/settings',
  '/dashboard',
  '/admin',          // /admin으로 시작하는 모든 경로 포함
]
```

#### 2. 페이지 생성 (평소처럼)

```tsx
// src/pages/profile.tsx
export default function ProfilePage() {
  return <div>프로필</div>
}

// meta 선언 필요 없음! routes.ts에만 추가하면 됨
```

#### 3. AuthGuard 활성화 (나중에 필요할 때)

```tsx
// src/app/App.tsx
import { AuthGuard } from '@/app/providers/AuthGuard'

function App() {
  return (
    <AuthGuard>
      <LayoutSwitcher layout={currentLayout}>
        {element}
      </LayoutSwitcher>
    </AuthGuard>
  )
**현재 상태**: 
- ✅ 레이아웃 시스템 완전 구현 (페이지 meta 방식)
- ✅ AuthGuard 구조 준비됨 (routes.ts 배열 방식)
- ❌ 실제 인증 로직 미구현 (추후 useAuth 훅 만들면 됨)

---

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

`src/pages/` 폴더의 파일 구조가 자동으로 라우트로 변환됩니다.

| 파일 경로 | URL | 설명 |
|----------|-----|------|
| `pages/index.tsx` | `/` | 홈페이지 |
| `pages/about.tsx` | `/about` | About 페이지 |
| `pages/user-profile.tsx` | `/user-profile` | 사용자 프로필 (kebab-case) |
| `pages/blog/index.tsx` | `/blog` | 블로그 목록 |
| `pages/blog/[id].tsx` | `/blog/:id` | 동적 블로그 상세 |
| `pages/products/[id].tsx` | `/products/:id` | 동적 상품 상세 |
| `pages/[...all].tsx` | `/*` | 404 페이지 (모든 경로) |

### 페이지 파일 명명 규칙 ⭐

**kebab-case 사용** (소문자 + 하이픈)
```
pages/
├── index.tsx              # /
├── about.tsx              # /about
├── login.tsx              # /login
├── user-profile.tsx       # /user-profile
└── product-detail.tsx     # /product-detail
```

### 새 페이지 추가하기

1. `src/pages/` 폴더에 `.tsx` 파일 생성
2. **kebab-case**로 파일명 작성
3. 컴포넌트를 `export default`로 내보내기
4. 자동으로 라우트 생성됨!

```tsx
// src/pages/user-profile.tsx
export default function UserProfilePage() {
  return <div>User Profile</div>
}
// → 자동으로 /user-profile 경로 생성
```

## 🎨 Tailwind CSS v4

### 기본 사용

```tsx
<div className="bg-blue-600 text-white p-4 rounded-lg">
  Hello Tailwind!
</div>
```

### 커스텀 설정

`src/app/styles/index.css` 파일에서 테마 커스터마이징:

```css
@theme {
  /* 커스텀 색상 */
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  
  /* 커스텀 spacing */
  --spacing-128: 32rem;
}
```

### 커스텀 컴포넌트 스타일

```css
/* src/app/styles/index.css */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.btn-primary {
  background-color: rgb(37 99 235);
  color: white;
}
```

## 🔧 Path Alias

TypeScript path alias 설정으로 깔끔한 import:

```tsx
// ❌ 상대 경로
import { Button } from '../../../shared/ui/Button'

// ✅ Alias 사용
import { Button } from '@/shared/ui'
import { MainLayout } from '@/widgets/layout'
```

**설정**: `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📝 코딩 컨벤션

### 파일명 규칙
- **컴포넌트**: `PascalCase.tsx`
  - 예: `LoginForm.tsx`, `UserCard.tsx`, `ProductFilter.tsx`
- **유틸리티**: `camelCase.ts`
  - 예: `formatDate.ts`, `validateEmail.ts`, `debounce.ts`
- **페이지**: `kebab-case.tsx` ⭐
  - 예: `index.tsx`, `about.tsx`, `user-profile.tsx`, `product-detail.tsx`
- **타입 파일**: `camelCase.type.ts`
  - 예: `authService.type.ts`, `userService.type.ts`
- **서비스 파일**: `camelCase.ts`
  - 예: `authService.ts`, `productService.ts`

### Import 순서
```tsx
// 1. React 관련
import { useState, useEffect } from 'react'

// 2. 외부 라이브러리
import { Link } from 'react-router-dom'

// 3. 내부 모듈 (alias)
import { Button } from '@/shared/ui'
import { useAuth } from '@/features/auth'

// 4. 상대 경로
import { Header } from './Header'

// 5. 타입
import type { User } from '@/entities/user'

// 6. 스타일 (필요시)
import './styles.css'
```

### 컴포넌트 구조
```tsx
// 1. Imports
import { useState } from 'react'

// 2. Types/Interfaces
interface Props {
  title: string
  onSubmit: () => void
}

// 3. Component
export function MyComponent({ title, onSubmit }: Props) {
  // 4. Hooks
  const [state, setState] = useState(false)
  
  // 5. Event Handlers
  const handleClick = () => {
    setState(true)
    onSubmit()
  }
  
  // 6. Early returns
  if (!title) return null
  
  // 7. Main render
  return (
    <div onClick={handleClick}>
      <h1>{title}</h1>
    </div>
  )
}
```

## 🏗️ 프로젝트 확장 가이드

### 1. 새로운 Feature 추가
```
src/features/auth/
├── model/           # 비즈니스 로직
│   └── useAuth.ts
├── ui/              # UI 컴포넌트
│   └── LoginForm.tsx
└── index.ts         # Public API
```

### 2. 새로운 Entity 추가
```
src/entities/user/
├── model/           # 타입, 인터페이스
│   └── types.ts
├── ui/              # 엔티티 UI
│   └── UserCard.tsx
├── api/             # API 호출
│   └── userApi.ts
└── index.ts
```

### 3. 공통 UI 컴포넌트 추가
```tsx
// src/shared/ui/Input.tsx
export function Input({ ...props }) {
  return <input className="..." {...props} />
}

// src/shared/ui/index.ts
export { Button } from './Button'
export { Input } from './Input'
```

## 📦 주요 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | ^19.2.0 | UI 라이브러리 |
| react-router-dom | ^7.x | 라우팅 |
| tailwindcss | ^4.x | CSS 프레임워크 |
| vite | ^7.2.4 | 빌드 도구 |
| vite-plugin-pages | ^0.33.x | 파일 기반 라우팅 |
| typescript | ~5.9.3 | 타입 체크 |
| i18next | ^25.x | 다국어 지원 |
| react-i18next | ^16.x | React용 i18n |
| @headlessui/react | ^2.x | 접근성 UI 컴포넌트 |
| @heroicons/react | ^2.x | 아이콘 라이브러리 |

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
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 간결한 프로젝트 구조 가이드 ⭐
  - 코딩 컨벤션
  - 테마 색상 시스템
  - 광역 Alert 사용법
  - 레이아웃 시스템

### 공식 문서
- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Tailwind CSS v4 문서](https://tailwindcss.com)
- [HeadlessUI 공식 문서](https://headlessui.com)
- [React Router 문서](https://reactrouter.com)
- [FSD 아키텍처](https://feature-sliced.design)
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
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

## 👥 기여

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

---

**Made with ❤️ by GTSN Team**
# golf-ai-project
