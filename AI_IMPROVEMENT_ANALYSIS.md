# AI 골프 분석 시스템 API 문서

## 📊 개요

AI 스윙 분석 시스템은 골프 스윙 데이터와 영상을 분석하여 사용자의 스윙을 평가하고, 최적화 대비 개선 가능한 수치를 %로 제공합니다.

---

## 🎯 분석 항목

### 1. 비거리 개선 (Distance Improvement)
- **계산 방식**: (최적 캐리 - 현재 캐리) / 최적 캐리 * 100
- **기준**: 헤드스피드별 최적 캐리 거리 대비
- **표시 조건**: 5% 이상 개선 가능할 때만 표시

### 2. 구질 개선 (Ball Flight Improvement)
- **계산 방식**: 사이드스핀의 초과분 / 전체 사이드스핀 * 100
- **기준**: 최적 사이드스핀 범위 (-200 ~ +200 rpm)
- **슬라이스/훅 판정**: 사이드스핀 방향으로 판단
- **표시 조건**: 사이드스핀이 최적 범위를 벗어날 때

### 3. 스매시 팩터 (Smash Factor)
- **계산 방식**: (최적 스매시 팩터 - 현재 스매시 팩터) / 최적 스매시 팩터 * 100
- **기준**: 볼스피드 / 헤드스피드 (이상적: 1.5)
- **표시 조건**: 3% 이상 개선 가능할 때만 표시

### 4. 런치앵글 (Launch Angle)
- **계산 방식**: |최적 런치각 - 현재 런치각| / 최적 런치각 * 100
- **기준**: 헤드스피드별 최적 런치각
- **표시 조건**: 10% 이상 차이날 때만 표시

### 5. 스핀량 (Spin Rate)
- **계산 방식**: |최적 스핀 - 현재 스핀| / 최적 스핀 * 100
- **기준**: 헤드스피드별 최적 백스핀량
- **표시 조건**: 10% 이상 차이날 때만 표시

---

## 📡 API 엔드포인트

### 일반 사용자 API

#### 1. 설정 조회
**GET** `/api/ai-analysis/config`

