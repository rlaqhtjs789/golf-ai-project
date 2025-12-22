/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 브랜드 색상 테마
      colors: {
        // 메인 브랜드 색상 (그린 계열)
        brand: {
          primary: {
            400: '#4ade80', // green-400
            500: '#22c55e', // green-500
            600: '#16a34a', // green-600
          },
          accent: {
            400: '#34d399', // emerald-400
            500: '#10b981', // emerald-500
            600: '#059669', // emerald-600
          },
          teal: {
            400: '#2dd4bf', // teal-400
          },
        },
        // 배경 색상 (다크 테마)
        bg: {
          primary: '#0f172a',   // slate-900
          secondary: '#1e293b', // slate-800
          tertiary: '#334155',  // slate-700
        },
        // 위험/삭제 색상
        danger: {
          400: '#f87171', // red-400
          500: '#ef4444', // red-500
          600: '#dc2626', // red-600
          700: '#b91c1c', // red-700
        },
      },
      
      // 📱 커스텀 브레이크포인트 추가 예시
      // screens: {
      //   'xs': '475px',
      //   '3xl': '1920px',
      // },
      
      // 📏 커스텀 spacing 추가 예시
      // spacing: {
      //   '128': '32rem',
      //   '144': '36rem',
      // },
      
      // 🔤 커스텀 폰트 추가 예시
      // fontFamily: {
      //   sans: ['Inter', 'sans-serif'],
      //   serif: ['Merriweather', 'serif'],
      // },
    },
  },
  plugins: [
    // 🔌 Tailwind 플러그인 추가 예시
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}
