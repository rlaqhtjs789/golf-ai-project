# GFEngine2D API 레퍼런스

## 📚 DLL 함수명 목록

### 1. 엔진 관리 함수

#### 버전 정보
```javascript
// 함수명: CSharp_Gfe_GFEngine2D_Version
// 반환값: string (버전 문자열)
// 파라미터: 없음
const version = libGFEngine2D.CSharp_Gfe_GFEngine2D_Version();
```

#### 객체 생성/삭제
```javascript
// 생성
// 함수명: CSharp_Gfe_new_GFEngine2D
// 반환값: pointer (GFEngine2D 핸들)
// 파라미터: 없음
const handle = libGFEngine2D.CSharp_Gfe_new_GFEngine2D();

// 삭제
// 함수명: CSharp_Gfe_delete_GFEngine2D
// 반환값: void
// 파라미터: pointer (핸들)
libGFEngine2D.CSharp_Gfe_delete_GFEngine2D(handle);
```

#### 초기화
```javascript
// 초기화 (방향, 클럽, 손잡이)
// 함수명: CSharp_Gfe_GFEngine2D_Initialize__SWIG_0
// 반환값: int (ResultCode)
// 파라미터: 
//   - pointer (핸들)
//   - int (PoseDirection: 0=전면, 1=측면)
//   - int (ClubType: 0=드라이버, 1=아이언)
//   - int (HandedId: 0=오른손, 1=왼손)
const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0(
  handle, 
  0,  // PoseDirection.kFront
  0,  // ClubType.kDriver
  0   // HandedId.kRightHanded
);

// 초기화 (방향, 클럽만 - 손잡이 자동 감지)
// 함수명: CSharp_Gfe_GFEngine2D_Initialize__SWIG_1
// 반환값: int (ResultCode)
// 파라미터:
//   - pointer (핸들)
//   - int (PoseDirection)
//   - int (ClubType)
const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_Initialize__SWIG_1(
  handle,
  0,  // PoseDirection.kFront
  0   // ClubType.kDriver
);

// 설정 방향 변경
// 함수명: CSharp_Gfe_GFEngine2D_SetConfigDirection
// 반환값: int (ResultCode)
// 파라미터:
//   - pointer (핸들)
//   - int (PoseDirection)
const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_SetConfigDirection(
  handle,
  0  // PoseDirection.kFront
);
```

#### 상태 확인
```javascript
// 준비 상태 확인
// 함수명: CSharp_Gfe_GFEngine2D_IsReady
// 반환값: bool
// 파라미터: pointer (핸들)
const isReady = libGFEngine2D.CSharp_Gfe_GFEngine2D_IsReady(handle);

// 초기화
// 함수명: CSharp_Gfe_GFEngine2D_Clear
// 반환값: bool
// 파라미터: pointer (핸들)
const cleared = libGFEngine2D.CSharp_Gfe_GFEngine2D_Clear(handle);
```

---

### 2. 비디오 메타데이터 함수

```javascript
// VideoMetadata 생성 (빈 객체)
// 함수명: CSharp_Gfe_new_VideoMetadata__SWIG_0
// 반환값: pointer
// 파라미터: 없음
const metadataHandle = libGFEngine2D.CSharp_Gfe_new_VideoMetadata__SWIG_0();

// VideoMetadata 생성 (값 지정)
// 함수명: CSharp_Gfe_new_VideoMetadata__SWIG_1
// 반환값: pointer
// 파라미터:
//   - float (fps: 초당 프레임 수)
//   - int (frame_count: 총 프레임 수)
//   - ulong (duration_us: 지속 시간 마이크로초)
const metadataHandle = libGFEngine2D.CSharp_Gfe_new_VideoMetadata__SWIG_1(
  30.0,    // fps
  100,     // frame_count
  3330000  // duration_us (3.33초)
);

// FPS 가져오기
// 함수명: CSharp_Gfe_VideoMetadata_fps
// 반환값: float
// 파라미터: pointer (metadata 핸들)
const fps = libGFEngine2D.CSharp_Gfe_VideoMetadata_fps(metadataHandle);

// 프레임 수 가져오기
// 함수명: CSharp_Gfe_VideoMetadata_frame_count
// 반환값: int
// 파라미터: pointer (metadata 핸들)
const frameCount = libGFEngine2D.CSharp_Gfe_VideoMetadata_frame_count(metadataHandle);

// 지속 시간 가져오기
// 함수명: CSharp_Gfe_VideoMetadata_duration_us
// 반환값: ulong
// 파라미터: pointer (metadata 핸들)
const duration = libGFEngine2D.CSharp_Gfe_VideoMetadata_duration_us(metadataHandle);

// 초기화 여부 확인
// 함수명: CSharp_Gfe_VideoMetadata_Initialized
// 반환값: bool
// 파라미터: pointer (metadata 핸들)
const initialized = libGFEngine2D.CSharp_Gfe_VideoMetadata_Initialized(metadataHandle);

// 리셋
// 함수명: CSharp_Gfe_VideoMetadata_Reset
// 반환값: void
// 파라미터: pointer (metadata 핸들)
libGFEngine2D.CSharp_Gfe_VideoMetadata_Reset(metadataHandle);

// VideoMetadata 삭제
// 함수명: CSharp_Gfe_delete_VideoMetadata
// 반환값: void
// 파라미터: pointer (metadata 핸들)
libGFEngine2D.CSharp_Gfe_delete_VideoMetadata(metadataHandle);

// 비디오 메타데이터 설정
// 함수명: CSharp_Gfe_GFEngine2D_SetVideoMetadata
// 반환값: void
// 파라미터:
//   - pointer (GFEngine2D 핸들)
//   - pointer (VideoMetadata 핸들)
libGFEngine2D.CSharp_Gfe_GFEngine2D_SetVideoMetadata(handle, metadataHandle);
```

