/**
 * Shared Lib - 범용 유틸리티
 * 
 * 프로젝트 전반에서 재사용되는 범용 유틸리티 함수들을 관리합니다.
 */

/**
 * 깊은 복사
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 배열에서 중복 제거
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}
