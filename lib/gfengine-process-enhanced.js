/**
 * GFEngine Process Wrapper (Enhanced)
 * 
 * 실제 GFEngine2D 결과 구조에 맞춰 구현된 프로세스 래퍼
 */

const { spawn } = require('child_process');
const path = require('path');
const EventEmitter = require('events');

// 결과 코드 enum
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

// 스윙 문제 심각도
const SwingProblemSeverity = {
  kUnset: -1,
  kBest: 0,
  kNotBad: 1,
  kWrong: 3,
};

// 스윙 단계
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

class GFEngineProcess extends EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.ready = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.serverPath = path.join(__dirname, '../bin/gfengine-server.exe');
  }

  /**
   * 프로세스 시작
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.process = spawn(this.serverPath, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let buffer = '';

      // stdout에서 JSON 메시지 수신
      this.process.stdout.on('data', (data) => {
        buffer += data.toString();
        
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
        console.error('[GFEngine stderr]:', data.toString());
      });

      // 프로세스 종료
      this.process.on('exit', (code) => {
        console.log(`GFEngine 프로세스 종료: ${code}`);
        this.ready = false;
        this.emit('exit', code);
        
        // 모든 대기 중인 요청 거부
        this.pendingRequests.forEach((pending) => {
          pending.reject(new Error('프로세스가 종료되었습니다'));
        });
        this.pendingRequests.clear();
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

      // 타임아웃 (10초)
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
        ...params,
      }) + '\n';

      this.process.stdin.write(message);

      // 타임아웃 (5분 - 영상 분석은 시간이 걸림)
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
    return result.version;
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
   * 분석 결과 파싱 및 보강
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

  /**
   * 결과 코드 메시지
   */
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

  /**
   * 문제 타입 이름
   */
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
      50: 'kSideAddressPostureUp',
      55: 'kSideTopCrossOver',
      56: 'kSideTopSpineCollapse',
      57: 'kSideTopFlyingElbow',
      58: 'kSideTopLegCollapse',
      59: 'kSideDownswingFaultSlot',
      60: 'kSideImpactEarlyExtension',
      62: 'kSideTopLaidOff',
      63: 'kSideTakeawayClubInside',
      65: 'kSideAddressPostureDown',
      66: 'kSideTakeawayClubOutside',
      67: 'kSideFollowLeftArmPull',
      68: 'kSideImpactNotHipTurn',
      69: 'kSideBackswingHeadAhead',
      73: 'kSideAddressPostureSitDown',
      '-1': 'kInvalid',
    };
    return names[type] || `Unknown(${type})`;
  }

  /**
   * 심각도 이름
   */
  getSeverityName(severity) {
    const names = {
      [-1]: 'kUnset',
      [0]: 'kBest',
      [1]: 'kNotBad',
      [3]: 'kWrong',
    };
    return names[severity] || `Unknown(${severity})`;
  }

  /**
   * Ping 테스트
   */
  async ping() {
    const result = await this.sendRequest('ping');
    return result.pong === true;
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
module.exports.ResultCode = ResultCode;
module.exports.SwingProblemSeverity = SwingProblemSeverity;
module.exports.StepId = StepId;


