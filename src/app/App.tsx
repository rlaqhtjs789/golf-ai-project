import { useRoutes, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import routes from '~react-pages'
import { AuthGuard } from '@/app/providers/AuthGuard'
import { LayoutSwitcher } from '@/app/providers/LayoutSwitcher'
import { getLayoutConfig } from '@/app/config/layouts'
import type { LayoutType } from '@/app/types/route'
import { AlertProvider } from '@/shared/ui'
import '@/shared/i18n' // i18n 초기화

function App() {
  const location = useLocation()

  // 현재 경로의 레이아웃 설정 가져오기
  const layoutConfig = useMemo(() => {
    return getLayoutConfig(location.pathname)
  }, [location.pathname])

  const currentLayout = (layoutConfig.layout || 'main') as LayoutType

  const element = useRoutes(routes)

  return (
    <AlertProvider>
      <AuthGuard>
        <LayoutSwitcher layout={currentLayout} meta={layoutConfig}>
          {element}
        </LayoutSwitcher>
      </AuthGuard>
    </AlertProvider>
  )
}

export default App
