/**
 * 스윙 페이지
 *
 * @route /swing
 *
 * 플로우:
 * 1. 첫 번째 스윙 (swing-first): 스윙화면-1 → 스윙화면-2 → 스윙화면-3 → 솔루션 영상
 * 2. 두 번째 스윙 (swing-second): 스윙화면두번째-1 → 스윙화면-2 → 스윙화면-3 → 솔루션 차트
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore, selectCurrentStep, selectFirstSwingProgress, selectSecondSwingProgress, selectSwingCount } from '@/features/golf-session/model/sessionStore'
import type { SwingData } from '@/features/golf-session/types/session.type'
import { SWING_COUNT_PER_SESSION } from '@/shared/constants/swing'

type SwingPhase = 'initial' | 'swinging' | 'loading'

// 초기 측정 데이터
const getInitialMeasurement = () => ({
  clubSpeed: '0',
  ballSpeed: '0',
  launchAngle: '0',
  direction: '-',
  lateralDistance: '0',
  distance: '0',
  sideSpin: '-',
  backSpin: '0',
  ballFlight: '-',
})

// 임시 측정 데이터 생성 함수
const generateMockData = () => ({
  clubSpeed: (48 + Math.random() * 5).toFixed(1),
  ballSpeed: (33 + Math.random() * 5).toFixed(1),
  launchAngle: (18 + Math.random() * 5).toFixed(1),
  direction: Math.random() > 0.5 ? `L${(Math.random() * 2).toFixed(1)}` : `R${(Math.random() * 2).toFixed(1)}`,
  lateralDistance: (1 + Math.random() * 3).toFixed(1),
  distance: (200 + Math.random() * 70).toFixed(1),
  sideSpin: `${Math.random() > 0.5 ? 'R' : 'L'}${Math.floor(300 + Math.random() * 300)}`,
  backSpin: String(Math.floor(4000 + Math.random() * 1000)),
  ballFlight: ['슬라이스', '훅', '스트레이트'][Math.floor(Math.random() * 3)],
})

function SwingPage() {
  const navigate = useNavigate()
  const currentStep = useSessionStore(selectCurrentStep)
  const firstSwingProgress = useSessionStore(selectFirstSwingProgress)
  const secondSwingProgress = useSessionStore(selectSecondSwingProgress)
  const swingCount = useSessionStore(selectSwingCount)
  const { setStep, setFirstSwingProgress, setSecondSwingProgress, addSwingToHistory, setSwingCount } = useSessionStore()

  const [phase, setPhase] = useState<SwingPhase>('initial')
  const [currentMeasurement, setCurrentMeasurement] = useState(getInitialMeasurement())
  const [measurements, setMeasurements] = useState<Array<typeof currentMeasurement>>([])

  // 첫 번째 스윙인지 두 번째 스윙인지 확인
  const isFirstSwing = currentStep === 'swing-first'
  const swingProgress = isFirstSwing ? firstSwingProgress : secondSwingProgress
  const setSwingProgress = isFirstSwing ? setFirstSwingProgress : setSecondSwingProgress

  useEffect(() => {
    console.log('[swing] 첫번째 useEffect, currentStep:', currentStep, 'phase:', phase)

    // loading phase일 때는 상태 변경을 무시 (solution으로 navigate 중)
    if (phase === 'loading') {
      console.log('[swing] phase === loading, 조기 return')
      return
    }

    // 첫 번째 스윙이 아닌 상태로 진입하면 홈으로 리다이렉트
    if (currentStep !== 'swing-first' && currentStep !== 'swing-second') {
      console.log('[swing] 조건 불만족! 홈으로 이동. currentStep:', currentStep)
      navigate('/')
      return
    }
    console.log('[swing] 조건 만족! 계속 진행.')

    // Phase 1: 초기 안내 (2초 후 스윙 시작)
    const initialTimer = setTimeout(() => {
      setPhase('swinging')
    }, 2000)

    return () => clearTimeout(initialTimer)
  }, [currentStep, navigate, phase])

  useEffect(() => {
    if (phase !== 'swinging') return

    // SWING_COUNT_PER_SESSION개 완료 시 로딩 단계로 전환
    if (swingProgress >= SWING_COUNT_PER_SESSION) {
      const loadingTimer = setTimeout(() => {
        setPhase('loading')
      }, 100)
      return () => clearTimeout(loadingTimer)
    }

    // Phase 2: 스윙 진행 (SWING_COUNT_PER_SESSION개 카운팅)
    const swingTimer = setTimeout(() => {
      const nextProgress = swingProgress + 1
      setSwingProgress(nextProgress)
      // 측정값 생성 및 수집
      const newMeasurement = generateMockData()
      setCurrentMeasurement(newMeasurement)
      setMeasurements((prev) => [...prev, newMeasurement])
    }, 1500) // 1.5초마다 1개씩 카운팅

    return () => clearTimeout(swingTimer)
  }, [phase, swingProgress, setSwingProgress])

  useEffect(() => {
    if (phase !== 'loading') return

    // Phase 3: 로딩 (2초 후 솔루션 페이지로 이동)
    const loadingTimer = setTimeout(() => {
      console.log('[swing] 로딩 완료, 상태 설정 시작')

      // SwingData 생성 및 저장
      if (measurements.length === SWING_COUNT_PER_SESSION) {
        const swingData: SwingData = {
          swingNumber: swingCount,
          measurements: measurements.map((m, index) => ({
            swingNumber: index + 1,
            clubSpeed: parseFloat(m.clubSpeed),
            ballSpeed: parseFloat(m.ballSpeed),
            distance: parseFloat(m.distance),
            angle: parseFloat(m.launchAngle),
            spin: 0, // placeholder
            timestamp: Date.now(),
          })),
          averages: {
            clubSpeed: measurements.reduce((sum, m) => sum + parseFloat(m.clubSpeed), 0) / SWING_COUNT_PER_SESSION,
            ballSpeed: measurements.reduce((sum, m) => sum + parseFloat(m.ballSpeed), 0) / SWING_COUNT_PER_SESSION,
            distance: measurements.reduce((sum, m) => sum + parseFloat(m.distance), 0) / SWING_COUNT_PER_SESSION,
            angle: measurements.reduce((sum, m) => sum + parseFloat(m.launchAngle), 0) / SWING_COUNT_PER_SESSION,
            spin: 0,
          },
          completedAt: Date.now(),
        }

        // 🔗 API 연동 지점 1: 스윙 데이터 서버 저장
        // TODO: POST /api/swings/save (swingData 저장)
        // 응답: 저장된 스윙 ID 또는 성공 여부

        // 🔗 API 연동 후: 다음 3개 라인 제거 (세션 저장 불필요)
        // 히스토리에 추가 (현재는 세션 저장, API 연동 후 제거 가능)
        console.log('[swing] addSwingToHistory 호출, swingCount:', swingCount)
        addSwingToHistory(swingData)
        setSwingCount(swingCount + 1)
      }

      // 첫 번째 스윙이면 solution-video, 두 번째 스윙이면 solution-chart로 설정
      if (isFirstSwing) {
        console.log('[swing] isFirstSwing 감지, setStep(solution-video) 호출')
        setStep('solution-video')
      } else {
        console.log('[swing] isFirstSwing=false, setStep(solution-chart) 호출')
        setStep('solution-chart')
      }

      // solution 페이지로 이동
      console.log('[swing] navigate(/analysis/solution) 호출')
      navigate('/analysis/solution')
    }, 2000)

    return () => clearTimeout(loadingTimer)
  }, [phase, navigate, isFirstSwing, setStep, measurements, swingCount, addSwingToHistory, setSwingCount])

  // Phase 1: 초기 안내
  if (phase === 'initial') {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100">
            {isFirstSwing ? `평소 리듬으로 스윙을 ${SWING_COUNT_PER_SESSION}회 해주세요.` : '연습한대로, 다시 스윙 해주세요.'}
          </h1>
        </div>
      </div>
    )
  }

  // Phase 3: 로딩
  if (phase === 'loading') {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-12">
            스윙 분석 로딩 화면
          </h2>

          {/* 로딩 스피너 */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-blue-200 rounded-full opacity-20"></div>
              <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>

          <p className="text-xl text-gray-300">
            GTS Ai가 회원님의 스윙·샷 데이터를 정밀 진단하고 있어요.
          </p>
        </div>
      </div>
    )
  }

  // Phase 2: 스윙 진행
  return (
    <div className="min-h-full flex flex-col py-8 px-4">
      {/* 상단: SWING_COUNT_PER_SESSION개 체크박스 */}
      <div className="mb-8 animate-fade-in">
        <div className="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
          {Array.from({ length: SWING_COUNT_PER_SESSION }, (_, i) => i + 1).map((num) => (
            <div
              key={num}
              className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full border-4 transition-all duration-500 ${
                num <= swingProgress
                  ? "bg-linear-to-br from-green-400 to-emerald-600 border-green-400 shadow-lg shadow-green-500/50 scale-110"
                  : "bg-slate-800 border-slate-600"
              }`}>
              {/* 체크 표시 */}
              {num <= swingProgress && (
                <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {/* 번호 표시 (체크 전) */}
              {num > swingProgress && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm md:text-base font-bold text-gray-500">
                    {num}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단: 영상박스 + 측정값 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* 왼쪽: 영상박스 */}
          <div className="flex items-center justify-center min-h-full">
            <div className="w-full min-h-full max-w-md aspect-video bg-slate-800 rounded-3xl border-4 border-slate-700 flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🏌️</div>
                <p className="text-gray-400 text-lg">스윙 영상 영역</p>
                <p className="text-gray-500 text-sm mt-2">
                  (향후 실시간 영상 표시)
                </p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 측정값 */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-4">
              {/* 측정값 그리드 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 클럽스피드 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">클럽스피드 (m/s)</p>
                  <p className="text-3xl font-bold text-green-400">
                    {currentMeasurement.clubSpeed}
                  </p>
                </div>

                {/* 볼스피드 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">볼스피드 (m/s)</p>
                  <p className="text-3xl font-bold text-green-400">
                    {currentMeasurement.ballSpeed}
                  </p>
                </div>

                {/* 발사각 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">발사각 (°)</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {currentMeasurement.launchAngle}
                  </p>
                </div>

                {/* 방향각 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">방향각 (°)</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {currentMeasurement.direction}
                  </p>
                </div>

                {/* 좌우거리 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">좌우거리 (m)</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {currentMeasurement.lateralDistance}
                  </p>
                </div>

                {/* 사이드스핀 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">사이드스핀 (rpm)</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {currentMeasurement.sideSpin}
                  </p>
                </div>

                {/* 백스핀 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">백스핀 (rpm)</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {currentMeasurement.backSpin}
                  </p>
                </div>

                {/* 구질 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">구질</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {currentMeasurement.ballFlight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

export default SwingPage
