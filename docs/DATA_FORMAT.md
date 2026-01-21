# GFEngine2D 데이터 양식 가이드

## 📋 입력 데이터 양식

### 1. 초기화 파라미터

```javascript
// Initialize 함수 파라미터
{
  direction: 0,    // PoseDirection: 0=전면, 1=측면
  clubType: 0,     // ClubType: 0=드라이버, 1=아이언
  handedId: 0     // HandedId: 0=오른손, 1=왼손
}
```

### 2. VideoMetadata 파라미터

```javascript
// VideoMetadata 생성 파라미터
{
  fps: 30.0,           // float: 초당 프레임 수
  frameCount: 100,     // int: 총 프레임 수
  durationUs: 3330000 // ulong: 지속 시간 (마이크로초)
}

// 예시 계산:
// durationUs = duration_seconds * 1000000
// 예: 3.33초 = 3330000 마이크로초
```

### 3. SrcImagesInterface 구현 필요 데이터

```javascript
// SrcImagesInterface는 비디오 프레임을 제공하는 인터페이스
// 다음 메서드들을 구현해야 함:

class SrcImagesInterface {
  // 특정 프레임의 이미지 반환
  At(frameIndex: int): Image
  
  // 총 프레임 수
  Size(): int
  
  // 비어있는지 확인
  Empty(): bool
}

// 실제 구현 예시:
{
  frames: [
    Image,  // 프레임 0
    Image,  // 프레임 1
    Image,  // 프레임 2
    // ...
  ]
}
```

### 4. Image 데이터 양식

```javascript
// Image 생성 파라미터
{
  width: 1920,        // int: 이미지 너비
  height: 1080,       // int: 이미지 높이
  channelMode: 0,     // ChannelMode: 0=RGB, 1=BGR, 2=GrayScale
  buffer: Buffer      // 이미지 픽셀 데이터
}

// ChannelMode
const ChannelMode = {
  kRgb: 0,        // RGB 순서
  kBgr: 1,        // BGR 순서
  kGrayScale: 2   // 그레이스케일
};
```

---

## 📤 출력 데이터 양식

### 1. SwingAnalysisResult 구조

```javascript
{
  result_code: 0,  // ResultCode (0 = 성공)
  value: {          // SwingResultInterface
    // 기본 정보
    poseDirection: 0,
    clubType: 0,
    handedId: 0,
    modelVersion: 1,
    
    // 스윙 단계 프레임 인덱스
    frameIndex: {
      address: 10,
      takeAway: 25,
      backSwing: 40,
      top: 55,
      downSwing: 70,
      impact: 85,
      followThrough: 100,
      finish: 115
    },
    
    // 문제점들
    problems: [
      {
        type: 9,                    // SwingProblemType
        severity: 3,                // SwingProblemSeverity
        score: 0.75,                // float: 0.0 ~ 1.0
        evidenceStepId: 3           // StepId
      }
    ],
    
    // 스윙 플레인
    swingPlane: {
      swingTempo: 1.25,             // float: 초 단위
      handSwingPlanePoints: {       // Dictionary<int, SwingPlanePoint>
        [frameIndex]: SwingPlanePoint
      },
      clubSwingPlanePoints: {       // Dictionary<int, SwingPlanePoint>
        [frameIndex]: SwingPlanePoint
      }
    },
    
    // 기타
    shoulderStanceRatio: 0.85,     // float
    stepImages: {                   // 각 단계별 Image
      [stepId]: Image
    },
    panoramaImage: Image
  }
}
```

### 2. SwingProblemItem 구조

```javascript
{
  type: 9,              // SwingProblemType (int)
  severity: 3,           // SwingProblemSeverity (int)
  score: 0.75,           // float: 0.0 ~ 1.0
  evidenceStepId: 3     // StepId (int)
}
```

### 3. CompareResult 구조

```javascript
{
  result_code: 0,        // ResultCode (int)
  value: 0.85            // float: 유사도 (0.0 ~ 1.0)
}
```

### 4. SwingPlanePoint 구조

```javascript
// SwingPlanePoint는 프레임별 스윙 플레인 포인트 정보
// (실제 구조는 DLL 내부 구현에 따라 다를 수 있음)
{
  // 3D 좌표 또는 2D 투영 좌표 등
  // Point2d 배열 또는 3D 포인트 정보
}
```

---

## 🔢 숫자 범위 및 제약사항