시스템 설정값을 조회합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "club_types": {
      "driver": "드라이버",
      "7iron": "7아이언"
    },
    "club_numbers": {
      "0": "드라이버",
      "1": "3우드"
    },
    "genders": {
      "male": "남성",
      "female": "여성"
    },
    "age_groups": {
      "10s": "10대",
      "20s": "20대",
      "30s": "30대"
    },
    "shot_shapes": {
      "straight": "스트레이트",
      "slice": "슬라이스"
    },
    "swing_count": {
      "min": 3,
      "max": 20,
      "default": 10
    },
    "max_video_size": 100,
    "units": {
      "input": {
        "distance": "meters",
        "speed": "m/s",
        "height": "meters"
      },
      "storage": {
        "distance": "yards",
        "speed": "mph",
        "height": "feet"
      }
    }
  }
}
```

---

#### 2. 세션 시작
**POST** `/api/ai-analysis/sessions`

새로운 AI 분석 세션을 시작합니다.

**요청 본문:**
```json
{
  "user_id": "user123",              // 선택: 회원 UID (app_users.uid)
  "club": 1,                         // 선택: GTS 클럽 번호 (0-18)
  "club_type": "driver",              // 선택: 클럽 종류 (club 또는 club_type 필수)
  "gender": "male",                   // 필수: 성별 (male/female)
  "age_group": "30s",                 // 필수: 연령대 (10s/20s/30s/40s/50s/60s+)
  "handicap": 15.0,                   // 선택: 핸디캡 (0-54)
  "swing_count": 5,                   // 선택: 스윙 횟수 (기본값: 10, 최소: 3, 최대: 20)
  "shop_id": 1,                       // 선택: 매장 ID
  "pcid": "ACBDJFBSDKFBJS"            // 선택: PC ID (타석 식별자)
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "세션이 시작되었습니다.",
  "data": {
    "session_uuid": "82b0bd52-b592-47e6-9ac8-e1442ed5fbdc",
    "session": {
      "id": 15,
      "session_uuid": "82b0bd52-b592-47e6-9ac8-e1442ed5fbdc",
      "user_id": null,
      "club_type": "driver",
      "gender": "male",
      "age_group": "30s",
      "handicap": "15.00",
      "swing_count": 3,
      "completed_swings": 0,
      "status": "in_progress",
      "shop_id": 1,
      "pcid": "ACBDJFBSDKFBJS",
      "started_at": "2026-01-21T07:51:38.000000Z"
    }
  }
}
```

---

#### 3. 세션 목록 조회
**GET** `/api/ai-analysis/sessions`

세션 목록을 조회합니다. 다양한 필터를 지원합니다.

**쿼리 파라미터:**
- `user_id` (string): 회원 UID로 필터링
- `status` (string): 세션 상태로 필터링 (in_progress/completed/cancelled)
- `club` 또는 `club_type` (string): 클럽 종류로 필터링
- `selectedGender` 또는 `gender` (string): 성별로 필터링 (male/female)
- `selectedAge` 또는 `age_group` (string): 연령대로 필터링 (10s/20s/30s/40s/50s/60s+ 또는 "36-39" 형식)
- `selectedHandicap` 또는 `handicap` (string/number): 핸디캡으로 필터링 (단일 값 또는 "15-19.9" 형식)
- `shop_id` (integer): 매장 ID로 필터링
- `pcid` (string): PC ID로 필터링
- `page` (integer): 페이지 번호 (기본값: 1)
- `per_page` (integer): 페이지당 항목 수 (기본값: 20)

**요청 예시:**
```bash
GET /api/ai-analysis/sessions?selectedGender=male&selectedAge=36-39&selectedHandicap=15-19.9&club=driver&shop_id=1&pcid=ACBDJFBSDKFBJS&page=1&per_page=20
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 15,
        "session_uuid": "82b0bd52-b592-47e6-9ac8-e1442ed5fbdc",
        "user_id": null,
        "club_type": "driver",
        "gender": "male",
        "age_group": "30s",
        "handicap": "15.00",
        "swing_count": 3,
        "completed_swings": 0,
        "status": "in_progress",
        "shop_id": 1,
        "pcid": "ACBDJFBSDKFBJS",
        "started_at": "2026-01-21T07:51:38.000000Z",
        "created_at": "2026-01-21T07:51:38.000000Z"
      }
    ],
    "first_page_url": "http://api.playgts.com/api/ai-analysis/sessions?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://api.playgts.com/api/ai-analysis/sessions?page=1",
    "next_page_url": null,
    "path": "http://api.playgts.com/api/ai-analysis/sessions",
    "per_page": 20,
    "prev_page_url": null,
    "to": 15,
    "total": 15
  }
}
```

---

#### 4. 세션 조회 (분석 결과 포함)
**GET** `/api/ai-analysis/sessions/{sessionUuid}`

특정 세션의 상세 정보와 분석 결과를 조회합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 15,
      "session_uuid": "82b0bd52-b592-47e6-9ac8-e1442ed5fbdc",
      "user_id": null,
      "club_type": "driver",
      "gender": "male",
      "age_group": "30s",
      "handicap": "15.00",
      "swing_count": 5,
      "completed_swings": 5,
      "status": "completed",
      "shop_id": 1,
      "pcid": "ACBDJFBSDKFBJS",
      "started_at": "2026-01-21T07:51:38.000000Z",
      "completed_at": "2026-01-21T08:10:15.000000Z"
    },
    "analysis": {
      "distance": {
        "score": 72.5,
        "avg_carry": 220.0,
        "optimal_carry": 270.0,
        "optimization_rate": 81.5
      },
      "consistency": {
        "score": 85.3,
        "dispersion_radius": 12.5
      },
      "overall_score": 78.9
    },
    "improvements": {
      "main_message": "회원님은, 비거리 22.6% 개선이 가능해요, 슬라이스 구질 15.8% 개선이 가능해요 🎯",
      "improvements": {
        "distance": {
          "improvable": true,
          "current": 220.0,
          "optimal": 270.0,
          "difference": 50.0,
          "improvable_percentage": 22.6,
          "message": "비거리 22.6% 개선이 가능해요",
          "description": "현재 평균 220.0야드에서 최적 270.0야드까지 50.0야드 더 날릴 수 있어요."
        },
        "ball_flight": {
          "improvable": true,
          "current": "슬라이스",
          "side_spin": -850,
          "optimal_range": [-200, 200],
          "excess_spin": 650,
          "avg_curve": 18.5,
          "improvable_percentage": 15.8,
          "message": "슬라이스 구질 15.8% 개선이 가능해요",
          "description": "평균 18.5야드 휘어지는 슬라이스을 스트레이트로 개선할 수 있어요."
        }
      },
      "standards": {
        "club_speed": 100.5,
        "optimal_carry_distance": 270.0,
        "optimal_ball_speed": 150.0,
        "optimal_launch_angle": 12.5,
        "optimal_spin_rate": 2200
      }
    },
    "video_analysis": {
      "total_score": 85.5,
      "problem_items": [
        {
          "name": "백스윙",
          "score": 80.0
        }
      ]
    }
  }
}
```

