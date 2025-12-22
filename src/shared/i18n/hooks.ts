import { useTranslation as useTranslationOriginal } from 'react-i18next'
import i18n from './config'

/**
 * i18n 번역 훅
 * 
 * @example
 * ```tsx
 * const { t, i18n } = useTranslation()
 * 
 * // 사용
 * <h1>{t('common.loading')}</h1>
 * <button onClick={() => i18n.changeLanguage('en')}>English</button>
 * ```
 */
export const useTranslation = () => {
  return useTranslationOriginal()
}

/**
 * 언어 변경 유틸리티
 */
export const changeLanguage = (lng: 'ko' | 'en' | 'ja') => {
  return i18n.changeLanguage(lng)
}

/**
 * 현재 언어 가져오기
 */
export const getCurrentLanguage = (): string => {
  return i18n.language
}

/**
 * 지원하는 언어 목록
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const

export type Language = 'ko' | 'en' | 'ja'
