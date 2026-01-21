/**
 * GFEngine2D Factory
 * 
 * 사용 가능한 최적의 래퍼를 자동 선택
 */

const fs = require('fs');
const path = require('path');

/**
 * 사용 가능한 래퍼 확인 및 생성
 */
function createEngine() {
  // 1. 안전한 래퍼 시도 (ffi-napi)
  try {
    const { GFEngine2D } = require('./gfengine-wrapper-safe');
    console.log('✅ Safe Wrapper (ffi-napi) 사용');
    return new GFEngine2D();
  } catch (error) {
    console.log('⚠️  Safe Wrapper 불가:', error.message);
  }
  
  // 2. N-API Addon 시도
  try {
    const addonPath = path.join(__dirname, 'gfengine-addon/build/Release/gfengine_addon.node');
    if (fs.existsSync(addonPath)) {
      const addon = require('./gfengine-addon/index-real');
      console.log('✅ N-API Addon 사용');
      return {
        load: () => addon.load(),
        version: () => addon.getVersion(),
        initialize: (d, c, h) => addon.initialize(d, c, h),
        isReady: () => addon.isReady(),
        clear: () => addon.clear(),
        dispose: () => addon.unload(),
        checkHealth: () => ({
          success: true,
          ready: addon.isReady(),
          version: addon.getVersion(),
          handleValid: true
        })
      };
    }
  } catch (error) {
    console.log('⚠️  N-API Addon 불가:', error.message);
  }
  
  // 3. Python 브릿지 시도
  try {
    const GFEngineProcess = require('./gfengine-process-python');
    console.log('✅ Python Bridge 사용');
    
    const instance = new GFEngineProcess();
    let started = false;
    
    return {
      async load() {
        if (!started) {
          await instance.start();
          started = true;
        }
      },
      async version() {
        return '1.14.0'; // 하드코딩
      },
      async initialize(d, c, h) {
        const result = await instance.initialize(d, c, h);
        return { success: result.success, code: result.code };
      },
      async isReady() {
        // Python 브릿지는 항상 준비됨
        return started;
      },
      async clear() {
        // 구현 필요
        return true;
      },
      async dispose() {
        if (started) {
          await instance.stop();
          started = false;
        }
      },
      async checkHealth() {
        return {
          success: started,
          ready: started,
          version: '1.14.0',
          handleValid: started
        };
      },
      async analyzeVideo(videoPath, options = {}) {
        console.log(`🎬 [Factory] analyzeVideo 호출: ${videoPath}`);
        const result = await instance.analyzeVideo(videoPath, options);
        console.log(`✅ [Factory] analyzeVideo 완료, result_code: ${result?.result_code}`);
        return result;
      }
    };
  } catch (error) {
    console.log('⚠️  Python Bridge 불가:', error.message);
  }
  
  throw new Error('사용 가능한 GFEngine2D 래퍼가 없습니다');
}

/**
 * 사용 가능한 래퍼 타입 확인
 */
function checkAvailableWrappers() {
  const available = [];
  
  // Safe Wrapper (ffi-napi)
  try {
    require.resolve('ffi-napi');
    available.push({
      type: 'safe-wrapper',
      name: 'Safe Wrapper (ffi-napi)',
      performance: 4,
      stability: 5,
      buildRequired: true
    });
  } catch (e) {}
  
  // N-API Addon
  try {
    const addonPath = path.join(__dirname, 'gfengine-addon/build/Release/gfengine_addon.node');
    if (fs.existsSync(addonPath)) {
      available.push({
        type: 'napi-addon',
        name: 'N-API Addon',
        performance: 5,
        stability: 5,
        buildRequired: true
      });
    }
  } catch (e) {}
  
  // Python Bridge
  try {
    const pyScript = path.join(__dirname, '../bin/gfengine-server-improved.py');
    if (fs.existsSync(pyScript)) {
      available.push({
        type: 'python-bridge',
        name: 'Python Bridge',
        performance: 3,
        stability: 4,
        buildRequired: false
      });
    }
  } catch (e) {}
  
  return available;
}

module.exports = {
  createEngine,
  checkAvailableWrappers
};

