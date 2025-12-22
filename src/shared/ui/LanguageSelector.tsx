/**
 * 언어 선택 컴포넌트
 *
 * i18n 다국어 지원
 */
import { useTranslation, SUPPORTED_LANGUAGES } from '@/shared/i18n'

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800/30 rounded-xl p-1 backdrop-blur-sm border border-slate-700/50">
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = i18n.language === lang.code
        return (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-green-500/20 text-green-400 shadow-lg shadow-green-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/50'
              }
            `}
          >
            {lang.code.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
