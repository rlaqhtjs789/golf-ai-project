/**
 * GFEngine2D 안전한 JavaScript 래퍼
 * 
 * access violation 없이 안전하게 DLL 사용
 * 버전은 하드코딩, 나머지 기능은 정상 작동
 */

const ffi = require('ffi-napi');
const ref = require('ref-napi');
const path = require('path');

// 기본 타입 정의
const intPtr = ref.refType(ref.types.void);

// DLL 경로
const dllPath = path.join(__dirname, '../bin/libGFEngine2D.dll');

// DLL 함수 로드 (버전 함수 제외)
const libGFEngine2D = ffi.Library(dllPath, {
  // 엔진 관리
  'CSharp_Gfe_new_GFEngine2D': [intPtr, []],
  'CSharp_Gfe_delete_GFEngine2D': ['void', [intPtr]],
  'CSharp_Gfe_GFEngine2D_Initialize__SWIG_0': ['int', [intPtr, 'int', 'int', 'int']],
  'CSharp_Gfe_GFEngine2D_IsReady': ['bool', [intPtr]],
  'CSharp_Gfe_GFEngine2D_Clear': ['bool', [intPtr]],
  
  // VideoMetadata
  'CSharp_Gfe_new_VideoMetadata__SWIG_1': [intPtr, ['int', 'int', 'double', 'int']],
  'CSharp_Gfe_delete_VideoMetadata': ['void', [intPtr]],
  'CSharp_Gfe_GFEngine2D_SetVideoMetadata': ['void', [intPtr, intPtr]],
});

// Enum 정의
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

/**
 * GFEngine2D 메인 클래스
 */
class GFEngine2D {
  constructor() {
    this.handle = null;
    this.initialized = false;
    this.knownVersion = '1.14.0'; // 알려진 버전
  }

  /**
   * 핸들 생성 (내부용)
   */
  _createHandle() {
    if (!this.handle || this.handle.isNull()) {
      this.handle = libGFEngine2D.CSharp_Gfe_new_GFEngine2D();
      if (this.handle.isNull()) {
        throw new Error('엔진 핸들 생성 실패');
      }
    }
  }

  /**
   * 안전한 버전 반환
   * DLL 함수를 호출하지 않고 알려진 버전 반환
   */
  version() {
    // 엔진이 초기화되었거나 준비되었으면 버전 반환
    if (this.initialized) {
      return this.knownVersion;
    }
    
    // 준비 상태 확인 시도
    try {
      this._createHandle();
      if (this.isReady()) {
        return this.knownVersion;
      }
    } catch (error) {
      // 무시
    }
    
    return null;
  }

  /**
   * 엔진 상태 확인 (버전 포함)
   */
  checkHealth() {
    try {
      this._createHandle();
      
      const isReady = this.isReady();
      
      return {
        success: true,
        ready: isReady,
        version: this.knownVersion,
        handleValid: !this.handle.isNull(),
        initialized: this.initialized
      };
    } catch (error) {
      return {
        success: false,
        ready: false,
        version: null,
        handleValid: false,
        initialized: false,
        error: error.message
      };
    }
  }

  /**
   * 엔진 초기화
   */
  initialize(direction, clubType, handedId) {
    this._createHandle();
    
    const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0(
      this.handle,
      direction,
      clubType,
      handedId
    );
    
    if (result === 0) {
      this.initialized = true;
    }
    
    return {
      success: result === 0,
      code: result,
      message: this._getResultMessage(result)
    };
  }

  /**
   * 준비 상태 확인
   */
  isReady() {
    if (!this.handle || this.handle.isNull()) {
      return false;
    }
    
    try {
      return libGFEngine2D.CSharp_Gfe_GFEngine2D_IsReady(this.handle);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear
   */
  clear() {
    if (!this.handle || this.handle.isNull()) {
      return false;
    }
    
    try {
      const result = libGFEngine2D.CSharp_Gfe_GFEngine2D_Clear(this.handle);
      if (result) {
        this.initialized = false;
      }
      return result;
    } catch (error) {
      return false;
    }
  }

  /**
   * 비디오 메타데이터 설정
   */
  setVideoMetadata(width, height, fps, frameCount) {
    this._createHandle();
    
    const metadata = libGFEngine2D.CSharp_Gfe_new_VideoMetadata__SWIG_1(
      width,
      height,
      fps,
      frameCount
    );
    
    if (metadata.isNull()) {
      throw new Error('메타데이터 생성 실패');
    }
    
    try {
      libGFEngine2D.CSharp_Gfe_GFEngine2D_SetVideoMetadata(this.handle, metadata);
      return true;
    } finally {
      // 메타데이터 정리
      libGFEngine2D.CSharp_Gfe_delete_VideoMetadata(metadata);
    }
  }

  /**
   * 정리
   */
  dispose() {
    if (this.handle && !this.handle.isNull()) {
      try {
        libGFEngine2D.CSharp_Gfe_delete_GFEngine2D(this.handle);
      } catch (error) {
        console.error('엔진 정리 실패:', error);
      }
      this.handle = null;
      this.initialized = false;
    }
  }

  /**
   * 결과 코드 메시지
   */
  _getResultMessage(code) {
    const messages = {
      [ResultCode.kSuccess]: '성공',
      [ResultCode.kCanceled]: '취소됨',
      [ResultCode.kFailedResourceNotReady]: '리소스 준비 안됨',
      [ResultCode.kFailedEngineInternalError]: '엔진 내부 오류',
      [ResultCode.kFailedFindPosture]: '자세 찾기 실패',
      [ResultCode.kFailedWrongSwingDirection]: '잘못된 스윙 방향',
      [ResultCode.kFailedWrongHandedId]: '잘못된 손잡이',
      [ResultCode.kUnknown]: '알 수 없는 오류',
    };
    return messages[code] || `알 수 없는 코드: ${code}`;
  }
}

// Export
module.exports = {
  GFEngine2D,
  PoseDirection,
  ClubType,
  HandedId,
  ResultCode,
  libGFEngine2D, // 고급 사용자용
};


