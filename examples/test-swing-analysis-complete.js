/**
 * 완전한 스윙 분석 예제
 * 
 * 실제 비디오 프레임을 사용한 분석 시나리오
 */

const {
  GFEngine2D,
  VideoMetadata,
  SrcImagesInterface,
  Image,
  PoseDirection,
  ClubType,
  HandedId,
  ResultCode,
  StepId,
  SwingProblemSeverity,
} = require('../lib/gfengine-wrapper-complete');

async function analyzeSwingExample() {
  let engine = null;
  let metadata = null;
  let srcImages = null;

  try {
    console.log('🏌️ 골프 스윙 분석 예제\n');

    // 1. 엔진 생성 및 초기화
    console.log('[1/5] 엔진 초기화...');
    engine = new GFEngine2D();
    const initResult = engine.initialize(
      PoseDirection.kFront,
      ClubType.kDriver,
      HandedId.kRightHanded
    );
    
    if (initResult !== 0) {
      throw new Error(`엔진 초기화 실패: ${initResult}`);
    }
    
    if (!engine.isReady()) {
      throw new Error('엔진이 준비되지 않았습니다');
    }
    console.log('✅ 완료\n');

    // 2. 비디오 메타데이터 설정
    console.log('[2/5] 비디오 메타데이터 설정...');
    metadata = new VideoMetadata(1920, 1080, 30.0, 300);
    engine.setVideoMetadata(metadata);
    console.log('✅ 완료\n');

    // 3. 이미지 준비
    console.log('[3/5] 이미지 준비...');
    srcImages = new SrcImagesInterface();
    
    // 실제 구현에서는 비디오 파일에서 프레임을 추출하여 추가
    console.log('   ⚠️  실제 비디오 프레임을 추가해야 합니다');
    console.log('   예: fluent-ffmpeg를 사용하여 프레임 추출 후 addImage() 호출\n');

    // 예시 (실제로는 비디오 프레임 데이터 필요):
    // for (let i = 0; i < frameCount; i++) {
    //   const frameData = extractFrame(videoPath, i);
    //   const image = new Image(frameData, width, height, channels);
    //   srcImages.addImage(image, i);
    // }

    // 4. 분석 실행
    console.log('[4/5] 스윙 분석 실행...');
    console.log('   ⚠️  실제 이미지 없이는 분석할 수 없습니다');
    console.log('   analyzeSwingVideo() 호출 예시:\n');
    console.log('   ```javascript');
    console.log('   const result = engine.analyzeSwingVideo(srcImages);');
    console.log('   ```\n');

    // 5. 결과 처리 예시
    console.log('[5/5] 결과 처리 방법...\n');
    console.log('분석 결과 사용 예시:');
    console.log('```javascript');
    console.log('// 결과 코드 확인');
    console.log('if (result.resultCode === ResultCode.kSuccess) {');
    console.log('  const swingResult = result.getValue();');
    console.log('');
    console.log('  // 프레임 인덱스');
    console.log('  const impactFrame = swingResult.getFrameIndex(StepId.kImpact);');
    console.log('  console.log(`임팩트 프레임: ${impactFrame}`);');
    console.log('');
    console.log('  // 문제점 분석');
    console.log('  const problem = swingResult.getSwingProblem();');
    console.log('  const allProblems = problem.getAllProblems();');
    console.log('  const problemArray = allProblems.toArray();');
    console.log('');
    console.log('  problemArray.forEach((item) => {');
    console.log('    console.log(`문제 타입: ${item.type}`);');
    console.log('    console.log(`심각도: ${item.severity}`);');
    console.log('    console.log(`점수: ${item.score}`);');
    console.log('  });');
    console.log('');
    console.log('  // 스윙 플레인');
    console.log('  const plane = swingResult.getSwingPlane(impactFrame, 0.5);');
    console.log('  const tempo = plane.getSwingTempo();');
    console.log('  console.log(`스윙 템포: ${tempo}`);');
    console.log('');
    console.log('  // 이미지');
    console.log('  const impactImage = swingResult.getStepImage(StepId.kImpact);');
    console.log('  const panorama = swingResult.getPanoramaImage();');
    console.log('');
    console.log('  // 정리');
    console.log('  plane.dispose();');
    console.log('  allProblems.dispose();');
    console.log('  problem.dispose();');
    console.log('  result.dispose();');
    console.log('}');
    console.log('```\n');

    console.log('='.repeat(60));
    console.log('📚 다음 단계:');
    console.log('='.repeat(60));
    console.log('1. fluent-ffmpeg로 비디오 프레임 추출');
    console.log('2. 각 프레임을 Image 객체로 변환');
    console.log('3. SrcImagesInterface에 추가');
    console.log('4. analyzeSwingVideo() 실행');
    console.log('5. 결과 파싱 및 활용\n');

  } catch (error) {
    console.error('\n❌ 에러:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // 정리
    console.log('정리 중...');
    if (srcImages) srcImages.dispose();
    if (metadata) metadata.dispose();
    if (engine) engine.dispose();
    console.log('✅ 완료');
  }
}

analyzeSwingExample();


