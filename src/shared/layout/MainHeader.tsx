import { HomeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { LanguageSelector, useAlert } from '@/shared/ui'

/**
 * MainHeader 옵션
 */
export interface MainHeaderOptions {
  /** 홈 버튼 노출 여부 (기본값: true) */
  showHomeButton?: boolean

  /** 나가기 버튼 노출 여부 (기본값: true) */
  showExitButton?: boolean

  /** 언어 선택 버튼 노출 여부 (기본값: true) */
  showLanguageSelector?: boolean
}

interface MainHeaderProps {
  options?: MainHeaderOptions
}

export function MainHeader({ options }: MainHeaderProps) {
  const {
    showHomeButton = true,
    showExitButton = true,
    showLanguageSelector = true,
  } = options || {}

  const navigate = useNavigate()
  const { showConfirm } = useAlert()

  const handleHomeClick = () => {
    showConfirm({
      title: '홈으로 이동',
      subtitle: '홈으로 이동하시겠습니까?\n현재 진행 중인 내용이 있다면 저장되지 않을 수 있습니다.',
      okBtnName: '이동',
      cancelBtnName: '취소',
      okBtnVariant: 'success',
      callback: (result) => {
        if (result === 'ok') {
          navigate('/')
        }
      },
    })
  }

  const handleExitClick = () => {
    showConfirm({
      title: '프로그램 종료',
      subtitle: '정말 종료하시겠습니까?',
      okBtnName: '종료',
      cancelBtnName: '취소',
      okBtnVariant: 'danger',
      callback: (result) => {
        if (result === 'ok') {
          // TODO: 앱 종료 API 연동 필요
          console.log('앱 종료 요청')
        }
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-green-500/30 shadow-lg shadow-green-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div className="shrink-0">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              GTS Ai <span className="text-green-400 animate-pulse">SOLUTION</span>
            </h1>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {showLanguageSelector && <LanguageSelector />}

            {showHomeButton && (
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 px-6 py-2 text-gray-200 hover:text-green-400 transition-all duration-150 hover:scale-110 font-semibold">
                <HomeIcon className="w-5 h-5" />
                홈
              </button>
            )}

            {showExitButton && (
              <button
                onClick={handleExitClick}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-150 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 font-semibold">
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                나가기
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
