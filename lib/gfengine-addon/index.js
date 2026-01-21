/**
 * GFEngine Addon JavaScript Wrapper
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
    const defaultPath = path.join(__dirname, '../bin/libGFEngine2D.dll');
    const finalPath = dllPath || defaultPath;
    
    addon.loadDLL(finalPath);
    this.loaded = true;
  }

  /**
   * 초기화
   */
  initialize(direction, clubType, handedId) {
    if (!this.loaded) {
      throw new Error('DLL이 로드되지 않았습니다. load()를 먼저 호출하세요.');
    }
    return addon.initialize(direction, clubType, handedId);
  }

  /**
   * 버전
   */
  getVersion() {
    if (!this.loaded) {
      throw new Error('DLL이 로드되지 않았습니다.');
    }
    return addon.getVersion();
  }

  /**
   * 프레임 분석 (Promise 기반)
   */
  analyzeFrame(frameBuffer, width, height) {
    if (!this.loaded) {
      throw new Error('DLL이 로드되지 않았습니다.');
    }

    return new Promise((resolve, reject) => {
      addon.analyzeFrameAsync(frameBuffer, width, height, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * DLL 해제
   */
  unload() {
    if (this.loaded) {
      addon.unloadDLL();
      this.loaded = false;
    }
  }
}

module.exports = new GFEngineAddon();


