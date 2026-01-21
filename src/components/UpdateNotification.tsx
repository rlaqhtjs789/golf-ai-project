/**
 * Update Notification Component
 * 
 * 앱 업데이트 알림 및 진행 상황 표시
 */

import { useUpdater } from '@/shared/hooks/useUpdater';

export default function UpdateNotification() {
  const {
    checking,
    updateAvailable,
    updateInfo,
    downloading,
    downloadProgress,
    downloaded,
    error,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
  } = useUpdater();

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">업데이트 오류</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-white text-red-500 rounded hover:bg-red-50 transition-colors text-sm"
        >
          닫기
        </button>
      </div>
    );
  }

  if (downloaded) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">업데이트 준비 완료</h3>
        <p className="text-sm mb-4">
          버전 {updateInfo?.version}이(가) 다운로드되었습니다.
          <br />
          앱을 재시작하여 업데이트를 적용하시겠습니까?
        </p>
        <div className="flex gap-2">
          <button
            onClick={quitAndInstall}
            className="flex-1 px-4 py-2 bg-white text-green-600 rounded hover:bg-green-50 transition-colors text-sm font-medium"
          >
            재시작
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            나중에
          </button>
        </div>
      </div>
    );
  }

  if (downloading && downloadProgress) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">업데이트 다운로드 중</h3>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{downloadProgress.percent.toFixed(1)}%</span>
            <span>
              {(downloadProgress.transferred / 1024 / 1024).toFixed(1)} MB /
              {(downloadProgress.total / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
          <div className="w-full bg-blue-300 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress.percent}%` }}
            />
          </div>
        </div>
        <p className="text-xs opacity-80">
          {(downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
        </p>
      </div>
    );
  }

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">새로운 업데이트</h3>
        <p className="text-sm mb-4">
          버전 {updateInfo?.version}을(를) 사용할 수 있습니다.
        </p>
        <div className="flex gap-2">
          <button
            onClick={downloadUpdate}
            className="flex-1 px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            다운로드
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            나중에
          </button>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-700 text-white px-6 py-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          <span className="text-sm">업데이트 확인 중...</span>
        </div>
      </div>
    );
  }

  // 기본 상태: 버튼만 표시
  return (
    <button
      onClick={checkForUpdates}
      className="fixed bottom-4 right-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm transition-colors"
    >
      업데이트 확인
    </button>
  );
}


