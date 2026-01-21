/**
 * 솔루션 페이지
 *
 * @route /solution
 *
 * 타입:
 * 1. 영상형 (solution-video): 첫 번째 스윙 후 - 영상 썸네일 + 모달
 * 2. 차트형 (solution-chart): 두 번째 스윙 후 - 비교 차트
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore, selectCurrentStep, selectSwingHistory, selectSessionUuid } from '@/features/golf-session/model/sessionStore'
import { VideoContentModal } from '@/features/golf-session/ui/VideoContentModal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { SwingData } from '@/features/golf-session/types/session.type'
import { SWING_COUNT_PER_SESSION } from '@/shared/constants/swing'
import { getSeverityInfo, CATEGORY_NAMES, getTopNProblems } from '@/shared/constants/swing-problems'
import { getSession, type Improvements } from '@/services/aiAnalysisApi'

// 🔗 API 연동 지점 4: 솔루션 영상 데이터 조회
// TODO: GET /api/analysis/videos/{problemId} 에서 동적으로 로드
// 현재는 샘플 영상 사용, API 연동 후 제거
// public 폴더의 sample-swing-video*.mp4 파일들 사용 (빌드 시 dist로 자동 복사)
const SAMPLE_VIDEO_URL = '/sample-swing-video.mp4'
const SAMPLE_VIDEO_URL2 = '/sample-swing-video2.mp4'
const SAMPLE_VIDEO_URL3 = '/sample-swing-video3.mp4'
const SAMPLE_VIDEO_URL4 = '/sample-swing-video4.mp4'
const SAMPLE_VIDEO_URL5 = '/sample-swing-video5.mp4'
const MOCK_VIDEOS = [
  { id: '1', title: '덮어치기-수직낙하', thumbnail: '', videoUrl: SAMPLE_VIDEO_URL, status: 'correct' },
  { id: '2', title: '배치기-펌핑드릴', thumbnail: '', videoUrl: SAMPLE_VIDEO_URL2, status: 'incorrect' },
  { id: '3', title: '체중이동타이밍', thumbnail: '', videoUrl: SAMPLE_VIDEO_URL3, status: 'correct' },
  { id: '4', title: '어퍼블로감각', thumbnail: '', videoUrl: SAMPLE_VIDEO_URL4, status: 'correct' },
  { id: '5', title: '지면반력활용', thumbnail: '', videoUrl: SAMPLE_VIDEO_URL5, status: 'incorrect' }
]



/**
 * 비거리 추이 데이터 생성
 * swingHistory의 각 스윙마다 Line 컴포넌트가 동적으로 추가됨
 *
 * 🔗 API 연동 후: swingHistory 대신 API 응답 데이터 직접 사용
 * TODO: GET /api/analysis/distance-trend 에서 이미 포맷된 데이터 받기
 */
const getDistanceTrendData = (swingHistory: SwingData[]) => {
  if (swingHistory.length === 0) {
    return []
  }

  // 각 스윙의 SWING_COUNT_PER_SESSION개 샷을 X축으로 표시
  const data = Array.from({ length: SWING_COUNT_PER_SESSION }, (_, i) => {
    const point: Record<string, string | number> = { shot: `${i + 1}회차` }

    // 각 스윙 데이터에서 해당 샷의 거리를 추출
    swingHistory.forEach((swing) => {
      // measurements 배열이 있고 해당 인덱스에 데이터가 있는지 확인
      if (swing.measurements && swing.measurements.length > i && swing.measurements[i]) {
        // measurements 배열에서 실제 거리 값 사용 (숫자로 변환)
        const distance = typeof swing.measurements[i].distance === 'number' 
          ? swing.measurements[i].distance 
          : Number(swing.measurements[i].distance || 0)
        point[`swing${swing.swingNumber}`] = distance || 0
      } else {
        // measurements 배열이 없거나 해당 인덱스에 데이터가 없으면 0 또는 평균값 사용
        point[`swing${swing.swingNumber}`] = swing.averages?.distance || 0
      }
    })

    return point
  })

  // 디버깅: 데이터 확인
  console.log('[solution] getDistanceTrendData 결과:', {
    swingHistoryLength: swingHistory.length,
    dataLength: data.length,
    firstDataPoint: data[0],
    allDataPoints: data,
    swingHistory: swingHistory.map(swing => ({
      swingNumber: swing.swingNumber,
      measurementsLength: swing.measurements?.length || 0,
      measurements: swing.measurements?.map((m, idx) => ({ 
        index: idx,
        distance: m.distance,
        distanceType: typeof m.distance,
        clubSpeed: m.clubSpeed,
        ballSpeed: m.ballSpeed
      })) || [],
      averages: swing.averages
    }))
  })

  return data
}

