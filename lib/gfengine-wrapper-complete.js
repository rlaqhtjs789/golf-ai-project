/**
 * GFEngine2D 완전한 JavaScript 래퍼
 * 
 * C# 바인딩 기반으로 모든 함수를 ffi-napi로 매핑
 */

const ffi = require('ffi-napi');
const ref = require('ref-napi');
const path = require('path');

// 기본 타입 정의
const intPtr = ref.refType(ref.types.void);
const intPtrPtr = ref.refType(intPtr);
const stringPtr = ref.refType(ref.types.CString);

// DLL 경로
const dllPath = path.join(__dirname, '../bin/libGFEngine2D.dll');

// 모든 함수 정의
const libGFEngine2D = ffi.Library(dllPath, {
  // ========================================
  // 1. 엔진 관리 (최우선)
  // ========================================
  'CSharp_Gfe_GFEngine2D_Version': ['string', []],
  'CSharp_Gfe_new_GFEngine2D': [intPtr, []],
  'CSharp_Gfe_delete_GFEngine2D': ['void', [intPtr]],
  'CSharp_Gfe_GFEngine2D_Initialize__SWIG_0': ['int', [intPtr, 'int', 'int', 'int']],
  'CSharp_Gfe_GFEngine2D_IsReady': ['bool', [intPtr]],
  'CSharp_Gfe_GFEngine2D_Clear': ['bool', [intPtr]],

  // ========================================
  // 2. VideoMetadata (비디오 메타데이터)
  // ========================================
  'CSharp_Gfe_new_VideoMetadata__SWIG_0': [intPtr, []],
  'CSharp_Gfe_new_VideoMetadata__SWIG_1': [intPtr, ['int', 'int', 'double', 'int']],
  'CSharp_Gfe_delete_VideoMetadata': ['void', [intPtr]],
  'CSharp_Gfe_VideoMetadata_video_width_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_VideoMetadata_video_width_get': ['int', [intPtr]],
  'CSharp_Gfe_VideoMetadata_video_height_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_VideoMetadata_video_height_get': ['int', [intPtr]],
  'CSharp_Gfe_VideoMetadata_fps_set': ['void', [intPtr, 'double']],
  'CSharp_Gfe_VideoMetadata_fps_get': ['double', [intPtr]],
  'CSharp_Gfe_VideoMetadata_frame_count_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_VideoMetadata_frame_count_get': ['int', [intPtr]],
  'CSharp_Gfe_GFEngine2D_SetVideoMetadata': ['void', [intPtr, intPtr]],

  // ========================================
  // 3. 분석 실행 (최우선)
  // ========================================
  'CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0': [intPtr, [intPtr, intPtr]],
  'CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_1': [intPtr, [intPtr, intPtr, intPtr]],

  // ========================================
  // 4. SrcImagesInterface (영상 입력)
  // ========================================
  'CSharp_Gfe_new_SrcImagesInterface': [intPtr, []],
  'CSharp_Gfe_delete_SrcImagesInterface': ['void', [intPtr]],
  'CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_0': ['void', [intPtr, intPtr]],
  'CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_1': ['void', [intPtr, intPtr, 'int']],
  'CSharp_Gfe_SrcImagesInterface_GetImage': [intPtr, [intPtr, 'int']],
  'CSharp_Gfe_SrcImagesInterface_GetImageCount': ['int', [intPtr]],
  'CSharp_Gfe_SrcImagesInterface_Clear': ['void', [intPtr]],

  // ========================================
  // 5. Image (이미지 데이터)
  // ========================================
  'CSharp_Gfe_new_Image__SWIG_0': [intPtr, []],
  'CSharp_Gfe_new_Image__SWIG_1': [intPtr, [intPtr, 'int', 'int', 'int']],
  'CSharp_Gfe_delete_Image': ['void', [intPtr]],
  'CSharp_Gfe_Image_IsEmpty': ['bool', [intPtr]],
  'CSharp_Gfe_Image_GetWidth': ['int', [intPtr]],
  'CSharp_Gfe_Image_GetHeight': ['int', [intPtr]],
  'CSharp_Gfe_Image_GetChannels': ['int', [intPtr]],
  'CSharp_Gfe_Image_GetData': [intPtr, [intPtr]],
  'CSharp_Gfe_Image_GetDataSize': ['int', [intPtr]],

  // ========================================
  // 6. SwingAnalysisResult (분석 결과)
  // ========================================
  'CSharp_Gfe_new_SwingAnalysisResult__SWIG_0': [intPtr, []],
  'CSharp_Gfe_new_SwingAnalysisResult__SWIG_1': [intPtr, ['int', intPtr]],
  'CSharp_Gfe_delete_SwingAnalysisResult': ['void', [intPtr]],
  'CSharp_Gfe_SwingAnalysisResult_result_code_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_SwingAnalysisResult_result_code_get': ['int', [intPtr]],
  'CSharp_Gfe_SwingAnalysisResult_value_set': ['void', [intPtr, intPtr]],
  'CSharp_Gfe_SwingAnalysisResult_value_get': [intPtr, [intPtr]],

  // ========================================
  // 7. SwingResultInterface (결과 데이터)
  // ========================================
  'CSharp_Gfe_SwingResultInterface_GetPoseDirection': ['int', [intPtr]],
  'CSharp_Gfe_SwingResultInterface_GetPoseClubType': ['int', [intPtr]],
  'CSharp_Gfe_SwingResultInterface_GetHandedId': ['int', [intPtr]],
  'CSharp_Gfe_SwingResultInterface_ModelVersion': ['int', [intPtr]],
  'CSharp_Gfe_SwingResultInterface_GetFrameIndex': ['int', [intPtr, 'int']],
  'CSharp_Gfe_SwingResultInterface_GetSwingProblem': [intPtr, [intPtr]],
  'CSharp_Gfe_SwingResultInterface_GetSwingPlane': [intPtr, [intPtr, 'int', 'double']],
  'CSharp_Gfe_SwingResultInterface_GetStepImage': [intPtr, [intPtr, 'int']],
  'CSharp_Gfe_SwingResultInterface_GetPanoramaImage': [intPtr, [intPtr]],
  'CSharp_Gfe_SwingResultInterface_GetGuideline': [intPtr, [intPtr, 'int', 'int']],
  'CSharp_Gfe_SwingResultInterface_GetShoulderStanceRatio': ['double', [intPtr]],

  // ========================================
  // 8. SwingProblem (문제점 분석)
  // ========================================
  'CSharp_Gfe_new_SwingProblem': [intPtr, []],
  'CSharp_Gfe_delete_SwingProblem': ['void', [intPtr]],
  'CSharp_Gfe_SwingProblem_GetAllProblems': [intPtr, [intPtr]],
  'CSharp_Gfe_SwingProblem_GetProblems': [intPtr, [intPtr, 'int']],
  'CSharp_Gfe_SwingProblem_GetStepProblems': [intPtr, [intPtr, 'int']],

  // ========================================
  // 9. SwingProblemItems (문제점 목록)
  // ========================================
  'CSharp_Gfe_SwingProblemItems_size': ['int', [intPtr]],
  'CSharp_Gfe_SwingProblemItems_getitem': [intPtr, [intPtr, 'int']],
  'CSharp_Gfe_delete_SwingProblemItems': ['void', [intPtr]],

  // ========================================
  // 10. SwingProblemItem (개별 문제점)
  // ========================================
  'CSharp_Gfe_SwingProblemItem_type_get': ['int', [intPtr]],
  'CSharp_Gfe_SwingProblemItem_severity_get': ['int', [intPtr]],
  'CSharp_Gfe_SwingProblemItem_score_get': ['double', [intPtr]],
  'CSharp_Gfe_SwingProblemItem_evidenceStepId_get': ['int', [intPtr]],

  // ========================================
  // 11. SwingPlane (스윙 플레인)
  // ========================================
  'CSharp_Gfe_new_SwingPlane': [intPtr, []],
  'CSharp_Gfe_delete_SwingPlane': ['void', [intPtr]],
  'CSharp_Gfe_SwingPlane_GetSwingTempo': ['double', [intPtr]],
  'CSharp_Gfe_SwingPlane_GetHandSwingPlanePoint': [intPtr, [intPtr, 'int']],
  'CSharp_Gfe_SwingPlane_GetClubSwingPlanePoint': [intPtr, [intPtr, 'int']],

  // ========================================
  // 12. FrameIndex (프레임 인덱스)
  // ========================================
  'CSharp_Gfe_new_FrameIndex__SWIG_0': [intPtr, []],
  'CSharp_Gfe_delete_FrameIndex': ['void', [intPtr]],
  'CSharp_Gfe_FrameIndex_address_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_address_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_takeAway_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_takeAway_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_backSwing_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_backSwing_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_top_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_top_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_downSwing_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_downSwing_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_impact_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_impact_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_followThrough_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_followThrough_get': ['int', [intPtr]],
  'CSharp_Gfe_FrameIndex_finish_set': ['void', [intPtr, 'int']],
  'CSharp_Gfe_FrameIndex_finish_get': ['int', [intPtr]],
});

