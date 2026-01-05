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

    // 애니메이션 완료 후 제거 (800ms)
    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== newClick.id))
    }, 800)
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
                /* 중심 펄스 효과 */
                @keyframes click-pulse {
                  0% {
                    width: 12px;
                    height: 12px;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0.8);
                  }
                  50% {
                    opacity: 0.8;
                  }
                  100% {
                    width: 12px;
                    height: 12px;
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(2.5);
                  }
                }

                /* 다중 리플 효과 - 첫 번째 */
                @keyframes click-ripple-1 {
                  0% {
                    width: 24px;
                    height: 24px;
                    opacity: 0.9;
                    transform: translate(-50%, -50%) scale(0.5);
                  }
                  100% {
                    width: 24px;
                    height: 24px;
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(2.2);
                  }
                }

                /* 다중 리플 효과 - 두 번째 */
                @keyframes click-ripple-2 {
                  0% {
                    width: 32px;
                    height: 32px;
                    opacity: 0.7;
                    transform: translate(-50%, -50%) scale(0.3);
                  }
                  100% {
                    width: 32px;
                    height: 32px;
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(2);
                  }
                }

                /* 파티클 효과 */
                @keyframes particle-burst {
                  0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                  }
                  100% {
                    opacity: 0;
                    transform: translate(var(--tx), var(--ty)) scale(0.3);
                  }
                }

                /* 중심 펄스 */
                .click-pulse {
                  position: absolute;
                  width: 12px;
                  height: 12px;
                  background: radial-gradient(circle, #4ade80, #2dd4bf);
                  border-radius: 50%;
                  left: 0;
                  top: 0;
                  animation: click-pulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                  filter: blur(1px);
                  box-shadow: 0 0 12px rgba(74, 222, 128, 0.8),
                              0 0 24px rgba(45, 212, 191, 0.4);
                }

                /* 리플 1 */
                .click-ripple-1 {
                  position: absolute;
                  width: 24px;
                  height: 24px;
                  border: 2.5px solid #22c55e;
                  border-radius: 50%;
                  left: 0;
                  top: 0;
                  animation: click-ripple-1 0.6s ease-out forwards;
                  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6),
                              inset 0 0 8px rgba(34, 197, 94, 0.3);
                }

                /* 리플 2 */
                .click-ripple-2 {
                  position: absolute;
                  width: 32px;
                  height: 32px;
                  border: 2px solid #10b981;
                  border-radius: 50%;
                  left: 0;
                  top: 0;
                  animation: click-ripple-2 0.7s ease-out 0.05s forwards;
                  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
                }

                /* 파티클 */
                .particle {
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  background: linear-gradient(135deg, #4ade80, #2dd4bf);
                  border-radius: 50%;
                  left: 0;
                  top: 0;
                  animation: particle-burst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                  box-shadow: 0 0 6px rgba(74, 222, 128, 0.9);
                }
              `}</style>

              {/* 중심 펄스 */}
              <div className="click-pulse" />

              {/* 다중 리플 */}
              <div className="click-ripple-1" />
              <div className="click-ripple-2" />

              {/* 8방향 파티클 */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180
                const distance = 40
                const tx = Math.cos(rad) * distance
                const ty = Math.sin(rad) * distance
                return (
                  <div
                    key={i}
                    className="particle"
                    style={
                      {
                        '--tx': `${tx}px`,
                        '--ty': `${ty}px`,
                        animationDelay: `${i * 0.02}s`,
                      } as React.CSSProperties
                    }
                  />
                )
              })}
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
