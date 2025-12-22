/**
 * 브랜드 색상 테마 가이드
 *
 * tailwind.config.js에 정의된 커스텀 색상을 사용하세요.
 * 이 파일은 참고용이며, 실제로는 Tailwind 클래스를 사용합니다.
 */

/**
 * 사용 방법:
 *
 * ❌ 기존 방식 (하드코딩):
 * className="bg-green-500 text-emerald-400"
 *
 * ✅ 새로운 방식 (테마 사용):
 * className="bg-brand-primary-500 text-brand-accent-400"
 *
 * 나중에 색상 변경 시:
 * tailwind.config.js에서만 색상값을 변경하면 전체 테마가 변경됩니다!
 */

export const THEME_GUIDE = {
  // 메인 브랜드 색상 (그린 계열)
  primary: {
    light: 'brand-primary-400',   // #4ade80 (green-400)
    DEFAULT: 'brand-primary-500', // #22c55e (green-500)
    dark: 'brand-primary-600',    // #16a34a (green-600)
  },

  // 액센트 색상 (에메랄드 계열)
  accent: {
    light: 'brand-accent-400',   // #34d399 (emerald-400)
    DEFAULT: 'brand-accent-500', // #10b981 (emerald-500)
    dark: 'brand-accent-600',    // #059669 (emerald-600)
  },

  // 틸 색상
  teal: {
    DEFAULT: 'brand-teal-400', // #2dd4bf (teal-400)
  },

  // 배경 색상 (다크 테마)
  background: {
    primary: 'bg-primary',   // #0f172a (slate-900)
    secondary: 'bg-secondary', // #1e293b (slate-800)
    tertiary: 'bg-tertiary',  // #334155 (slate-700)
  },

  // 위험/삭제 색상
  danger: {
    light: 'danger-400',   // #f87171 (red-400)
    DEFAULT: 'danger-500', // #ef4444 (red-500)
    medium: 'danger-600',  // #dc2626 (red-600)
    dark: 'danger-700',    // #b91c1c (red-700)
  },
} as const

/**
 * 그라데이션 예시:
 *
 * bg-gradient-to-r from-brand-primary-500 to-brand-accent-600
 * bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary
 */

/**
 * 투명도 사용:
 *
 * bg-brand-primary-500/10  (10% 투명도)
 * bg-brand-primary-500/50  (50% 투명도)
 * border-brand-primary-500/30
 */
