import type { RouteMetadata } from '@/app/types/route'

/**
 * 경로별 레이아웃 설정
 *
 * 이 객체에서 각 페이지의 레이아웃과 옵션을 중앙에서 관리합니다.
 * Nuxt의 definePageMeta처럼 사용하지만, 중앙화되어 한눈에 볼 수 있습니다.
 */
export const LAYOUT_CONFIG: Record<string, RouteMetadata> = {
  // 홈 페이지
  '/': {
    layout: 'main',
    mainHeader: {
      showHomeButton: false,
      showExitButton: true,
    },
  },

  // 선택 화면 (성별, 연령대, 핸디)
  '/select': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
      showExitButton: true,
      showLanguageSelector: true,
    },
  },

  // 로그인 페이지
  '/login': {
    layout: 'auth',
  },

  // 스윙 페이지
  '/swing': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
      showExitButton: true,
    },
  },

  // 솔루션 페이지
  '/solution': {
    layout: 'main',
    mainHeader: {
      showHomeButton: true,
      showExitButton: true,
    },
  },

  // 완료 페이지 (마지막 페이지)
  '/complete': {
    layout: 'main',
    mainHeader: {
      showHomeButton: false,
      showExitButton: false,
    },
  },

  // 참조사항 - 해당주석 삭제
  // 추가 페이지 설정 예시:
  // '/dashboard': {
  //   layout: 'main',
  //   mainHeader: {
  //     showHomeButton: true,
  //     showExitButton: true,
  //   },
  // },
}

/**
 * 기본 레이아웃 설정
 *
 * LAYOUT_CONFIG에 정의되지 않은 페이지는 이 설정을 사용합니다.
 */
export const DEFAULT_LAYOUT: RouteMetadata = {
  layout: 'main',
  mainHeader: {
    showHomeButton: true,
    showExitButton: true,
    showLanguageSelector: true,
  },
}

/**
 * 경로에 맞는 레이아웃 설정을 찾습니다.
 *
 * @param pathname - 현재 경로
 * @returns 레이아웃 메타데이터
 */
export function getLayoutConfig(pathname: string): RouteMetadata {
  // 정확히 일치하는 경로가 있으면 반환
  if (LAYOUT_CONFIG[pathname]) {
    return LAYOUT_CONFIG[pathname]
  }

  // 동적 라우트 매칭 (예: /blog/:id)
  for (const [pattern, config] of Object.entries(LAYOUT_CONFIG)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
      if (regex.test(pathname)) {
        return config
      }
    }
  }

  // 기본 설정 반환
  return DEFAULT_LAYOUT
}