/**
 * 구질 추이 데이터 생성 (Swiper 슬라이더용)
 * 순서: 첫 번째 스윙 → 최신 스윙 → 역순으로 나머지
 * 예: 6회차 = [1, 6, 5, 4, 3], 7회차 = [1, 7, 6, 5, 4]
 * swingNumber는 실제 스윙 번호, originalIndex는 swingHistory 내 배열 위치 (0~4)
 *
 * 🔗 API 연동 후: swingHistory 대신 API 응답 데이터 직접 사용
 * TODO: GET /api/analysis/ball-quality 에서 이미 포맷된 데이터 받기
 */
const getBallQualityData = (swingHistory: SwingData[]) => {
  if (swingHistory.length === 0) {
    return []
  }

  // 정렬 순서: 첫 번째 + 최신순
  const orderedSwings: SwingData[] = []

  // 첫 번째 스윙 추가
  orderedSwings.push(swingHistory[0])

  // 마지막 스윙부터 두 번째 스윙까지 역순으로 추가
  for (let i = swingHistory.length - 1; i >= 1; i--) {
    orderedSwings.push(swingHistory[i])
  }

  // 최대 5개만 유지 (첫 번째 + 최신 4개)
  const finalSwings = orderedSwings.slice(0, 5)

  return finalSwings.map((swing) => {
    // 원래 배열에서의 위치 찾기 (색상 계산용)
    const originalIndex = swingHistory.findIndex(s => s.swingNumber === swing.swingNumber)
    return {
      swingIndex: swing.swingNumber,  // 실제 스윙 번호 (1, 3, 4, 5, 6...)
      originalIndex: originalIndex,   // 색상 계산용 (swingHistory 내 배열 위치: 0~4)
      // 🔗 API 연동 후: 실제 구질 데이터로 교체
      // TODO: measurements 데이터가 아닌 서버에서 계산된 구질 데이터 사용
      data: Array.from({ length: SWING_COUNT_PER_SESSION }, (_, idx) => ({
        swing: idx + 1,
        targetDistance: 200 + Math.random() * 20,
        actualDistance: 190 + Math.random() * 80,
        lateralOffset: Math.random() * 8 - 4,
      })),
    }
  })
}

