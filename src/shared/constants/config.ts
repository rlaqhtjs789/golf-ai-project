/**
 * Shared Constants - 전역 상수
 * 
 * 앱 전체에서 사용되는 상수를 정의합니다.
 */

// ===== 앱 설정 =====
export const APP_CONFIG = {
  APP_NAME: 'GTSN-AI',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const

// ===== 로컬 스토리지 키 =====
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
} as const

// ===== HTTP 상태 코드 =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ===== 페이지 사이즈 옵션 =====
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 20
