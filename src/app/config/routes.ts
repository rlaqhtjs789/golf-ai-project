/**
 * 인증이 필요한 페이지 목록
 *
 * 이 배열에 있는 경로는 로그인하지 않으면 접근할 수 없습니다.
 */
export const PROTECTED_ROUTES = [
  // 추후 인증 필요 router 추가
  // '/',
] as const

/**
 * 경로가 인증이 필요한지 확인
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => {
    // 정확히 일치하거나
    if (pathname === route) return true
    // 하위 경로인 경우 (예: /admin/users)
    if (pathname.startsWith(route + '/')) return true
    return false
  })
}
