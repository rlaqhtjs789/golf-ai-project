/**
 * Golf Session 타입 정의
 *
 * 스윙 세션의 전체 플로우를 관리하는 타입들
 */

/**
 * 세션 진행 단계
 *
 * swing-first: 첫 번째 스윙 (스윙화면-1, 2, 3)
 * solution-video: 첫 번째 솔루션 (영상형)
 * swing-second: 두 번째 스윙 (스윙화면두번째-1, 2, 3)
 * solution-chart: 두 번째 솔루션 (차트 비교형)
 * complete: 완료 (마지막 페이지)
 */
export type SessionStep =
  | 'swing-first'
  | 'solution-video'
  | 'swing-second'
  | 'solution-chart'
  | 'complete'

/**
 * 단일 스윙의 측정 데이터
 *
 * @property swingNumber - 스윙 번호 (1~10)
 * @property clubSpeed - 클럽 스피드
 * @property ballSpeed - 볼 스피드
 * @property distance - 비거리
 * @property angle - 발사각
 * @property spin - 스핀량
 * @property timestamp - 측정 시간
 */
export interface SwingMeasurement {
  swingNumber: number
  clubSpeed: number
  ballSpeed: number
  distance: number
  angle: number
  spin: number
  timestamp: number
}

/**
 * 10번 스윙의 전체 데이터
 *
 * @property measurements - 10개의 스윙 측정값 배열
 * @property averages - 평균값
 * @property completedAt - 완료 시간
 */
export interface SwingData {
  measurements: SwingMeasurement[]
  averages: {
    clubSpeed: number
    ballSpeed: number
    distance: number
    angle: number
    spin: number
  }
  completedAt: number
}

/**
 * 솔루션 영상 정보
 *
 * @property id - 영상 ID
 * @property title - 영상 제목
 * @property thumbnail - 썸네일 URL
 * @property videoUrl - 영상 URL
 * @property category - 카테고리 (백스윙, 다운스윙, 임팩트 등)
 */
export interface SolutionVideo {
  id: string
  title: string
  thumbnail: string
  videoUrl: string
  category: string
}

/**
 * 솔루션 데이터
 *
 * @property problemType - 주요 문제 유형 (예: "비거리 부족", "슬라이스")
 * @property problemDescription - 문제 설명
 * @property improvementPercentage - 개선 퍼센트 (솔루션-차트에서 사용)
 * @property videos - 추천 영상 리스트 (솔루션-영상에서 사용)
 */
export interface SolutionData {
  problemType: string
  problemDescription: string
  improvementPercentage?: {
    distance: number
    accuracy: number
    consistency: number
  }
  videos: SolutionVideo[]
}

/**
 * 전체 세션 상태 인터페이스
 */
export interface SessionState {
  // 현재 진행 단계
  currentStep: SessionStep

  // 스윙 데이터
  firstSwingData: SwingData | null
  secondSwingData: SwingData | null

  // 솔루션 데이터
  solutionData: SolutionData | null

  // 첫 번째 스윙 진행 상태 (0~10)
  firstSwingProgress: number

  // 두 번째 스윙 진행 상태 (0~10)
  secondSwingProgress: number

  // Actions
  setStep: (step: SessionStep) => void
  setFirstSwingProgress: (progress: number) => void
  setSecondSwingProgress: (progress: number) => void
  saveFirstSwingData: (data: SwingData) => void
  saveSecondSwingData: (data: SwingData) => void
  saveSolutionData: (data: SolutionData) => void
  reset: () => void
}
