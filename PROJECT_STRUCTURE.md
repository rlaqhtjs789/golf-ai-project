# GTSN-AI Project

React + Vite + TypeScript + Tailwind CSS 기반 프로젝트

## 🚀 기술 스택

- **React 19** - UI 라이브러리
- **Vite** - 빌드 툴
- **TypeScript** - 타입 안정성
- **Tailwind CSS v4** - 유틸리티 CSS 프레임워크
- **React Router** - 라우팅
- **vite-plugin-pages** - 파일 기반 자동 라우팅
- **i18next** - 다국어 지원
- **HeadlessUI** - 접근성 보장 UI 컴포넌트

## 📁 프로젝트 구조 (FSD 기반)

```
src/
├── app/                          # 앱 진입점 및 전역 설정
│   ├── App.tsx                  # 메인 앱 컴포넌트
│   └── styles/
│       └── index.css            # Tailwind CSS v4 설정
│
├── pages/                        # 📄 페이지 컴포넌트 (자동 라우팅)
│   ├── index.tsx                # / - 홈페이지
│   └── about.tsx                # /about - 소개 페이지
│
├── widgets/                      # 🧩 복합 UI 블록 (레이아웃 조합)
│   └── layout/
│       └── MainLayout.tsx       # 메인 레이아웃 (Header+Footer 조립)
│
├── features/                     # ⚡ 도메인별 비즈니스 로직 (API 도메인 기준)
│   │
│   ├── auth/                    # 인증 도메인 예시
│   │   ├── api/
│   │   │   ├── authService.ts   # 로그인, 로그아웃, 회원가입
│   │   │   └── tokenService.ts  # 토큰 관리, 갱신
│   │   ├── types/
│   │   │   ├── authService.type.ts   # authService 관련 모든 타입
│   │   │   └── tokenService.type.ts  # tokenService 관련 모든 타입
│   │   ├── constants/
│   │   │   ├── authErrors.ts    # 에러 코드 enum
│   │   │   └── authStatus.ts    # 인증 상태 enum
│   │   ├── ui/
│   │   │   ├── LoginForm.tsx    # 로그인 전용 폼
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/               # 도메인 전용 커스텀 훅 (선택)
│   │   │   └── useAuth.ts
│   │   └── utils/               # 도메인 전용 유틸 (선택)
│   │       └── validateAuth.ts
│   │
│   ├── user/                    # 사용자 도메인 예시
│   │   ├── api/
│   │   │   └── userService.ts
│   │   ├── types/
│   │   │   └── userService.type.ts
│   │   ├── constants/
│   │   └── ui/
│   │
│   └── product/                 # 상품 도메인 예시
│       ├── api/
│       │   ├── productService.ts
│       │   └── categoryService.ts
│       ├── types/
│       │   ├── productService.type.ts
│       │   └── categoryService.type.ts
│       ├── constants/
│       │   └── filterOptions.ts # 필터링 옵션
│       ├── ui/
│       │   ├── ProductCard.tsx
│       │   └── ProductFilter.tsx
│       └── utils/
│           └── formatPrice.ts
│
└── shared/                       # 🔧 공통 리소스
    ├── ui/                      # 완전 공용 기본 컴포넌트
    │   ├── Alert.tsx           # 광역 알림/확인 다이얼로그 (HeadlessUI Dialog)
    │   ├── AlertContext.tsx    # Alert 전역 상태 관리
    │   ├── Button.tsx          # 공용 버튼 컴포넌트
    │   ├── LanguageSelector.tsx # 언어 선택 컴포넌트
    │   └── index.ts            # 전체 export
    │
    ├── layout/                  # 레이아웃 컴포넌트
    │   ├── MainHeader.tsx      # 메인 헤더 (홈/나가기 버튼)
    │   └── index.ts
    │
    ├── theme/                   # 테마 관리
    │   ├── colors.ts           # 브랜드 색상 가이드
    │   ├── ThemeContext.tsx    # 테마 Context
    │   ├── ThemeProvider.tsx   # 테마 Provider
    │   ├── hooks.ts            # useTheme 훅
    │   └── index.ts
    │
    ├── i18n/                    # 다국어 지원
    │   ├── config.ts           # i18n 설정
    │   ├── hooks.ts            # useTranslation 훅
    │   ├── index.ts
    │   └── locales/
    │       ├── ko.json         # 한국어
    │       ├── en.json         # 영어
    │       └── ja.json         # 일본어
    │
    ├── lib/                     # 전역 유틸리티
    │   ├── utils.ts            # 범용 유틸
    │   ├── date.ts             # 날짜 관련
    │   ├── string.ts           # 문자열 관련
    │   └── validate.ts         # 범용 검증
    │
    ├── api/                     # API 공통 설정
    │   └── client.ts           # axios/fetch 인스턴스
    │
    ├── types/                   # 전역 타입
    │   └── common.ts           # 공통 타입
    │
    └── constants/               # 전역 상수
        └── config.ts           # 앱 설정
```

