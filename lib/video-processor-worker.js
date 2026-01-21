/**
 * Video Processor Worker
 * 
 * 비디오 처리를 Worker Thread에서 수행하여 메인 프로세스 블로킹 방지
 */

const { Worker } = require('worker_threads');
const path = require('path');
const EventEmitter = require('events');

class VideoProcessorWorker extends EventEmitter {
  constructor() {
    super();
    this.worker = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  /**
   * Worker 시작
   */
  start() {
    const workerPath = path.join(__dirname, 'video-processor-worker-thread.js');
    this.worker = new Worker(workerPath);

    // 메시지 수신
    this.worker.on('message', (message) => {
      const { type, requestId, data, error } = message;

      if (type === 'progress') {
        this.emit('progress', data);
        return;
      }

      if (type === 'response') {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          if (error) {
            pending.reject(new Error(error));
          } else {
            pending.resolve(data);
          }
          this.pendingRequests.delete(requestId);
        }
      }
    });

    // 에러
    this.worker.on('error', (err) => {
      console.error('Worker 에러:', err);
      this.emit('error', err);
    });

    // 종료
    this.worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker 비정상 종료: ${code}`);
      }
    });
  }

  /**
   * 프레임 추출 (비동기)
   */
  extractFrames(videoPath, outputDir, options = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;

      this.pendingRequests.set(requestId, { resolve, reject });

      this.worker.postMessage({
        requestId,
        method: 'extractFrames',
        params: { videoPath, outputDir, options },
      });
    });
  }

  /**
   * 메타데이터 조회
   */
  getMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;

      this.pendingRequests.set(requestId, { resolve, reject });

      this.worker.postMessage({
        requestId,
        method: 'getMetadata',
        params: { videoPath },
      });
    });
  }

  /**
   * Worker 종료
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

module.exports = VideoProcessorWorker;


