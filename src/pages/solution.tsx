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
import { useSessionStore, selectCurrentStep, selectSwingHistory } from '@/features/golf-session/model/sessionStore'
import { VideoContentModal } from '@/features/golf-session/ui/VideoContentModal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { SwingData } from '@/features/golf-session/types/session.type'
import { SWING_COUNT_PER_SESSION } from '@/shared/constants/swing'

// 🔗 API 연동 지점 3: 문제점 데이터 조회
// TODO: GET /api/analysis/problems 에서 동적으로 로드
// 현재는 MOCK_PROBLEMS 사용, API 연동 후 제거
const MOCK_PROBLEMS = [
  {
    id: 1,
    title: '백스윙이 감지되어있어요',
    percentage: 45.2,
    shots: [
      { id: 's1', image: '', label: '샷 1' },
      { id: 's2', image: '', label: '샷 2' },
      { id: 's3', image: '', label: '샷 3' },
    ],
  },
  {
    id: 2,
    title: '스윙 자세가 감지되어있어요',
    percentage: 28.7,
    shots: [
      { id: 's4', image: '', label: '샷 1' },
      { id: 's5', image: '', label: '샷 2' },
      { id: 's6', image: '', label: '샷 3' },
    ],
  },
  {
    id: 3,
    title: '임팩트가 감지되어있어요',
    percentage: 16.3,
    shots: [
      { id: 's7', image: '', label: '샷 1' },
      { id: 's8', image: '', label: '샷 2' },
      { id: 's9', image: '', label: '샷 3' },
    ],
  },
]

