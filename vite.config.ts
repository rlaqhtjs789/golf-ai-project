import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from 'vite-plugin-pages'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Pages({
      dirs: 'src/pages',
      extensions: ['tsx', 'jsx'],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Electron에서 로드할 때 상대 경로 사용 (항상 상대 경로)
  base: './',
  // 개발 서버 설정
  server: {
    port: 5174,
    strictPort: true, // 포트가 사용 중이면 에러
  },
  // 빌드 설정
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // public 폴더의 파일들이 dist 루트로 복사되도록 보장
    copyPublicDir: true,
    // Electron 환경에서 사용할 수 있도록 설정
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
})
