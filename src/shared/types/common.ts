/**
 * Shared Types - 전역 타입
 * 
 * 프로젝트 전체에서 사용되는 공통 타입을 정의합니다.
 */

// ===== 공통 API 타입 =====
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

// ===== Pagination 타입 =====
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ===== 기타 공통 타입 =====
export type ID = string | number

export interface Timestamp {
  createdAt: string
  updatedAt: string
}
