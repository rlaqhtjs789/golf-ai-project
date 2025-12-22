import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// 브라우저 언어 또는 로컬스토리지에서 언어 가져오기
const getInitialLanguage = (): string => {
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) return savedLanguage
  
  const browserLanguage = navigator.language.split('-')[0]
  return ['ko', 'en', 'ja'].includes(browserLanguage) ? browserLanguage : 'ko'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: getInitialLanguage(), // 초기 언어 (기본: 한국어)
    fallbackLng: 'ko', // 번역이 없을 경우 대체 언어
    interpolation: {
      escapeValue: false, // React는 XSS 보호가 되어있음
    },
    react: {
      useSuspense: false, // Suspense 비활성화 (선택사항)
    },
  })

// 언어 변경 시 로컬스토리지에 저장
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng)
})

export default i18n
