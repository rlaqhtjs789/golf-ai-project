/**
 * 완료 페이지 (마지막 페이지)
 *
 * @route /complete
 *
 * 전체 스윙 세션 완료 후 표시되는 최종 페이지
 * - 개선 결과 요약
 * - 처음으로 돌아가기
 * - 추가 솔루션 제안 (향후 구현 예정)
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore, selectCurrentStep } from '@/features/golf-session/model/sessionStore'

function CompletePage() {
  const navigate = useNavigate()
  const currentStep = useSessionStore(selectCurrentStep)
  const { reset } = useSessionStore()

  useEffect(() => {
    // complete 단계가 아니면 홈으로 리다이렉트
    if (currentStep !== 'complete') {
      navigate('/')
    }
  }, [currentStep, navigate])

  // 처음으로 돌아가기
  const handleGoHome = () => {
    reset() // 세션 데이터 초기화
    navigate('/')
  }

  // 나가기 (앱 종료 또는 초기화)
  const handleExit = () => {
    reset()
    // 향후 키오스크 모드에서는 실제 앱 종료 또는 대기 화면으로 전환
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        {/* 축하 메시지 */}
        <div className="mb-12 animate-fade-in">
          <div className="text-6xl md:text-8xl mb-6">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-4">
            분석이 완료되었습니다!
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            GTS-AI SOLUTION과 함께한 스윙 분석 세션이 종료되었습니다.
          </p>
        </div>

        {/* 개선 요약 카드 */}
        <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 border-2 border-slate-700 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-6">
            회원님의 스윙 개선 결과
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-purple-500/10 rounded-2xl p-6 border border-purple-500/30">
              <p className="text-gray-400 mb-2">비거리 개선</p>
              <p className="text-4xl font-bold text-purple-400">+22.8%</p>
            </div>
            <div className="bg-cyan-500/10 rounded-2xl p-6 border border-cyan-500/30">
              <p className="text-gray-400 mb-2">정확도 개선</p>
              <p className="text-4xl font-bold text-cyan-400">+16.0%</p>
            </div>
          </div>

          <p className="text-lg text-gray-300">
            솔루션 영상을 참고하여 꾸준히 연습하시면<br />
            더 나은 결과를 얻으실 수 있습니다!
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-green-500/50">
            처음으로
          </button>

          <button
            onClick={handleExit}
            className="px-8 py-4 bg-slate-700 text-white font-bold text-lg rounded-xl hover:bg-slate-600 transition-colors">
            나가기
          </button>
        </div>

        {/* 추가 안내 (향후 기능 예정) */}
        <div className="mt-12 p-6 bg-slate-900/50 rounded-2xl border border-slate-700">
          <p className="text-gray-400 text-sm">
            💡 향후 업데이트: 추가로 감지된 문제점에 대한 솔루션도 제공 예정입니다
          </p>
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
      `}</style>
    </div>
  )
}

export default CompletePage
