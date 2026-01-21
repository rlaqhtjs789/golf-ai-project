/**
 * Worker Thread for Video Processing
 */

const { parentPort } = require('worker_threads');
const videoProcessor = require('./video-processor');

/**
 * 응답 전송
 */
function sendResponse(requestId, data) {
  parentPort.postMessage({
    type: 'response',
    requestId,
    data,
  });
}

/**
 * 에러 전송
 */
function sendError(requestId, error) {
  parentPort.postMessage({
    type: 'response',
    requestId,
    error: error.message,
  });
}

/**
 * 진행 상황 전송
 */
function sendProgress(data) {
  parentPort.postMessage({
    type: 'progress',
    data,
  });
}

/**
 * 메시지 처리
 */
parentPort.on('message', async (message) => {
  const { requestId, method, params } = message;

  try {
    if (method === 'extractFrames') {
      const { videoPath, outputDir, options } = params;

      const frames = await videoProcessor.extractFrames(
        videoPath,
        outputDir,
        options,
        (progress) => {
          sendProgress(progress);
        }
      );

      sendResponse(requestId, frames);
    }
    else if (method === 'getMetadata') {
      const { videoPath } = params;
      const metadata = await videoProcessor.getVideoMetadata(videoPath);
      sendResponse(requestId, metadata);
    }
    else {
      throw new Error(`Unknown method: ${method}`);
    }
  }
  catch (error) {
    sendError(requestId, error);
  }
});


