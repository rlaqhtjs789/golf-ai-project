/**
 * 커스텀 타이틀바 컴포넌트 (frameless 윈도우용)
 */

import React, { useState } from 'react';

// Electron API 타입 정의
declare global {
  interface Window {
    app?: {
      quit: () => Promise<void>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
  }
}

export function CustomTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  // 컴포넌트 마운트 시 API 확인
  React.useEffect(() => {
    console.log('🔧 CustomTitleBar 마운트');
    console.log('   window.app 존재:', !!window.app);
    if (window.app) {
      console.log('   window.app.minimize 존재:', typeof window.app.minimize);
      console.log('   window.app.maximize 존재:', typeof window.app.maximize);
      console.log('   window.app.close 존재:', typeof window.app.close);
    }
  }, []);

  const handleMinimize = async () => {
    console.log('🔽 최소화 버튼 클릭');
    console.log('   window.app:', window.app);
    if (window.app) {
      try {
        await window.app.minimize();
        console.log('✅ 최소화 완료');
      } catch (error) {
        console.error('❌ 최소화 실패:', error);
      }
    } else {
      console.error('❌ window.app이 정의되지 않았습니다!');
      alert('Electron API가 로드되지 않았습니다. 개발 모드에서는 작동하지 않을 수 있습니다.');
    }
  };

  const handleMaximize = async () => {
    console.log('🔼 최대화 버튼 클릭');
    if (window.app) {
      try {
        const result = await window.app.maximize();
        if (result && 'isMaximized' in result) {
          setIsMaximized(result.isMaximized);
        } else {
          setIsMaximized(!isMaximized);
        }
        console.log('✅ 최대화/복원 완료');
      } catch (error) {
        console.error('❌ 최대화/복원 실패:', error);
      }
    } else {
      console.warn('⚠️ window.app이 없습니다 (브라우저 환경?)');
    }
  };

  const handleClose = async () => {
    console.log('❌ 닫기 버튼 클릭');
    if (window.app) {
      try {
        await window.app.close();
        console.log('✅ 창 닫기 완료');
      } catch (error) {
        console.error('❌ 창 닫기 실패:', error);
      }
    } else {
      console.warn('⚠️ window.app이 없습니다 (브라우저 환경?)');
    }
  };

  return (
    <div
      className="h-8 bg-gray-900 flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* 앱 제목 */}
      <div className="flex items-center space-x-2">
        <span className="text-white text-sm font-semibold">GTS AI Analysis</span>
      </div>

      {/* 윈도우 컨트롤 버튼 */}
      <div className="flex items-center space-x-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* 최소화 */}
        <button
          onClick={handleMinimize}
          className="w-12 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          title="최소화"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        {/* 최대화/복원 */}
        <button
          onClick={handleMaximize}
          className="w-12 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          title={isMaximized ? '복원' : '최대화'}
        >
          {isMaximized ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h8M8 17h8M15 7v10M9 7v10"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          )}
        </button>

        {/* 닫기 */}
        <button
          onClick={handleClose}
          className="w-12 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
          title="닫기"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

