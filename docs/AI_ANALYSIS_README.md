# AI 골프 샷 데이터 및 영상 분석 시스템

회원/비회원 모두 이용 가능한 AI 골프 스윙 분석 시스템입니다.

## 📋 주요 기능

### 1. 분석 플로우
1. **기본 정보 입력**: 클럽, 성별, 연령, 핸디캡 선택
2. **스윙 데이터 수집**: N회 스윙 (관리자 설정 가능)
3. **영상 분석**: 첫번째 스윙 영상을 스틸컷으로 추출 후 DLL 분석
4. **샷 데이터 분석**: 3가지 핵심 항목 분석
   - **비거리 분석**: 클럽 스피드 기준 최적화율 계산
   - **구질 분석**: 볼 궤적 패턴 분석
   - **일관성 분석**: 볼 착지점 분포도 분석 (가장 중요!)

### 2. 3대 분석 항목

#### 🎯 비거리 분석 (가중치 25%)
- 클럽 스피드에 따른 최적값 비교
- 볼 스피드, 스핀량, 런치앵글 최적화율 계산
- 0-100점 스코어링

#### 🌐 구질 분석 (가중치 25%)
- 센서에서 제공하는 구질 데이터 활용
- 드로우, 페이드, 슬라이스, 훅, 푸시 드로우 등
- 주 구질 및 분포 분석

#### ⭐ 일관성 분석 (가중치 50% - 가장 중요!)
- 볼 착지점 분포도 계산
- 표준편차 기반 일관성 점수
- 분포 면적 및 반경 시각화

## 🗄️ 데이터베이스 구조

### 테이블 목록
- `ai_settings` - 관리자 설정
- `club_speed_standards` - 클럽 스피드별 최적값 기준표
- `ai_sessions` - 분석 세션
- `ai_swings` - 각 스윙 데이터
- `ai_shot_data` - 런치모니터 샷 데이터
- `ai_analyses` - 분석 결과
- `ai_video_analyses` - 영상 분석 결과

## 🚀 설치 및 설정

### 1. 마이그레이션 실행

```bash
php artisan migrate
```

### 2. 환경 변수 설정 (.env)

```env
# AI 분석 DLL 경로 (Windows 전용)
AI_ANALYSIS_DLL_PATH=C:\path\to\your\analysis.dll

# 영상 분석 활성화 (true/false)
AI_ANALYSIS_VIDEO_ENABLED=true

# 기본 스윙 횟수
AI_ANALYSIS_DEFAULT_SWING_COUNT=10

# 최대 스윙 횟수
AI_ANALYSIS_MAX_SWING_COUNT=20

# 최소 스윙 횟수
AI_ANALYSIS_MIN_SWING_COUNT=3

# 영상 최대 크기 (MB)
AI_ANALYSIS_MAX_VIDEO_SIZE=100

# 스틸컷 FPS
AI_ANALYSIS_STILLCUT_FPS=30

# 세션 만료 시간 (시간)
AI_ANALYSIS_SESSION_EXPIRY=24
```

### 3. 스토리지 링크 생성

```bash
php artisan storage:link
```

### 4. 권한 설정

```bash
chmod -R 775 storage/app/ai_analysis
```

## 📡 API 엔드포인트

### 일반 사용자 API

#### 설정 조회
```http
GET /api/ai-analysis/config
```

#### 세션 시작
```http
POST /api/ai-analysis/sessions
Content-Type: application/json

{
  "user_id": 123,           // nullable (비회원은 null)
  "club_type": "driver",
  "gender": "male",
  "age_group": "30s",
  "handicap": 15.5,         // nullable
  "swing_count": 10         // nullable (기본값 사용)
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "세션이 시작되었습니다.",
  "data": {
    "session_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "session": { ... }
  }
}
```

#### 스윙 데이터 저장
```http
POST /api/ai-analysis/sessions/{sessionUuid}/swings
Content-Type: multipart/form-data

video: (file)             // 영상 파일 (optional)
shot_data[club_speed]: 95.5
shot_data[ball_speed]: 140.2
shot_data[launch_angle]: 12.5
shot_data[spin_rate]: 2400
shot_data[carry_distance]: 245
shot_data[carry_side]: -5
shot_data[total_distance]: 260
shot_data[total_side]: -8
shot_data[shot_shape]: "draw"
shot_data[side_spin]: -500
... (기타 런치모니터 데이터)
```

