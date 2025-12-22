import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

/**
 * 테마 훅
 * 
 * @example
 * ```tsx
 * const { theme, setTheme, isDark } = useTheme()
 * 
 * // 다크모드 토글
 * <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
 *   {isDark ? '🌙' : '☀️'}
 * </button>
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
