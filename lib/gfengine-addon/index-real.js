/**
 * GFEngine Addon JavaScript Wrapper (Real API)
 */

const path = require('path');
const addon = require('./build/Release/gfengine_addon.node');

class GFEngineAddon {
  constructor() {
    this.loaded = false;
  }

  /**
   * DLL 로드
   */
  load(dllPath = null) {
    const defaultPath = path.join(__dirname, '../../bin/libGFEngine2D.dll');
    const finalPath = dllPath || defaultPath;
    
    addon.loadDLL(finalPath);
    this.loaded = true;
    
    console.log('✅ GFEngine2D DLL 로드 완료');
  }

  /**
   * 버전
   */
  getVersion() {
    if (!this.loaded) {
      throw new Error('DLL이 로드되지 않았습니다. load()를 먼저 호출하세요.');
    }
    return addon.getVersion();
  }

  /**
   * 초기화
   */
  initialize(direction, clubType, handedId) {
    if (!this.loaded) {
      throw new Error('DLL이 로드되지 않았습니다.');
    }
    return addon.initialize(direction, clubType, handedId);
  }

  /**
   * 준비 상태 확인
   */
  isReady() {
    if (!this.loaded) {
      return false;
    }
    return addon.isReady();
  }

  /**
   * Clear
   */
  clear() {
    if (!this.loaded) {
      return false;
    }
    return addon.clear();
  }

  /**
   * DLL 언로드
   */
  unload() {
    if (this.loaded) {
      addon.unloadDLL();
      this.loaded = false;
      console.log('✅ GFEngine2D DLL 언로드 완료');
    }
  }
}

module.exports = new GFEngineAddon();


