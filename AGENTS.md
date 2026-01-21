# GTSN Golf AI - Agent Development Guidelines

This file contains essential information for agentic coding agents working on the GTSN Golf AI codebase.

## Build, Test, and Development Commands

### Core Development Commands
```bash
# Start development server (React + Vite)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Electron Desktop App Commands
```bash
# Run Electron in development mode
npm run electron:dev

# Build Electron app for Windows
npm run electron:build:win

# Build Electron app (platform-agnostic)
npm run electron:build
```

### Testing Commands
```bash
# Run individual test files (Node.js based)
node test-engine-health.js
node test-sensor-simple.js
node test-engine-full.js
node test-python-bridge.js

# Build Python bridge executable
npm run build:python

# Build everything (Python + React + Electron)
npm run build:all
```

## Project Architecture

### Directory Structure
```
src/
├── app/               # App-level components and providers
├── components/        # Reusable UI components
├── features/          # Feature-specific modules (golf-session, etc.)
├── pages/             # Route-based page components
├── services/          # API and external service integrations
├── shared/            # Cross-cutting concerns
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   ├── ui/            # Shared UI components
│   ├── lib/           # Utility functions
│   ├── i18n/          # Internationalization
│   ├── theme/         # Theme system
│   └── constants/     # Application constants
├── stores/            # State management (Zustand)
└── widgets/           # Layout components
```

### Technology Stack
- **Frontend:** React 19.2.0 + TypeScript + Vite 7.2.4
- **Styling:** Tailwind CSS 4.1.17
- **State Management:** Zustand 5.0.9
- **Routing:** React Router 7.10.1
- **Desktop:** Electron 39.2.7
- **Backend:** Node.js + Python bridge for GFEngine2D

## Code Style Guidelines

### TypeScript Configuration
- Strict mode enabled
- ES2022 target
- JSX transform: `react-jsx`
- Path alias: `@/*` maps to `./src/*`
- No unused locals/parameters allowed

### Naming Conventions
- **Components:** PascalCase (`EngineConnectionModal`)
- **Hooks:** camelCase with `use` prefix (`useGFEngine`)
- **Files:** kebab-case for utilities, PascalCase for components
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types:** PascalCase with descriptive suffixes (`AnalysisResult`)

### Import Organization
```typescript
// 1. React imports
import React, { useEffect, useState } from 'react';

// 2. External libraries
import { create } from 'zustand';
import { BrowserRouter } from 'react-router-dom';

// 3. Internal imports (use @ alias)
import type { Session } from '@/services/aiAnalysisApi';
import { useGFEngine } from '@/shared/hooks/useGFEngine';
```

### Export Patterns
```typescript
// Named exports for utilities
export function deepClone<T>(obj: T): T { ... }

// Default export for main components
export default function EngineConnectionModal() { ... }

// Type exports
export type { Session, AnalysisResult };
```

## Component and State Patterns

### Component Structure
```typescript
/**
 * Brief component description
 */
import React, { useEffect, useState } from 'react';

// Interface definitions
interface ComponentProps {
  // prop definitions
}

// Component implementation
export function ComponentName({ prop }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
}
```

### State Management with Zustand
```typescript
// Store definition
interface GolfSessionStore {
  // State
  currentSession: Session | null;
  isLoading: boolean;
  
  // Actions
  startSession: (params: SessionStartParams) => Promise<void>;
  endSession: () => void;
}

export const useGolfSessionStore = create<GolfSessionStore>((set, get) => ({
  currentSession: null,
  isLoading: false,
  
  startSession: async (params) => {
    set({ isLoading: true });
    try {
      const session = await startSession(params);
      set({ currentSession: session });
    } finally {
      set({ isLoading: false });
    }
  },
  
  endSession: () => {
    set({ currentSession: null });
  },
}));
```

## API Service Patterns

### Service File Structure
```typescript
// Constants
const API_BASE_URL = 'http://localhost:8000/api';

// Type definitions
export interface SessionStartParams {
  // parameter definitions
}

export interface Session {
  // session interface
}

// API functions
export async function startSession(params: SessionStartParams): Promise<ApiResponse<{ session_uuid: string; session: Session }>> {
  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '세션 시작 실패');
  }
  
  return response.json();
}
```

## Error Handling Guidelines

### Component Error Handling
```typescript
export function ComponentName() {
  const [error, setError] = useState<string | null>(null);
  
  const handleAction = async () => {
    try {
      setError(null);
      await someAsyncOperation();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    }
  };
  
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  // Normal render
}
```

### Service Error Handling
- Always check response.ok before parsing JSON
- Throw descriptive Error objects with user-friendly messages
- Include both technical details and user-facing messages
- Use consistent error message format (Korean for user-facing)

## Testing Guidelines

### Test File Patterns
- Use Node.js for integration tests
- Include setup/teardown in try/catch blocks
- Use console.log for test output with emojis for clarity
- Test both success and error scenarios

### Test Structure Example
```javascript
/**
 * Test description in Korean
 */
async function test() {
  console.log('🧪 테스트 이름\n');
  
  try {
    // Setup
    const engine = createEngine();
    await engine.load();
    
    // Test execution
    const result = await engine.someOperation();
    console.log('✅ 성공:', result);
    
  } catch (error) {
    console.error('❌ 실패:', error.message);
  }
}
```

## Internationalization

### i18n Usage
```typescript
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation();
  
  return <div>{t('golf.session.title')}</div>;
}
```

- Use translation keys with dot notation
- Default language is Korean
- Store language preference in localStorage

## Electron Integration

### IPC Patterns
- Use preload scripts for secure IPC
- Enable context isolation
- Handle development vs production environments
- Use `wait-on` for development server coordination

## Development Workflow

1. **Before coding:** Run `npm run lint` to check existing code
2. **During development:** Use `npm run dev` for hot reloading
3. **After changes:** Run `npm run lint` to verify code quality
4. **For Electron:** Use `npm run electron:dev` for desktop testing
5. **Before commit:** Ensure all linting passes and tests run successfully

## Key Dependencies to Understand

- **@headlessui/react:** Unstyled UI components
- **recharts:** Data visualization charts
- **fluent-ffmpeg:** Video processing
- **electron-updater:** Auto-update functionality
- **zod:** Schema validation
- **axios:** HTTP client (if used)

## Common Gotchas

- Path aliases only work with `@/` prefix
- Electron requires separate build process
- Python bridge needs native DLL compilation
- Korean language support is default expectation
- State management uses Zustand, not Redux/Context