/**
 * 분석 세션 상태 관리 (Zustand)
 */

import { create } from 'zustand';
import type { Session, AnalysisResult } from '@/services/aiAnalysisApi';

interface AnalysisState {
  // 현재 세션
  currentSession: Session | null;
  sessionUuid: string | null;
  
  // 진행 상황
  completedSwings: number;
  totalSwings: number;
  
  // 분석 결과
  analysisResult: AnalysisResult | null;
  
  // 로딩 상태
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: Session, uuid: string) => void;
  updateProgress: (completed: number, total: number) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  // 초기 상태
  currentSession: null,
  sessionUuid: null,
  completedSwings: 0,
  totalSwings: 10,
  analysisResult: null,
  isLoading: false,
  error: null,

  // Actions
  setSession: (session, uuid) =>
    set({
      currentSession: session,
      sessionUuid: uuid,
      totalSwings: session.swing_count,
      completedSwings: 0,
      error: null,
    }),

  updateProgress: (completed, total) =>
    set({
      completedSwings: completed,
      totalSwings: total,
    }),

  setAnalysisResult: (result) =>
    set({ analysisResult: result }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error, isLoading: false }),

  clearSession: () =>
    set({
      currentSession: null,
      sessionUuid: null,
      completedSwings: 0,
      totalSwings: 10,
      analysisResult: null,
      error: null,
    }),
}));


