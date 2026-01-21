/**
 * 폼 선택 페이지 (성별, 연령대, 핸디캡, 클럽 선택)
 *
 * @route /select
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n/hooks'
import { useSessionStore } from '@/features/golf-session/model/sessionStore'
import { startSession } from '@/services/aiAnalysisApi'

type Gender = 'male' | 'female' | null
type AgeRange = '15-19' | '20-29' | '30-32' | '33-35' | '36-39' | '40-44' | '45-49' | '60-69' | '70-79' | null
type HandicapRange = '0-4.9' | '5-9.9' | '10-14.9' | '15-19.9' | '20-24.9' | '25-29.9' | '30+' | null
type ClubType = 'driver' | 'wood3' | 'utility' | 'iron4' | 'iron5' | 'iron6' | 'iron7' | 'iron8' | 'iron9' | null
type Step = 1 | 2 | 3 | 4

function SelectPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setStep: setSessionStep, setFirstSwingProgress, setSessionUuid, reset } = useSessionStore()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [selectedGender, setSelectedGender] = useState<Gender>(null)
  const [selectedAge, setSelectedAge] = useState<AgeRange>(null)
  const [selectedHandicap, setSelectedHandicap] = useState<HandicapRange>(null)
  const [selectedClub, setSelectedClub] = useState<ClubType>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const ageRanges: AgeRange[] = ['15-19', '20-29', '30-32', '33-35', '36-39', '40-44', '45-49', '60-69', '70-79']
  const handicapRanges: HandicapRange[] = ['0-4.9', '5-9.9', '10-14.9', '15-19.9', '20-24.9', '25-29.9', '30+']
  const clubTypes: ClubType[] = ['driver', 'wood3', 'utility', 'iron4', 'iron5', 'iron6', 'iron7', 'iron8', 'iron9']

  // 단계 전환 애니메이션
  const transitionToStep = (step: Step) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep(step)
      setIsTransitioning(false)
    }, 0)
  }

  // 성별 선택 시 자동으로 다음 단계로 (단, 모든 항목이 이미 선택된 경우 제외)
  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender)
    // 최초 선택 시에만 자동 전환 (모든 항목이 선택되지 않은 경우)
    if (!isAllSelected) {
      setTimeout(() => transitionToStep(2), 0)
    }
  }

  // 연령대 선택 시 자동으로 다음 단계로 (단, 모든 항목이 이미 선택된 경우 제외)
  const handleAgeSelect = (age: AgeRange) => {
    setSelectedAge(age)
    // 최초 선택 시에만 자동 전환
    if (!isAllSelected) {
      setTimeout(() => transitionToStep(3), 0)
    }
  }

  // 핸디 선택 시 자동으로 다음 단계로 (단, 모든 항목이 이미 선택된 경우 제외)
  const handleHandicapSelect = (handicap: HandicapRange) => {
    setSelectedHandicap(handicap)
    // 최초 선택 시에만 자동 전환
    if (!isAllSelected) {
      setTimeout(() => transitionToStep(4), 0)
    }
  }

  // 클럽 타입을 API 형식으로 변환
  const mapClubType = (club: ClubType): string => {
    if (club === 'driver') return 'driver'
    if (club === 'wood3') return '3wood'
    if (club === 'utility') return '3iron' // utility는 3iron으로 매핑
    if (club === 'iron4') return '4iron'
    if (club === 'iron5') return '5iron'
    if (club === 'iron6') return '6iron'
    if (club === 'iron7') return '7iron'
    if (club === 'iron8') return '8iron'
    if (club === 'iron9') return '9iron'
    return 'driver' // 기본값
  }

  // 연령대를 API 형식으로 변환
  const mapAgeGroup = (age: AgeRange): string => {
    if (!age) return '30s'
    // '20-29' -> '20s'
    const firstNumber = age.split('-')[0]
    return `${firstNumber}s`
  }

  // 클럽 선택 시 바로 다음 단계로 이동
  const handleClubSelect = async (club: ClubType) => {
    setSelectedClub(club)
    // 클럽 선택 후 바로 스윙 세션으로 이동 (club을 직접 전달)
    await handleNext(club)
  }

  // 다음 페이지로 이동
  const handleNext = async (clubOverride?: ClubType) => {
    const finalClub = clubOverride || selectedClub
    
    // 선택된 값 콘솔 디버깅
    console.log('=== 선택 완료 ===')
    console.log('성별:', selectedGender)
    console.log('연령대:', selectedAge)
    console.log('핸디:', selectedHandicap)
    console.log('클럽:', finalClub)
    console.log('전체 데이터:', { selectedGender, selectedAge, selectedHandicap, club: finalClub })

    // 모든 항목이 선택되었는지 확인
    if (!selectedGender || !selectedAge || !selectedHandicap || !finalClub) {
      console.error('[setup] ⚠️ 필수 항목이 선택되지 않음')
      return
    }

    // 세션 초기화 (처음부터 다시 시작)
    reset()

    // 세션 시작 - 첫 번째 스윙으로 설정
    setSessionStep('swing-first')
    setFirstSwingProgress(0)

    // 스윙 페이지로 즉시 이동 (API는 백그라운드에서 처리)
    console.log('[setup] → 스윙 페이지로 이동')
    navigate('/analysis/swing')

    // 🔗 API 연동: 세션 시작 (백그라운드 실행 - 페이지 전환을 막지 않음)
    const apiClubType = mapClubType(finalClub)
    const apiAgeGroup = mapAgeGroup(selectedAge)
    
    // shop_id와 pcid 확인
    const { getShopSettings } = await import('@/services/settingsService')
    const shopSettings = getShopSettings()
    console.log('[setup] shopSettings:', shopSettings)
    console.log('[setup] API 전송 데이터:', {
      club_type: apiClubType,
      gender: selectedGender,
      age_group: apiAgeGroup,
      handicap: selectedHandicap,
      shop_id: shopSettings.shop_id,
      pcid: shopSettings.pcid,
    })

    startSession({
      club_type: apiClubType,
      gender: selectedGender as 'male' | 'female',
      age_group: apiAgeGroup as any,
      handicap: selectedHandicap ? parseFloat(selectedHandicap) : null,
      swing_count: 3,
    }).then(response => {
      if (response.success && response.data.session_uuid) {
        console.log('[setup] ✅ 세션 시작 성공, UUID:', response.data.session_uuid)
        setSessionUuid(response.data.session_uuid)
        
        // 🔗 Electron IPC: Start sensor data collection
        if (window.swingAnalysis) {
          console.log('[setup] 📡 Calling window.swingAnalysis.startSession...')
          window.swingAnalysis.startSession(response.data.session_uuid, 3)
            .then((ipcResult) => {
              console.log('[setup] 📡 IPC result received:', ipcResult)
              if (ipcResult.success) {
                console.log('[setup] ✅ Electron collection mode activated')
              } else {
                console.error('[setup] ⚠️ Electron collection mode activation failed:', ipcResult.error)
              }
            })
            .catch((error) => {
              console.error('[setup] ❌ IPC call failed:', error)
            })
        } else {
          console.warn('[setup] ⚠️ window.swingAnalysis not found (web environment)')
        }
      } else {
        console.error('[setup] ⚠️ 세션 UUID 없음')
      }
    }).catch(error => {
      console.error('[setup] ❌ 세션 시작 실패:', error)
      console.error('[setup] 에러 상세:', error.message)
      if (error.message?.includes('422')) {
        console.error('[setup] ⚠️ 422 에러: 입력값이 올바르지 않습니다. shop_id와 pcid를 확인하세요.')
      }
    })
  }

  // 모든 항목이 선택되었는지 확인
  const isAllSelected = selectedGender && selectedAge && selectedHandicap && selectedClub

  return (
    <div className="min-h-full flex flex-col">
      {/* 메인 컨텐츠 영역 - 선택항목과 컨텐츠를 하나로 묶음 */}
      <div className="flex flex-1 items-center justify-center gap-8 px-4 py-6">
        {/* 선택항목 + 메인컨텐츠 박스 */}
        <div className={`flex flex-col transition-all duration-700 ${
          isAllSelected ? 'transform -translate-x-[5%]' : ''
        }`}>
          {/* 진행 표시 및 이전 선택 항목 */}
          <div className="pt-6 px-4">
            <div className="max-w-4xl mx-auto">
              {/* 단계 인디케이터 */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      step === currentStep ? 'w-16 bg-linear-to-r from-green-400 to-emerald-500' :
                      step < currentStep ? 'w-8 bg-green-600' : 'w-8 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* 선택된 항목 표시 */}
              {(selectedGender || selectedAge || selectedHandicap || selectedClub) && (
                <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in">
                  {selectedGender && (
                    <button
                      onClick={() => transitionToStep(1)}
                      className="group px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300">
                      <span className="text-xl mr-2">{selectedGender === 'male' ? '👨' : '👩'}</span>
                      {t(`select.gender.${selectedGender}`)}
                    </button>
                  )}
                  {selectedAge && (
                    <button
                      onClick={() => transitionToStep(2)}
                      className="group px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300">
                      {t(`select.age.ranges.${selectedAge}`)}
                    </button>
                  )}
                  {selectedHandicap && (
                    <button
                      onClick={() => transitionToStep(3)}
                      className="group px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300">
                      {t(`select.handicap.ranges.${selectedHandicap}`)}
                    </button>
                  )}
                  {selectedClub && (
                    <button
                      onClick={() => transitionToStep(4)}
                      className="group px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 rounded-full text-white font-semibold shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300">
                      {t(`select.club.types.${selectedClub}`)}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="px-4 py-12 mt-8">
            <div className={`w-full max-w-5xl mx-auto transition-all duration-700 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}>
          {/* Step 1: 성별 선택 */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 mb-12 md:mb-16">
                {t('select.gender.title')}
              </h2>
              <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
                {/* 남성 */}
                <button
                  onClick={() => handleGenderSelect('male')}
                  className={`group relative p-10 md:p-16 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 ${
                    selectedGender === 'male'
                      ? 'bg-linear-to-br from-green-500 to-emerald-600 border-green-400 shadow-2xl shadow-green-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700 hover:border-green-500'
                  }`}>
                  <div className="relative z-10">
                    <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👨</div>
                    <div className={`text-2xl md:text-3xl font-bold transition-colors ${
                      selectedGender === 'male' ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {t('select.gender.male')}
                    </div>
                  </div>
                </button>

                {/* 여성 */}
                <button
                  onClick={() => handleGenderSelect('female')}
                  className={`group relative p-10 md:p-16 rounded-3xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 ${
                    selectedGender === 'female'
                      ? 'bg-linear-to-br from-green-500 to-emerald-600 border-green-400 shadow-2xl shadow-green-500/50'
                      : 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700 hover:border-green-500'
                  }`}>
                  <div className="relative z-10">
                    <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-110 transition-transform duration-300">👩</div>
                    <div className={`text-2xl md:text-3xl font-bold transition-colors ${
                      selectedGender === 'female' ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {t('select.gender.female')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 연령대 선택 */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 mb-12 md:mb-16">
                {t('select.age.title')}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                {ageRanges.map((age) => (
                  <button
                    key={age}
                    onClick={() => handleAgeSelect(age)}
                    className={`relative px-4 py-6 md:py-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 group ${
                      selectedAge === age
                        ? 'bg-linear-to-br from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-500/50'
                        : 'bg-slate-800/50 hover:bg-linear-to-br hover:from-green-500 hover:to-emerald-600 border-slate-700 hover:border-green-400'
                    }`}>
                    <div className={`text-lg md:text-xl font-bold transition-colors ${
                      selectedAge === age ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {t(`select.age.ranges.${age}`)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 핸디 선택 */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 mb-12 md:mb-16">
                {t('select.handicap.title')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5 max-w-4xl mx-auto">
                {handicapRanges.map((handicap) => (
                  <button
                    key={handicap}
                    onClick={() => handleHandicapSelect(handicap)}
                    className={`relative px-6 py-8 md:py-10 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 group ${
                      selectedHandicap === handicap
                        ? 'bg-linear-to-br from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-500/50'
                        : 'bg-slate-800/50 hover:bg-linear-to-br hover:from-green-500 hover:to-emerald-600 border-slate-700 hover:border-green-400'
                    }`}>
                    <div className={`text-xl md:text-2xl font-bold transition-colors ${
                      selectedHandicap === handicap ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {t(`select.handicap.ranges.${handicap}`)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: 클럽 선택 */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-400 to-teal-400 mb-8 md:mb-12">
                {t('select.club.title')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
                {clubTypes.map((club) => (
                  <button
                    key={club}
                    onClick={() => handleClubSelect(club)}
                    className={`relative px-6 py-8 md:py-10 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 group ${
                      selectedClub === club
                        ? 'bg-linear-to-br from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-500/50'
                        : 'bg-slate-800/50 hover:bg-linear-to-br hover:from-green-500 hover:to-emerald-600 border-slate-700 hover:border-green-400'
                    }`}>
                    <div className={`text-xl md:text-2xl font-bold transition-colors ${
                      selectedClub === club ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {t(`select.club.types.${club}`)}
                    </div>
                  </button>
                ))}
              </div>
              {/* 하단 안내 메시지 */}
              <div className="mt-8 md:mt-12 text-center">
                <p className="text-gray-400 text-sm md:text-base">
                  {t('select.club.notice')}
                </p>
              </div>
            </div>
          )}
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
          animation: fade-in 0.5s ease-out;
        }

        /* 우측에서 슬라이드 인 */
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

      `}</style>
    </div>
  )
}

export default SelectPage