---

### 3. 스윙 분석 함수

```javascript
// 스윙 비디오 분석 (임팩트 프레임 자동 감지)
// 함수명: CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0
// 반환값: pointer (SwingAnalysisResult 핸들)
// 파라미터:
//   - pointer (GFEngine2D 핸들)
//   - pointer (SrcImagesInterface 핸들)
//   - pointer (GFEngineResultInterface 핸들 - 콜백)
const resultHandle = libGFEngine2D.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0(
  handle,
  srcImagesHandle,
  callbackHandle
);

// 스윙 비디오 분석 (임팩트 프레임 지정)
// 함수명: CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_1
// 반환값: pointer (SwingAnalysisResult 핸들)
// 파라미터:
//   - pointer (GFEngine2D 핸들)
//   - pointer (SrcImagesInterface 핸들)
//   - int (impact_frame_index: 임팩트 프레임 인덱스)
//   - pointer (GFEngineResultInterface 핸들 - 콜백)
const resultHandle = libGFEngine2D.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_1(
  handle,
  srcImagesHandle,
  85,  // impact_frame_index
  callbackHandle
);
```

---

### 4. 비교 함수

```javascript
// 스윙 비교
// 함수명: CSharp_Gfe_GFEngine2D_SwingCompare
// 반환값: pointer (CompareResult 핸들)
// 파라미터:
//   - pointer (GFEngine2D 핸들)
//   - pointer (SwingResultInterface 핸들 - 스윙 A)
//   - pointer (SwingResultInterface 핸들 - 스윙 B)
const compareHandle = libGFEngine2D.CSharp_Gfe_GFEngine2D_SwingCompare(
  handle,
  swingAHandle,
  swingBHandle
);

// 이미지 비교
// 함수명: CSharp_Gfe_GFEngine2D_ImageCompare
// 반환값: pointer (CompareResult 핸들)
// 파라미터:
//   - pointer (GFEngine2D 핸들)
//   - pointer (Image 핸들 - 소스)
//   - pointer (Image 핸들 - 참조)
const compareHandle = libGFEngine2D.CSharp_Gfe_GFEngine2D_ImageCompare(
  handle,
  sourceImageHandle,
  referenceImageHandle
);

// CompareResult에서 결과 코드 가져오기
// 함수명: CSharp_Gfe_CompareResult_result_code_get
// 반환값: int (ResultCode)
// 파라미터: pointer (CompareResult 핸들)
const resultCode = libGFEngine2D.CSharp_Gfe_CompareResult_result_code_get(compareHandle);

// CompareResult에서 값 가져오기 (유사도)
// 함수명: CSharp_Gfe_CompareResult_value_get
// 반환값: float (0.0 ~ 1.0)
// 파라미터: pointer (CompareResult 핸들)
const similarity = libGFEngine2D.CSharp_Gfe_CompareResult_value_get(compareHandle);
```

---

## 📊 Enum 값 정의

### PoseDirection (촬영 방향)
```javascript
const PoseDirection = {
  kNone: -1,
  kFront: 0,  // 전면
  kSide: 1    // 측면
};
```

### ClubType (클럽 타입)
```javascript
const ClubType = {
  kNone: -1,
  kDriver: 0,  // 드라이버
  kIron: 1     // 아이언
};
```

### HandedId (손잡이)
```javascript
const HandedId = {
  kNone: -1,
  kRightHanded: 0,  // 오른손
  kLeftHanded: 1    // 왼손
};
```

### ResultCode (결과 코드)
```javascript
const ResultCode = {
  kSuccess: 0,                        // 성공
  kCanceled: 1,                       // 취소됨
  kFailedResourceNotReady: 2,         // 리소스 준비 안됨
  kFailedEngineInternalError: 3,      // 엔진 내부 오류
  kFailedFindPosture: 4,              // 자세 찾기 실패
  kFailedWrongSwingDirection: 5,      // 잘못된 스윙 방향
  kFailedWrongHandedId: 6,            // 잘못된 손잡이
  kUnknown: 7                         // 알 수 없는 오류
};
```

