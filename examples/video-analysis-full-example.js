/**
 * GFEngine2D 영상 분석 전체 예제
 * 
 * 별도 프로세스 방식으로 안전하게 영상 분석
 */

const GFEngineProcess = require('../lib/gfengine-process-enhanced');
const path = require('path');

// 분석할 비디오 파일 경로
const VIDEO_PATH = 'D:\\Videos\\golf-swing.mp4';

async function main() {
  const engine = new GFEngineProcess();

  try {
    console.log('='.repeat(60));
    console.log('GFEngine2D 영상 분석 예제');
    console.log('='.repeat(60));
    console.log('');

    // ========================================
    // 1. 엔진 시작
    // ========================================
    console.log('[1/5] 엔진 프로세스 시작 중...');
    
    await engine.start();
    console.log('✅ 엔진 시작 완료');
    console.log('');

    // ========================================
    // 2. 버전 확인
    // ========================================
    console.log('[2/5] 버전 확인 중...');
    
    const version = await engine.getVersion();
    console.log(`✅ GFEngine 버전: ${version}`);
    console.log('');

    // ========================================
    // 3. 엔진 초기화
    // ========================================
    console.log('[3/5] 엔진 초기화 중...');
    
    const initResult = await engine.initialize(
      0,  // PoseDirection.Front (정면)
      0,  // ClubType.Driver (드라이버)
      0   // HandedId.RightHanded (오른손잡이)
    );
    
    if (initResult.success) {
      console.log('✅ 초기화 성공');
    } else {
      throw new Error('초기화 실패');
    }
    console.log('');

    // ========================================
    // 4. 진행 상황 모니터링
    // ========================================
    console.log('[4/5] 영상 분석 중...');
    console.log('');

    engine.on('progress', (data) => {
      const bar = '█'.repeat(Math.floor(data.progress / 2));
      const empty = '░'.repeat(50 - Math.floor(data.progress / 2));
      process.stdout.write(`\r  [${bar}${empty}] ${data.progress}% - ${data.stage}`);
    });

    // ========================================
    // 5. 비디오 분석
    // ========================================
    const result = await engine.analyzeVideo(VIDEO_PATH, {
      direction: 0,  // Front
      clubType: 0,   // Driver
      handedId: 0,   // RightHanded
    });

    console.log('\n');
    console.log('✅ 분석 완료!');
    console.log('');

    // ========================================
    // 결과 출력
    // ========================================
    console.log('='.repeat(60));
    console.log('분석 결과');
    console.log('='.repeat(60));
    console.log('');

    // 기본 정보
    console.log('📊 기본 정보:');
    console.log(`  - 결과 코드: ${result.resultCode} (${result.success ? '성공' : '실패'})`);
    console.log(`  - 어깨 스탠스 비율: ${result.value.shoulderStanceRatio.toFixed(2)}`);
    console.log(`  - 스윙 템포: ${result.value.swingPlane.swingTempo.toFixed(2)}`);
    console.log('');

    // 프레임 인덱스
    console.log('🎬 스윙 단계별 프레임:');
    const frameIndex = result.value.frameIndex;
    console.log(`  - Address:       ${frameIndex.address}`);
    console.log(`  - Take Away:     ${frameIndex.takeAway}`);
    console.log(`  - Backswing:     ${frameIndex.backSwing}`);
    console.log(`  - Top:           ${frameIndex.top}`);
    console.log(`  - Downswing:     ${frameIndex.downSwing}`);
    console.log(`  - Impact:        ${frameIndex.impact}`);
    console.log(`  - Follow Through: ${frameIndex.followThrough}`);
    console.log(`  - Finish:        ${frameIndex.finish}`);
    console.log('');

    // 문제점
    console.log('⚠️  스윙 문제점:');
    if (result.value.problems.length === 0) {
      console.log('  없음 - 완벽한 스윙입니다! 🎉');
    } else {
      result.value.problems.forEach((problem, index) => {
        const severityIcon = {
          'kBest': '✅',
          'kNotBad': '⚠️',
          'kWrong': '❌',
        }[problem.severityName] || '❓';
        
        console.log(`  ${index + 1}. ${severityIcon} ${problem.typeName}`);
        console.log(`     심각도: ${problem.severityName} (점수: ${problem.score.toFixed(2)})`);
        console.log(`     증거 단계: Step ${problem.evidenceStepId}`);
        console.log('');
      });
    }

    // 심각한 문제만 필터링
    const criticalProblems = result.value.problems.filter(
      p => p.severityName === 'kWrong'
    );
    
    if (criticalProblems.length > 0) {
      console.log('🚨 즉시 개선이 필요한 문제:');
      criticalProblems.forEach((problem, index) => {
        console.log(`  ${index + 1}. ${problem.typeName}`);
      });
      console.log('');
    }

    // JSON 출력 (백엔드로 전송할 데이터)
    console.log('='.repeat(60));
    console.log('백엔드로 전송할 JSON 데이터:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('');
    console.error('❌ 에러 발생:', error.message);
    if (error.code) {
      console.error(`   에러 코드: ${error.code}`);
    }
    console.error('');
    process.exit(1);
  } finally {
    // ========================================
    // 정리
    // ========================================
    console.log('');
    console.log('엔진 종료 중...');
    await engine.stop();
    console.log('✅ 완료');
  }
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };


