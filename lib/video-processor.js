/**
 * 비디오 프로세서 모듈
 * FFmpeg를 사용하여 비디오 파일에서 프레임을 추출하고 처리합니다.
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const path = require('path');
const fs = require('fs').promises;
const { createWriteStream } = require('fs');

// FFmpeg & FFprobe 경로 설정
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

console.log('✅ FFmpeg 경로:', ffmpegPath);
console.log('✅ FFprobe 경로:', ffprobePath);

/**
 * 비디오 메타데이터 추출
 * @param {string} videoPath - 비디오 파일 경로
 * @returns {Promise<object>} 메타데이터
 */
async function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration,
          width: videoStream.width,
          height: videoStream.height,
          fps: eval(videoStream.r_frame_rate), // "30000/1001" 같은 형식을 숫자로 변환
          codec: videoStream.codec_name,
          bitrate: metadata.format.bit_rate,
        });
      }
    });
  });
}

/**
 * 비디오를 프레임 이미지로 추출
 * @param {string} videoPath - 비디오 파일 경로
 * @param {string} outputDir - 출력 디렉토리
 * @param {object} options - 추출 옵션
 * @param {number} options.fps - 초당 추출할 프레임 수 (기본: 30)
 * @param {number} options.startTime - 시작 시간(초)
 * @param {number} options.duration - 추출 시간(초)
 * @param {function} progressCallback - 진행 상황 콜백
 * @returns {Promise<string[]>} 추출된 프레임 파일 경로 배열
 */
async function extractFrames(videoPath, outputDir, options = {}, progressCallback = null) {
  const {
    fps = 30,
    startTime = 0,
    duration = null,
    quality = 2, // 1-31, 낮을수록 고품질
  } = options;

  // 출력 디렉토리 생성
  await fs.mkdir(outputDir, { recursive: true });

  // 비디오 메타데이터 가져오기
  const metadata = await getVideoMetadata(videoPath);
  const totalFrames = Math.floor((duration || metadata.duration) * fps);

  return new Promise((resolve, reject) => {
    const frameFiles = [];
    let frameCount = 0;

    const command = ffmpeg(videoPath)
      .fps(fps)
      .outputOptions([
        `-q:v ${quality}`, // 품질 설정
      ])
      .output(path.join(outputDir, 'frame-%04d.jpg'));

    // 시작 시간 지정
    if (startTime > 0) {
      command.seekInput(startTime);
    }

    // 추출 시간 지정
    if (duration) {
      command.duration(duration);
    }

    // 진행 상황 추적
    command.on('progress', (progress) => {
      if (progressCallback) {
        const percent = progress.percent || 0;
        progressCallback({
          percent: Math.min(percent, 100),
          frames: progress.frames || 0,
          currentTime: progress.timemark,
        });
      }
    });

    // 완료
    command.on('end', async () => {
      try {
        // 추출된 파일 목록 읽기
        const files = await fs.readdir(outputDir);
        const sortedFiles = files
          .filter(f => f.startsWith('frame-') && f.endsWith('.jpg'))
          .sort()
          .map(f => path.join(outputDir, f));

        resolve(sortedFiles);
      } catch (error) {
        reject(error);
      }
    });

    // 에러
    command.on('error', (err) => {
      reject(err);
    });

    // 실행
    command.run();
  });
}

/**
 * 특정 시간의 프레임 하나만 추출 (썸네일 등)
 * @param {string} videoPath - 비디오 파일 경로
 * @param {string} outputPath - 출력 파일 경로
 * @param {number} timeInSeconds - 추출할 시간(초)
 * @returns {Promise<string>} 추출된 파일 경로
 */
async function extractSingleFrame(videoPath, outputPath, timeInSeconds = 0) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .seekInput(timeInSeconds)
      .frames(1)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

/**
 * 비디오를 리사이즈 (전처리용)
 * @param {string} inputPath - 입력 비디오 경로
 * @param {string} outputPath - 출력 비디오 경로
 * @param {number} width - 출력 너비
 * @param {number} height - 출력 높이
 * @param {function} progressCallback - 진행 상황 콜백
 * @returns {Promise<string>} 출력 파일 경로
 */
async function resizeVideo(inputPath, outputPath, width, height, progressCallback = null) {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .size(`${width}x${height}`)
      .output(outputPath);

    if (progressCallback) {
      command.on('progress', (progress) => {
        progressCallback({
          percent: progress.percent || 0,
          currentTime: progress.timemark,
        });
      });
    }

    command
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

/**
 * 비디오 회전
 * @param {string} inputPath - 입력 비디오 경로
 * @param {string} outputPath - 출력 비디오 경로
 * @param {number} angle - 회전 각도 (90, 180, 270)
 * @returns {Promise<string>} 출력 파일 경로
 */
async function rotateVideo(inputPath, outputPath, angle) {
  const transposeMap = {
    90: '1',    // 시계 방향 90도
    180: '2,2', // 180도 (transpose 2번)
    270: '2',   // 반시계 방향 90도
  };

  const transpose = transposeMap[angle];
  if (!transpose) {
    throw new Error(`지원하지 않는 회전 각도: ${angle}`);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(`transpose=${transpose}`)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

/**
 * 프레임 파일들을 메모리로 읽기
 * @param {string[]} framePaths - 프레임 파일 경로 배열
 * @returns {Promise<Buffer[]>} 프레임 데이터 배열
 */
async function loadFrames(framePaths) {
  return Promise.all(
    framePaths.map(path => fs.readFile(path))
  );
}

/**
 * 임시 디렉토리 정리
 * @param {string} dirPath - 삭제할 디렉토리 경로
 */
async function cleanupTempDir(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`임시 디렉토리 삭제됨: ${dirPath}`);
  } catch (error) {
    console.error('임시 디렉토리 삭제 실패:', error);
  }
}

module.exports = {
  getVideoMetadata,
  extractFrames,
  extractSingleFrame,
  resizeVideo,
  rotateVideo,
  loadFrames,
  cleanupTempDir,
};

