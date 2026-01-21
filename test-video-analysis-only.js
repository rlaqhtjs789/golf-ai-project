/**
 * 영상 분석 단독 테스트 스크립트
 * 샷 데이터 없이 영상 파일만 분석
 */

const path = require('path');
const fs = require('fs');

// SwingAnalysisService 임포트
const SwingAnalysisService = require('./lib/swing-analysis-service');

// 테스트할 영상 파일 경로 (직접 지정)
const TEST_VIDEOS = {
  front: 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train\\260120135424,Guest,Guest,W1,54.0,39.7,0.4,14.7,3318.0,-15.0,168.9,178.5,-20.3,0.9,straight,1.0,0.0,0.0,0.0,0.0,0.0,0.0,,,0,0,f.mp4',
  // side: 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train\\SIDE_20250120_143022.mp4'
};

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎬 영상 분석 단독 테스트');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testVideoAnalysis() {
  const service = new SwingAnalysisService(null); // mainWindow 없이 초기화
  
  try {
    // 1. 엔진 초기화
    console.log('📡 Python 엔진 초기화 중...\n');
    await service._initializeEngine();
    console.log('✅ Python 엔진 준비 완료!\n');
    
    // 2. 영상 파일 존재 확인
    console.log('📂 영상 파일 확인 중...');
    const videos = {};
    
    if (fs.existsSync(TEST_VIDEOS.front)) {
      videos.front = {
        fullPath: TEST_VIDEOS.front,
        filename: path.basename(TEST_VIDEOS.front),
        timestamp: Date.now()
      };
      console.log(`   ✅ 정면 영상: ${videos.front.filename}`);
    } else {
      console.log(`   ⚠️  정면 영상 없음: ${TEST_VIDEOS.front}`);
    }
    
    if (fs.existsSync(TEST_VIDEOS.side)) {
      videos.side = {
        fullPath: TEST_VIDEOS.side,
        filename: path.basename(TEST_VIDEOS.side),
        timestamp: Date.now()
      };
      console.log(`   ✅ 측면 영상: ${videos.side.filename}`);
    } else {
      console.log(`   ⚠️  측면 영상 없음: ${TEST_VIDEOS.side}`);
    }
    
    if (Object.keys(videos).length === 0) {
      throw new Error('분석할 영상 파일이 없습니다. TEST_VIDEOS 경로를 확인하세요.');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬 영상 분석 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 3. 영상 분석 실행
    const startTime = Date.now();
    const results = await service._analyzeVideos(videos);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 분석 결과 요약');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`⏱️  총 소요 시간: ${duration}초\n`);
    
    // 4. 결과 출력
    if (results.front) {
      console.log('📹 정면 영상 분석 결과:');
      
      // result_code 확인 (다양한 경로 시도)
      const resultCode = results.front.result_code ?? 
                         results.front.result?.result_code ?? 
                         results.front.analysis_result?.result_code ?? 
                         'N/A';
      console.log(`   결과 코드: ${resultCode}`);
      
      // 문제점 확인 (다양한 경로 시도)
      const problems = results.front.problems ?? 
                      results.front.value?.problems ?? 
                      results.front.analysis_result?.problems ?? 
                      [];
      if (problems && problems.length > 0) {
        console.log(`   문제점: ${problems.length}개`);
        problems.forEach((problem, index) => {
          const typeName = problem.typeName || problem.type;
          const severityName = problem.severityName || problem.severity;
          const score = problem.score !== undefined ? ` (점수: ${problem.score.toFixed(2)})` : '';
          const hasImage = problem.evidenceImage ? ' ✓ 프레임 이미지 있음' : '';
          const frameNum = problem.evidenceFrameNumber !== undefined ? ` [프레임 ${problem.evidenceFrameNumber}]` : '';
          console.log(`      ${index + 1}. ${typeName} - ${severityName}${score}${frameNum}${hasImage}`);
        });
      } else {
        console.log(`   문제점: 없음 (완벽한 스윙!)`)
      }
    }
    
    if (results.side) {
      console.log('📹 측면 영상 분석 결과:');
      
      // result_code 확인 (다양한 경로 시도)
      const resultCode = results.side.result_code ?? 
                         results.side.result?.result_code ?? 
                         results.side.analysis_result?.result_code ?? 
                         'N/A';
      console.log(`   결과 코드: ${resultCode}`);
      
      // 문제점 확인 (다양한 경로 시도)
      const problems = results.side.problems ?? 
                      results.side.value?.problems ?? 
                      results.side.analysis_result?.problems ?? 
                      [];
      if (problems && problems.length > 0) {
        console.log(`   문제점: ${problems.length}개`);
        problems.forEach((problem, index) => {
          const typeName = problem.typeName || problem.type;
          const severityName = problem.severityName || problem.severity;
          const score = problem.score !== undefined ? ` (점수: ${problem.score.toFixed(2)})` : '';
          const hasImage = problem.evidenceImage ? ' ✓ 프레임 이미지 있음' : '';
          const frameNum = problem.evidenceFrameNumber !== undefined ? ` [프레임 ${problem.evidenceFrameNumber}]` : '';
          console.log(`      ${index + 1}. ${typeName} - ${severityName}${score}${frameNum}${hasImage}`);
        });
      } else {
        console.log(`   문제점: 없음 (완벽한 스윙!)`)
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 테스트 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    console.error(error.stack);
  } finally {
    // 5. 엔진 정리
    if (service.engine && service.engine.dispose) {
      console.log('🛑 Python 엔진 종료 중...');
      await service.engine.dispose();
      console.log('✅ 정리 완료\n');
    }
    process.exit(0);
  }
}

// 실행
testVideoAnalysis();
