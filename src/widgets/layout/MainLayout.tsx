import type { ReactNode } from 'react'
import { MainHeader } from '@/shared/layout/MainHeader'
import type { RouteMetadata } from '@/app/types/route'

interface MainLayoutProps {
  children: ReactNode
  meta?: RouteMetadata
}

export function MainLayout({ children, meta }: MainLayoutProps) {
  const headerOptions = meta?.mainHeader

  return (
    <div className="min-h-screen min-w-[768px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* 배경 애니메이션 효과 */}
      <div className="fixed left-0 top-0 w-full h-full">
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
      </div>

      <MainHeader options={headerOptions} />
      <main className="flex-1 relative z-1 flex flex-direction-column w-full align-center justify-center">
        {children}
      </main>

      {/* 애니메이션 CSS */}
      <style>{`
        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