## 🎯 FSD (Feature-Sliced Design) 아키텍처

### 레이어 구조 (상위 → 하위)

1. **app** - 애플리케이션 초기화, 라우팅, 전역 설정
2. **pages** - URL 경로에 매핑되는 페이지 (자동 라우팅)
3. **widgets** - 복합 UI 블록 (레이아웃 조합)
4. **features** - 도메인별 비즈니스 로직 (API 도메인 기준)
5. **shared** - 프로젝트 전체에서 재사용되는 공통 코드

### 핵심 규칙

- ✅ 상위 레이어는 하위 레이어만 import 가능
- ❌ 같은 레이어 간 import 금지 (features 간 직접 참조 불가)
- ✅ `shared`는 모든 레이어에서 자유롭게 사용 가능
- ❌ 하위 레이어는 상위 레이어 import 불가

### Features 도메인 구조 원칙

**도메인 폴더명 = API 엔드포인트 기준**

```
features/
├── auth/          # /api/auth/*
├── user/          # /api/user/*
└── product/       # /api/product/*
```

**각 도메인 내부 구조:**

```
features/{domain}/
├── api/                    # 필수: API 서비스 레이어
│   ├── xxxService.ts       # 서비스 구현
│   └── ...
├── types/                  # 필수: 서비스별 타입 (1:1 매핑)
│   ├── xxxService.type.ts  # xxxService의 Request/Response 타입
│   └── ...
├── constants/              # 선택: enum, 필터 옵션 등
├── ui/                     # 선택: 도메인 전용 컴포넌트
├── hooks/                  # 선택: 도메인 전용 커스텀 훅
└── utils/                  # 선택: 도메인 전용 유틸리티
```

**타입 파일 명명 규칙:**
- `{서비스명}.type.ts` → 해당 서비스의 모든 Request/Response 타입
- 예: `authService.ts` → `authService.type.ts`
- 한 파일에 Request와 Response를 함께 관리

**타입 파일 내부 구조:**
```typescript
// features/auth/types/authService.type.ts

// ===== Request Types =====
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
}

// ===== Response Types =====
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

export interface SignupResponse {
  message: string
  userId: string
}

// ===== Shared Models =====
export interface UserInfo {
  id: string
  email: string
  name: string
}
```

### Import 예시

```tsx
// ✅ Good - 서비스와 타입을 명확하게 import
import { authService } from '@/features/auth/api/authService'
import type { 
  LoginRequest, 
  LoginResponse 
} from '@/features/auth/types/authService.type'

// ✅ Good - shared 사용
import { Button } from '@/shared/ui'
import { formatDate } from '@/shared/lib/date'

// ✅ Good - 여러 서비스 사용 시
import { authService } from '@/features/auth/api/authService'
import { tokenService } from '@/features/auth/api/tokenService'
import type { LoginRequest } from '@/features/auth/types/authService.type'
import type { RefreshTokenRequest } from '@/features/auth/types/tokenService.type'

// ❌ Bad - features 간 직접 참조
import { userService } from '@/features/user/api/userService' // auth에서 불가!

// ✅ Good - 필요하면 shared로 추출
import { apiClient } from '@/shared/api/client' // 공통 API 클라이언트
```

### 실전 사용 예시

```typescript
// features/auth/api/authService.ts
import { apiClient } from '@/shared/api/client'
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '../types/authService.type'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },
  
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },
}
```

```typescript
// pages/login/index.tsx
import { useState } from 'react'
import { authService } from '@/features/auth/api/authService'
import { LoginForm } from '@/features/auth/ui/LoginForm'
import type { LoginRequest } from '@/features/auth/types/authService.type'

export default function LoginPage() {
  const handleLogin = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data)
      console.log('로그인 성공:', response)
    } catch (error) {
      console.error('로그인 실패:', error)
    }
  }

  return <LoginForm onSubmit={handleLogin} />
}
```

## 🛠️ 설치 및 실행

### 설치
\`\`\`bash
npm install
\`\`\`

### 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

### 빌드
\`\`\`bash
npm run build
\`\`\`

### 프리뷰
\`\`\`bash
npm run preview
\`\`\`

## 🎨 Tailwind CSS 커스터마이징

`tailwind.config.js` 파일에서 다음을 커스터마이징할 수 있습니다:

- **colors** - 브랜드 컬러 추가
- **screens** - 반응형 브레이크포인트
- **spacing** - 간격 값
- **fontFamily** - 폰트 설정
- **plugins** - Tailwind 플러그인 추가

자세한 내용은 `tailwind.config.js` 주석 참조

## 🗺️ 라우팅 (파일 기반)

`src/pages/` 폴더의 파일 구조가 자동으로 라우트로 변환됩니다:

| 파일 경로 | URL |
|----------|-----|
| `pages/index.tsx` | `/` |
| `pages/about.tsx` | `/about` |
| `pages/blog/index.tsx` | `/blog` |
| `pages/blog/[id].tsx` | `/blog/:id` |
| `pages/[...all].tsx` | `/*` (404) |

## 📝 코딩 컨벤션

### 파일명
- 컴포넌트: `PascalCase.tsx` (예: `LoginForm.tsx`, `UserCard.tsx`)
- 유틸리티: `camelCase.ts` (예: `formatDate.ts`, `validateEmail.ts`)
- 페이지: `kebab-case.tsx` (예: `login.tsx`, `user-profile.tsx`)
- 타입: `camelCase.type.ts` (예: `authService.type.ts`)

### 파일 상단 주석 규칙

**페이지 파일 (pages/*.tsx):**
```tsx
/**
 * 페이지 역할 설명
 *
 * @route /경로
 */
