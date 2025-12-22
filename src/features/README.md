# Features Layer

도메인별 비즈니스 로직을 관리하는 레이어입니다.

## 📁 구조 원칙

### 도메인 폴더명 = API 엔드포인트 기준

```
features/
├── auth/          # /api/auth/*
├── user/          # /api/user/*
└── product/       # /api/product/*
```

### 각 도메인 내부 구조

```
features/{domain}/
├── api/                    # 필수: API 서비스 레이어
│   ├── xxxService.ts       # 서비스 구현
│   └── ...
├── types/                  # 필수: 서비스별 타입 (1:1 매핑)
│   ├── xxxService.type.ts  # xxxService의 Request/Response 타입
│   └── ...
├── constants/              # 선택: enum, 필터 옵션 등
│   └── xxxErrors.ts
├── ui/                     # 선택: 도메인 전용 컴포넌트
│   └── XxxForm.tsx
├── hooks/                  # 선택: 도메인 전용 커스텀 훅
│   └── useXxx.ts
└── utils/                  # 선택: 도메인 전용 유틸리티
    └── validateXxx.ts
```

## 📝 파일 명명 규칙

- **서비스**: `camelCase.ts` (예: `authService.ts`)
- **타입**: `camelCase.type.ts` (예: `authService.type.ts`)
- **컴포넌트**: `PascalCase.tsx` (예: `LoginForm.tsx`)
- **유틸**: `camelCase.ts` (예: `validateAuth.ts`)
- **상수**: `camelCase.ts` (예: `authErrors.ts`)

## 📌 Import 규칙

### ✅ Good

```typescript
// 서비스와 타입을 명확하게 import
import { authService } from '@/features/auth/api/authService'
import type { LoginRequest, LoginResponse } from '@/features/auth/types/authService.type'

// shared 사용
import { apiClient } from '@/shared/api/client'
import { Button } from '@/shared/ui'
```

### ❌ Bad

```typescript
// features 간 직접 참조 불가
import { userService } from '@/features/user/api/userService' // auth에서 불가!
```

## 💡 새 도메인 추가 방법

1. `features/` 아래 도메인 폴더 생성
2. 필수 폴더 생성: `api/`, `types/`
3. 서비스 파일 작성: `api/xxxService.ts`
4. 타입 파일 작성: `types/xxxService.type.ts`
5. 필요에 따라 선택 폴더 추가: `constants/`, `ui/`, `hooks/`, `utils/`

## 📚 예시

자세한 예시는 `PROJECT_STRUCTURE.md` 파일을 참조하세요.