### StepId (스윙 단계)
```javascript
const StepId = {
  kNone: -1,
  kAddress: 0,        // 어드레스
  kTakeAway: 1,       // 테이크어웨이
  kBackSwing: 2,      // 백스윙
  kTop: 3,            // 탑
  kDownSwing: 4,      // 다운스윙
  kImpact: 5,         // 임팩트
  kFollowThrough: 6,  // 팔로우스루
  kFinish: 7          // 피니시
};
```

### SwingProblemType (문제 유형)
```javascript
const SwingProblemType = {
  kInvalid: -1,
  kAllImpactHeadUp: 0,
  kFrontFollowChickenWing: 3,
  kAllFinishBalance: 6,
  kFrontAddressSpine: 7,
  kFrontTakeawayEarlyCocking: 8,
  kFrontTopSway: 9,
  kAllTopShoulderRotation: 10,
  kFrontTopReverseSpine: 11,
  kAllTopOverSwing: 12,
  kFrontTopLeftArmCurve: 13,
  kAllTopNotCocking: 14,
  kFrontImpactSlide: 15,
  kFrontImpactUnderHipMove: 16,
  kFrontImpactNotHipMove: 17,
  kFrontDownswingCasting: 18,
  kFrontFollowForwardLunge: 22,
  kFrontAddressStance: 27,
  kFrontTopUpperBodyUp: 29,
  kFrontTopLeftLeg: 30,
  kSideAddressPostureUp: 50,
  kSideTopCrossOver: 55,
  kSideTopSpineCollapse: 56,
  kSideTopFlyingElbow: 57,
  kSideTopLegCollapse: 58,
  kSideDownswingFaultSlot: 59,
  kSideImpactEarlyExtension: 60,
  kSideTopLaidOff: 62,
  kSideTakeawayClubInside: 63,
  kSideAddressPostureDown: 65,
  kSideTakeawayClubOutside: 66,
  kSideFollowLeftArmPull: 67,
  kSideImpactNotHipTurn: 68,
  kSideBackswingHeadAhead: 69,
  kSideAddressPostureSitDown: 73
};
```

### SwingProblemSeverity (문제 심각도)
```javascript
const SwingProblemSeverity = {
  kUnset: -1,
  kBest: 0,      // 최고
  kNotBad: 1,    // 나쁘지 않음
  kWrong: 3      // 잘못됨
};
```

---

## 📝 데이터 타입

### ffi-napi 타입 매핑

```javascript
// C# 타입 -> ffi-napi 타입
'int'      -> 'int'
'float'    -> 'float'
'bool'     -> 'bool'
'string'   -> 'string'
'ulong'    -> 'ulong' 또는 'uint64'
'pointer'  -> 'pointer'
'void'     -> 'void'
```

---

## 🔄 사용 흐름 예시

### 1. 기본 사용 흐름

```javascript
// 1. 엔진 생성
const handle = libGFEngine2D.CSharp_Gfe_new_GFEngine2D();

// 2. 초기화
const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0(
  handle,
  0,  // PoseDirection.kFront
  0,  // ClubType.kDriver
  0   // HandedId.kRightHanded
);

// 3. 준비 상태 확인
if (libGFEngine2D.CSharp_Gfe_GFEngine2D_IsReady(handle)) {
  // 4. 비디오 메타데이터 설정
  const metadataHandle = libGFEngine2D.CSharp_Gfe_new_VideoMetadata__SWIG_1(
    30.0, 100, 3330000
  );
  libGFEngine2D.CSharp_Gfe_GFEngine2D_SetVideoMetadata(handle, metadataHandle);
  
  // 5. 분석 실행
  // (SrcImagesInterface와 GFEngineResultInterface 구현 필요)
  
  // 6. 정리
  libGFEngine2D.CSharp_Gfe_delete_VideoMetadata(metadataHandle);
}

// 7. 엔진 삭제
libGFEngine2D.CSharp_Gfe_delete_GFEngine2D(handle);
```

---

## ⚠️ 주의사항

1. **메모리 관리**: 모든 생성된 핸들은 사용 후 반드시 삭제해야 합니다.
2. **포인터 검증**: 핸들을 사용하기 전에 `isNull()` 체크가 필요합니다.
3. **에러 처리**: ResultCode를 확인하여 오류를 처리해야 합니다.
4. **스레드 안전성**: DLL 호출은 스레드 안전하지 않을 수 있으므로 주의가 필요합니다.

---

## 📌 추가 함수들

더 많은 함수들이 필요하면 `include/GFEngine2D/libGFEngine2DPINVOKE.cs` 파일을 참고하세요.

주요 추가 함수 카테고리:
- Image 관련 함수
- SwingResultInterface 관련 함수
- SwingProblem 관련 함수
- SwingPlane 관련 함수
- Guideline 관련 함수
- Point2d, Size, Color 등 유틸리티 함수

