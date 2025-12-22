/**
 * ContentModal - 베이스 모달 컴포넌트
 *
 * Headless UI Dialog를 기반으로 한 풀스크린 모달
 * 헤더, 푸터 없이 순수하게 컨텐츠만 표시
 * children(slot)으로 원하는 컨텐츠를 자유롭게 제공할 수 있습니다.
 *
 * @see https://headlessui.com/react/dialog - Headless UI Dialog 공식 문서
 *
 * @example
 * ```tsx
 * <ContentModal isOpen={isOpen} onClose={onClose}>
 *   <div>원하는 컨텐츠</div>
 * </ContentModal>
 * ```
 */
import { Dialog } from '@headlessui/react'
import type { ReactNode } from 'react'

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  showCloseButton?: boolean
}

export function ContentModal({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
}: ContentModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

      {/* 풀스크린 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="relative w-full h-full overflow-auto">
          {/* 닫기 버튼 (옵션) */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="fixed top-6 right-6 z-10 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors group shadow-xl"
              aria-label="닫기">
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* 컨텐츠 영역 (slot) - 전체 화면 */}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
