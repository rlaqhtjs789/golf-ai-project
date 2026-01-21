/**
 * 프로그램 종료 버튼 컴포넌트
 */

import { useState } from 'react';

export function ExitButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExit = () => {
    setShowConfirm(true);
  };

  const confirmExit = () => {
    if (window.app) {
      window.app.quit();
    } else {
      // 웹 환경에서는 경고만 표시
      alert('Electron 환경에서만 종료할 수 있습니다');
    }
  };

  const cancelExit = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* 나가기 버튼 */}
      <button
        onClick={handleExit}
        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>나가기</span>
      </button>

      {/* 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">프로그램 종료</h3>
            <p className="text-gray-600 mb-6">정말로 프로그램을 종료하시겠습니까?</p>

            <div className="flex space-x-3">
              <button
                onClick={cancelExit}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                종료
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


