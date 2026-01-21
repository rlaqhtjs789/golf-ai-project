/**
 * 빌드 후 영상 파일 복사 스크립트
 * public 폴더의 sample-swing-video*.mp4 파일들을 dist 폴더로 복사
 */
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, 'public')
const distDir = path.join(__dirname, 'dist')

try {
  // dist 폴더가 없으면 생성
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true })
  }
  
  // public 폴더의 모든 sample-swing-video*.mp4 파일 찾기
  const files = fs.readdirSync(publicDir, { encoding: 'utf8' })
  const sampleVideoFiles = files.filter(f => f.startsWith('sample-swing-video') && f.endsWith('.mp4'))
  
  if (sampleVideoFiles.length === 0) {
    console.warn('⚠️ public 폴더에 sample-swing-video*.mp4 파일이 없습니다')
    process.exit(0)
  }
  
  // 각 파일을 dist 폴더로 복사
  let copiedCount = 0
  sampleVideoFiles.forEach(file => {
    const sourceFile = path.join(publicDir, file)
    const destFile = path.join(distDir, file)
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, destFile)
      console.log(`✅ ${file} 복사 완료`)
      copiedCount++
    }
  })
  
  console.log(`✅ 총 ${copiedCount}개 영상 파일 복사 완료`)
} catch (error) {
  console.error('❌ 파일 복사 실패:', error.message)
  process.exit(1)
}
