/**
 * 영상 파일 찾기 헬퍼 스크립트
 * 센서 폴더에서 최신 영상 파일 경로를 찾습니다
 */

const fs = require('fs');
const path = require('path');

// 센서 폴더 경로
const VIDEO_PATH = 'D:\\GTSGolf\\Signature\\app\\SVAgent\\@video\\train';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 영상 파일 검색');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`📂 검색 경로: ${VIDEO_PATH}\n`);

try {
  if (!fs.existsSync(VIDEO_PATH)) {
    console.error('❌ 폴더가 존재하지 않습니다!');
    console.log('\n💡 센서 프로그램이 설치되어 있는지 확인하세요.');
    process.exit(1);
  }
  
  // 폴더 내 모든 파일 읽기
  const files = fs.readdirSync(VIDEO_PATH);
  
  // 영상 파일만 필터링
  const videoFiles = files.filter(file => 
    file.toLowerCase().endsWith('.mp4') || 
    file.toLowerCase().endsWith('.avi')
  );
  
  if (videoFiles.length === 0) {
    console.log('⚠️  영상 파일이 없습니다.');
    console.log('\n💡 스윙을 한 번 실행하여 영상을 생성하세요.');
    process.exit(0);
  }
  
  // 파일 정보 수집 (생성 시간 포함)
  const fileInfos = videoFiles.map(file => {
    const fullPath = path.join(VIDEO_PATH, file);
    const stats = fs.statSync(fullPath);
    return {
      name: file,
      fullPath,
      created: stats.birthtime,
      size: stats.size,
      type: file.toUpperCase().includes('FRONT') ? 'front' : 
            file.toUpperCase().includes('SIDE') ? 'side' : 'unknown'
    };
  });
  
  // 생성 시간 순으로 정렬 (최신순)
  fileInfos.sort((a, b) => b.created - a.created);
  
  console.log(`✅ 총 ${fileInfos.length}개의 영상 파일 발견\n`);
  
  // 정면/측면 영상 그룹핑
  const frontVideos = fileInfos.filter(f => f.type === 'front');
  const sideVideos = fileInfos.filter(f => f.type === 'side');
  const unknownVideos = fileInfos.filter(f => f.type === 'unknown');
  
  // 최신 정면/측면 영상 찾기
  const latestFront = frontVideos[0];
  const latestSide = sideVideos[0];
  
  if (latestFront || latestSide) {
    console.log('🎯 테스트용 최신 영상:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (latestFront) {
      console.log(`📹 정면 영상:`);
      console.log(`   파일명: ${latestFront.name}`);
      console.log(`   경로: ${latestFront.fullPath}`);
      console.log(`   크기: ${(latestFront.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   생성: ${latestFront.created.toLocaleString('ko-KR')}\n`);
    } else {
      console.log(`📹 정면 영상: 없음\n`);
    }
    
    if (latestSide) {
      console.log(`📹 측면 영상:`);
      console.log(`   파일명: ${latestSide.name}`);
      console.log(`   경로: ${latestSide.fullPath}`);
      console.log(`   크기: ${(latestSide.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   생성: ${latestSide.created.toLocaleString('ko-KR')}\n`);
    } else {
      console.log(`📹 측면 영상: 없음\n`);
    }
    
    // test-video-analysis-only.js 업데이트용 코드 생성
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 복사하여 test-video-analysis-only.js에 붙여넣으세요:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('const TEST_VIDEOS = {');
    if (latestFront) {
      console.log(`  front: '${latestFront.fullPath.replace(/\\/g, '\\\\')}',`);
    } else {
      console.log(`  // front: 'D:\\\\GTSGolf\\\\...\\\\FRONT_xxxxxx.mp4',`);
    }
    if (latestSide) {
      console.log(`  side: '${latestSide.fullPath.replace(/\\/g, '\\\\')}',`);
    } else {
      console.log(`  // side: 'D:\\\\GTSGolf\\\\...\\\\SIDE_xxxxxx.mp4',`);
    }
    console.log('};\n');
  }
  
  // 전체 목록 출력
  if (fileInfos.length > 2) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📂 전체 영상 목록 (최신순):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    fileInfos.slice(0, 10).forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   타입: ${file.type === 'front' ? '📹 정면' : file.type === 'side' ? '📹 측면' : '❓ 알 수 없음'}`);
      console.log(`   크기: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   생성: ${file.created.toLocaleString('ko-KR')}\n`);
    });
    
    if (fileInfos.length > 10) {
      console.log(`... 외 ${fileInfos.length - 10}개 파일\n`);
    }
  }
  
} catch (error) {
  console.error('❌ 에러 발생:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
