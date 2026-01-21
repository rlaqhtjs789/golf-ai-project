/**
 * 완전한 JS 래퍼 테스트
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
} = require('../lib/gfengine-wrapper-complete');

async function test() {
  let engine = null;
  let metadata = null;
  let srcImages = null;

  try {
    console.log('🧪 완전한 JS 래퍼 테스트 시작...\n');

    // 1. 버전 확인
    console.log('[1/7] 버전 확인...');
    const version = GFEngine2D.getVersion();
    console.log(`✅ 버전: ${version}\n`);

    // 2. 엔진 생성
    console.log('[2/7] 엔진 생성...');
    engine = new GFEngine2D();
    console.log('✅ 완료\n');

    // 3. 엔진 초기화
    console.log('[3/7] 엔진 초기화...');
    const initResult = engine.initialize(
      PoseDirection.kFront,
      ClubType.kDriver,
      HandedId.kRightHanded
    );
    console.log(`✅ 초기화 코드: ${initResult}`);
    console.log(`   준비 상태: ${engine.isReady() ? 'Ready' : 'Not Ready'}\n`);

    // 4. 비디오 메타데이터 생성
    console.log('[4/7] 비디오 메타데이터 생성...');
    metadata = new VideoMetadata(1920, 1080, 30.0, 300);
    console.log(`✅ 메타데이터 생성`);
    console.log(`   크기: ${metadata.videoWidth}x${metadata.videoHeight}`);
    console.log(`   FPS: ${metadata.fps}`);
    console.log(`   프레임 수: ${metadata.frameCount}\n`);

    // 5. 메타데이터 설정
    console.log('[5/7] 메타데이터 설정...');
    engine.setVideoMetadata(metadata);
    console.log('✅ 완료\n');

    // 6. SrcImagesInterface 테스트
    console.log('[6/7] SrcImagesInterface 테스트...');
    srcImages = new SrcImagesInterface();
    console.log(`✅ 생성 완료`);
    console.log(`   이미지 개수: ${srcImages.getImageCount()}\n`);

    // 7. Image 테스트
    console.log('[7/7] Image 테스트...');
    const testImage = new Image();
    console.log(`✅ 이미지 생성`);
    console.log(`   비어있음: ${testImage.isEmpty()}\n`);

    console.log('='.repeat(60));
    console.log('✅ 모든 테스트 통과!');
    console.log('='.repeat(60));
    console.log('\n📝 참고:');
    console.log('   - 실제 분석을 위해서는 비디오 프레임을 SrcImagesInterface에 추가해야 합니다.');
    console.log('   - analyzeSwingVideo()를 호출하면 SwingAnalysisResult를 반환합니다.');
    console.log('   - 결과에서 문제점, 프레임 인덱스, 스윙 플레인 등을 추출할 수 있습니다.\n');

    // 메모리 정리
    testImage.dispose();

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

test();


