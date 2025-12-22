/**
 * VideoContentModal - 영상 재생 모달
 *
 * ContentModal을 사용하여 솔루션 영상을 풀스크린으로 재생
 * golf-session 도메인 전용 컴포넌트
 */
import { ContentModal } from '@/shared/ui'

interface VideoContentModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}

export function VideoContentModal({
  isOpen,
  onClose,
  videoUrl,
  title,
}: VideoContentModalProps) {
  return (
    <ContentModal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full flex flex-col bg-black">
        {/* 헤더 - 영상 제목 */}
        <div className="flex-shrink-0 px-8 py-6 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        </div>

        {/* 영상 영역 - 남은 공간 꽉 채움 */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-6">🎥</div>
              <p className="text-gray-400 text-xl md:text-2xl">영상을 준비 중입니다...</p>
            </div>
          )}
        </div>

        {/* 하단 안내 */}
        <div className="flex-shrink-0 px-8 py-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 text-center">
          <p className="text-sm text-gray-400">
            ESC 키를 누르거나 우측 상단 닫기 버튼을 클릭하면 닫힙니다
          </p>
        </div>
      </div>
    </ContentModal>
  )
}
