/**
 * 홈 페이지
 *
 * @route /
 */
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n/hooks'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="w-full px-6 py-16">
        {/* AI 스윙 진단 섹션 */}
        <div className="text-center mb-24 animate-fade-in">
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-6 drop-shadow-2xl animate-glow">
            {t("home.title")}
          </h2>
          <p className="text-2xl text-gray-300 mb-12 font-light tracking-wide">
            {t("home.subtitle")}
          </p>

          {/* START 버튼 - 게임 느낌 */}
          <button
            onClick={() => navigate('/analysis/setup')}
            className="group relative px-20 py-6 text-2xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-200 hover:scale-110 shadow-2xl">
            {/* 버튼 배경 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 transition-all duration-200 group-hover:from-green-400 group-hover:via-emerald-400 group-hover:to-green-500"></div>

            {/* 글로우 효과 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-xl"></div>
            </div>

            {/* 반짝이는 효과 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200">
              <div className="absolute inset-0 bg-white animate-pulse"></div>
            </div>

            <span className="relative z-10 tracking-widest drop-shadow-lg">
              {t("home.startButton")}
            </span>
          </button>
        </div>

        {/* 스윙 진단과 개선 과정 */}
        <div className="mt-20">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 mb-12 md:mb-16 tracking-wide">
            {t("home.processTitle")}
          </h3>

          {/* 타임라인 */}
          <div className="relative max-w-7xl mx-auto">
            {/* 연결선 - 글로우 효과 (1024px 이상에서만 표시) */}
            <div
              className="hidden lg:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50 shadow-lg shadow-green-500/50"
              style={{ zIndex: 0 }}></div>

            {/* 단계들 - 반응형: 태블릿 3개, 큰 화면 5개 */}
            <div
              className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 lg:gap-16"
              style={{ zIndex: 1 }}>
              {/* 1단계 */}
              <div className="flex flex-col items-center animate-slide-up">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                  {/* 외부 글로우 */}
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60"></div>

                  {/* 메인 원 */}
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/60">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full"></div>
                  </div>
                </div>
                <h4 className="font-bold text-gray-100 text-center mb-3 text-lg md:text-xl">
                  1. {t("home.steps.step1.title")}
                </h4>
                <p className="text-sm md:text-base text-gray-400 text-center leading-relaxed">
                  {t("home.steps.step1.description")}
                </p>
              </div>

              {/* 2단계 */}
              <div className="flex flex-col items-center animate-slide-up delay-100">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/60">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full"></div>
                  </div>
                </div>
                <h4 className="font-bold text-gray-100 text-center mb-3 text-lg md:text-xl">
                  2. {t("home.steps.step2.title")}
                </h4>
                <p className="text-sm md:text-base text-gray-400 text-center leading-relaxed">
                  {t("home.steps.step2.description")}
                </p>
              </div>

              {/* 3단계 */}
              <div className="flex flex-col items-center animate-slide-up delay-200">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/60">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full"></div>
                  </div>
                </div>
                <h4 className="font-bold text-gray-100 text-center mb-3 text-lg md:text-xl">
                  3. {t("home.steps.step3.title")}
                </h4>
                <p className="text-sm md:text-base text-gray-400 text-center leading-relaxed">
                  {t("home.steps.step3.description")}
                </p>
              </div>

              {/* 4단계 */}
              <div className="flex flex-col items-center animate-slide-up delay-300">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/60">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full"></div>
                  </div>
                </div>
                <h4 className="font-bold text-gray-100 text-center mb-3 text-lg md:text-xl">
                  4. {t("home.steps.step4.title")}
                </h4>
                <p className="text-sm md:text-base text-gray-400 text-center leading-relaxed">
                  {t("home.steps.step4.description")}
                </p>
              </div>

              {/* 5단계 */}
              <div className="flex flex-col items-center animate-slide-up delay-400">
                <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-60"></div>
                  <div className="relative w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/60">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full"></div>
                  </div>
                </div>
                <h4 className="font-bold text-gray-100 text-center mb-3 text-lg md:text-xl">
                  5. {t("home.steps.step5.title")}
                </h4>
                <p className="text-sm md:text-base text-gray-400 text-center leading-relaxed">
                  {t("home.steps.step5.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 배경 애니메이션 효과 CSS */}
      <style>{`
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(74, 222, 128, 0.5),
                         0 0 40px rgba(74, 222, 128, 0.3),
                         0 0 60px rgba(74, 222, 128, 0.2);
          }
          50% {
            text-shadow: 0 0 30px rgba(74, 222, 128, 0.8),
                         0 0 60px rgba(74, 222, 128, 0.5),
                         0 0 90px rgba(74, 222, 128, 0.3);
          }
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}

export default HomePage