// ========================================
// Enum 정의
// ========================================

const PoseDirection = {
  kFront: 0,
  kSide: 1,
};

const ClubType = {
  kDriver: 0,
  kIron: 1,
};

const HandedId = {
  kRightHanded: 0,
  kLeftHanded: 1,
};

const ResultCode = {
  kSuccess: 0,
  kCanceled: 1,
  kFailedResourceNotReady: 2,
  kFailedEngineInternalError: 3,
  kFailedFindPosture: 4,
  kFailedWrongSwingDirection: 5,
  kFailedWrongHandedId: 6,
  kUnknown: 7,
};

const StepId = {
  kAddress: 0,
  kTakeAway: 1,
  kBackSwing: 2,
  kTop: 3,
  kDownSwing: 4,
  kImpact: 5,
  kFollowThrough: 6,
  kFinish: 7,
};

const SwingProblemSeverity = {
  kUnset: -1,
  kBest: 0,
  kNotBad: 1,
  kWrong: 3,
};

// ========================================
// 클래스 래퍼
// ========================================

/**
 * GFEngine2D 메인 엔진 클래스
 */
class GFEngine2D {
  constructor() {
    this.handle = libGFEngine2D.CSharp_Gfe_new_GFEngine2D();
    if (this.handle.isNull()) {
      throw new Error('Failed to create GFEngine2D instance');
    }
  }

