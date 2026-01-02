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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

// 임시 비교 데이터 (첫 번째 스윙 vs 두 번째 스윙)
const MOCK_COMPARISON_DATA = [
  {
    metric: '클럽 스피드',
    unit: 'mph',
    첫번째: 95.2,
    두번째: 102.8,
    improvement: '+8.0%',
  },
  {
    metric: '볼 스피드',
    unit: 'mph',
    첫번째: 138.5,
    두번째: 152.3,
    improvement: '+10.0%',
  },
  {
    metric: '발사각',
    unit: '°',
    첫번째: 12.3,
    두번째: 14.7,
    improvement: '+19.5%',
  },
  {
    metric: '스매시 팩터',
    unit: '',
    첫번째: 1.45,
    두번째: 1.48,
    improvement: '+2.1%',
  },
  {
    metric: '비거리',
    unit: 'yard',
    첫번째: 215,
    두번째: 264,
    improvement: '+22.8%',
  },
  {
    metric: '정확도',
    unit: '%',
    첫번째: 68.2,
    두번째: 79.1,
    improvement: '+16.0%',
  },
]

function SolutionPage() {
  const navigate = useNavigate()
  const currentStep = useSessionStore(selectCurrentStep)
  const { setStep, setSecondSwingProgress } = useSessionStore()
  const [selectedVideo, setSelectedVideo] = useState<typeof MOCK_VIDEOS[0] | null>(null)

  useEffect(() => {
    // swing 단계에서 넘어오는 경우를 허용하기 위해 조건 변경
    if (
      currentStep !== 'solution-video' &&
      currentStep !== 'solution-chart' &&
      currentStep !== 'swing-first' &&
      currentStep !== 'swing-second'
    ) {
      navigate('/')
    }
  }, [currentStep, navigate])

  // swing 단계에서 진입한 경우 올바른 solution 단계로 설정
  useEffect(() => {
    if (currentStep === 'swing-first') {
      setStep('solution-video')
    } else if (currentStep === 'swing-second') {
      setStep('solution-chart')
    }
  }, [currentStep, setStep])

  const isVideoType = currentStep === 'solution-video'

  // 다시 스윙하러가기
  const handleGoToSwing = () => {
    setStep('swing-second')
    setSecondSwingProgress(0)
    navigate('/swing')
  }

  // 완료 (마지막 페이지로)
  const handleComplete = () => {
    setStep('complete')
    navigate('/complete')
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
    <div className="min-h-screen flex flex-col py-8 px-4 overflow-auto">
      {/* 상단: 개선 결과 요약 */}
      <div className="mb-8 text-center animate-fade-in">
        <p className="text-lg md:text-xl text-gray-400 mb-2">
          두 번째 스윙 완료! 첫 번째 스윙과 비교한 결과입니다
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
          회원님은, <span className="text-purple-400">비거리 22.8%</span>, <span className="text-cyan-400">정확도 16.0%</span> 개선되었어요!
        </h1>
      </div>

      {/* 중앙: 비교 차트 */}
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-6 text-center">
          스윙 측정값 비교 분석
        </h2>

        {/* 차트 영역 */}
        <div className="bg-slate-800/50 rounded-3xl p-6 md:p-8 border border-slate-700 mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={MOCK_COMPARISON_DATA}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis
                dataKey="metric"
                stroke="#94a3b8"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '14px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Bar dataKey="첫번째" fill="#ef4444" name="첫 번째 스윙" radius={[8, 8, 0, 0]} />
              <Bar dataKey="두번째" fill="#10b981" name="두 번째 스윙" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 개선율 카드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {MOCK_COMPARISON_DATA.map((data) => (
            <div
              key={data.metric}
              className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-green-400 transition-all hover:scale-105">
              <p className="text-gray-400 text-sm mb-2">{data.metric}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-red-400">
                  {data.첫번째}{data.unit}
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-2xl font-bold text-green-400">
                  {data.두번째}{data.unit}
                </span>
              </div>
              <div className="inline-block px-3 py-1 bg-green-500/20 rounded-full">
                <span className="text-green-400 font-bold text-sm">{data.improvement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 완료 버튼 */}
      <div className="mt-8 flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleComplete}
          className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
          완료 (마지막 페이지로)
        </button>

        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-slate-700 text-white font-bold text-lg rounded-xl hover:bg-slate-600 transition-colors">
          처음으로
        </button>
      </div>
    </div>
  )
}

export default SolutionPage
