/**
 * Python 브릿지 방식 예제
 * 
 * C++ 컴파일러 없이 Python으로 영상 분석
 */

const GFEngineProcessPython = require('../lib/gfengine-process-python');
const path = require('path');

async function main() {
  const engine = new GFEngineProcessPython();

  try {
    console.log('🐍 Python 브릿지 방식 영상 분석 예제');
    console.log('='.repeat(60));
    console.log('');

    // 1. 엔진 시작
    console.log('[1/4] Python 프로세스 시작 중...');
    await engine.start();
    console.log('✅ 시작 완료');
    console.log('');

    // 2. 버전 확인
    console.log('[2/4] 버전 확인 중...');
    const version = await engine.getVersion();
    console.log(`✅ GFEngine 버전: ${version}`);
    console.log('');

    // 3. 초기화
    console.log('[3/4] 엔진 초기화 중...');
    const initResult = await engine.initialize(0, 0, 0);
    if (initResult.success) {
      console.log('✅ 초기화 성공');
    }
    console.log('');

    // 4. Ping 테스트
    console.log('[4/4] Ping 테스트...');
    const pong = await engine.ping();
    console.log(`✅ Ping: ${pong ? 'OK' : 'Failed'}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ 모든 테스트 통과!');
    console.log('');
    console.log('이제 실제 비디오 분석을 실행할 수 있습니다:');
    console.log('  const result = await engine.analyzeVideo(videoPath, options);');

  } catch (error) {
    console.error('');
    console.error('❌ 에러:', error.message);
    process.exit(1);
  } finally {
    console.log('');
    console.log('엔진 종료 중...');
    await engine.stop();
    console.log('✅ 완료');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };


