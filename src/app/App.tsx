import { useRoutes, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import routes from '~react-pages'
import { AuthGuard } from '@/app/providers/AuthGuard'
import { LayoutSwitcher } from '@/app/providers/LayoutSwitcher'
import { getLayoutConfig } from '@/app/config/layouts'
import type { LayoutType } from '@/app/types/route'
import { AlertProvider } from '@/shared/ui'
import '@/shared/i18n' // i18n 초기화

interface ClickEffect {
  id: number
  x: number
  y: number
}

function App() {
  const location = useLocation()
  const [clicks, setClicks] = useState<ClickEffect[]>([])

  // 현재 경로의 레이아웃 설정 가져오기
  const layoutConfig = useMemo(() => {
    return getLayoutConfig(location.pathname)
  }, [location.pathname])

  const currentLayout = (layoutConfig.layout || 'main') as LayoutType

  const element = useRoutes(routes)

  // 클릭 이펙트 처리
  const handleClick = (e: React.MouseEvent) => {
    const newClick: ClickEffect = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    }
    setClicks((prev) => [...prev, newClick])

    // 애니메이션 완료 후 제거 (600ms)
    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== newClick.id))
    }, 600)
  }

  return (
    <AlertProvider>
      <AuthGuard>
        <div onClick={handleClick} style={{ cursor: 'default' }}>
          {/* 클릭 이펙트 렌더링 */}
          {clicks.map((click) => (
            <div
              key={click.id}
              style={{
                position: 'fixed',
                left: `${click.x}px`,
                top: `${click.y}px`,
                pointerEvents: 'none',
                zIndex: 9999,
              }}>
              <style>{`
                @keyframes click-ripple {
                  0% {
                    width: 20px;
                    height: 20px;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0.5);
                  }
                  100% {
                    width: 20px;
                    height: 20px;
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(1.5);
                  }
                }

                .click-effect {
                  position: absolute;
                  width: 20px;
                  height: 20px;
                  border: 2px solid rgba(59, 130, 246, 0.6);
                  border-radius: 50%;
                  left: 0;
                  top: 0;
                  animation: click-ripple 0.6s ease-out forwards;
                }
              `}</style>
              <div className="click-effect" />
            </div>
          ))}
          <LayoutSwitcher layout={currentLayout} meta={layoutConfig}>
            {element}
          </LayoutSwitcher>
        </div>
      </AuthGuard>
    </AlertProvider>
  )
}

export default App