function SolutionPage() {
  const navigate = useNavigate()
  const currentStep = useSessionStore(selectCurrentStep)
  const swingHistory = useSessionStore(selectSwingHistory)
  const videoAnalysisResults = useSessionStore(state => state.videoAnalysisResults)
  const sessionUuid = useSessionStore(selectSessionUuid)
  const { setStep, setFirstSwingProgress, setSecondSwingProgress, resetSwingHistory } = useSessionStore()
  const [selectedVideo, setSelectedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [toggledSwings, setToggledSwings] = useState<Record<number, boolean>>({})
  const [improvements, setImprovements] = useState<Improvements | null>(null)
  const [improvementsLoading, setImprovementsLoading] = useState(false)

  // 색상 배열 (비거리추이와 동일하게 사용)
  const colors = ['#c084fc', '#06b6d4', '#10b981', '#f59e0b', '#f472b6']

  // 🔗 API 연동 후: 다음 값들을 서버에서 계산하여 받기
  // TODO: GET /api/analysis/summary 응답에서 직접 받기

  // 첫 번째 스윙 평균 거리
  const firstSwingAverage = swingHistory.length > 0
    ? Number(swingHistory[0].averages.distance.toFixed(2))
    : 0

  // 마지막(최신) 스윙 평균 거리
  const lastSwingAverage = swingHistory.length > 0
    ? Number(swingHistory[swingHistory.length - 1].averages.distance.toFixed(2))
    : 0

  // 개선도 계산 (첫 번째 vs 마지막 스윙)
  const improvementRate = swingHistory.length > 1
    ? Number((((lastSwingAverage - firstSwingAverage) / firstSwingAverage) * 100).toFixed(2))
    : 0

  // 영상형인지 차트형인지 구분
  const isVideoType = currentStep === 'solution-video'

  useEffect(() => {
    // swing 단계에서 넘어오는 경우를 허용하기 위해 조건 변경
    console.log('[solution] 첫 번째 useEffect, currentStep:', currentStep)

    if (currentStep !== 'solution-video' && currentStep !== 'solution-chart') {
      console.log('[solution] 조건 불만족! 홈으로. currentStep:', currentStep)
      navigate('/')
      return
    }

    // 🔗 API 연동 지점 2: 솔루션 분석 데이터 조회
    // TODO: 페이지 진입 시 필요한 데이터 로드
    // - solution-video: GET /api/analysis/video (영상 솔루션 데이터)
    // - solution-chart: GET /api/analysis/chart (비교 차트 데이터)
    // 현재는 swingHistory를 로컬에서 사용하고 있으므로 API 연동 후 교체
  }, [currentStep, navigate])

  // API에서 개선 가능 수치 가져오기
  useEffect(() => {
    const fetchImprovements = async () => {
      if (!sessionUuid) {
        console.log('[solution] sessionUuid 없음 - improvements API 호출 스킵')
        return
      }

      setImprovementsLoading(true)
      try {
        console.log('[solution] improvements API 호출 시작, sessionUuid:', sessionUuid)
        const response = await getSession(sessionUuid)
        
        console.log('[solution] 📦 API 응답 전체:', response)
        console.log('[solution] 📦 response.success:', response.success)
        console.log('[solution] 📦 response.data:', response.data)
        console.log('[solution] 📦 response.data.improvements:', response.data?.improvements)
        
        if (response.success && response.data?.improvements) {
          console.log('[solution] ✅ improvements 받음:', response.data.improvements)
          setImprovements(response.data.improvements)
        } else {
          console.log('[solution] ⚠️ improvements 없음 - response:', response)
          console.log('[solution] ⚠️ response.success:', response.success)
          console.log('[solution] ⚠️ response.data?.improvements:', response.data?.improvements)
        }
      } catch (error) {
        console.error('[solution] ❌ improvements API 에러:', error)
        console.error('[solution] ❌ 에러 상세:', error instanceof Error ? error.message : String(error))
      } finally {
        setImprovementsLoading(false)
      }
    }

    fetchImprovements()
  }, [sessionUuid])

  // 🔗 API 연동 후: 서버에서 계산된 값 직접 받기
  // TODO: GET /api/analysis/summary 응답에서 straightQualityImprovement 받기
  // 스트레이트 구질 개선율 계산 (각도 변화로 계산)
  const straightQualityImprovement = useMemo(() => {
    if (swingHistory.length > 1) {
      // 첫 번째와 마지막 스윙의 각도 차이로 개선도 계산
      const firstAngle = swingHistory[0].averages.angle
      const lastAngle = swingHistory[swingHistory.length - 1].averages.angle
      const improvement = Math.abs(lastAngle - firstAngle) * 3
      return Math.round(improvement * 100) / 100 // 소수점 2자리
    }
    return 0
  }, [swingHistory])

  // 표시할 스윙 계산 (토글 상태 + 초기값)
  const visibleSwings = useMemo(() => {
    const initial: Record<number, boolean> = {}
    swingHistory.forEach((swing, index) => {
      // toggledSwings에 있으면 그 값 사용, 없으면 초기값 (첫 번째와 마지막만 true)
      if (toggledSwings[swing.swingNumber] !== undefined) {
        initial[swing.swingNumber] = toggledSwings[swing.swingNumber]
      } else {
        initial[swing.swingNumber] = index === 0 || index === swingHistory.length - 1
      }
    })
    return initial
  }, [swingHistory, toggledSwings])

  // 스윙 토글 핸들러
  const handleToggleSwing = (swingNumber: number) => {
    setToggledSwings(prev => ({
      ...prev,
      [swingNumber]: !(visibleSwings[swingNumber])
    }))
  }

  // 구질 추이 데이터 메모이제이션
  const ballQualityData = useMemo(() => getBallQualityData(swingHistory), [swingHistory])

  // 영상 분석 결과가 있는지 확인
  const hasVideoAnalysis = videoAnalysisResults && videoAnalysisResults.length > 0
  
  // 모든 영상 분석 결과에서 문제점을 추출하고 상위 3개 선택
  const top3Problems = useMemo(() => {
    if (!hasVideoAnalysis) return []
    
    // 모든 영상(정면/측면)의 문제점을 하나의 배열로 합치기
    const allProblems: any[] = []
    videoAnalysisResults.forEach((result) => {
      const problems = result.result?.value?.problems || []
      problems.forEach((problem: any) => {
        allProblems.push({
          ...problem,
          videoType: result.videoType, // 어느 영상에서 나온 문제인지 표시
        })
      })
    })
    
    // typeName 기준으로 중복 제거 (같은 문제가 정면/측면에서 모두 나와도 하나로 취급)
    // 단, 더 나쁜 점수(낮은 점수)를 가진 것을 유지
    const uniqueProblemsMap = new Map<string, any>()
    allProblems.forEach((problem) => {
      const typeName = problem.typeName
      if (!typeName) return // typeName이 없으면 스킵
      
      const existing = uniqueProblemsMap.get(typeName)
      if (!existing || (problem.score !== undefined && existing.score !== undefined && problem.score < existing.score)) {
        // 기존 문제가 없거나, 현재 문제가 더 나쁜 점수를 가지면 교체
        uniqueProblemsMap.set(typeName, problem)
      } else if (existing && problem.videoType && !existing.videoTypes) {
        // 여러 영상에서 같은 문제가 나온 경우, videoTypes 배열로 관리
        existing.videoTypes = [existing.videoType, problem.videoType]
        delete existing.videoType
      }
    })
    
    const uniqueProblems = Array.from(uniqueProblemsMap.values())
    
    console.log('[solution] 전체 문제점:', allProblems.length, '개')
    console.log('[solution] 중복 제거 후:', uniqueProblems.length, '개')
    console.log('[solution] 문제점 목록:', uniqueProblems.map(p => p.typeName || p.koreanName))
    
    // getTopNProblems가 점수순 정렬, koreanName, description, percentage 등을 모두 추가해줌
    return getTopNProblems(uniqueProblems, 3)
  }, [hasVideoAnalysis, videoAnalysisResults])
  
  // 영상 분석 결과 콘솔 로그
  useEffect(() => {
    console.log('=== 솔루션 페이지 디버깅 ===')
    console.log('videoAnalysisResults:', videoAnalysisResults)
    console.log('hasVideoAnalysis:', hasVideoAnalysis)
    console.log('top3Problems:', top3Problems)
    console.log('top3Problems.length:', top3Problems.length)
    
    if (hasVideoAnalysis) {
      console.log('✅ 영상 분석 결과 있음 - 실제 데이터 사용')
      videoAnalysisResults.forEach((result, index) => {
        console.log(`\n[${index + 1}] ${result.videoType} 영상:`)
        console.log('  - result_code:', result.result?.result_code)
        console.log('  - problems:', result.result?.value?.problems)
      })
      
      if (top3Problems.length === 0) {
        console.log('⚠️ 문제점이 추출되지 않음 - 데이터 구조 확인 필요')
      }
    } else {
      console.log('⚠️ 영상 분석 결과 없음 - Mock 데이터 사용')
    }
    console.log('============================')
  }, [hasVideoAnalysis, videoAnalysisResults, top3Problems])

  // 다시 스윙 (히스토리 유지)
  const handleRetrySwing = () => {
    console.log('[solution-handleRetrySwing] 다시 스윙하기 시작')
    setIsTransitioning(true)
    setFirstSwingProgress(0)
    setSecondSwingProgress(0)
    setStep('swing-first')
    Promise.resolve().then(() => {
      navigate('/analysis/swing')
    })
  }

  // 새로운 스윙 (히스토리 초기화)
  const handleNewSwing = () => {
    console.log('[solution-handleNewSwing] 새로운 스윙하기 시작')
    setIsTransitioning(true)
    resetSwingHistory()
    setFirstSwingProgress(0)
    setSecondSwingProgress(0)
    setStep('swing-first')
    Promise.resolve().then(() => {
      navigate('/analysis/swing')
    })
  }

  // 완료하기 (complete 페이지로 이동)
  const handleComplete = () => {
    console.log('[solution-handleComplete] 완료하기 시작')
    setIsTransitioning(true)
    setStep('complete')
    Promise.resolve().then(() => {
      navigate('/analysis/complete')
    })
  }

  // 영상/차트 전환 핸들러
  const handleSwitchView = () => {
    if (isVideoType) {
      // 영상형 → 차트형
      console.log('[solution] 영상형 → 차트형 전환')
      setStep('solution-chart')
    } else {
      // 차트형 → 영상형
      console.log('[solution] 차트형 → 영상형 전환')
      setStep('solution-video')
    }
  }

  // 전환 중이면 아무것도 렌더링하지 않음
  if (isTransitioning) {
    return <div />
  }

  // 영상형 렌더링
  if (isVideoType) {
    return (
      <>
        <div className="h-screen flex flex-col py-4 px-4 pb-32 overflow-hidden">
          {/* 상단: 전환 버튼 */}
          <div className="mb-4 text-center">
            <button
              onClick={handleSwitchView}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              차트 보기
            </button>
          </div>

          {/* 상단: 개선 결과 요약 */}
          <div className="mb-8 text-center animate-fade-in mx-auto w-4/5">
            <p className="text-lg md:text-xl text-gray-400 mb-2">
              GTS-AI SOLUTION이 함께 개선하면 예상되는 결과
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              {improvementsLoading ? (
                '개선 가능 수치 분석 중...'
              ) : improvements?.main_message ? (
                <>
                  회원님은,{' '}
                  {improvements.main_message.split(',').map((text, index, array) => {
                    const trimmed = text.trim()
                    // 퍼센티지 추출 및 반올림
                    const percentMatch = trimmed.match(/(\d+\.?\d*)%/)
                    if (percentMatch) {
                      const percent = Math.round(parseFloat(percentMatch[1]))
                      const beforePercent = trimmed.substring(0, percentMatch.index)
                      const afterPercent = trimmed.substring(percentMatch.index! + percentMatch[0].length)
                      return (
                        <span key={index}>
                          <span className="text-green-400 font-bold">
                            {beforePercent} {percent}%{afterPercent}
                          </span>
                          {index < array.length - 1 && ', '}
                        </span>
                      )
                    }
                    return (
                      <span key={index}>
                        <span className="text-green-400 font-bold">{trimmed}</span>
                        {index < array.length - 1 && ', '}
                      </span>
                    )
                  })}
                  {' 개선이 가능해요'}
                </>
              ) : improvements?.improvements ? (
                <>
                  회원님은, 
                  {improvements.improvements.distance?.improvable && (
                    <span className="text-red-400 font-bold"> 비거리 {Math.round(improvements.improvements.distance.improvable_percentage || 0)}%</span>
                  )}
                  {improvements.improvements.ball_flight?.improvable && (
                    <span className="text-cyan-400 font-bold">, {improvements.improvements.ball_flight.current} 구질 {Math.round(improvements.improvements.ball_flight.improvable_percentage || 0)}%</span>
                  )}
                  {' 개선이 가능해요'}
                </>
              ) : (
                '회원님은, 비거리 22.6%, 슬라이스 구질 15.8% 개선이 가능해요.'
              )}
            </h1>
          </div>

          {/* 상단: 문제점 영역 - 카드 구조 */}
          <div className="mb-12 mx-auto w-5/6">
            {hasVideoAnalysis ? (
              top3Problems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {top3Problems.map((problem, index) => {
                  const severityInfo = getSeverityInfo(problem.severity)
                  const isHighlighted = index === 0 // 첫 번째(가장 안좋은) 문제 강조
                  
                  return (
                    <div
                      key={problem.id}
                      className={`rounded-3xl overflow-hidden border-2 p-5 transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-linear-to-br from-green-500/20 to-green-400/10 border-green-400 shadow-lg shadow-green-500/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      {/* 문제점 이미지 */}
                      <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-slate-700">
                        {problem.evidenceImage ? (
                          // 실제 영상에서 추출한 프레임 사용
                          <img
                            src={`data:image/jpeg;base64,${problem.evidenceImage}`}
                            alt={problem.koreanName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // 프레임이 없을 경우 대체 UI
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">{problem.koreanName}</p>
                          </div>
                        )}
                        {/* 영상 타입 배지 */}
                        <div className="absolute top-2 right-2">
                          {problem.videoTypes && problem.videoTypes.length > 1 ? (
                            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                              📹 정면/측면
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                              {problem.videoType === 'front' ? '📹 정면' : problem.videoType === 'side' ? '📹 측면' : '📹'}
                            </span>
                          )}
                        </div>
                        {/* 심각도 배지 */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            severityInfo.color === 'red' ? 'bg-red-500/80 text-white' :
                            severityInfo.color === 'yellow' ? 'bg-yellow-500/80 text-black' :
                            'bg-blue-500/80 text-white'
                          }`}>
                            {severityInfo.koreanName}
                          </span>
                        </div>
                        {/* 프레임 번호 표시 */}
                        {problem.evidenceFrameNumber !== null && problem.evidenceFrameNumber !== undefined && (
                          <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                              🎬 프레임 {problem.evidenceFrameNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* 문제점 제목 */}
                      <h3 className={`text-lg font-bold mb-4 ${
                        isHighlighted ? 'text-green-300' : 'text-gray-200'
                      }`}>
                        {problem.koreanName}
                      </h3>
                      
                      {/* 설명 */}
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {problem.description}
                      </p>
                      
                      {/* 개선 가능 퍼센티지 */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-500">개선 가능</span>
                        <span className="text-2xl font-bold text-green-400">
                          {problem.percentage.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* 카테고리 */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-slate-700 rounded-full text-gray-300">
                          🏷️ {CATEGORY_NAMES[problem.category] || problem.category}
                        </span>
                        <span className="px-2 py-1 bg-slate-700 rounded-full text-gray-300">
                          📊 {problem.score?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              ) : (
                // 영상 분석 결과는 있지만 문제점이 없을 때
                <div className="text-center py-12">
                  <div className="inline-block p-6 bg-green-500/10 rounded-3xl border-2 border-green-500/30">
                    <svg className="w-20 h-20 mx-auto mb-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">완벽한 스윙입니다! 🎉</h3>
                    <p className="text-gray-300">AI가 감지한 문제점이 없습니다.</p>
                  </div>
                </div>
              )
            ) : (
              // 영상 분석 결과가 없을 때
              <div className="text-center py-12">
                <div className="inline-block p-6 bg-orange-500/10 rounded-3xl border-2 border-orange-500/30">
                  <svg className="w-20 h-20 mx-auto mb-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-orange-400 mb-2">영상 분석 결과 없음</h3>
                  <p className="text-gray-300 mb-4">영상 분석이 완료되지 않았거나 데이터를 불러올 수 없습니다.</p>
                  <button
                    onClick={handleRetrySwing}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    다시 스윙하기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 하단: 맞춤 솔루션 영상 */}
          <div className="flex-1 w-full flex flex-col min-h-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-100 mb-3 text-center flex-shrink-0">
              회원님을 위한 맞춤 솔루션 [ {(() => {
                // 문제점 단계별 분류
                const backswingProblems = ['Top', 'TopSway', 'TopReverse', 'TopUpright', 'TopArmsync', 'TopOverswing', 'TopFlat', 'TopSteep', 'TopLowHand', 'TopOverrotation']
                const downswingProblems = ['Down', 'DownSpinOut', 'DownSlide', 'DownDipping', 'DownCasting', 'DownOverTheTop']
                const impactProblems = ['Impact', 'ImpactChicken', 'ImpactFlip', 'ImpactScooping']
                const finishProblems = ['Finish', 'FinishBalance']
                
                // top3Problems에서 가장 많은 문제가 발생한 단계 찾기
                if (top3Problems.length === 0) {
                  return '백스윙 편'
                }
                
                let backswingCount = 0
                let downswingCount = 0
                let impactCount = 0
                let finishCount = 0
                
                top3Problems.forEach(problem => {
                  const typeName = problem.typeName || ''
                  if (backswingProblems.some(keyword => typeName.includes(keyword))) {
                    backswingCount++
                  } else if (downswingProblems.some(keyword => typeName.includes(keyword))) {
                    downswingCount++
                  } else if (impactProblems.some(keyword => typeName.includes(keyword))) {
                    impactCount++
                  } else if (finishProblems.some(keyword => typeName.includes(keyword))) {
                    finishCount++
                  }
                })
                
                // 가장 많은 문제가 발생한 단계 결정
                const maxCount = Math.max(backswingCount, downswingCount, impactCount, finishCount)
                if (maxCount === backswingCount && backswingCount > 0) {
                  return '백스윙 편'
                } else if (maxCount === downswingCount && downswingCount > 0) {
                  return '다운스윙 편'
                } else if (maxCount === impactCount && impactCount > 0) {
                  return '임팩트 편'
                } else if (maxCount === finishCount && finishCount > 0) {
                  return '피니시 편'
                }
                
                // 기본값
                return '백스윙 편'
              })()} ]
            </h2>

            {/* Swiper 슬라이더 */}
            <div className="flex-1 min-h-0">
              <Swiper
                modules={[FreeMode]}
                spaceBetween={12}
                slidesPerView={6}
                freeMode={true}
                breakpoints={{
                  640: { slidesPerView: 6 },
                  1024: { slidesPerView: 6 },
                  1280: { slidesPerView: 6 },
                }}
                className="h-full">
              {MOCK_VIDEOS.map((video) => (
                <SwiperSlide key={video.id}>
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="group relative h-full bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 transition-all w-full max-h-[280px]">
                    {/* 영상 썸네일 */}
                    {video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover pointer-events-none"
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          // 영상의 첫 프레임을 썸네일로 사용
                          const videoElement = e.currentTarget
                          try {
                            // 메타데이터 로드 후 첫 프레임으로 이동
                            if (videoElement.readyState >= 1) {
                              videoElement.currentTime = 0.1
                            }
                          } catch (error) {
                            console.error('[Solution] 썸네일 설정 실패:', error)
                          }
                        }}
                        onLoadedData={(e) => {
                          // 데이터 로드 후 첫 프레임으로 이동
                          const videoElement = e.currentTarget
                          try {
                            if (videoElement.readyState >= 2) {
                              videoElement.currentTime = 0.1
                            }
                          } catch (error) {
                            console.error('[Solution] 썸네일 데이터 로드 실패:', error)
                          }
                        }}
                        onSeeked={(e) => {
                          // 프레임 이동 완료 후 일시정지 (썸네일만 표시)
                          e.currentTarget.pause()
                        }}
                        onError={(e) => {
                          console.error('[Solution] 영상 썸네일 로드 실패:', video.videoUrl, e)
                        }}
                      />
                    ) : video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-800 to-slate-900">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <p className="text-gray-400 text-sm px-4">{video.title}</p>
                        </div>
                      </div>
                    )}

                    {/* 재생 버튼 오버레이 */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>

                    {/* 제목 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                      <p className="text-white font-semibold text-sm">{video.title}</p>
                    </div>
                  </button>
                </SwiperSlide>
              ))}
              </Swiper>
            </div>
          </div>

          {/* 하단: 다시 스윙하러가기 버튼 */}
          <div className="mt-4 mb-20 text-center mx-auto flex-shrink-0">
            <button
              onClick={handleRetrySwing}
              className="px-12 py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
              다시 스윙하러가기
            </button>
          </div>
        </div>

        {/* 영상 모달 */}
        <VideoContentModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo?.videoUrl || ''}
          title={selectedVideo?.title || ''}
        />

        {/* 애니메이션 CSS */}
        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }

          /* Swiper 커스텀 스타일 */
          .swiper-button-next,
          .swiper-button-prev {
            display: none !important;
          }

          .swiper-pagination {
            display: none !important;
          }
        `}</style>
      </>
    )
  }

  // 차트형 렌더링
  return (
    <div className="min-h-screen w-full flex flex-col py-8 px-4 pb-32 overflow-auto">
      {/* 상단: 전환 버튼 */}
      <div className="mb-4 text-center">
        <button
          onClick={handleSwitchView}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          영상 보기
        </button>
      </div>

      {/* 상단: 개선 결과 요약 */}
      <div className="mb-16 text-center animate-fade-in">
        <p className="text-lg md:text-xl text-gray-400 mb-2">
          {swingHistory.length > 0 ? `${swingHistory[0].swingNumber}~${swingHistory[swingHistory.length - 1].swingNumber}번째 스윙` : '0번째 스윙'} 완료! 지금까지의 데이터를 비교 분석한 결과입니다
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
          {improvementsLoading ? (
            '개선 가능 수치 분석 중...'
          ) : improvements?.main_message ? (
            <>
              회원님은,{' '}
              {improvements.main_message.split(',').map((text, index, array) => {
                const trimmed = text.trim()
                // 퍼센티지 추출 및 반올림
                const percentMatch = trimmed.match(/(\d+\.?\d*)%/)
                if (percentMatch) {
                  const percent = Math.round(parseFloat(percentMatch[1]))
                  const beforePercent = trimmed.substring(0, percentMatch.index)
                  const afterPercent = trimmed.substring(percentMatch.index! + percentMatch[0].length)
                  
                  // 텍스트 내용에 따라 색상 결정
                  const isDistance = beforePercent.includes('비거리')
                  const isAccuracy = beforePercent.includes('정확도') || beforePercent.includes('푸쉬') || beforePercent.includes('풀') || beforePercent.includes('구질') || beforePercent.includes('슬라이스') || beforePercent.includes('훅') || beforePercent.includes('스핀') || beforePercent.includes('런치각')
                  const colorClass = isDistance ? 'text-red-400' : isAccuracy ? 'text-cyan-400' : 'text-green-400'
                  
                  return (
                    <span key={index}>
                      {beforePercent}{' '}
                      <span className={`${colorClass} font-bold`}>
                        {percent}%
                      </span>
                      {afterPercent}
                      {index < array.length - 1 && ', '}
                    </span>
                  )
                }
                return (
                  <span key={index}>
                    <span className="text-green-400 font-bold">{trimmed}</span>
                    {index < array.length - 1 && ', '}
                  </span>
                )
              })}
              {' 개선이 가능해요'}
            </>
          ) : improvements?.improvements ? (
            <>
              회원님은, 
              {improvements.improvements.distance?.improvable && (
                <span className="text-red-400 font-bold"> 비거리 {Math.round(improvements.improvements.distance.improvable_percentage || 0)}%</span>
              )}
              {improvements.improvements.ball_flight?.improvable && (
                <span className="text-cyan-400 font-bold">, {improvements.improvements.ball_flight.current} 구질 {Math.round(improvements.improvements.ball_flight.improvable_percentage || 0)}%</span>
              )}
              {' 개선이 가능해요'}
            </>
          ) : (
            <>
              회원님은, <span className={improvementRate > 0 ? 'text-green-400' : 'text-red-400'}>비거리 {improvementRate > 0 ? '+' : ''}{Number(improvementRate.toFixed(2))}%</span>, <span className="text-cyan-400">정확도 {Number((16.0).toFixed(2))}%</span> 개선되었어요!
            </>
          )}
        </h1>
      </div>

      {/* 중앙: 비교 차트 */}
      <div className="flex-1 mx-auto w-full space-y-12">
        {/* 1. 비거리 추이 차트 */}
        <div className='w-full'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-100">
              비거리 추이 ({swingHistory.length > 0 ? `${swingHistory[0].swingNumber}~${swingHistory[swingHistory.length - 1].swingNumber}회차` : '0회차'})
            </h2>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-purple-500/5 rounded-xl px-4 py-3 border border-purple-400/50">
                <p className="text-xs text-gray-400">첫 번째 평균</p>
                <p className="text-base font-bold text-purple-400">
                  {firstSwingAverage}m
                </p>
              </div>
              {(() => {
                const lastSwingIndex = Math.max(0, swingHistory.length - 1)
                const lastSwingColor = colors[lastSwingIndex % colors.length]
                return (
                  <div
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      backgroundColor: `${lastSwingColor}11`,
                      borderColor: `${lastSwingColor}80`
                    }}>
                    <p className="text-xs text-gray-400">마지막 평균</p>
                    <p className="text-base font-bold" style={{ color: lastSwingColor }}>
                      {lastSwingAverage}m
                    </p>
                  </div>
                )
              })()}
              <div className={`rounded-xl px-4 py-3 border ${improvementRate > 0 ? 'bg-green-500/5 border-green-400/50' : 'bg-red-500/5 border-red-400/50'}`}>
                <p className="text-xs text-gray-400">개선도</p>
                <p className={`text-base font-bold ${improvementRate > 0 ? 'text-green-400' : 'text-red-400'}`}>{improvementRate > 0 ? '+' : ''}{improvementRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700">
            {/* 범례 - 인터랙티브 토글 버튼 */}
            <div className="flex gap-3 flex-wrap mb-6">
              {swingHistory.map((swing, index) => {
                const color = colors[index % colors.length]
                const isVisible = visibleSwings[swing.swingNumber]

                return (
                  <button
                    key={`legend-${swing.swingNumber}`}
                    onClick={() => handleToggleSwing(swing.swingNumber)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full
                      border-2 transition-all duration-300
                      cursor-pointer hover:scale-105
                      ${isVisible
                        ? 'bg-linear-to-r from-green-500/20 to-emerald-600/20 border-green-400 shadow-md shadow-green-500/30'
                        : 'bg-slate-800/50 border-slate-600 opacity-50 hover:opacity-70'
                      }
                    `}
                    aria-pressed={isVisible}
                    aria-label={`${swing.swingNumber}번째 스윙 ${isVisible ? '숨기기' : '보기'}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full transition-opacity ${isVisible ? 'opacity-100' : 'opacity-40'}`}
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className={`text-sm font-semibold transition-colors ${isVisible ? 'text-gray-100' : 'text-gray-500'}`}>
                      {swing.swingNumber}번째 스윙
                    </span>
                  </button>
                )
              })}
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={getDistanceTrendData(swingHistory)}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="shot"
                  stroke="#94a3b8"
                  style={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  label={{ value: '거리 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  style={{ fontSize: '14px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => `${Number(value).toFixed(2)}m`}
                />
                {/* 동적으로 각 스윙마다 Line 추가 - 가시성 필터링 */}
                {swingHistory
                  .filter(swing => visibleSwings[swing.swingNumber])
                  .map((swing) => {
                    const originalIndex = swingHistory.indexOf(swing)
                    const color = colors[originalIndex % colors.length]
                    return (
                      <Line
                        key={`swing-${swing.swingNumber}`}
                        type="monotone"
                        dataKey={`swing${swing.swingNumber}`}
                        stroke={color}
                        name={`${swing.swingNumber}번째 스윙`}
                        dot={{ fill: color, r: 5 }}
                        activeDot={{ r: 7 }}
                        isAnimationActive={false}
                        strokeWidth={2}
                      />
                    )
                  })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 구질 추이 차트 - Swiper 슬라이더 (FreeMode, 최신 스윙 순서) */}
        <div className='w-full'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-100">
              구질 추이 ({swingHistory.length > 0 ? `${swingHistory[0].swingNumber}~${swingHistory[swingHistory.length - 1].swingNumber}회차` : '0회차'})
            </h2>
            <div className={`rounded-xl px-4 py-3 border ${straightQualityImprovement > 0 ? 'bg-green-500/5 border-green-400/50' : 'bg-red-500/5 border-red-400/50'}`}>
              <p className="text-xs text-gray-400 mb-1">스트레이트 구질 개선</p>
              <p className={`text-lg font-bold ${straightQualityImprovement > 0 ? 'text-green-400' : 'text-red-400'}`}>{straightQualityImprovement > 0 ? '+' : ''}{Number(straightQualityImprovement.toFixed(2))}%</p>
            </div>
          </div>

          {/* Swiper 슬라이더 - 최신 스윙이 앞에 */}
          <Swiper
            modules={[FreeMode]}
            spaceBetween={16}
            slidesPerView={1.2}
            freeMode={true}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 2 },
              1280: { slidesPerView: 2.2 },
            }}
            className="pb-8">
            {ballQualityData.map((swingItem, index) => {
              // 비거리 추이와 동일한 색상 매핑 (originalIndex 기준)
              const colorIndex = swingItem.originalIndex
              const scatterColor = colors[colorIndex % colors.length]

              return (
                <SwiperSlide key={`quality-${index}`}>
                  <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 h-full">
                    <h3 className="text-lg font-bold mb-4 text-center" style={{ color: scatterColor }}>
                      {swingItem.swingIndex}번째 스윙
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <ScatterChart margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                        <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="lateralOffset"
                          stroke="#94a3b8"
                          domain={[-6, 6]}
                          tick={false}
                        />
                        <YAxis
                          type="number"
                          dataKey="actualDistance"
                          stroke="#94a3b8"
                          label={{
                            value: '거리 (m)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#94a3b8',
                          }}
                          style={{ fontSize: '12px', fontWeight: 'bold' }}
                          domain={[180, 280]}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                              const data = payload[0].payload as {
                                swing: number
                                targetDistance: number
                                actualDistance: number
                                lateralOffset: number
                              }
                              const direction =
                                data.lateralOffset < 0 ? 'LEFT' : data.lateralOffset > 0 ? 'RIGHT' : 'CENTER'
                              return (
                                <div className="bg-slate-900 p-3 rounded border border-slate-600">
                                  <p className="text-gray-300 text-sm">스윙 {data.swing}회</p>
                                  <p style={{ color: scatterColor }} className="text-sm">거리: {Number(data.actualDistance).toFixed(2)}m</p>
                                  <p style={{ color: scatterColor }} className="text-sm opacity-80">
                                    방향: {direction} {Number(Math.abs(data.lateralOffset)).toFixed(2)}m
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Scatter data={swingItem.data} fill={scatterColor} fillOpacity={0.7} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>

      </div>

      {/* 하단: 버튼 (3개) */}
      <div className="mt-20 mb-20 flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleNewSwing}
          className="px-8 py-4 bg-linear-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-blue-500/50">
          새로운 스윙하기
        </button>

        <button
          onClick={handleRetrySwing}
          className="px-8 py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
          다시 스윙하기
        </button>

        <button
          onClick={handleComplete}
          className="px-8 py-4 bg-linear-to-r from-purple-500 to-purple-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/50">
          완료하기
        </button>
      </div>
    </div>
  )
}

export default SolutionPage