**응답 예시:**
```json
{
  "success": true,
  "message": "스윙 데이터가 저장되었습니다.",
  "data": {
    "swing": { ... },
    "progress": {
      "completed": 1,
      "total": 10,
      "percentage": 10.0
    },
    "session_completed": false
  }
}
```

#### 세션 조회 (분석 결과 포함)
```http
GET /api/ai-analysis/sessions/{sessionUuid}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "session": { ... },
    "analysis": {
      "distance": {
        "score": 85.5,
        "avg_carry": 242.3,
        "optimal_carry": 245.0,
        "optimization_rate": 89.2,
        "details": { ... }
      },
      "shot_shape": {
        "dominant": "draw",
        "distribution": {
          "draw": 7,
          "straight": 2,
          "fade": 1
        },
        "avg_side_spin": -450.5,
        "avg_curve": 8.2
      },
      "consistency": {
        "score": 92.3,
        "dispersion_area": 125.5,
        "dispersion_radius": 8.7,
        "std_dev_carry": 5.2,
        "std_dev_side": 3.8,
        "points": [
          {"x": -5, "y": 242},
          {"x": -3, "y": 245},
          ...
        ]
      },
      "overall_score": 88.9
    },
    "video_analysis": {
      "problem_items": [
        {
          "name": "스윙 플레인",
          "score": 75,
          "description": "백스윙 시 클럽이 약간 플랫합니다."
        }
      ],
      "total_score": 80,
      "swing_path_points": [ ... ]
    }
  }
}
```

#### 세션 목록 조회
```http
GET /api/ai-analysis/sessions?user_id=123&status=completed&club_type=driver&per_page=20
```

#### 세션 취소
```http
POST /api/ai-analysis/sessions/{sessionUuid}/cancel
```

#### 세션 삭제
```http
DELETE /api/ai-analysis/sessions/{sessionUuid}
```

#### 세션 재분석
```http
POST /api/ai-analysis/sessions/{sessionUuid}/reanalyze
```

### 관리자 API

모든 관리자 API는 `auth:sanctum` 및 `admin` 미들웨어 필요

#### 설정 조회
```http
GET /api/admin/ai-analysis/settings
```

#### 설정 업데이트
```http
PUT /api/admin/ai-analysis/settings/{key}
Content-Type: application/json

{
  "value": "10",
  "description": "기본 스윙 횟수",
  "type": "integer"
}
```

#### 클럽 스피드 기준표 조회
```http
GET /api/admin/ai-analysis/standards?club_type=driver
```

#### 클럽 스피드 기준 생성
```http
POST /api/admin/ai-analysis/standards
Content-Type: application/json

{
  "club_type": "driver",
  "club_speed_min": 100.0,
  "club_speed_max": 105.0,
  "optimal_ball_speed": 150.0,
  "optimal_launch_angle": 12.0,
  "optimal_spin_rate": 2200.0,
  "optimal_carry_distance": 260.0
}
```

#### 클럽 스피드 기준 업데이트
```http
PUT /api/admin/ai-analysis/standards/{id}
```

#### 클럽 스피드 기준 삭제
```http
DELETE /api/admin/ai-analysis/standards/{id}
```

#### 통계 조회
```http
GET /api/admin/ai-analysis/statistics?start_date=2026-01-01&end_date=2026-01-31
```

## 🔧 서비스 클래스

### AiSessionService
세션 및 스윙 데이터 관리

```php
use App\Services\AiSessionService;

$sessionService = app(AiSessionService::class);

// 세션 생성
$session = $sessionService->createSession([
    'club_type' => 'driver',
    'gender' => 'male',
    'age_group' => '30s',
    'handicap' => 15.5,
]);

// 스윙 저장
$swing = $sessionService->saveSwing($session, [
    'shot_data' => [...],
    'video_path' => '...',
]);

// 세션 조회
$session = $sessionService->getSessionWithAnalysis($sessionUuid);

// 세션 삭제
$sessionService->deleteSession($session);
```

### AiAnalysisService
분석 로직 수행

```php
use App\Services\AiAnalysisService;

$analysisService = app(AiAnalysisService::class);

// 세션 분석 수행
$analysis = $analysisService->analyzeSession($session);
```

### VideoAnalysisService
영상 분석 및 DLL 연동

```php
use App\Services\VideoAnalysisService;

$videoService = app(VideoAnalysisService::class);

// 영상 분석
$videoAnalysis = $videoService->analyzeVideo($swing);

// 스틸컷 정리
$videoService->cleanupStillcuts($sessionId);
```

## 📊 분석 알고리즘

