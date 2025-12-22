import { type ReactNode } from 'react'
import type { RouteMetadata } from '@/app/types/route'

interface BlankLayoutProps {
  children: ReactNode
  meta?: RouteMetadata
}

/**
 * 레이아웃 없는 순수 페이지
 *
 * 랜딩 페이지, 404 페이지 등에 사용
 */
export function BlankLayout({ children }: BlankLayoutProps) {
  return <>{children}</>
}
