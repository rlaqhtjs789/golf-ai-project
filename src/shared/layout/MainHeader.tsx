import { HomeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  const [currentTime, setCurrentTime] = useState(new Date())

  // 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 시간 포맷 (HH:MM:SS)
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // 시간 클릭 → 관리자 페이지
  const handleTimeClick = () => {
    navigate('/settings/shop')
  }

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
      callback: async (result) => {
        if (result === 'ok') {
          console.log('앱 종료 요청')
          // Electron 앱 종료
          if (window.app && window.app.quit) {
            try {
              await window.app.quit()
            } catch (error) {
              console.error('앱 종료 실패:', error)
            }
          } else {
            console.warn('Electron API를 사용할 수 없습니다')
          }
        }
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-green-500/30 shadow-lg shadow-green-500/20 backdrop-blur-sm" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 + 시간 */}
          <div className="flex items-center gap-6 shrink-0">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              GTS Ai <span className="text-green-400 animate-pulse">SOLUTION</span>
            </h1>
            
            {/* 시간 표시 (클릭하면 관리자 페이지) */}
            <button
              onClick={handleTimeClick}
              className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/80 text-gray-300 hover:text-green-400 rounded-lg font-mono text-lg transition-all duration-200 hover:scale-105 border border-slate-700/50 hover:border-green-500/50 cursor-pointer"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              title="관리자 설정">
              {formatTime(currentTime)}
            </button>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
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
