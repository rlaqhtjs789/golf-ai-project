import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isProtectedRoute } from '@/app/config/routes'

interface AuthGuardProps {
  children: ReactNode
}

/**
 * 인증 가드
 *
 * routes.ts의 PROTECTED_ROUTES 배열을 기반으로
 * 자동으로 인증을 체크합니다.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()

  // TODO: 실제 인증 상태 체크 (useAuth 훅 사용)
  const isAuthenticated = false // 임시

  // 인증이 필요한 페이지인지 체크
  if (isProtectedRoute(location.pathname) && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
