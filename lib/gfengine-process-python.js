/**
 * GFEngine2D Python Bridge (프로덕션 지원)
 * 개발: python 스크립트 사용
 * 프로덕션: exe 파일 사용
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

class GFEngineProcessPython extends EventEmitter {
  constructor() {
    super();
    
    this.process = null;
    this.ready = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    
    // 개발 vs 프로덕션 환경 감지
    let isPackaged = false;
    try {
      const { app } = require('electron');
      isPackaged = app.isPackaged;
    } catch (error) {
      // Electron 없이 테스트하는 경우
      isPackaged = false;
    }
    
    if (!isPackaged) {
      // 개발 환경: dist-python의 exe 사용 (없으면 Python 스크립트)
      const distPythonExe = path.join(__dirname, '../dist-python/gfengine-server-srcimages.exe');
      const fs = require('fs');
      
      if (fs.existsSync(distPythonExe)) {
        // exe 파일이 있으면 사용
        this.pythonCommand = distPythonExe;
        this.pythonScript = null;
        this.workingDir = path.join(__dirname, '../bin');
      } else {
        // 없으면 Python 스크립트 사용
        this.pythonCommand = 'python';
        this.pythonScript = path.join(__dirname, '../bin/gfengine-server-srcimages.py');
        this.workingDir = path.join(__dirname, '../bin');
      }
    } else {
      // 프로덕션 환경: resources/bin의 exe 사용
      try {
        const { app } = require('electron');
        const resourcesPath = process.resourcesPath || path.join(app.getAppPath(), '..');
        this.pythonCommand = path.join(resourcesPath, 'bin', 'gfengine-server-srcimages.exe');
        this.pythonScript = null;
        this.workingDir = path.join(resourcesPath, 'bin');
        console.log(`📂 Resources 경로: ${resourcesPath}`);
      } catch (error) {
        // Electron 없이 테스트하는 경우
        this.pythonCommand = path.join(process.cwd(), 'dist-python', 'gfengine-server-srcimages.exe');
        this.pythonScript = null;
        this.workingDir = path.join(process.cwd(), 'bin');
      }
    }
    
    console.log(`Python 경로: ${this.pythonCommand}`);
    console.log(`작업 디렉토리: ${this.workingDir}`);
  }

  /**
   * 프로세스 시작
   */
  async start() {
    return new Promise((resolve, reject) => {
      const args = this.pythonScript ? [this.pythonScript] : [];
      
      console.log(`Python 프로세스 시작: ${this.pythonCommand} ${args.join(' ')}`);
      
      // Python 프로세스 실행
      this.process = spawn(this.pythonCommand, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.workingDir,
        windowsHide: true, // Windows에서 콘솔 창 숨김
      });

      let buffer = '';

      // stdout에서 JSON 메시지 수신
      this.process.stdout.on('data', (data) => {
        buffer += data.toString();
        
        const lines = buffer.split('\n');
        buffer = lines.pop();

        lines.forEach(line => {
          if (line.trim()) {
            // DLL 출력 무시 (tf version, GolfFix Engine 등)
            if (line.includes('tf version') || 
                line.includes('TensorFlow') || 
                line.includes('GolfFix Engine')) {
              return;
            }
            
            try {
              const message = JSON.parse(line);
              this.handleMessage(message);
            } catch (err) {
              // JSON이 아닌 출력은 무시
              if (line.startsWith('{')) {
                console.error('메시지 파싱 실패:', err.message);
              }
            }
          }
        });
      });

      // stderr는 로그용
      this.process.stderr.on('data', (data) => {
        console.log('[Python stderr]:', data.toString().trim());
      });

      this.process.on('close', (code) => {
        console.log(`Python 프로세스 종료 (코드: ${code})`);
        this.ready = false;
        
        // 대기 중인 모든 요청 거부
        this.pendingRequests.forEach(({ reject }) => {
          reject(new Error('Python 프로세스 종료됨'));
        });
        this.pendingRequests.clear();
      });

      this.process.on('error', (err) => {
        console.error('Python 프로세스 에러:', err);
        reject(err);
      });

      // 준비 완료 대기
      this.once('ready', () => {
        this.ready = true;
        resolve();
      });

      // 타임아웃 (10초)
      setTimeout(() => {
        if (!this.ready) {
          reject(new Error('Python 프로세스 시작 타임아웃'));
        }
      }, 10000);
    });
  }

  /**
   * 메시지 처리
   */
  handleMessage(message) {
    const { type, requestId, result, error } = message;

    if (type === 'ready' || type === 'info') {
      this.emit('ready');
      return;
    }

    if (type === 'progress') {
      this.emit('progress', result);
      return;
    }

    if (type === 'response') {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve(result);
        }
        this.pendingRequests.delete(requestId);
      }
    }
  }

  /**
   * 요청 전송
   */
  sendRequest(type, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject(new Error('Python 프로세스가 준비되지 않았습니다'));
        return;
      }

      const requestId = ++this.requestId;
      
      this.pendingRequests.set(requestId, { resolve, reject });

      const message = JSON.stringify({
        requestId,
        type,
        params,
      }) + '\n';

      this.process.stdin.write(message);

      // 타임아웃 (5분)
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('요청 타임아웃'));
        }
      }, 300000);
    });
  }

  /**
   * 초기화
   */
  async initialize(direction, clubType, handedId) {
    const result = await this.sendRequest('initialize', {
      direction,
      clubType,
      handedId,
    });
    
    if (!result.success) {
      throw new Error(`초기화 실패: 코드 ${result.code}`);
    }
    
    return result;
  }

  /**
   * 버전
   */
  async getVersion() {
    const result = await this.sendRequest('getVersion');
    return result; // 이미 버전 문자열임
  }

  /**
   * 비디오 분석
   */
  async analyzeVideo(videoPath, options = {}) {
    const result = await this.sendRequest('analyzeVideo', {
      videoPath,
      direction: options.direction || 0,
      clubType: options.clubType || 0,
      frameImages: options.frameImages || [],
      frameCount: options.frameCount || 0,
      fps: options.fps || 30.0,
      width: options.width || 1920,
      height: options.height || 1080,
      duration: options.duration || 0.0,
      useRealImages: (options.frameImages && options.frameImages.length > 0),
    });
    
    return this.parseAnalysisResult(result);
  }

  /**
   * 헬스체크
   */
  async checkHealth() {
    try {
      const result = await this.sendRequest('ping');
      return {
        success: result.pong === true,
        ready: this.ready,
        version: '1.14.0',
        handleValid: this.ready,
      };
    } catch (error) {
      return {
        success: false,
        ready: false,
        version: null,
        handleValid: false,
      };
    }
  }

  /**
   * 분석 결과 파싱
   */
  parseAnalysisResult(rawResult) {
    // (기존 코드 유지)
    return rawResult;
  }

  async ping() {
    const result = await this.sendRequest('ping');
    return result.pong === true;
  }

  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.ready = false;
    }
  }
}

module.exports = GFEngineProcessPython;

