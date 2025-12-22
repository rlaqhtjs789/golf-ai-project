import type { MainHeaderOptions } from '@/shared/layout/MainHeader'

/**
 * 레이아웃 타입 정의
 *
 * - main: 기본 레이아웃 (Header)
 * - auth: 인증 레이아웃 (Header/Footer 없음, 중앙 정렬)
 * - blank: 레이아웃 없음 (순수 페이지만)
 */
export type LayoutType = 'main' | 'auth' | 'blank'

export interface RouteMetadata {
  /** 페이지 레이아웃 (기본값: 'main') */
  layout?: LayoutType

  /** 페이지 제목 */
  title?: string

  /** MainHeader 옵션 */
  mainHeader?: MainHeaderOptions

  /** 기타 커스텀 메타데이터 */
  [key: string]: unknown
}