### ResultCode
- 범위: `-1` ~ `7`
- 성공: `0` (kSuccess)

### PoseDirection
- 범위: `-1` ~ `1`
- 유효값: `0` (전면), `1` (측면)

### ClubType
- 범위: `-1` ~ `1`
- 유효값: `0` (드라이버), `1` (아이언)

### HandedId
- 범위: `-1` ~ `1`
- 유효값: `0` (오른손), `1` (왼손)

### StepId
- 범위: `-1` ~ `7`
- 유효값: `0` ~ `7` (각 스윙 단계)

### SwingProblemType
- 범위: `-1` ~ `73`
- `-1`: kInvalid (유효하지 않음)

### SwingProblemSeverity
- 범위: `-1` ~ `3`
- `-1`: kUnset (설정 안됨)
- `0`: kBest (최고)
- `1`: kNotBad (나쁘지 않음)
- `3`: kWrong (잘못됨)

### Score (문제점 점수)
- 범위: `0.0` ~ `1.0` (float)
- 높을수록 문제가 심각함

### FPS
- 범위: `0.0` ~ (float)
- 일반적: `24.0`, `30.0`, `60.0`

### Frame Count
- 범위: `0` ~ (int)
- 양수 값

### Duration (마이크로초)
- 범위: `0` ~ (ulong)
- 계산: `초 * 1000000`

---

## 📦 JSON 직렬화 예시

### 입력 데이터 (JSON)

```json
{
  "direction": 0,
  "clubType": 0,
  "handedId": 0,
  "videoMetadata": {
    "fps": 30.0,
    "frameCount": 100,
    "durationUs": 3330000
  }
}
```

### 출력 데이터 (JSON)

```json
{
  "result_code": 0,
  "value": {
    "poseDirection": 0,
    "clubType": 0,
    "handedId": 0,
    "modelVersion": 1,
    "frameIndex": {
      "address": 10,
      "takeAway": 25,
      "backSwing": 40,
      "top": 55,
      "downSwing": 70,
      "impact": 85,
      "followThrough": 100,
      "finish": 115
    },
    "problems": [
      {
        "type": 9,
        "severity": 3,
        "score": 0.75,
        "evidenceStepId": 3
      }
    ],
    "swingPlane": {
      "swingTempo": 1.25,
      "handSwingPlanePoints": {},
      "clubSwingPlanePoints": {}
    },
    "shoulderStanceRatio": 0.85
  }
}
```

---

## 🔄 데이터 변환 예시

### 초 단위 → 마이크로초

```javascript
function secondsToMicroseconds(seconds) {
  return Math.floor(seconds * 1000000);
}

// 예시
const durationUs = secondsToMicroseconds(3.33); // 3330000
```

### 마이크로초 → 초 단위

```javascript
function microsecondsToSeconds(us) {
  return us / 1000000;
}

// 예시
const seconds = microsecondsToSeconds(3330000); // 3.33
```

### 프레임 인덱스 → 시간 (초)

```javascript
function frameToTime(frameIndex, fps) {
  return frameIndex / fps;
}

// 예시
const time = frameToTime(85, 30.0); // 2.833초
```

### 시간 (초) → 프레임 인덱스

```javascript
function timeToFrame(time, fps) {
  return Math.floor(time * fps);
}

// 예시
const frame = timeToFrame(2.833, 30.0); // 85
```

---

## ⚠️ 데이터 검증

### 필수 검증 사항

```javascript
// 1. 초기화 파라미터 검증
function validateInitParams(direction, clubType, handedId) {
  if (direction !== 0 && direction !== 1) {
    throw new Error('Invalid PoseDirection');
  }
  if (clubType !== 0 && clubType !== 1) {
    throw new Error('Invalid ClubType');
  }
  if (handedId !== 0 && handedId !== 1) {
    throw new Error('Invalid HandedId');
  }
}

// 2. VideoMetadata 검증
function validateVideoMetadata(fps, frameCount, durationUs) {
  if (fps <= 0) {
    throw new Error('FPS must be positive');
  }
  if (frameCount <= 0) {
    throw new Error('Frame count must be positive');
  }
  if (durationUs <= 0) {
    throw new Error('Duration must be positive');
  }
}

// 3. ResultCode 검증
function validateResultCode(resultCode) {
  if (resultCode < -1 || resultCode > 7) {
    throw new Error('Invalid ResultCode');
  }
  return resultCode === 0; // 성공 여부
}
```

