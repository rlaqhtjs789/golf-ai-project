/**
 * 광역 알림/확인 다이얼로그 컴포넌트
 *
 * HeadlessUI Dialog 기반
 * @see https://headlessui.com/react/dialog
 */
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/solid'

export interface AlertProps {
  isOpen: boolean
  title: string
  subtitle?: string
  okBtnName?: string
  cancelBtnName?: string
  okBtnVariant?: 'primary' | 'danger' | 'success'
  cancelBtnVariant?: 'primary' | 'danger' | 'success'
  type: 'alert' | 'confirm'
  onClose: () => void
  callback?: (result: 'ok' | 'cancel') => void
}

export function Alert({
  isOpen,
  title,
  subtitle,
  okBtnName = '확인',
  cancelBtnName = '취소',
  okBtnVariant = 'primary',
  cancelBtnVariant = 'primary',
  type,
  onClose,
  callback,
}: AlertProps) {
  const handleOk = () => {
    callback?.(('ok'))
    onClose()
  }

  const handleCancel = () => {
    callback?.('cancel')
    onClose()
  }

  const getButtonClass = (variant: 'primary' | 'danger' | 'success') => {
    const baseClass = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg'

    switch (variant) {
      case 'danger':
        return `${baseClass} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white hover:shadow-red-500/50`
      case 'success':
        return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white hover:shadow-green-500/50`
      case 'primary':
      default:
        return `${baseClass} bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white hover:shadow-slate-500/50`
    }
  }

  return (
    <Dialog open={isOpen} onClose={type === 'confirm' ? handleCancel : onClose} className="relative z-[100]">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* 중앙 정렬 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform transition-all">
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-green-500/30 overflow-hidden">
            {/* 배경 애니메이션 효과 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-32 h-32 bg-green-500/10 rounded-full blur-3xl -top-16 -left-16 animate-pulse"></div>
              <div className="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -bottom-16 -right-16 animate-pulse delay-500"></div>
            </div>

            {/* 컨텐츠 */}
            <div className="relative z-10">
              {/* 헤더 */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                    {title}
                  </DialogTitle>
                  <button
                    onClick={type === 'confirm' ? handleCancel : onClose}
                    className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 내용 */}
              {subtitle && (
                <div className="px-6 pb-6">
                  <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {subtitle}
                  </p>
                </div>
              )}

              {/* 버튼 영역 */}
              <div className="px-6 pb-6">
                {type === 'alert' ? (
                  <button
                    onClick={handleOk}
                    className={`w-full ${getButtonClass(okBtnVariant)}`}>
                    {okBtnName}
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className={`flex-1 ${getButtonClass(cancelBtnVariant)}`}>
                      {cancelBtnName}
                    </button>
                    <button
                      onClick={handleOk}
                      className={`flex-1 ${getButtonClass(okBtnVariant)}`}>
                      {okBtnName}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>

      {/* 애니메이션 CSS */}
      <style>{`
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </Dialog>
  )
}
