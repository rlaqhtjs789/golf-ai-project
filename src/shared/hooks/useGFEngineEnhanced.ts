/**
 * GFEngine2D React Hook (Enhanced)
 * 실제 GFEngine2D 결과 구조 기반
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  SwingAnalysisResult,
  AnalysisProgress,
  GFEngineError,
  PoseDirection,
  ClubType,
  HandedId,
  SwingProblem,
  SwingProblemSeverity,
  StepId,
} from '../types/gfengine-enhanced';

/**
 * GFEngine 상태
 */
interface GFEngineState {
  isInitialized: boolean;
  isAnalyzing: boolean;
  progress: AnalysisProgress | null;
  result: SwingAnalysisResult | null;
  error: GFEngineError | null;
}

/**
 * GFEngine Hook (Enhanced)
 */
export function useGFEngineEnhanced() {
  const [state, setState] = useState<GFEngineState>({
    isInitialized: false,
    isAnalyzing: false,
    progress: null,
    result: null,
    error: null,
  });

  const engineRef = useRef<any>(null);

  // GFEngine API 체크 (Electron 환경)
  const isAvailable = typeof window !== 'undefined' && !!window.gfengine;

  /**
   * 엔진 시작
   */
  const startEngine = useCallback(async () => {
    if (!isAvailable) {
      throw new Error('GFEngine API가 사용 불가능합니다 (Electron 환경 필요)');
    }

    try {
      // 프로세스 시작
      await window.gfengine.start();
      
      setState((prev) => ({ ...prev, error: null }));
    } catch (error: any) {
      console.error('엔진 시작 실패:', error);
      setState((prev) => ({
        ...prev,
        error: { message: error.message },
      }));
      throw error;
    }
  }, [isAvailable]);

  /**
   * 엔진 초기화
   */
  const initialize = useCallback(
    async (
      direction: PoseDirection,
      clubType: ClubType,
      handedId: HandedId
    ) => {
      if (!isAvailable) {
        throw new Error('GFEngine API가 사용 불가능합니다');
      }

      try {
        const response = await window.gfengine.initialize(direction, clubType, handedId);

        if (response.success) {
          setState((prev) => ({ ...prev, isInitialized: true, error: null }));
        } else {
          throw new Error(response.message || '초기화 실패');
        }

        return response.success;
      } catch (error: any) {
        console.error('엔진 초기화 에러:', error);
        setState((prev) => ({
          ...prev,
          error: { message: error.message },
        }));
        throw error;
      }
    },
    [isAvailable]
  );

  /**
   * 비디오 분석
   */
  const analyzeVideo = useCallback(
    async (
      videoPath: string,
      options: {
        direction: PoseDirection;
        clubType: ClubType;
        handedId?: HandedId;
      }
    ) => {
      if (!isAvailable) {
        throw new Error('GFEngine API가 사용 불가능합니다');
      }

      if (!state.isInitialized) {
        throw new Error('엔진이 초기화되지 않았습니다. initialize()를 먼저 호출하세요.');
      }

      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        progress: { progress: 0, stage: '분석 시작' },
        result: null,
        error: null,
      }));

      try {
        const result = await window.gfengine.analyzeVideo(videoPath, options);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          result,
          progress: { progress: 100, stage: '완료' },
        }));

        return result;
      } catch (error: any) {
        console.error('비디오 분석 에러:', error);
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: {
            message: error.message,
            code: error.code,
          },
        }));
        throw error;
      }
    },
    [isAvailable, state.isInitialized]
  );

  /**
   * 버전 정보
   */
  const getVersion = useCallback(async () => {
    if (!isAvailable) return 'Unknown';

    try {
      return await window.gfengine.getVersion();
    } catch (error) {
      console.error('버전 조회 에러:', error);
      return 'Unknown';
    }
  }, [isAvailable]);

  /**
   * Ping 테스트
   */
  const ping = useCallback(async () => {
    if (!isAvailable) return false;

    try {
      return await window.gfengine.ping();
    } catch (error) {
      console.error('Ping 실패:', error);
      return false;
    }
  }, [isAvailable]);

  /**
   * 엔진 종료
   */
  const stopEngine = useCallback(async () => {
    if (!isAvailable) return;

    try {
      await window.gfengine.stop();
      setState((prev) => ({ ...prev, isInitialized: false }));
    } catch (error) {
      console.error('엔진 종료 에러:', error);
    }
  }, [isAvailable]);

  /**
   * 에러 클리어
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!isAvailable) return;

    // 진행 상황 리스너
    const unsubProgress = window.gfengine.onProgress((progress: AnalysisProgress) => {
      setState((prev) => ({ ...prev, progress }));
    });

    // 정리
    return () => {
      unsubProgress();
    };
  }, [isAvailable]);

  // 컴포넌트 언마운트 시 엔진 정리
  useEffect(() => {
    return () => {
      if (isAvailable && state.isInitialized) {
        stopEngine();
      }
    };
  }, [isAvailable, state.isInitialized, stopEngine]);

  return {
    // 상태
    isAvailable,
    isInitialized: state.isInitialized,
    isAnalyzing: state.isAnalyzing,
    progress: state.progress,
    result: state.result,
    error: state.error,

    // 메서드
    startEngine,
    initialize,
    analyzeVideo,
    getVersion,
    ping,
    stopEngine,
    clearError,

    // 헬퍼
    getCriticalProblems: () => {
      if (!state.result) return [];
      return state.result.value.problems.filter(
        (p) => p.severity === SwingProblemSeverity.kWrong
      );
    },

    getProblemsByStep: (stepId: StepId) => {
      if (!state.result) return [];
      return state.result.value.problems.filter(
        (p) => p.evidenceStepId === stepId
      );
    },
  };
}

/**
 * Electron 환경 체크 Hook
 */
export function useElectron() {
  const isElectron = typeof window !== 'undefined' && !!window.electron;
  const isDev = isElectron ? window.electron.isDev : false;
  const platform = isElectron ? window.electron.platform : 'unknown';

  return {
    isElectron,
    isDev,
    platform,
  };
}