---

#### 5. 스윙 데이터 저장
**POST** `/api/ai-analysis/sessions/{sessionUuid}/swings`

샷 데이터와 영상을 저장합니다. 한 번의 스윙마다 호출합니다.

**요청 형식:** `multipart/form-data`

**요청 파라미터:**
- `video` (file): 스윙 영상 파일 (선택, 최대 100MB)
- `shot_data` (object): 런치모니터 샷 데이터 (필수)
  - `club` (integer): 클럽 번호 (0-18)
  - `ballSpeed` (number): 볼 스피드 (m/s)
  - `clubSpeed` (number): 헤드 스피드 (m/s)
  - `launchAngle` (number): 런치 앵글 (도)
  - `sideSpin` (number): 사이드 스핀 (rpm)
  - `backSpin` (number): 백 스핀 (rpm)
  - `carry` (number): 캐리 거리 (미터)
  - `dist` (number): 총 거리 (미터)
  - `TargetDist` (number): 목표 거리 (미터)
  - `shot_shape` (string): 구질
- `shop_id` (integer): 매장 ID (선택)
- `pcid` (string): PC ID (선택)

**요청 예시:**
```bash
POST /api/ai-analysis/sessions/82b0bd52-b592-47e6-9ac8-e1442ed5fbdc/swings
Content-Type: multipart/form-data

{
  "video": (파일),
  "shot_data": {
    "club": 1,
    "ballSpeed": 67.0,
    "clubSpeed": 45.2,
    "launchAngle": 12.5,
    "sideSpin": -850,
    "backSpin": 2500,
    "carry": 220,
    "dist": 235,
    "TargetDist": 250,
    "shot_shape": "slice"
  },
  "shop_id": 1,
  "pcid": "ACBDJFBSDKFBJS"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "스윙 데이터가 저장되었습니다.",
  "data": {
    "swing": {
      "id": 1,
      "session_id": 15,
      "swing_number": 1,
      "video_path": "ai_analysis/videos/82b0bd52-b592-47e6-9ac8-e1442ed5fbdc/1/swing_1234567890.mp4",
      "status": "completed",
      "shotData": {
        "ball_speed": 67.0,
        "club_speed": 45.2,
        "launch_angle": 12.5
      }
    },
    "progress": {
      "completed": 1,
      "total": 5,
      "percentage": 20.0
    },
    "session_completed": false
  }
}
```

**참고:**
- 모든 스윙이 완료되면 세션이 자동으로 완료 상태로 변경되고 전체 분석이 수행됩니다.
- 첫 번째 스윙에 영상이 있으면 자동으로 영상 분석이 시작됩니다.

---

#### 6. 영상 분석 결과 저장
**POST** `/api/ai-analysis/sessions/{sessionUuid}/video-analysis`

GFEngine2D에서 분석한 영상 분석 결과를 저장합니다.

**요청 본문:**
```json
{
  "swing_number": 1,                  // 필수: 스윙 번호
  "result_code": 0,                   // 필수: 결과 코드 (0: 성공)
  "analysis_result": {                // 필수: 분석 결과
    "poseDirection": 1,
    "clubType": 1,
    "handedId": 1,
    "modelVersion": 1,
    "frameIndex": [10, 20, 30],
    "problems": [
      {
        "name": "백스윙",
        "score": 80.0
      }
    ],
    "swingPlane": {
      "swingTempo": 1.2
    },
    "shoulderStanceRatio": 1.0
  },
  "step_images_paths": ["path1.jpg", "path2.jpg"],
  "panorama_image_path": "panorama.jpg",
  "guidelines_data": {},
  "raw_result": {},
  "shop_id": 1,                       // 선택: 매장 ID
  "pcid": "ACBDJFBSDKFBJS"            // 선택: PC ID
}
```

**결과 코드:**
- `0`: 성공
- `1`: 취소됨
- `2`: 리소스 준비 안 됨
- `3`: 엔진 내부 오류
- `4`: 자세 찾기 실패
- `5`: 잘못된 스윙 방향
- `6`: 잘못된 손잡이 ID
- `7`: 알 수 없는 오류