  /**
   * 버전 정보 (static)
   */
  static getVersion() {
    return libGFEngine2D.CSharp_Gfe_GFEngine2D_Version();
  }

  /**
   * 엔진 초기화
   */
  initialize(direction, clubType, handedId) {
    const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0(
      this.handle,
      direction,
      clubType,
      handedId
    );
    return result;
  }

  /**
   * 준비 상태 확인
   */
  isReady() {
    return libGFEngine2D.CSharp_Gfe_GFEngine2D_IsReady(this.handle);
  }

  /**
   * Clear
   */
  clear() {
    return libGFEngine2D.CSharp_Gfe_GFEngine2D_Clear(this.handle);
  }

  /**
   * 비디오 메타데이터 설정
   */
  setVideoMetadata(metadata) {
    libGFEngine2D.CSharp_Gfe_GFEngine2D_SetVideoMetadata(this.handle, metadata.handle);
  }

  /**
   * 스윙 비디오 분석
   */
  analyzeSwingVideo(srcImages, options = null) {
    let resultHandle;
    if (options) {
      resultHandle = libGFEngine2D.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_1(
        this.handle,
        srcImages.handle,
        options.handle
      );
    } else {
      resultHandle = libGFEngine2D.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0(
        this.handle,
        srcImages.handle
      );
    }
    return new SwingAnalysisResult(resultHandle);
  }

  /**
   * 정리
   */
  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_GFEngine2D(this.handle);
      this.handle = null;
    }
  }
}

/**
 * VideoMetadata 클래스
 */
class VideoMetadata {
  constructor(width = 0, height = 0, fps = 0, frameCount = 0) {
    if (width === 0 && height === 0) {
      this.handle = libGFEngine2D.CSharp_Gfe_new_VideoMetadata__SWIG_0();
    } else {
      this.handle = libGFEngine2D.CSharp_Gfe_new_VideoMetadata__SWIG_1(
        width,
        height,
        fps,
        frameCount
      );
    }
  }

  get videoWidth() {
    return libGFEngine2D.CSharp_Gfe_VideoMetadata_video_width_get(this.handle);
  }

  set videoWidth(value) {
    libGFEngine2D.CSharp_Gfe_VideoMetadata_video_width_set(this.handle, value);
  }

  get videoHeight() {
    return libGFEngine2D.CSharp_Gfe_VideoMetadata_video_height_get(this.handle);
  }

  set videoHeight(value) {
    libGFEngine2D.CSharp_Gfe_VideoMetadata_video_height_set(this.handle, value);
  }

