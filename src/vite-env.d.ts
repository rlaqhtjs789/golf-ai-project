/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />

// vite-plugin-pages 타입 정의
declare module '~react-pages' {
  import type { RouteObject } from 'react-router-dom'
  import type { RouteMetadata } from '@/app/types/route'

  type PageRoute = RouteObject & {
    meta?: RouteMetadata
  }

  const routes: PageRoute[]
  export default routes
}

// CSS 파일 import 타입 선언
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Swiper CSS 파일 import 타입 선언
declare module 'swiper/css'
declare module 'swiper/css/navigation'
declare module 'swiper/css/pagination'