**응답 예시:**
```json
{
  "success": true,
  "message": "영상 분석 결과가 저장되었습니다.",
  "data": {
    "video_analysis": {
      "id": 1,
      "swing_id": 1,
      "result_code": 0,
      "total_score": 85.5,
      "analysis_status": "completed",
      "analyzed_at": "2026-01-21T08:05:00.000000Z"
    }
  }
}
```

---

#### 7. 세션 취소
**POST** `/api/ai-analysis/sessions/{sessionUuid}/cancel`

진행 중인 세션을 취소합니다.

**응답 예시:**
```json
{
  "success": true,
  "message": "세션이 취소되었습니다."
}
```

---

#### 8. 세션 삭제
**DELETE** `/api/ai-analysis/sessions/{sessionUuid}`

세션과 관련된 모든 데이터(영상, 분석 결과 등)를 삭제합니다.

**응답 예시:**
```json
{
  "success": true,
  "message": "세션이 삭제되었습니다."
}
```

---

#### 9. 세션 재분석
**POST** `/api/ai-analysis/sessions/{sessionUuid}/reanalyze`

완료된 세션을 다시 분석합니다.

**응답 예시:**
```json
{
  "success": true,
  "message": "재분석이 완료되었습니다.",
  "data": {
    "analysis": {
      "distance": {
        "score": 72.5,
        "avg_carry": 220.0
      }
    }
  }
}
```

---

### 관리자 API

관리자 API는 인증이 필요합니다 (`auth:sanctum`, `admin` 미들웨어).

#### 10. 설정 조회
**GET** `/api/admin/ai-analysis/settings`

#### 11. 설정 업데이트
**PUT** `/api/admin/ai-analysis/settings/{key}`

#### 12. 클럽 스피드 기준표 조회
**GET** `/api/admin/ai-analysis/standards`

#### 13. 클럽 스피드 기준표 생성
**POST** `/api/admin/ai-analysis/standards`

#### 14. 클럽 스피드 기준표 업데이트
**PUT** `/api/admin/ai-analysis/standards/{id}`

#### 15. 클럽 스피드 기준표 삭제
**DELETE** `/api/admin/ai-analysis/standards/{id}`

#### 16. 통계 조회
**GET** `/api/admin/ai-analysis/statistics`

---

## 🗂️ 데이터베이스 구조

### ai_sessions 테이블

```sql
CREATE TABLE ai_sessions (
    id BIGINT PRIMARY KEY,
    session_uuid UUID UNIQUE,         -- 세션 고유 ID
    user_id VARCHAR(255) NULL,        -- 회원 UID (app_users.uid)
    shop_id BIGINT NULL,              -- 매장 ID
    pcid VARCHAR(255) NULL,           -- PC ID (타석 식별자)
    club_type VARCHAR(50),            -- 클럽 종류
    gender ENUM('male', 'female'),    -- 성별
    age_group VARCHAR(10),            -- 연령대
    handicap DECIMAL(5,2) NULL,        -- 핸디캡
    swing_count INTEGER,              -- 설정된 스윙 횟수
    completed_swings INTEGER DEFAULT 0, -- 완료된 스윙 횟수
    status ENUM('in_progress', 'completed', 'cancelled'), -- 세션 상태
    started_at TIMESTAMP NULL,        -- 시작 시간
    completed_at TIMESTAMP NULL,      -- 완료 시간
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_uuid (session_uuid),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_shop_id (shop_id),
    INDEX idx_pcid (pcid)
);
```

### club_speed_standards 테이블

```sql
CREATE TABLE club_speed_standards (
    id BIGINT PRIMARY KEY,
    club_type VARCHAR(50),              -- 'driver', '7iron', etc.
    club_speed_min DECIMAL(8,2),        -- 최소 헤드스피드 (mph)
    club_speed_max DECIMAL(8,2),        -- 최대 헤드스피드 (mph)
    optimal_ball_speed DECIMAL(8,2),    -- 최적 볼스피드 (mph)
    optimal_launch_angle DECIMAL(8,2),  -- 최적 런치각 (도)
    optimal_spin_rate DECIMAL(8,2),     -- 최적 스핀량 (rpm)
    optimal_carry_distance DECIMAL(8,2), -- 최적 캐리 거리 (야드)
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔄 작동 흐름

```
1. 사용자가 AI 세션 시작
   POST /api/ai-analysis/sessions
   (shop_id, pcid 포함)
   ↓
