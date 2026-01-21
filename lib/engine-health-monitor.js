/**
 * 엔진 헬스 모니터
 * Python 서버 연결 상태 주기적 체크 및 자동 재연결
 */

const EventEmitter = require('events');

class EngineHealthMonitor extends EventEmitter {
  constructor(engine, options = {}) {
    super();
    
    this.engine = engine;
    this.isMonitoring = false;
    this.isHealthy = false;
    this.consecutiveFailures = 0;
    this.reconnectAttempts = 0;
    
    this.config = {
      checkInterval: options.checkInterval || 5000,      // 5초마다 체크
      healthCheckTimeout: options.healthCheckTimeout || 3000, // 3초 타임아웃
      maxConsecutiveFailures: options.maxConsecutiveFailures || 3, // 3번 연속 실패
      maxReconnectAttempts: options.maxReconnectAttempts || 5, // 최대 5번 재연결
      reconnectDelay: options.reconnectDelay || 2000,    // 2초 후 재연결
    };
    
    this.intervalId = null;
  }

  /**
   * 모니터링 시작
   */
  start() {
    if (this.isMonitoring) {
      console.log('⚠️  이미 모니터링 중입니다.');
      return;
    }

    console.log('🏥 엔진 헬스 모니터링 시작');
    this.isMonitoring = true;
    this.isHealthy = true;
    this.consecutiveFailures = 0;
    
    // 초기 헬스체크
    this._performHealthCheck();
    
    // 주기적 헬스체크
    this.intervalId = setInterval(() => {
      this._performHealthCheck();
    }, this.config.checkInterval);
    
    this.emit('monitoring-started');
  }

  /**
   * 모니터링 중지
   */
  stop() {
    if (!this.isMonitoring) return;

    console.log('🛑 엔진 헬스 모니터링 중지');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isMonitoring = false;
    this.emit('monitoring-stopped');
  }

  /**
   * 헬스체크 수행
   */
  async _performHealthCheck() {
    try {
      const startTime = Date.now();
      
      // 타임아웃 설정
      const healthPromise = this.engine.checkHealth();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), this.config.healthCheckTimeout)
      );
      
      const health = await Promise.race([healthPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      // 정상
      if (health && health.success && health.ready) {
        this._handleHealthy(responseTime);
      } else {
        this._handleUnhealthy('Health check failed: not ready');
      }
      
    } catch (error) {
      this._handleUnhealthy(error.message);
    }
  }

  /**
   * 정상 상태 처리
   */
  _handleHealthy(responseTime) {
    const wasUnhealthy = !this.isHealthy;
    
    this.isHealthy = true;
    this.consecutiveFailures = 0;
    this.reconnectAttempts = 0;
    
    if (wasUnhealthy) {
      console.log('✅ 엔진 연결 복구됨');
      this.emit('connection-restored', { responseTime });
    }
    
    this.emit('health-check', {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 비정상 상태 처리
   */
  _handleUnhealthy(reason) {
    this.consecutiveFailures++;
    
    console.warn(`⚠️  헬스체크 실패 (${this.consecutiveFailures}/${this.config.maxConsecutiveFailures}): ${reason}`);
    
    this.emit('health-check', {
      status: 'unhealthy',
      reason,
      consecutiveFailures: this.consecutiveFailures,
      timestamp: new Date().toISOString(),
    });
    
    // 연속 실패 횟수가 임계값을 넘으면 연결 끊김으로 판단
    if (this.consecutiveFailures >= this.config.maxConsecutiveFailures && this.isHealthy) {
      this._handleDisconnection();
    }
  }

  /**
   * 연결 끊김 처리
   */
  _handleDisconnection() {
    console.error('❌ 엔진 연결 끊김 감지');
    
    this.isHealthy = false;
    this.emit('connection-lost', {
      consecutiveFailures: this.consecutiveFailures,
      timestamp: new Date().toISOString(),
    });
    
    // 자동 재연결 시도
    this._attemptReconnect();
  }

  /**
   * 재연결 시도
   */
  async _attemptReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('❌ 최대 재연결 시도 횟수 초과');
      this.emit('reconnect-failed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.config.maxReconnectAttempts,
      });
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 재연결 시도 ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}...`);
    
    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.config.maxReconnectAttempts,
    });

    try {
      // 기존 엔진 정리
      await this.engine.dispose();
      
      // 대기
      await new Promise(resolve => setTimeout(resolve, this.config.reconnectDelay));
      
      // 재시작
      await this.engine.load();
      await this.engine.initialize(0, 0, 0);
      
      console.log('✅ 재연결 성공!');
      this.consecutiveFailures = 0;
      this.isHealthy = true;
      
      this.emit('reconnect-success', {
        attempt: this.reconnectAttempts,
      });
      
    } catch (error) {
      console.error(`❌ 재연결 실패 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}):`, error.message);
      
      this.emit('reconnect-error', {
        attempt: this.reconnectAttempts,
        error: error.message,
      });
      
      // 다음 재연결 시도
      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        setTimeout(() => this._attemptReconnect(), this.config.reconnectDelay);
      } else {
        this.emit('reconnect-failed', {
          attempts: this.reconnectAttempts,
          maxAttempts: this.config.maxReconnectAttempts,
        });
      }
    }
  }

  /**
   * 수동 재연결
   */
  async manualReconnect() {
    console.log('🔄 수동 재연결 시도...');
    this.reconnectAttempts = 0;
    await this._attemptReconnect();
  }

  /**
   * 현재 상태
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      isHealthy: this.isHealthy,
      consecutiveFailures: this.consecutiveFailures,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.config.maxReconnectAttempts,
    };
  }
}

module.exports = EngineHealthMonitor;

