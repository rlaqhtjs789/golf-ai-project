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
      <div className="w-full max-w-5xl mx-auto h-[80vh] flex flex-col bg-black rounded-xl overflow-hidden">
        {/* 헤더 - 영상 제목 */}
        <div className="flex-shrink-0 px-8 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">{title}</h2>
        </div>

        {/* 영상 영역 - 세로 100%로 영상 전체 보이게 */}
        <div className="flex-1 flex items-center justify-center bg-black min-h-0 overflow-hidden">
          {videoUrl ? (
            <video
              key={videoUrl} // videoUrl이 변경되면 재생되도록 key 추가
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('[VideoContentModal] 영상 로드 실패:', videoUrl, e)
                console.error('[VideoContentModal] 에러 상세:', e.currentTarget.error)
              }}
              onLoadedData={() => {
                console.log('[VideoContentModal] 영상 로드 완료:', videoUrl)
              }}
              onCanPlay={() => {
                console.log('[VideoContentModal] 영상 재생 가능:', videoUrl)
              }}
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl md:text-8xl mb-6">🎥</div>
              <p className="text-gray-400 text-xl md:text-2xl">영상을 준비 중입니다...</p>
            </div>
          )}
        </div>

        {/* 하단 안내 */}
        <div className="flex-shrink-0 px-8 py-3 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 text-center">
          <p className="text-xs text-gray-400">
            ESC 키를 누르거나 우측 상단 닫기 버튼을 클릭하면 닫힙니다
          </p>
        </div>
      </div>
    </ContentModal>
  )
}