  get fps() {
    return libGFEngine2D.CSharp_Gfe_VideoMetadata_fps_get(this.handle);
  }

  set fps(value) {
    libGFEngine2D.CSharp_Gfe_VideoMetadata_fps_set(this.handle, value);
  }

  get frameCount() {
    return libGFEngine2D.CSharp_Gfe_VideoMetadata_frame_count_get(this.handle);
  }

  set frameCount(value) {
    libGFEngine2D.CSharp_Gfe_VideoMetadata_frame_count_set(this.handle, value);
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_VideoMetadata(this.handle);
      this.handle = null;
    }
  }
}

/**
 * SrcImagesInterface 클래스
 */
class SrcImagesInterface {
  constructor() {
    this.handle = libGFEngine2D.CSharp_Gfe_new_SrcImagesInterface();
  }

  addImage(image, frameIndex = -1) {
    if (frameIndex === -1) {
      libGFEngine2D.CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_0(this.handle, image.handle);
    } else {
      libGFEngine2D.CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_1(this.handle, image.handle, frameIndex);
    }
  }

  getImage(index) {
    const imageHandle = libGFEngine2D.CSharp_Gfe_SrcImagesInterface_GetImage(this.handle, index);
    return new Image(imageHandle);
  }

  getImageCount() {
    return libGFEngine2D.CSharp_Gfe_SrcImagesInterface_GetImageCount(this.handle);
  }

  clear() {
    libGFEngine2D.CSharp_Gfe_SrcImagesInterface_Clear(this.handle);
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_SrcImagesInterface(this.handle);
      this.handle = null;
    }
  }
}

/**
 * Image 클래스
 */
class Image {
  constructor(handleOrData = null, width = 0, height = 0, channels = 0) {
    if (handleOrData && typeof handleOrData === 'object' && !Buffer.isBuffer(handleOrData)) {
      // 기존 핸들 사용
      this.handle = handleOrData;
    } else if (handleOrData === null) {
      // 빈 이미지
      this.handle = libGFEngine2D.CSharp_Gfe_new_Image__SWIG_0();
    } else {
      // 새 이미지 생성
      this.handle = libGFEngine2D.CSharp_Gfe_new_Image__SWIG_1(handleOrData, width, height, channels);
    }
  }

  isEmpty() {
    return libGFEngine2D.CSharp_Gfe_Image_IsEmpty(this.handle);
  }

  getWidth() {
    return libGFEngine2D.CSharp_Gfe_Image_GetWidth(this.handle);
  }

  getHeight() {
    return libGFEngine2D.CSharp_Gfe_Image_GetHeight(this.handle);
  }

  getChannels() {
    return libGFEngine2D.CSharp_Gfe_Image_GetChannels(this.handle);
  }

  getData() {
    return libGFEngine2D.CSharp_Gfe_Image_GetData(this.handle);
  }

  getDataSize() {
    return libGFEngine2D.CSharp_Gfe_Image_GetDataSize(this.handle);
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_Image(this.handle);
      this.handle = null;
    }
  }
}

/**
 * SwingAnalysisResult 클래스
 */
class SwingAnalysisResult {
  constructor(handle) {
    this.handle = handle;
  }

  get resultCode() {
    return libGFEngine2D.CSharp_Gfe_SwingAnalysisResult_result_code_get(this.handle);
  }

  getValue() {
    const valueHandle = libGFEngine2D.CSharp_Gfe_SwingAnalysisResult_value_get(this.handle);
    return new SwingResultInterface(valueHandle);
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_SwingAnalysisResult(this.handle);
      this.handle = null;
    }
  }
}

/**
 * SwingResultInterface 클래스
 */
class SwingResultInterface {
  constructor(handle) {
    this.handle = handle;
  }

  getPoseDirection() {
    return libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetPoseDirection(this.handle);
  }

  getPoseClubType() {
    return libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetPoseClubType(this.handle);
  }

  getHandedId() {
    return libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetHandedId(this.handle);
  }

  getModelVersion() {
    return libGFEngine2D.CSharp_Gfe_SwingResultInterface_ModelVersion(this.handle);
  }

  getFrameIndex(stepId) {
    return libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetFrameIndex(this.handle, stepId);
  }

  getSwingProblem() {
    const problemHandle = libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetSwingProblem(this.handle);
    return new SwingProblem(problemHandle);
  }

