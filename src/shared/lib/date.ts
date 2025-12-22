/**
 * Shared Lib - 날짜 유틸리티
 * 
 * 날짜 관련 유틸리티 함수들을 제공합니다.
 */

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @example formatDate(new Date()) // "2025년 12월 16일"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * 날짜와 시간을 포맷팅
 * @example formatDateTime(new Date()) // "2025년 12월 16일 오후 3:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * 상대 시간 표시 (예: "3분 전", "2시간 전")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

/**
 * ISO 문자열을 Date 객체로 변환
 */
export function parseISODate(isoString: string): Date {
  return new Date(isoString)
}

/**
 * 날짜가 유효한지 검증
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}