import ...
```

**예시:**
```tsx
/**
 * 홈 페이지
 *
 * @route /
 */

/**
 * 폼 선택 페이지 (성별, 연령대, 핸디캡, 클럽 선택)
 *
 * @route /select
 */

/**
 * 로그인 페이지
 *
 * @route /login
 */
```

**UI 컴포넌트 (shared/ui/*.tsx):**
```tsx
/**
 * 컴포넌트 역할 간단 설명
 *
 * 테일윈드/HeadlessUI 컴포넌트 사용 시 참조 링크
 * @see https://링크
 */
import ...
```

**예시:**
```tsx
/**
 * 광역 알림/확인 다이얼로그 컴포넌트
 *
 * HeadlessUI Dialog 기반
 * @see https://headlessui.com/react/dialog
 */

/**
 * 공용 버튼 컴포넌트
 *
 * variant, size 옵션 제공
 */

/**
 * 언어 선택 컴포넌트
 *
 * i18n 다국어 지원
 */
```

### Import 순서
1. React 관련
2. 외부 라이브러리
3. 내부 모듈 (@/)
4. 상대 경로
5. 스타일

### 컴포넌트 구조
\`\`\`tsx
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
\`\`\`

## 🔧 Path Alias

TypeScript path alias 설정:

- `@/*` → `src/*`

예시:
\`\`\`tsx
import { Button } from '@/shared/ui'
import { MainLayout } from '@/widgets/layout'
\`\`\`

## 🎨 테마 색상 시스템

### 색상 테마 파일 위치
- **`tailwind.config.js`** - 실제 색상값 정의
- **`src/shared/theme/colors.ts`** - 사용 가이드 및 참고 문서

### 사용 방법

**기존 방식 (하드코딩):**
```tsx
className="bg-green-500 text-emerald-400"
```

**새로운 방식 (테마 사용):**
```tsx
className="bg-brand-primary-500 text-brand-accent-400"
```

### 테마 색상 변경
나중에 전체 색상 테마를 변경하려면 `tailwind.config.js`에서만 수정하면 됩니다.

```js
// tailwind.config.js
colors: {
  brand: {
    primary: {
      400: '#4ade80',  // 여기만 수정하면 전체 앱에 반영
      500: '#22c55e',
      600: '#16a34a',
    },
    // ...
  }
}
```

### 정의된 색상 그룹
- **brand.primary** - 메인 브랜드 색상 (green 계열)
- **brand.accent** - 액센트 색상 (emerald 계열)
- **brand.teal** - 틸 색상
- **bg** - 배경 색상 (slate 계열)
- **danger** - 위험/삭제 색상 (red 계열)

자세한 내용은 `src/shared/theme/colors.ts` 참고

## 🔔 광역 Alert 시스템

### 사용 방법

```tsx
import { useAlert } from '@/shared/ui'

function MyComponent() {
  const { showAlert, showConfirm } = useAlert()

  // 알림 표시
  showAlert({
    title: '알림',
    subtitle: '내용',
    okBtnName: '확인',
    okBtnVariant: 'success',
    callback: (result) => {
      // result는 항상 'ok'
    }
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
        // 확인 클릭
      } else {
        // 취소 클릭
      }
    }
  })
}
```

### 특징
- ✅ **전역 사용 가능** - Context API 기반
- ✅ **HeadlessUI** - 접근성 자동 처리
- ✅ **버튼 variant** - primary, success, danger
- ✅ **콜백 지원** - ok/cancel 분기 처리

## 🎭 레이아웃 시스템

### 배경 애니메이션
배경 애니메이션은 **레이아웃 레벨**에서 자동 제공됩니다.
- `MainLayout` - 메인 페이지 배경
- `AuthLayout` - 로그인 페이지 배경

페이지 파일에서는 배경 관련 코드를 작성할 필요 없습니다.

### 현재 페이지 목록
| 파일 | 경로 | 레이아웃 |
|------|------|---------|
| `pages/index.tsx` | `/` | MainLayout |
| `pages/select.tsx` | `/select` | MainLayout |
| `pages/login.tsx` | `/login` | AuthLayout |

## 📚 추가 리소스

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [HeadlessUI 공식 문서](https://headlessui.com)
- [FSD 아키텍처](https://feature-sliced.design)
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
- [i18next 공식 문서](https://www.i18next.com)

## 📄 License

MIT
