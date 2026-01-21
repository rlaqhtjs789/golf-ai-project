/**
 * 스윙 분석 React Hook
 */

import { useState, useEffect, useCallback } from 'react';

interface AnalysisStatus {
  isActive: boolean;
  sessionUuid: string | null;
  currentSwingCount: number;
  totalSwingCount: number;
  progress: number;
}

interface SwingAnalysisAPI {
  startSession: (sessionUuid: string, totalSwingCount: number) => Promise<{ success: boolean; error?: string }>;
  stopSession: () => Promise<{ success: boolean; error?: string }>;
  getStatus: () => Promise<AnalysisStatus>;
  onProgress: (callback: (data: any) => void) => () => void;
  onShotComplete: (callback: (data: any) => void) => () => void;
}

declare global {
  interface Window {
    swingAnalysis?: SwingAnalysisAPI;
  }
}

export function useSwingAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>({
    isActive: false,
    sessionUuid: null,
    currentSwingCount: 0,
    totalSwingCount: 0,
    progress: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상태 주기적 업데이트
  useEffect(() => {
    const interval = setInterval(async () => {
      if (window.swingAnalysis) {
        const currentStatus = await window.swingAnalysis.getStatus();
        setStatus(currentStatus);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 진행 상황 구독
  useEffect(() => {
    if (!window.swingAnalysis) return;

    const unsubscribeProgress = window.swingAnalysis.onProgress((data) => {
      console.log('분석 진행:', data);
    });

    const unsubscribeShot = window.swingAnalysis.onShotComplete((data) => {
      console.log('샷 완료:', data);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeShot();
    };
  }, []);

  // 세션 시작
  const startSession = useCallback(async (sessionUuid: string, totalSwingCount: number) => {
    if (!window.swingAnalysis) {
      setError('스윙 분석 API를 사용할 수 없습니다');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.swingAnalysis.startSession(sessionUuid, totalSwingCount);
      
      if (!result.success) {
        throw new Error(result.error || '세션 시작 실패');
      }

      console.log('✅ 분석 세션 시작:', sessionUuid);
    } catch (err: any) {
      setError(err.message);
      console.error('세션 시작 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 세션 중지
  const stopSession = useCallback(async () => {
    if (!window.swingAnalysis) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.swingAnalysis.stopSession();
      
      if (!result.success) {
        throw new Error(result.error || '세션 중지 실패');
      }

      console.log('✅ 분석 세션 중지');
    } catch (err: any) {
      setError(err.message);
      console.error('세션 중지 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    isLoading,
    error,
    startSession,
    stopSession,
  };
}


