/**
 * 자동 래퍼 선택 테스트
 */

const { createEngine, checkAvailableWrappers } = require('../lib/gfengine-factory');

async function test() {
  console.log('🔍 사용 가능한 래퍼 확인...\n');
  
  const available = checkAvailableWrappers();
  
  console.log('사용 가능한 래퍼:');
  available.forEach((wrapper, i) => {
    console.log(`  ${i + 1}. ${wrapper.name}`);
    console.log(`     - 성능: ${'⭐'.repeat(wrapper.performance)}`);
    console.log(`     - 안정성: ${'⭐'.repeat(wrapper.stability)}`);
    console.log(`     - 빌드 필요: ${wrapper.buildRequired ? '예' : '아니오'}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('최적 래퍼 자동 선택 중...\n');
  
  try {
    const engine = createEngine();
    
    // 비동기 함수인지 확인
    const isAsync = engine.version && engine.version.constructor.name === 'AsyncFunction';
    
    if (isAsync) {
      console.log('비동기 래퍼 감지됨 (Python Bridge)\n');
      
      await engine.load();
      const version = await engine.version();
      console.log(`버전: ${version}`);
      
      const health = await engine.checkHealth();
      console.log('상태:', health);
      
      await engine.dispose();
    } else {
      console.log('동기 래퍼 감지됨 (ffi-napi or N-API)\n');
      
      const version = engine.version();
      console.log(`버전: ${version}`);
      
      const health = engine.checkHealth();
      console.log('상태:', health);
      
      engine.dispose();
    }
    
    console.log('\n✅ 테스트 성공!');
    
  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    process.exit(1);
  }
}

test();


