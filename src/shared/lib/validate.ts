/**
 * Shared Lib - 검증 유틸리티
 * 
 * 데이터 유효성 검사 함수들을 제공합니다.
 */

/**
 * 이메일 유효성 검사
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검사
 * 최소 8자, 대문자, 소문자, 숫자, 특수문자 포함
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 포함해야 합니다')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 포함해야 합니다')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 한국 전화번호 유효성 검사
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * URL 유효성 검사
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 빈 값 체크 (null, undefined, 빈 문자열)
 */
export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

/**
 * 숫자 범위 검사
 */
export function isInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max
}
