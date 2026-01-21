/**
 * GFEngine Process Wrapper (Python Bridge)
 * 
 * Python 브릿지를 사용하는 프로세스 래퍼
 * C++ 컴파일러 없이도 사용 가능!
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

// ResultCode, Severity 등은 gfengine-process-enhanced.js와 동일
const ResultCode = {
  kSuccess: 0,
  kCanceled: 1,
  kFailedResourceNotReady: 2,
  kFailedEngineInternalError: 3,
  kFailedFindPosture: 4,
  kFailedWrongSwingDirection: 5,
  kFailedWrongHandedId: 6,
  kUnknown: 7,
};

const SwingProblemSeverity = {
  kUnset: -1,
  kBest: 0,
  kNotBad: 1,
  kWrong: 3,
};

const StepId = {
  kAddress: 0,
  kTakeAway: 1,
  kBackSwing: 2,
  kTop: 3,
  kDownSwing: 4,
  kImpact: 5,
  kFollowThrough: 6,
  kFinish: 7,
};

class GFEngineProcessPython extends EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.ready = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    
    // 개선된 서버 우선 사용
    const improvedScript = path.join(__dirname, '../bin/gfengine-server-improved.py');
    const realScript = path.join(__dirname, '../bin/gfengine-server-real.py');
    const oldScript = path.join(__dirname, '../bin/gfengine-server.py');
    
    const fs = require('fs');
    if (fs.existsSync(improvedScript)) {
      this.pythonScript = improvedScript;
    } else if (fs.existsSync(realScript)) {
      this.pythonScript = realScript;
    } else {
      this.pythonScript = oldScript;
    }
  }

  /**
   * 프로세스 시작
   */
  async start() {
    return new Promise((resolve, reject) => {
      // Python 프로세스 실행
      this.process = spawn('python', [this.pythonScript], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(__dirname, '../bin'), // DLL이 있는 폴더
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

      // stderr
      this.process.stderr.on('data', (data) => {
        console.error('[Python stderr]:', data.toString());
      });

      // 프로세스 종료
      this.process.on('exit', (code) => {
        console.log(`Python 프로세스 종료: ${code}`);
        this.ready = false;
        this.emit('exit', code);
        
        this.pendingRequests.forEach((pending) => {
          pending.reject(new Error('프로세스가 종료되었습니다'));
        });
        this.pendingRequests.clear();
      });

      // 에러
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
    });
    
    return this.parseAnalysisResult(result);
  }

  /**
   * 분석 결과 파싱
   */
  parseAnalysisResult(rawResult) {
    if (rawResult.result_code !== ResultCode.kSuccess) {
      const error = new Error(`분석 실패: ${this.getResultCodeMessage(rawResult.result_code)}`);
      error.code = rawResult.result_code;
      throw error;
    }

    const value = rawResult.value;

    // 문제점에 이름 추가
    if (value.problems) {
      value.problems = value.problems.map(problem => ({
        ...problem,
        typeName: this.getProblemTypeName(problem.type),
        severityName: this.getSeverityName(problem.severity),
      }));
    }

    return {
      resultCode: rawResult.result_code,
      success: true,
      value: {
        frameIndex: value.frameIndex,
        problems: value.problems || [],
        swingPlane: value.swingPlane || {},
        shoulderStanceRatio: value.shoulderStanceRatio || 0,
      },
    };
  }

  getResultCodeMessage(code) {
    const messages = {
      [ResultCode.kSuccess]: '성공',
      [ResultCode.kCanceled]: '취소됨',
      [ResultCode.kFailedResourceNotReady]: '리소스 준비 안됨',
      [ResultCode.kFailedEngineInternalError]: '엔진 내부 오류',
      [ResultCode.kFailedFindPosture]: '자세 찾기 실패',
      [ResultCode.kFailedWrongSwingDirection]: '잘못된 스윙 방향',
      [ResultCode.kFailedWrongHandedId]: '잘못된 손잡이',
      [ResultCode.kUnknown]: '알 수 없는 오류',
    };
    return messages[code] || `알 수 없는 코드: ${code}`;
  }

  getProblemTypeName(type) {
    const names = {
      0: 'kAllImpactHeadUp',
      3: 'kFrontFollowChickenWing',
      6: 'kAllFinishBalance',
      7: 'kFrontAddressSpine',
      8: 'kFrontTakeawayEarlyCocking',
      9: 'kFrontTopSway',
      10: 'kAllTopShoulderRotation',
      11: 'kFrontTopReverseSpine',
      12: 'kAllTopOverSwing',
      13: 'kFrontTopLeftArmCurve',
      14: 'kAllTopNotCocking',
      15: 'kFrontImpactSlide',
      18: 'kFrontDownswingCasting',
      22: 'kFrontFollowForwardLunge',
      27: 'kFrontAddressStance',
      29: 'kFrontTopUpperBodyUp',
      30: 'kFrontTopLeftLeg',
      '-1': 'kInvalid',
    };
    return names[type] || `Unknown(${type})`;
  }

  getSeverityName(severity) {
    const names = {
      [-1]: 'kUnset',
      [0]: 'kBest',
      [1]: 'kNotBad',
      [3]: 'kWrong',
    };
    return names[severity] || `Unknown(${severity})`;
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
module.exports.ResultCode = ResultCode;
module.exports.SwingProblemSeverity = SwingProblemSeverity;
module.exports.StepId = StepId;

