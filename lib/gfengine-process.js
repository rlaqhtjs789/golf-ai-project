/**
 * GFEngine Process Wrapper (권장)
 * 
 * DLL을 별도 프로세스에서 실행하여 안정성 극대화
 * - DLL 크래시가 메인 앱에 영향 없음
 * - 빌드 도구 불필요
 * - 크로스 플랫폼 지원 쉬움
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

class GFEngineProcess extends EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.ready = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  /**
   * 프로세스 시작
   */
  async start() {
    return new Promise((resolve, reject) => {
      // C++ 래퍼 프로세스 실행 (bin/gfengine-server.exe)
      const serverPath = path.join(__dirname, '../bin/gfengine-server.exe');
      
      this.process = spawn(serverPath, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let buffer = '';

      // stdout에서 JSON 메시지 수신
      this.process.stdout.on('data', (data) => {
        buffer += data.toString();
        
        // 줄 단위로 파싱
        const lines = buffer.split('\n');
        buffer = lines.pop(); // 마지막 불완전한 줄은 버퍼에 유지

        lines.forEach(line => {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this.handleMessage(message);
            } catch (err) {
              console.error('메시지 파싱 실패:', err, line);
            }
          }
        });
      });

      // stderr
      this.process.stderr.on('data', (data) => {
        console.error('GFEngine stderr:', data.toString());
      });

      // 프로세스 종료
      this.process.on('exit', (code) => {
        console.log(`GFEngine 프로세스 종료: ${code}`);
        this.ready = false;
        this.emit('exit', code);
      });

      // 에러
      this.process.on('error', (err) => {
        console.error('GFEngine 프로세스 에러:', err);
        reject(err);
      });

      // 준비 완료 대기
      this.once('ready', () => {
        this.ready = true;
        resolve();
      });

      // 타임아웃
      setTimeout(() => {
        if (!this.ready) {
          reject(new Error('GFEngine 프로세스 시작 타임아웃'));
        }
      }, 10000);
    });
  }

  /**
   * 메시지 처리
   */
  handleMessage(message) {
    const { type, requestId, data, error } = message;

    if (type === 'ready') {
      this.emit('ready');
      return;
    }

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
  }

  /**
   * 요청 전송
   */
  sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject(new Error('GFEngine 프로세스가 준비되지 않았습니다'));
        return;
      }

      const requestId = ++this.requestId;
      
      this.pendingRequests.set(requestId, { resolve, reject });

      const message = JSON.stringify({
        requestId,
        method,
        params,
      }) + '\n';

      this.process.stdin.write(message);

      // 타임아웃 (60초)
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('요청 타임아웃'));
        }
      }, 60000);
    });
  }

  /**
   * 초기화
   */
  async initialize(direction, clubType, handedId) {
    return this.sendRequest('initialize', { direction, clubType, handedId });
  }

  /**
   * 버전
   */
  async getVersion() {
    return this.sendRequest('getVersion');
  }

  /**
   * 비디오 분석
   */
  async analyzeVideo(videoPath, options) {
    return this.sendRequest('analyzeVideo', { videoPath, options });
  }

  /**
   * 프레임 분석
   */
  async analyzeFrame(frameBuffer, width, height) {
    // Base64 인코딩
    const frameBase64 = frameBuffer.toString('base64');
    return this.sendRequest('analyzeFrame', {
      frame: frameBase64,
      width,
      height,
    });
  }

  /**
   * 종료
   */
  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.ready = false;
    }
  }
}

module.exports = GFEngineProcess;