### 비거리 최적화율 계산
```
최적화율 = (실제값 / 최적값) × 100

- 최적값과 일치: 100점
- 최적값 초과: 초과한 만큼 감점
- 최적값 미달: 미달한 만큼 감점
```

### 일관성 점수 계산
```
표준편차 합 = 캐리 표준편차 + 사이드 표준편차
일관성 점수 = max(0, min(100, 100 - (표준편차 합 × 2)))

- 표준편차 합 10 이하: 80점 이상
- 표준편차 합 50 이상: 0점
```

### 종합 점수 계산
```
종합 점수 = (비거리 점수 × 0.25) + (일관성 점수 × 0.50) + (구질 일관성 × 0.25)
```

## 🎯 DLL 연동

### DLL 인터페이스
Windows 환경에서 COM 객체를 통한 DLL 호출

```php
// VideoAnalysisService.php 내부

private function callWindowsDll(string $stillcutsPath): array
{
    // DLL 호출 예시 (실제 인터페이스에 맞게 수정 필요)
    $com = new \COM("YourDLL.ClassName");
    $result = $com->AnalyzeSwing($stillcutsPath);
    return json_decode($result, true);
}
```

### DLL 반환 형식
```json
{
  "problem_items": [
    {
      "name": "스윙 플레인",
      "score": 75,
      "description": "백스윙 시 클럽이 약간 플랫합니다."
    }
  ],
  "total_score": 80,
  "swing_path_points": [
    {"x": 100, "y": 200, "frame": 1},
    {"x": 105, "y": 180, "frame": 5}
  ]
}
```

## 📝 모델 관계도

```
AiSession (1) ──< (N) AiSwing
    │                  │
    │                  ├──< (1) AiShotData
    │                  └──< (1) AiVideoAnalysis (첫번째 스윙만)
    │
    └──< (1) AiAnalysis
```

## 🔒 보안 고려사항

1. **비회원 세션**: `user_id`가 null인 경우 세션 UUID로만 접근 가능
2. **파일 업로드**: 최대 크기 및 확장자 검증
3. **관리자 API**: `auth:sanctum` + `admin` 미들웨어 필수
4. **세션 만료**: 24시간 후 자동 만료 (설정 가능)

## 🧪 테스트

### 더미 데이터로 테스트

영상 분석 DLL이 없는 경우 자동으로 더미 데이터 반환

```php
// .env
AI_ANALYSIS_VIDEO_ENABLED=true
AI_ANALYSIS_DLL_PATH=  # 빈 값으로 두면 더미 데이터 사용
```

## 📦 파일 구조

```
app/
├── Models/
│   ├── AiSetting.php
│   ├── ClubSpeedStandard.php
│   ├── AiSession.php
│   ├── AiSwing.php
│   ├── AiShotData.php
│   ├── AiAnalysis.php
│   └── AiVideoAnalysis.php
├── Services/
│   ├── AiSessionService.php
│   ├── AiAnalysisService.php
│   └── VideoAnalysisService.php
└── Http/Controllers/
    ├── Api/
    │   └── AiAnalysisController.php
    └── Admin/
        └── AiAnalysisAdminController.php

config/
└── ai_analysis.php

routes/
├── api.php
└── api_ai_analysis.php

database/migrations/
├── 2026_01_13_000001_create_ai_settings_table.php
├── 2026_01_13_000002_create_club_speed_standards_table.php
├── 2026_01_13_000003_create_ai_sessions_table.php
├── 2026_01_13_000004_create_ai_swings_table.php
├── 2026_01_13_000005_create_ai_shot_data_table.php
├── 2026_01_13_000006_create_ai_analyses_table.php
└── 2026_01_13_000007_create_ai_video_analyses_table.php

storage/app/
├── ai_analysis/
│   ├── videos/
│   ├── raw_data/
│   └── stillcuts/
```

## 🐛 트러블슈팅

### 영상 분석 실패
- FFmpeg 설치 확인: `ffmpeg -version`
- DLL 경로 확인
- 로그 확인: `storage/logs/laravel.log`

### 스틸컷 추출 실패
- 영상 파일 형식 확인 (mp4, avi, mov, wmv)
- 저장소 권한 확인
- FFmpeg 설치 확인

### 분석 결과 없음
- 스윙 횟수 확인 (최소 3회 이상)
- 샷 데이터 완전성 확인
- 세션 완료 상태 확인

## 📞 문의

추가 개발이나 커스터마이징이 필요한 경우 개발팀에 문의하세요.

---

**Version**: 1.0.0  
**Date**: 2026-01-13  
**Laravel**: 10.x+

