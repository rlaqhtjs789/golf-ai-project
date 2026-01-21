/**
 * GFEngine2D React Hook
 * 웹뷰에서 GFEngine API를 쉽게 사용할 수 있도록 하는 커스텀 훅
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  GFEngineAPI,
  AnalysisResult,
  AnalysisProgress,
  GFEngineError,
  CameraDirection,
  ClubType,
  HandedType,
} from '../types/gfengine';

/**
 * GFEngine 상태
 */
interface GFEngineState {
  isInitialized: boolean;
  isAnalyzing: boolean;
  progress: AnalysisProgress | null;
  result: AnalysisResult | null;
  error: GFEngineError | null;
}

/**
 * GFEngine Hook
 */
export function useGFEngine() {
  const [state, setState] = useState<GFEngineState>({
    isInitialized: false,
    isAnalyzing: false,
    progress: null,
    result: null,
    error: null,
  });

  const unsubscribersRef = useRef<(() => void)[]>([]);

  // GFEngine API 체크
  const isAvailable = typeof window !== 'undefined' && !!window.gfengine;

  /**
   * 엔진 초기화
   */
  const initialize = useCallback(
    async (
      direction: CameraDirection,
      clubType: ClubType,
      handedId: HandedType
    ) => {
      if (!isAvailable) {
        console.error('GFEngine API가 사용 불가능합니다.');
        return false;
      }

      try {
        const response = await window.gfengine.initialize(direction, clubType, handedId);

        if (response.success) {
          setState((prev) => ({ ...prev, isInitialized: true, error: null }));
        } else {
          setState((prev) => ({
            ...prev,
            error: { message: response.message || '초기화 실패' },
          }));
        }

        return response.success;
      } catch (error: any) {
        console.error('엔진 초기화 에러:', error);
        setState((prev) => ({
          ...prev,
          error: { message: error.message || '알 수 없는 에러' },
        }));
        return false;
      }
    },
    [isAvailable]
  );

  /**
   * 비디오 파일 선택
   */
  const selectVideoFile = useCallback(async () => {
    if (!isAvailable) {
      console.error('GFEngine API가 사용 불가능합니다.');
      return null;
    }

    try {
      const result = await window.gfengine.selectVideoFile();
      return result.cancelled ? null : result.filePath;
    } catch (error: any) {
      console.error('파일 선택 에러:', error);
      setState((prev) => ({
        ...prev,
        error: { message: error.message },
      }));
      return null;
    }
  }, [isAvailable]);

  /**
   * 비디오 분석
   */
  const analyzeVideo = useCallback(
    async (
      videoPath: string,
      options: {
        direction: CameraDirection;
        clubType: ClubType;
        handedId: HandedType;
      }
    ) => {
      if (!isAvailable) {
        console.error('GFEngine API가 사용 불가능합니다.');
        return null;
      }

      if (!state.isInitialized) {
        console.error('엔진이 초기화되지 않았습니다.');
        return null;
      }

      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        progress: { progress: 0, stage: '분석 준비 중' },
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
          error: { message: error.message },
        }));
        return null;
      }
    },
    [isAvailable, state.isInitialized]
  );

  /**
   * 분석 취소
   */
  const cancelAnalysis = useCallback(async () => {
    if (!isAvailable) return false;

    try {
      const cancelled = await window.gfengine.cancelAnalysis();
      if (cancelled) {
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          progress: null,
        }));
      }
      return cancelled;
    } catch (error: any) {
      console.error('분석 취소 에러:', error);
      return false;
    }
  }, [isAvailable]);

  /**
   * 버전 정보 조회
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
   * 에러 클리어
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!isAvailable) return;

    // 진행 상황 리스너
    const unsubProgress = window.gfengine.onProgress((progress) => {
      setState((prev) => ({ ...prev, progress }));
    });
    unsubscribersRef.current.push(unsubProgress);

    // 완료 리스너
    const unsubComplete = window.gfengine.onAnalysisComplete((result) => {
      setState((prev) => ({
        ...prev,
        result,
        isAnalyzing: false,
      }));
    });
    unsubscribersRef.current.push(unsubComplete);

    // 에러 리스너
    const unsubError = window.gfengine.onError((error) => {
      setState((prev) => ({
        ...prev,
        error,
        isAnalyzing: false,
      }));
    });
    unsubscribersRef.current.push(unsubError);

    // 클린업
    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [isAvailable]);

  return {
    // 상태
    isAvailable,
    isInitialized: state.isInitialized,
    isAnalyzing: state.isAnalyzing,
    progress: state.progress,
    result: state.result,
    error: state.error,

    // 메서드
    initialize,
    selectVideoFile,
    analyzeVideo,
    cancelAnalysis,
    getVersion,
    clearError,
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