// 🔗 API 연동 지점 4: 솔루션 영상 데이터 조회
// TODO: GET /api/analysis/videos/{problemId} 에서 동적으로 로드
// 현재는 MOCK_VIDEOS 사용, API 연동 후 제거
const MOCK_VIDEOS = [
  { id: '1', title: '백스윙 교정 영상 1', thumbnail: '', videoUrl: '', status: 'correct' },
  { id: '2', title: '백스윙 교정 영상 2', thumbnail: '', videoUrl: '', status: 'incorrect' },
  { id: '3', title: '백스윙 교정 영상 3', thumbnail: '', videoUrl: '', status: 'correct' },
  { id: '4', title: '백스윙 교정 영상 4', thumbnail: '', videoUrl: '', status: 'correct' },
  { id: '5', title: '백스윙 교정 영상 5', thumbnail: '', videoUrl: '', status: 'incorrect' },
  { id: '6', title: '백스윙 교정 영상 6', thumbnail: '', videoUrl: '', status: 'correct' },
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
      if (swing.measurements[i]) {
        point[`swing${swing.swingNumber}`] = swing.averages.distance || (200 + Math.random() * 70)
      }
    })

    return point
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
  // 🔗 API 연동 후: 다음 2개 라인 제거하고 API 응답으로 대체
  // TODO: GET /api/swings/history 에서 swingHistory 받기
  const swingHistory = useSessionStore(selectSwingHistory)
  const { setStep, setFirstSwingProgress, setSecondSwingProgress, resetSwingHistory } = useSessionStore()
  const [selectedVideo, setSelectedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 색상 배열 (비거리추이와 동일하게 사용)
  const colors = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

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

  useEffect(() => {
    // swing 단계에서 넘어오는 경우를 허용하기 위해 조건 변경
    console.log('[solution] 첫 번째 useEffect, currentStep:', currentStep)

    if (
      currentStep !== 'solution-video' &&
      currentStep !== 'solution-chart' &&
      currentStep !== 'swing-first' &&
      currentStep !== 'swing-second'
    ) {
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

  // 구질 추이 데이터 메모이제이션
  const ballQualityData = useMemo(() => getBallQualityData(swingHistory), [swingHistory])

  // 비디오형: 다시 스윙하러가기 (두 번째 스윙으로)
  const handleGoToSwing = () => {
    setIsTransitioning(true)
    setStep('swing-second')
    setSecondSwingProgress(0)
    // isTransitioning이 true이므로 아무 UI도 렌더링되지 않음
    Promise.resolve().then(() => {
      navigate('/swing')
    })
  }

  // 차트형: 다시 스윙 (데이터 유지, swing-second로)
  const handleRetrySwing = () => {
    console.log('[solution-handleRetrySwing] 다시 스윙하기 시작')
    setIsTransitioning(true)
    setSecondSwingProgress(0)
    setStep('swing-second')
    Promise.resolve().then(() => {
      navigate('/swing')
    })
  }

  // 차트형: 새로운 스윙 (히스토리 초기화)
  const handleNewSwing = () => {
    console.log('[solution-handleNewSwing] 새로운 스윙하기 시작')
    setIsTransitioning(true)
    resetSwingHistory()
    setFirstSwingProgress(0)
    setSecondSwingProgress(0)
    setStep('swing-first')
    Promise.resolve().then(() => {
      navigate('/swing')
    })
  }

  // 차트형: 완료하기 (complete 페이지로 이동)
  const handleComplete = () => {
    console.log('[solution-handleComplete] 완료하기 시작')
    setIsTransitioning(true)
    setStep('complete')
    Promise.resolve().then(() => {
      navigate('/complete')
    })
  }

  const isVideoType = currentStep === 'solution-video'

  // 전환 중이면 아무것도 렌더링하지 않음
  if (isTransitioning) {
    return <div />
  }

  // 영상형 렌더링
  if (isVideoType) {
    return (
      <>
        <div className="min-h-screen flex flex-col py-8 px-4 overflow-auto">
          {/* 상단: 개선 결과 요약 */}
          <div className="mb-8 text-center animate-fade-in mx-auto w-4/5">
            <p className="text-lg md:text-xl text-gray-400 mb-2">
              GTS-AI SOLUTION이 함께 개선하면 예상되는 결과
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
              회원님은, <span className="text-purple-400">비거리 22.6%</span>, <span className="text-cyan-400">슬라이스 구질 15.8%</span> 개선이 가능해요.
            </h1>
          </div>

          {/* 상단: 문제점 영역 - 카드 구조 */}
          <div className="mb-12 mx-auto w-5/6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_PROBLEMS.map((problem, index) => (
                <div
                  key={problem.id}
                  className={`rounded-3xl overflow-hidden border-2 p-5 transition-all duration-300 ${
                    index === 0
                      ? 'bg-gradient-to-br from-green-500/20 to-green-400/10 border-green-400 shadow-lg shadow-green-500/30'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}>
                  {/* 문제점 제목 */}
                  <h3 className={`text-lg font-bold mb-4 ${
                    index === 0
                      ? 'text-green-400'
                      : 'text-gray-200'
                  }`}>
                    {problem.title}
                  </h3>

                  {/* 문제점 이미지 1개 (직사각형 비율 - 세로가 길게) */}
                  <div className="w-full aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center">
                    {problem.shots[0]?.image ? (
                      <img src={problem.shots[0].image} alt={problem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-gray-500 text-sm">{problem.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단: 맞춤 솔루션 영상 */}
          <div className="flex-1 w-full mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-100 mb-4 text-center">
              회원님을 위한 맞춤 솔루션 [ 백스윙 편 ]
            </h2>

            {/* Swiper 슬라이더 */}
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              slidesPerView={4.2}
              freeMode={true}
              breakpoints={{
                640: { slidesPerView: 4.2 },
                1024: { slidesPerView: 4.2 },
                1280: { slidesPerView: 4.2 },
              }}
              className="pb-12">
              {MOCK_VIDEOS.map((video) => (
                <SwiperSlide key={video.id}>
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="group relative aspect-[9/16] bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 transition-all w-full">
                    {/* 썸네일 */}
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white font-semibold text-sm">{video.title}</p>
                    </div>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* 하단: 다시 스윙하러가기 버튼 */}
          <div className="mt-8 text-center mx-auto">
            <button
              onClick={handleGoToSwing}
              className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
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
    <div className="min-h-screen w-4/5 flex flex-col py-8 px-4 overflow-auto">
      {/* 상단: 개선 결과 요약 */}
      <div className="mb-16 text-center animate-fade-in">
        <p className="text-lg md:text-xl text-gray-400 mb-2">
          {swingHistory.length > 0 ? swingHistory[swingHistory.length - 1].swingNumber : 0}번째 스윙 완료! 지금까지의 데이터를 비교 분석한 결과입니다
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
          회원님은, <span className={improvementRate > 0 ? 'text-green-400' : 'text-red-400'}>비거리 {improvementRate > 0 ? '+' : ''}{Number(improvementRate.toFixed(2))}%</span>, <span className="text-cyan-400">정확도 {Number((16.0).toFixed(2))}%</span> 개선되었어요!
        </h1>
      </div>

      {/* 중앙: 비교 차트 */}
      <div className="flex-1 mx-auto w-full space-y-12">
        {/* 1. 비거리 추이 차트 */}
        <div className='w-full'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-100">
              비거리 추이 ({swingHistory.length > 0 ? swingHistory[swingHistory.length - 1].swingNumber : 0}회차)
            </h2>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-slate-800/70 rounded-xl px-4 py-3 border border-purple-400/30">
                <p className="text-xs text-gray-400">첫 번째 평균</p>
                <p className="text-base font-bold text-purple-400">
                  {firstSwingAverage}m
                </p>
              </div>
              <div className="bg-slate-800/70 rounded-xl px-4 py-3 border border-cyan-400/30">
                <p className="text-xs text-gray-400">마지막 평균</p>
                <p className="text-base font-bold text-cyan-400">
                  {lastSwingAverage}m
                </p>
              </div>
              <div className={`bg-slate-800/70 rounded-xl px-4 py-3 border ${improvementRate > 0 ? 'border-green-400/30' : 'border-red-400/30'}`}>
                <p className="text-xs text-gray-400">개선도</p>
                <p className={`text-base font-bold ${improvementRate > 0 ? 'text-green-400' : 'text-red-400'}`}>{improvementRate > 0 ? '+' : ''}{improvementRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700">
            {/* 범례 */}
            <div className="flex gap-4 flex-wrap mb-6">
              {swingHistory.map((swing, index) => {
                const chartColors = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
                const color = chartColors[index % chartColors.length]
                return (
                  <div key={`legend-${swing.swingNumber}`} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm text-gray-300">{swing.swingNumber}번째 스윙</span>
                  </div>
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
                {/* 동적으로 각 스윙마다 Line 추가 */}
                {swingHistory.map((swing, index) => {
                  const colors = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
                  const color = colors[index % colors.length]
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
              구질 추이 ({swingHistory.length > 0 ? swingHistory[swingHistory.length - 1].swingNumber : 0}회차)
            </h2>
            <div className={`bg-slate-800/70 rounded-xl px-4 py-3 border ${straightQualityImprovement > 0 ? 'border-green-400/30' : 'border-red-400/30'}`}>
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
      <div className="mt-20 flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleNewSwing}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-blue-500/50">
          새로운 스윙하기
        </button>

        <button
          onClick={handleRetrySwing}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
          다시 스윙하기
        </button>

        <button
          onClick={handleComplete}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-purple-500/50">
          완료하기
        </button>
      </div>
    </div>
  )
}

export default SolutionPage