  getSwingPlane(frameIndex, planePercent) {
    const planeHandle = libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetSwingPlane(
      this.handle,
      frameIndex,
      planePercent
    );
    return new SwingPlane(planeHandle);
  }

  getStepImage(stepId) {
    const imageHandle = libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetStepImage(this.handle, stepId);
    return new Image(imageHandle);
  }

  getPanoramaImage() {
    const imageHandle = libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetPanoramaImage(this.handle);
    return new Image(imageHandle);
  }

  getShoulderStanceRatio() {
    return libGFEngine2D.CSharp_Gfe_SwingResultInterface_GetShoulderStanceRatio(this.handle);
  }
}

/**
 * SwingProblem 클래스
 */
class SwingProblem {
  constructor(handle) {
    this.handle = handle;
  }

  getAllProblems() {
    const itemsHandle = libGFEngine2D.CSharp_Gfe_SwingProblem_GetAllProblems(this.handle);
    return new SwingProblemItems(itemsHandle);
  }

  getProblems(severity) {
    const itemsHandle = libGFEngine2D.CSharp_Gfe_SwingProblem_GetProblems(this.handle, severity);
    return new SwingProblemItems(itemsHandle);
  }

  getStepProblems(stepId) {
    const itemsHandle = libGFEngine2D.CSharp_Gfe_SwingProblem_GetStepProblems(this.handle, stepId);
    return new SwingProblemItems(itemsHandle);
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_SwingProblem(this.handle);
      this.handle = null;
    }
  }
}

/**
 * SwingProblemItems 클래스
 */
class SwingProblemItems {
  constructor(handle) {
    this.handle = handle;
  }

  size() {
    return libGFEngine2D.CSharp_Gfe_SwingProblemItems_size(this.handle);
  }

  getItem(index) {
    const itemHandle = libGFEngine2D.CSharp_Gfe_SwingProblemItems_getitem(this.handle, index);
    return new SwingProblemItem(itemHandle);
  }

  toArray() {
    const size = this.size();
    const items = [];
    for (let i = 0; i < size; i++) {
      items.push(this.getItem(i));
    }
    return items;
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_SwingProblemItems(this.handle);
      this.handle = null;
    }
  }
}

/**
 * SwingProblemItem 클래스
 */
class SwingProblemItem {
  constructor(handle) {
    this.handle = handle;
  }

  get type() {
    return libGFEngine2D.CSharp_Gfe_SwingProblemItem_type_get(this.handle);
  }

  get severity() {
    return libGFEngine2D.CSharp_Gfe_SwingProblemItem_severity_get(this.handle);
  }

  get score() {
    return libGFEngine2D.CSharp_Gfe_SwingProblemItem_score_get(this.handle);
  }

  get evidenceStepId() {
    return libGFEngine2D.CSharp_Gfe_SwingProblemItem_evidenceStepId_get(this.handle);
  }
}

/**
 * SwingPlane 클래스
 */
class SwingPlane {
  constructor(handle) {
    this.handle = handle;
  }

  getSwingTempo() {
    return libGFEngine2D.CSharp_Gfe_SwingPlane_GetSwingTempo(this.handle);
  }

  getHandSwingPlanePoint(frameIndex) {
    return libGFEngine2D.CSharp_Gfe_SwingPlane_GetHandSwingPlanePoint(this.handle, frameIndex);
  }

  getClubSwingPlanePoint(frameIndex) {
    return libGFEngine2D.CSharp_Gfe_SwingPlane_GetClubSwingPlanePoint(this.handle, frameIndex);
  }

  dispose() {
    if (this.handle && !this.handle.isNull()) {
      libGFEngine2D.CSharp_Gfe_delete_SwingPlane(this.handle);
      this.handle = null;
    }
  }
}

// ========================================
// Export
// ========================================

module.exports = {
  // 클래스
  GFEngine2D,
  VideoMetadata,
  SrcImagesInterface,
  Image,
  SwingAnalysisResult,
  SwingResultInterface,
  SwingProblem,
  SwingProblemItems,
  SwingProblemItem,
  SwingPlane,

  // Enum
  PoseDirection,
  ClubType,
  HandedId,
  ResultCode,
  StepId,
  SwingProblemSeverity,

  // 원시 라이브러리 (고급 사용자용)
  libGFEngine2D,
};


