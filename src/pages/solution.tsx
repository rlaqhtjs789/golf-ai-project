/**
 * 솔루션 페이지
 *
 * @route /solution
 *
 * 타입:
 * 1. 영상형 (solution-video): 첫 번째 스윙 후 - 영상 썸네일 + 모달
 * 2. 차트형 (solution-chart): 두 번째 스윙 후 - 비교 차트
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore, selectCurrentStep } from '@/features/golf-session/model/sessionStore'
import { VideoContentModal } from '@/features/golf-session/ui/VideoContentModal'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// 임시 문제점 데이터 (1~3개)
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

// 임시 영상 데이터
const MOCK_VIDEOS = [
  { id: '1', title: '백스윙 교정 영상 1', thumbnail: '', videoUrl: '', status: 'correct' },
  { id: '2', title: '백스윙 교정 영상 2', thumbnail: '', videoUrl: '', status: 'incorrect' },
  { id: '3', title: '백스윙 교정 영상 3', thumbnail: '', videoUrl: '', status: 'correct' },
  { id: '4', title: '백스윙 교정 영상 4', thumbnail: '', videoUrl: '', status: 'correct' },
  { id: '5', title: '백스윙 교정 영상 5', thumbnail: '', videoUrl: '', status: 'incorrect' },
  { id: '6', title: '백스윙 교정 영상 6', thumbnail: '', videoUrl: '', status: 'correct' },
]

// 임시 비거리 추이 데이터 (첫 번째 vs 두 번째 스윙) - 미터 단위
const DISTANCE_TREND_DATA = [
  { shot: '1회차', firstSwing: 210, secondSwing: 220 },
  { shot: '2회차', firstSwing: 205, secondSwing: 232 },
  { shot: '3회차', firstSwing: 215, secondSwing: 240 },
  { shot: '4회차', firstSwing: 210, secondSwing: 245 },
  { shot: '5회차', firstSwing: 218, secondSwing: 238 },
  { shot: '6회차', firstSwing: 208, secondSwing: 250 },
  { shot: '7회차', firstSwing: 212, secondSwing: 244 },
  { shot: '8회차', firstSwing: 207, secondSwing: 242 },
  { shot: '9회차', firstSwing: 216, secondSwing: 255 },
  { shot: '10회차', firstSwing: 210, secondSwing: 260 },
]

// 임시 구질 추이 데이터 (첫 번째 스윙 - 목표거리 vs 실제거리)
const FIRST_SWING_QUALITY_DATA = [
  { swing: 1, targetDistance: 200, actualDistance: 195, lateralOffset: -3 },
  { swing: 2, targetDistance: 200, actualDistance: 205, lateralOffset: 2 },
  { swing: 3, targetDistance: 210, actualDistance: 215, lateralOffset: 5 },
  { swing: 4, targetDistance: 210, actualDistance: 210, lateralOffset: -1 },
  { swing: 5, targetDistance: 220, actualDistance: 218, lateralOffset: 4 },
  { swing: 6, targetDistance: 200, actualDistance: 208, lateralOffset: -2 },
  { swing: 7, targetDistance: 210, actualDistance: 212, lateralOffset: 3 },
  { swing: 8, targetDistance: 200, actualDistance: 207, lateralOffset: 1 },
  { swing: 9, targetDistance: 220, actualDistance: 216, lateralOffset: 6 },
  { swing: 10, targetDistance: 210, actualDistance: 210, lateralOffset: -4 },
]

// 임시 구질 추이 데이터 (두 번째 스윙 - 목표거리 vs 실제거리)
const SECOND_SWING_QUALITY_DATA = [
  { swing: 1, targetDistance: 200, actualDistance: 220, lateralOffset: 1 },
  { swing: 2, targetDistance: 200, actualDistance: 232, lateralOffset: -1 },
  { swing: 3, targetDistance: 210, actualDistance: 240, lateralOffset: 2 },
  { swing: 4, targetDistance: 210, actualDistance: 245, lateralOffset: 0 },
  { swing: 5, targetDistance: 220, actualDistance: 238, lateralOffset: -3 },
  { swing: 6, targetDistance: 200, actualDistance: 250, lateralOffset: 1 },
  { swing: 7, targetDistance: 210, actualDistance: 244, lateralOffset: 2 },
  { swing: 8, targetDistance: 200, actualDistance: 242, lateralOffset: -2 },
  { swing: 9, targetDistance: 220, actualDistance: 255, lateralOffset: 1 },
  { swing: 10, targetDistance: 210, actualDistance: 260, lateralOffset: 0 },
]


function SolutionPage() {
  const navigate = useNavigate()
  const currentStep = useSessionStore(selectCurrentStep)
  const { setStep, setFirstSwingProgress, setSecondSwingProgress } = useSessionStore()
  const [selectedVideo, setSelectedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

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
    }
  }, [currentStep, navigate])

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

  // 차트형: 다시 스윙 연습하기 (첫 번째 스윙으로 초기화)
  const handleRetrySwing = () => {
    console.log('[solution-handleRetrySwing] 시작')
    console.log('[solution-handleRetrySwing] currentStep:', currentStep)
    setIsTransitioning(true)
    setFirstSwingProgress(0)
    console.log('[solution-handleRetrySwing] setFirstSwingProgress(0) 호출')
    setStep('swing-first')
    console.log('[solution-handleRetrySwing] setStep(swing-first) 호출')
    // isTransitioning이 true이므로 아무 UI도 렌더링되지 않음
    Promise.resolve().then(() => {
      console.log('[solution-handleRetrySwing] Promise.then 에서 navigate 호출')
      navigate('/swing')
    })
  }

  // 홈으로 이동
  const handleGoHome = () => {
    navigate('/')
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
          두 번째 스윙 완료! 첫 번째 스윙과 비교한 결과입니다
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
          회원님은, <span className="text-purple-400">비거리 22.8%</span>, <span className="text-cyan-400">정확도 16.0%</span> 개선되었어요!
        </h1>
      </div>

      {/* 중앙: 비교 차트 */}
      <div className="flex-1 mx-auto w-full space-y-12">
        {/* 1. 비거리 추이 차트 */}
        <div className='w-full'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-100">
              비거리 추이
            </h2>
            <div className="flex gap-3 flex-wrap">
              <div className="bg-slate-800/70 rounded-xl px-3 py-2 border border-purple-400/30">
                <p className="text-xs text-gray-400">첫 번째 평균</p>
                <p className="text-base font-bold text-purple-400">213m</p>
              </div>
              <div className="bg-slate-800/70 rounded-xl px-3 py-2 border border-cyan-400/30">
                <p className="text-xs text-gray-400">두 번째 평균</p>
                <p className="text-base font-bold text-cyan-400">244m</p>
              </div>
              <div className="bg-slate-800/70 rounded-xl px-3 py-2 border border-green-400/30">
                <p className="text-xs text-gray-400">개선도</p>
                <p className="text-base font-bold text-green-400">+14.6%</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={DISTANCE_TREND_DATA}
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
                  formatter={(value) => `${value}m`}
                />
                <Line
                  type="monotone"
                  dataKey="firstSwing"
                  stroke="#a855f7"
                  strokeDasharray="5 5"
                  name="첫 번째 스윙 (BEFORE)"
                  dot={{ fill: '#a855f7', r: 5 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="secondSwing"
                  stroke="#06b6d4"
                  strokeDasharray="5 5"
                  name="두 번째 스윙 (AFTER)"
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 구질 추이 차트 - 두 개의 차트 (좌우 나뉨) */}
        <div className='w-full'>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-100">
              구질 추이
            </h2>
            <div className="bg-slate-800/70 rounded-xl px-4 py-3 border border-green-400/30">
              <p className="text-xs text-gray-400 mb-1">스트레이트 구질 개선</p>
              <p className="text-lg font-bold text-green-400">+25.3%</p>
              <p className="text-xs text-gray-400 mt-1">첫번째: 30% → 두번째: 55%</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 첫 번째 스윙 */}
            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-purple-400 mb-4 text-center">
                첫 번째 스윙 (BEFORE)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart
                  margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
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
                    label={{ value: '거리 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                    domain={[190, 230]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.2)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload as { swing: number; targetDistance: number; actualDistance: number; lateralOffset: number }
                        const direction = data.lateralOffset < 0 ? 'LEFT' : data.lateralOffset > 0 ? 'RIGHT' : 'CENTER'
                        return (
                          <div className="bg-slate-900 p-3 rounded border border-slate-600">
                            <p className="text-gray-300 text-sm">스윙 {data.swing}회</p>
                            <p className="text-purple-400 text-sm">거리: {data.actualDistance}m</p>
                            <p className="text-purple-300 text-sm">방향: {direction} {Math.abs(data.lateralOffset)}m</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter
                    data={FIRST_SWING_QUALITY_DATA}
                    fill="#a855f7"
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* 오른쪽: 두 번째 스윙 */}
            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 text-center">
                두 번째 스윙 (AFTER)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart
                  margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
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
                    label={{ value: '거리 (m)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                    domain={[190, 230]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    cursor={{ fill: 'rgba(6, 182, 212, 0.2)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload as { swing: number; targetDistance: number; actualDistance: number; lateralOffset: number }
                        const direction = data.lateralOffset < 0 ? 'LEFT' : data.lateralOffset > 0 ? 'RIGHT' : 'CENTER'
                        return (
                          <div className="bg-slate-900 p-3 rounded border border-slate-600">
                            <p className="text-gray-300 text-sm">스윙 {data.swing}회</p>
                            <p className="text-cyan-400 text-sm">거리: {data.actualDistance}m</p>
                            <p className="text-cyan-300 text-sm">방향: {direction} {Math.abs(data.lateralOffset)}m</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter
                    data={SECOND_SWING_QUALITY_DATA}
                    fill="#06b6d4"
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* 하단: 버튼 */}
      <div className="mt-20 flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleRetrySwing}
          className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
          다시 스윙 연습하기
        </button>

        <button
          onClick={handleGoHome}
          className="px-8 py-4 bg-slate-700 text-white font-bold text-lg rounded-xl hover:bg-slate-600 transition-colors">
          처음으로
        </button>
      </div>
    </div>
  )
}

export default SolutionPage