2. 각 스윙마다 샷 데이터 저장
   POST /api/ai-analysis/sessions/{sessionUuid}/swings
   (영상 파일 + 런치모니터 데이터, shop_id, pcid 포함)
   ↓
3. 영상 분석 결과 저장 (GFEngine2D)
   POST /api/ai-analysis/sessions/{sessionUuid}/video-analysis
   (shop_id, pcid 포함)
   ↓
4. 모든 스윙 완료 시 자동으로 전체 분석 수행
   - 비거리 분석
   - 구질 분석
   - 일관성 분석
   ↓
5. 세션 조회 API 호출 시
   GET /api/ai-analysis/sessions/{sessionUuid}
   - 분석 결과 반환
   - 개선 가능 수치 계산
   - 최적화 기준 데이터와 비교
   ↓
6. 프론트엔드에서 "비거리 22.6% 개선 가능" 메시지 표시
```

---

## 📝 사용 예시

### 전체 플로우 예시

#### 1. 세션 시작
```bash
POST /api/ai-analysis/sessions
Content-Type: application/json

{
  "selectedGender": "male",
  "selectedAge": "36-39",
  "selectedHandicap": "15-19.9",
  "club": "driver",
  "shop_id": 1,
  "pcid": "ACBDJFBSDKFBJS"
}
```

#### 2. 스윙 데이터 저장 (5번 반복)
```bash
POST /api/ai-analysis/sessions/{sessionUuid}/swings
Content-Type: multipart/form-data

{
  "video": (파일),
  "shot_data": {
    "club": 1,
    "ballSpeed": 67.0,
    "clubSpeed": 45.2,
    "launchAngle": 12.5,
    "sideSpin": -850,
    "backSpin": 2500,
    "carry": 220,
    "dist": 235
  },
  "shop_id": 1,
  "pcid": "ACBDJFBSDKFBJS"
}
```

#### 3. 영상 분석 결과 저장
```bash
POST /api/ai-analysis/sessions/{sessionUuid}/video-analysis
Content-Type: application/json

{
  "swing_number": 1,
  "result_code": 0,
  "analysis_result": {
    "problems": [
      {
        "name": "백스윙",
        "score": 80.0
      }
    ]
  },
  "shop_id": 1,
  "pcid": "ACBDJFBSDKFBJS"
}
```

#### 4. 결과 조회
```bash
GET /api/ai-analysis/sessions/{sessionUuid}
```

---

## 🎨 프론트엔드 표시 예시

```
┌─────────────────────────────────────┐
│  AI 스윙 분석 결과                    │
├─────────────────────────────────────┤
│                                     │
│  🎯 개선 가능 포인트                  │
│                                     │
│  회원님은,                           │
│  • 비거리 22.6% 개선이 가능해요      │
│  • 슬라이스 구질 15.8% 개선이 가능해요│
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  📊 현재 vs 최적                     │
│  비거리:  220야드 → 270야드         │
│  구질:    슬라이스 → 스트레이트       │
│  스매시팩터: 1.42 → 1.50             │
│                                     │
└─────────────────────────────────────┘
```

---

## ⚙️ 설정

### 마이그레이션 실행

```bash
php artisan migrate
```

### Seeder 실행 (기준 데이터 추가)

```bash
php artisan db:seed --class=ClubSpeedStandardSeeder
```

---

## 📈 향후 개선 사항

1. ✅ 개선 가능 % 계산 완료
2. ✅ 세션별 분석 자동화
3. ✅ shop_id, pcid 데이터베이스 저장
4. ✅ 세션 목록 필터링 (성별, 연령대, 핸디캡, 매장, 타석)
5. 🔜 AI 추천 연습 방법 제공
6. 🔜 과거 세션과 비교 분석
7. 🔜 프로 골퍼 데이터와 비교

---

## 🔗 관련 파일

- `app/Http/Controllers/Api/AiAnalysisController.php` - 일반 사용자 API 컨트롤러
- `app/Http/Controllers/Admin/AiAnalysisAdminController.php` - 관리자 API 컨트롤러
- `app/Services/AiAnalysisService.php` - 분석 로직
- `app/Services/AiSessionService.php` - 세션 관리 서비스
- `app/Models/AiSession.php` - 세션 모델
- `app/Models/ClubSpeedStandard.php` - 기준 데이터 모델
- `database/seeders/ClubSpeedStandardSeeder.php` - 샘플 데이터
- `routes/api_ai_analysis.php` - API 라우트 정의
