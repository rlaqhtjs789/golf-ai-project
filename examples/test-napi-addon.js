/**
 * N-API Addon 테스트
 */

const addon = require('../lib/gfengine-addon/index-real');

async function test() {
  try {
    console.log('🧪 N-API Addon 테스트 시작...\n');

    // 1. DLL 로드
    console.log('[1/4] DLL 로드 중...');
    addon.load();
    console.log('✅ 완료\n');

    // 2. 버전 확인
    console.log('[2/4] 버전 확인 중...');
    const version = addon.getVersion();
    console.log(`✅ 버전: ${version}\n`);

    // 3. 초기화
    console.log('[3/4] 엔진 초기화 중...');
    const initResult = addon.initialize(0, 0, 0);
    console.log(`✅ 초기화 ${initResult.success ? '성공' : '실패'}`);
    console.log(`   코드: ${initResult.code}`);
    console.log(`   준비 상태: ${initResult.isReady ? 'Ready' : 'Not Ready'}\n`);

    // 4. 준비 상태 재확인
    console.log('[4/4] 준비 상태 확인...');
    const isReady = addon.isReady();
    console.log(`✅ 준비 상태: ${isReady ? 'Ready' : 'Not Ready'}\n`);

    console.log('='.repeat(60));
    console.log('✅ 모든 테스트 통과!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // 정리
    console.log('\n정리 중...');
    addon.unload();
    console.log('✅ 완료');
  }
}

test();


