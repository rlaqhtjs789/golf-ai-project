import { type ReactNode } from 'react'
import type { RouteMetadata } from '@/app/types/route'

interface AuthLayoutProps {
  children: ReactNode
  meta?: RouteMetadata
}

/**
 * 인증 페이지 전용 레이아웃
 *
 * Header/Footer 없이 중앙 정렬된 카드 형태
 * 로그인, 회원가입 등에 사용
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen min-w-[768px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
      </div>

      <div className="w-full relative z-1">{children}</div>

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
  );
}
