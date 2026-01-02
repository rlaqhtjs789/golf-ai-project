/**
 * Golf Session Store
 *
 * 스윙 세션의 전체 상태를 관리하는 Zustand 스토어
 *
 * 플로우:
 * 1. swing-first (첫 번째 스윙) - 10개 체크박스 진행
 * 2. solution-video (영상형 솔루션)
 * 3. swing-second (두 번째 스윙) - 10개 체크박스 진행
 * 4. solution-chart (차트 비교형 솔루션)
 * 5. complete (마지막 페이지)
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SessionState } from '../types/session.type'

/**
 * 초기 상태
 */
const initialState = {
  currentStep: 'swing-first' as const,
  firstSwingData: null,
  secondSwingData: null,
  solutionData: null,
  firstSwingProgress: 0,
  secondSwingProgress: 0,
  swingHistory: [],
  swingCount: 1,
}

/**
 * Golf Session Store
 *
 * @example
 * ```tsx
 * import { useSessionStore } from '@/features/golf-session/model/sessionStore'
 *
 * function SwingPage() {
 *   const { currentStep, firstSwingProgress, setFirstSwingProgress } = useSessionStore()
 *
 *   // 스윙 진행
 *   const handleSwingComplete = () => {
 *     setFirstSwingProgress(10)
 *   }
 * }
 * ```
 */
export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      ...initialState,

      /**
       * 세션 단계 변경
       */
      setStep: (step) =>
        set(
          { currentStep: step },
          false,
          'session/setStep'
        ),

      /**
       * 첫 번째 스윙 진행률 업데이트 (0~10)
       */
      setFirstSwingProgress: (progress) =>
        set(
          { firstSwingProgress: progress },
          false,
          'session/setFirstSwingProgress'
        ),

      /**
       * 두 번째 스윙 진행률 업데이트 (0~10)
       */
      setSecondSwingProgress: (progress) =>
        set(
          { secondSwingProgress: progress },
          false,
          'session/setSecondSwingProgress'
        ),

      /**
       * 첫 번째 스윙 데이터 저장
       */
      saveFirstSwingData: (data) =>
        set(
          { firstSwingData: data },
          false,
          'session/saveFirstSwingData'
        ),

      /**
       * 두 번째 스윙 데이터 저장
       */
      saveSecondSwingData: (data) =>
        set(
          { secondSwingData: data },
          false,
          'session/saveSecondSwingData'
        ),

      /**
       * 솔루션 데이터 저장
       */
      saveSolutionData: (data) =>
        set(
          { solutionData: data },
          false,
          'session/saveSolutionData'
        ),

      /**
       * 스윙 데이터를 히스토리에 추가 (FIFO 5개 유지)
       *
       * FIFO 로직:
       * - 1~5번째 스윙: 순서대로 추가
       * - 6번째 이상: 첫 번째 데이터 유지 + 가장 최근 4개만 유지
       * 예: [swing1, swing2, swing3, swing4, swing5] → [swing1, swing3, swing4, swing5, swing6]
       */
      addSwingToHistory: (data) =>
        set(
          (state) => {
            const newHistory = [...state.swingHistory, data]
            let history = newHistory

            // 6개 이상이면 FIFO 처리 (첫 번째 유지 + 최근 4개)
            if (newHistory.length > 5) {
              history = [newHistory[0], ...newHistory.slice(-4)]
            }

            return { swingHistory: history }
          },
          false,
          'session/addSwingToHistory'
        ),

      /**
       * 스윙 횟수 업데이트
       */
      setSwingCount: (count) =>
        set(
          { swingCount: count },
          false,
          'session/setSwingCount'
        ),

      /**
       * 스윙 히스토리만 초기화 (새로운 스윙하기)
       */
      resetSwingHistory: () =>
        set(
          { swingHistory: [], swingCount: 1 },
          false,
          'session/resetSwingHistory'
        ),

      /**
       * 전체 세션 초기화 (처음으로 돌아가기)
       */
      reset: () =>
        set(
          initialState,
          false,
          'session/reset'
        ),
    }),
    {
      name: 'golf-session-store',
      enabled: import.meta.env.DEV,
    }
  )
)

/**
 * 선택적 셀렉터 훅 (성능 최적화)
 *
 * @example
 * ```tsx
 * // 필요한 데이터만 구독
 * const currentStep = useSessionStore(state => state.currentStep)
 * const firstSwingProgress = useSessionStore(state => state.firstSwingProgress)
 * ```
 */

// 자주 사용되는 셀렉터 미리 정의
export const selectCurrentStep = (state: SessionState) => state.currentStep
export const selectFirstSwingData = (state: SessionState) => state.firstSwingData
export const selectSecondSwingData = (state: SessionState) => state.secondSwingData
export const selectSolutionData = (state: SessionState) => state.solutionData
export const selectFirstSwingProgress = (state: SessionState) => state.firstSwingProgress
export const selectSecondSwingProgress = (state: SessionState) => state.secondSwingProgress
export const selectSwingHistory = (state: SessionState) => state.swingHistory
export const selectSwingCount = (state: SessionState) => state.swingCount
