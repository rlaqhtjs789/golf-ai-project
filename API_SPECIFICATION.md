# GTSN AI - API 명세서

골프 스윙 분석 AI 키오스크 프로젝트에 필요한 API 목록

## 📋 목차

1. [인증 (Auth)](#1-인증-auth)
2. [세션 관리 (Session)](#2-세션-관리-session)
3. [스윙 데이터 (Swing)](#3-스윙-데이터-swing)
4. [분석 결과 (Analysis)](#4-분석-결과-analysis)
5. [미디어 (Media)](#5-미디어-media)

---

## 1. 인증 (Auth)

### 1.1 비회원 세션 생성

**현재 프로젝트는 비회원으로 진행**되므로, 임시 세션 토큰을 발급받아야 합니다.

```
POST /api/auth/guest
```

**Request Body:**
```json
{
  "deviceId": "kiosk-001"  // 키오스크 기기 ID
}
```

**Response:**
```json
{
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-12-31T23:59:59Z",
  "userId": "guest-abc123"  // 임시 사용자 ID
}
```

**사용 위치:**
- `src/pages/index.tsx` - 홈 페이지 진입 시

---

### 1.2 로그인 (향후 회원 기능 추가 시)

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "user123",
    "name": "홍길동",
    "email": "user@example.com"
  }
}
```

**사용 위치:**
- `src/pages/login.tsx` - 로그인 페이지

---

## 2. 세션 관리 (Session)

### 2.1 스윙 세션 시작

정보 입력 완료 후 스윙 세션을 시작합니다.

```
POST /api/session/start
```

**Request Body:**
```json
{
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userInfo": {
    "gender": "male",           // "male" | "female"
    "ageRange": "30-32",        // "15-19" | "20-29" | "30-32" | ...
    "handicapRange": "10-14.9", // "0-4.9" | "5-9.9" | ...
    "clubType": "driver"        // "driver" | "wood3" | "utility" | ...
  }
}
```

**Response:**
```json
{
  "sessionId": "session-abc123",
  "createdAt": "2024-01-05T10:30:00Z",
  "status": "active"
}
```

**사용 위치:**
- `src/pages/select.tsx` - 정보 입력 완료 후 (handleNext 함수)

**TypeScript 타입:**
```typescript
// select.tsx에서 사용 중인 타입
type Gender = 'male' | 'female'
type AgeRange = '15-19' | '20-29' | '30-32' | '33-35' | '36-39' | '40-44' | '45-49' | '60-69' | '70-79'
type HandicapRange = '0-4.9' | '5-9.9' | '10-14.9' | '15-19.9' | '20-24.9' | '25-29.9' | '30+'
type ClubType = 'driver' | 'wood3' | 'utility' | 'iron4' | 'iron5' | 'iron6' | 'iron7' | 'iron8' | 'iron9'
```

---

### 2.2 세션 종료

```
POST /api/session/end
```

**Request Body:**
```json
{
  "sessionId": "session-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "totalSwings": 3,
  "completedAt": "2024-01-05T11:00:00Z"
}
```

**사용 위치:**
- `src/pages/complete.tsx` - 완료 페이지

---

## 3. 스윙 데이터 (Swing)

### 3.1 스윙 데이터 전송

실시간으로 측정된 스윙 데이터를 서버로 전송합니다.

```
POST /api/swing/measurement
```

**Request Body:**
```json
{
  "sessionId": "session-abc123",
  "swingNumber": 1,           // 몇 번째 스윙인지 (1, 2, 3...)
  "shotNumber": 1,            // 해당 스윙의 몇 번째 샷인지 (1~3 or 1~10)
  "measurement": {
    "clubSpeed": 48.5,        // 클럽 스피드 (m/s)
    "ballSpeed": 35.2,        // 볼 스피드 (m/s)
    "launchAngle": 20.3,      // 발사각 (도)
    "direction": "L1.5",      // 방향 (L=왼쪽, R=오른쪽, 숫자=각도)
    "lateralDistance": 2.1,   // 좌우 편차 (m)
    "distance": 235.7,        // 비거리 (야드)
    "sideSpin": "R450",       // 사이드 스핀 (R/L + rpm)
    "backSpin": 4500,         // 백스핀 (rpm)
    "ballFlight": "슬라이스", // 구질 ("슬라이스" | "훅" | "스트레이트")
    "timestamp": 1704447000000
  }
}
```

**Response:**
```json
{
  "success": true,
  "measurementId": "measure-123",
  "receivedAt": "2024-01-05T10:35:00Z"
}
```

**사용 위치:**
- `src/pages/swing.tsx` - 스윙 측정 중 (매 샷마다 전송)

**TypeScript 타입:**
```typescript
// src/features/golf-session/types/session.type.ts
export interface SwingMeasurement {
  swingNumber: number
  clubSpeed: number
  ballSpeed: number
  distance: number
  angle: number
  spin: number
  timestamp: number
}
```

---

### 3.2 스윙 완료 및 분석 요청

10회(또는 3회) 스윙이 모두 완료되면 분석을 요청합니다.

```
POST /api/swing/complete
```

**Request Body:**
```json
{
  "sessionId": "session-abc123",
  "swingNumber": 1,
  "totalShots": 3,
  "measurements": [
    {
      "shotNumber": 1,
      "clubSpeed": 48.5,
      "ballSpeed": 35.2,
      // ... 나머지 측정값
    },
    {
      "shotNumber": 2,
      // ...
    },
    {
      "shotNumber": 3,
      // ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "swingId": "swing-abc123",
  "analysisStatus": "processing",  // "processing" | "completed"
  "estimatedTime": 5  // 예상 분석 시간 (초)
}
```

**사용 위치:**
- `src/pages/swing.tsx` - 스윙 화면-3 (로딩 화면) 진입 시

---

### 3.3 실시간 스윙 데이터 수집 (WebSocket)

**선택 사항: WebSocket 또는 Polling 방식**

```
WS /api/swing/live
```

**서버 → 클라이언트 메시지:**
```json
{
  "type": "swing_detected",
  "data": {
    "shotNumber": 1,
    "clubSpeed": 48.5,
    "ballSpeed": 35.2,
    // ... 측정값
  }
}
```

**사용 위치:**
- `src/pages/swing.tsx` - 실시간 측정값 업데이트

---

## 4. 분석 결과 (Analysis)

### 4.1 스윙 분석 결과 조회

```
GET /api/analysis/result/{swingId}
```

**Response:**
```json
{
  "swingId": "swing-abc123",
  "status": "completed",
  "averages": {
    "clubSpeed": 48.2,
    "ballSpeed": 34.8,
    "distance": 232.5,
    "angle": 19.8,
    "spin": 4350
  },
  "analysisCompletedAt": "2024-01-05T10:40:00Z"
}
```

**사용 위치:**
- `src/pages/swing.tsx` - 로딩 화면에서 폴링으로 조회

---

### 4.2 문제점 분석 조회

첫 번째 스윙 후, AI가 분석한 주요 문제점을 조회합니다.

```
GET /api/analysis/problems
```

**Query Parameters:**
- `sessionId`: session-abc123
- `swingId`: swing-abc123

**Response:**
```json
{
  "problems": [
    {
      "id": 1,
      "title": "백스윙이 감지되어있어요",
      "percentage": 45.2,     // 문제 발생 비율
      "severity": "high",     // "high" | "medium" | "low"
      "shots": [
        {
          "id": "shot-1",
          "shotNumber": 1,
          "image": "https://cdn.example.com/shots/shot-1.jpg",
          "label": "샷 1"
        },
        {
          "id": "shot-2",
          "shotNumber": 3,
          "image": "https://cdn.example.com/shots/shot-2.jpg",
          "label": "샷 3"
        }
      ]
    },
    {
      "id": 2,
      "title": "스윙 자세가 감지되어있어요",
      "percentage": 28.7,
      "severity": "medium",
      "shots": [ /* ... */ ]
    },
    {
      "id": 3,
      "title": "임팩트가 감지되어있어요",
      "percentage": 16.3,
      "severity": "low",
      "shots": [ /* ... */ ]
    }
  ]
}
```

**사용 위치:**
- `src/pages/solution.tsx` - 솔루션 영상형 페이지
- **현재 MOCK 데이터:** `MOCK_PROBLEMS` (20~54줄)

---

### 4.3 솔루션 영상 목록 조회

문제점에 대한 교정 영상 목록을 조회합니다.

```
GET /api/analysis/videos/{problemId}
```

**Query Parameters:**
- `sessionId`: session-abc123
- `problemId`: 1

**Response:**
```json
{
  "problemId": 1,
  "problemTitle": "백스윙이 감지되어있어요",
  "videos": [
    {
      "id": "video-1",
      "title": "백스윙 교정 영상 1",
      "thumbnail": "https://cdn.example.com/thumbnails/video-1.jpg",
      "videoUrl": "https://cdn.example.com/videos/video-1.mp4",
      "duration": 120,        // 영상 길이 (초)
      "status": "correct",    // "correct" | "incorrect"
      "category": "백스윙"
    },
    {
      "id": "video-2",
      "title": "백스윙 교정 영상 2",
      // ...
    }
  ]
}
```

**사용 위치:**
- `src/pages/solution.tsx` - 솔루션 영상형 페이지
- `src/features/golf-session/ui/VideoContentModal.tsx` - 영상 모달
- **현재 MOCK 데이터:** `MOCK_VIDEOS` (59~66줄)

---

### 4.4 비거리 추이 데이터 조회

여러 스윙의 비거리 비교 차트 데이터를 조회합니다.

```
GET /api/analysis/distance-trend
```

**Query Parameters:**
- `sessionId`: session-abc123
- `swingIds`: swing-1,swing-2,swing-3 (최대 5개)

**Response:**
```json
{
  "data": [
    {
      "shot": "1회차",
      "swing1": 232.5,
      "swing2": 245.8,
      "swing3": 248.2
    },
    {
      "shot": "2회차",
      "swing1": 228.3,
      "swing2": 242.1,
      "swing3": 250.5
    },
    {
      "shot": "3회차",
      "swing1": 235.7,
      "swing2": 247.3,
      "swing3": 252.1
    }
  ],
  "averages": {
    "swing1": 232.2,
    "swing2": 245.1,
    "swing3": 250.3
  },
  "improvement": {
    "percentage": 7.8,  // 개선율 (%)
    "yards": 18.1       // 개선 야드
  }
}
```

**사용 위치:**
- `src/pages/solution.tsx` - 솔루션 차트형 페이지 (비거리 추이 차트)
- **현재 로직:** `getDistanceTrendData()` 함수 (77~97줄)

---

### 4.5 구질 추이 데이터 조회 (Swiper용)

여러 스윙의 구질 패턴을 Swiper 슬라이더로 표시할 데이터를 조회합니다.

```
GET /api/analysis/ball-flight-trend
```

**Query Parameters:**
- `sessionId`: session-abc123
- `swingIds`: swing-1,swing-2,swing-3

**Response:**
```json
{
  "swings": [
    {
      "swingNumber": 3,  // 최신 스윙부터 내림차순
      "swingId": "swing-3",
      "chartData": [
        { "x": 0, "y": 0, "type": "center" },
        { "x": -15, "y": 200, "type": "shot", "shotNumber": 1 },
        { "x": 5, "y": 210, "type": "shot", "shotNumber": 2 },
        { "x": -8, "y": 205, "type": "shot", "shotNumber": 3 }
      ],
      "average": {
        "direction": "L",
        "deviation": 9.3,
        "ballFlight": "슬라이스"
      }
    },
    {
      "swingNumber": 2,
      "swingId": "swing-2",
      "chartData": [ /* ... */ ],
      "average": { /* ... */ }
    },
    {
      "swingNumber": 1,
      "swingId": "swing-1",
      "chartData": [ /* ... */ ],
      "average": { /* ... */ }
    }
  ],
  "improvement": {
    "deviationReduction": 45.2,  // 편차 감소율 (%)
    "straightness": 78.5         // 직진성 점수 (%)
  }
}
```

**사용 위치:**
- `src/pages/solution.tsx` - 솔루션 차트형 페이지 (구질 추이 Swiper)
- **현재 로직:** `getBallFlightTrendData()` 함수 (100줄~)

---

### 4.6 개선도 통계 조회

첫 번째 스윙 대비 개선도를 조회합니다.

```
GET /api/analysis/improvement
```

**Query Parameters:**
- `sessionId`: session-abc123
- `baseSwingId`: swing-1 (기준 스윙)
- `compareSwingIds`: swing-2,swing-3 (비교 스윙들)

**Response:**
```json
{
  "distance": {
    "base": 232.5,
    "current": 250.3,
    "improvement": 7.7,        // 개선율 (%)
    "improvementYards": 17.8   // 개선 야드
  },
  "accuracy": {
    "base": 55.2,
    "current": 78.5,
    "improvement": 42.2        // 정확도 개선율 (%)
  },
  "consistency": {
    "base": 68.3,
    "current": 82.1,
    "improvement": 20.2        // 일관성 개선율 (%)
  }
}
```

**사용 위치:**
- `src/pages/solution.tsx` - 솔루션 차트형 페이지 (개선도 카드)

---

## 5. 미디어 (Media)

### 5.1 영상 스트리밍

```
GET /api/media/video/{videoId}
```

**Response:**
- Content-Type: `video/mp4`
- Streaming 지원

**사용 위치:**
- `src/features/golf-session/ui/VideoContentModal.tsx` - 영상 모달 재생

---

### 5.2 썸네일 이미지

```
GET /api/media/thumbnail/{imageId}
```

**Response:**
- Content-Type: `image/jpeg`

**사용 위치:**
- `src/pages/solution.tsx` - 영상 썸네일, 샷 이미지

---

## 📊 API 우선순위

### Phase 1 (필수 - MVP)

1. ✅ **비회원 세션 생성** - `/api/auth/guest`
2. ✅ **스윙 세션 시작** - `/api/session/start`
3. ✅ **스윙 데이터 전송** - `/api/swing/measurement`
4. ✅ **스윙 완료 및 분석** - `/api/swing/complete`
5. ✅ **분석 결과 조회** - `/api/analysis/result/{swingId}`
6. ✅ **문제점 조회** - `/api/analysis/problems`
7. ✅ **솔루션 영상 조회** - `/api/analysis/videos/{problemId}`

### Phase 2 (중요)

8. ✅ **비거리 추이 조회** - `/api/analysis/distance-trend`
9. ✅ **구질 추이 조회** - `/api/analysis/ball-flight-trend`
10. ✅ **개선도 통계 조회** - `/api/analysis/improvement`
11. ✅ **세션 종료** - `/api/session/end`

### Phase 3 (향후 기능)

12. 🔜 **로그인** - `/api/auth/login` (회원 기능)
13. 🔜 **실시간 스윙 수집** - WebSocket (선택)
14. 🔜 **영상 스트리밍 최적화**

---

## 🔗 프론트엔드 연동 가이드

### API 클라이언트 구조

```
src/
└── features/
    └── golf-session/
        └── api/                    # API 서비스 생성 필요
            ├── authService.ts      # 인증 API
            ├── sessionService.ts   # 세션 관리 API
            ├── swingService.ts     # 스윙 데이터 API
            ├── analysisService.ts  # 분석 결과 API
            └── mediaService.ts     # 미디어 API
```

### 환경 변수 설정

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000

# .env.production
VITE_API_BASE_URL=https://api.gtsn.ai
VITE_WS_BASE_URL=wss://api.gtsn.ai
```

### API 클라이언트 예시

```typescript
// src/shared/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 인터셉터 추가 (토큰 자동 첨부)
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sessionToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 📝 참고사항

### 현재 MOCK 데이터 위치

API 연동 전까지 MOCK 데이터를 사용하는 위치:

1. **문제점 데이터**: `src/pages/solution.tsx` - `MOCK_PROBLEMS` (20~54줄)
2. **솔루션 영상**: `src/pages/solution.tsx` - `MOCK_VIDEOS` (59~66줄)
3. **스윙 측정값**: `src/pages/swing.tsx` - `generateMockData()` (32~42줄)

### API 연동 시 제거 대상

```typescript
// ❌ API 연동 후 제거
const MOCK_PROBLEMS = [ /* ... */ ]
const MOCK_VIDEOS = [ /* ... */ ]
const generateMockData = () => { /* ... */ }

// ✅ API 연동 후 사용
const problems = await analysisService.getProblems(sessionId, swingId)
const videos = await analysisService.getVideos(problemId)
```

---

**Last Updated:** 2026-01-05
**Author:** GTSN Team
