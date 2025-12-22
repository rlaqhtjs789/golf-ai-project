/**
 * Shared Lib - 문자열 유틸리티
 * 
 * 문자열 관련 유틸리티 함수들을 제공합니다.
 */

/**
 * 문자열의 첫 글자를 대문자로 변환
 * @example capitalize('hello') // "Hello"
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * kebab-case를 camelCase로 변환
 * @example toCamelCase('hello-world') // "helloWorld"
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

/**
 * camelCase를 kebab-case로 변환
 * @example toKebabCase('helloWorld') // "hello-world"
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 문자열 길이 제한 및 말줄임표 추가
 * @example truncate('Hello World', 8) // "Hello..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 전화번호 포맷팅 (한국)
 * @example formatPhoneNumber('01012345678') // "010-1234-5678"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * 숫자를 천 단위 구분 기호로 포맷팅
 * @example formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}
