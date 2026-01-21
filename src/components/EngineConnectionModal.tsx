/**
 * 영상 분석 엔진 연결 상태 모달
 */

import React, { useEffect, useState } from 'react';

interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  maxReconnectAttempts: number;
  hasFailedPermanently: boolean;
}

export function EngineConnectionModal() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: true,
    isReconnecting: false,
    reconnectAttempt: 0,
    maxReconnectAttempts: 5,
    hasFailedPermanently: false,
  });

  useEffect(() => {
    if (!window.swingAnalysis) return;

    // 연결 끊김
    const unsubLost = window.swingAnalysis.onConnectionLost(() => {
      console.warn('⚠️  엔진 연결 끊김');
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
      }));
    });

    // 재연결 시도 중
    const unsubReconnecting = window.swingAnalysis.onReconnectAttempt((data: any) => {
      console.log(`🔄 재연결 중 (${data.attempt}/${data.maxAttempts})`);
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: true,
        reconnectAttempt: data.attempt,
        maxReconnectAttempts: data.maxAttempts,
      }));
    });

    // 재연결 성공
    const unsubSuccess = window.swingAnalysis.onReconnectSuccess(() => {
      console.log('✅ 재연결 성공');
      setStatus({
        isConnected: true,
        isReconnecting: false,
        reconnectAttempt: 0,
        maxReconnectAttempts: 5,
        hasFailedPermanently: false,
      });
    });

    // 재연결 실패 (최대 시도 횟수 초과)
    const unsubFailed = window.swingAnalysis.onReconnectFailed(() => {
      console.error('❌ 재연결 실패 (최대 시도 횟수 초과)');
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        hasFailedPermanently: true,
      }));
    });

    // 연결 복구
    const unsubRestored = window.swingAnalysis.onConnectionRestored(() => {
      console.log('✅ 연결 복구');
      setStatus({
        isConnected: true,
        isReconnecting: false,
        reconnectAttempt: 0,
        maxReconnectAttempts: 5,
        hasFailedPermanently: false,
      });
    });

    return () => {
      unsubLost();
      unsubReconnecting();
      unsubSuccess();
      unsubFailed();
      unsubRestored();
    };
  }, []);

  // 수동 재연결
  const handleManualReconnect = async () => {
    if (!window.swingAnalysis) return;

    console.log('🔄 수동 재연결 시도...');
    setStatus(prev => ({
      ...prev,
      hasFailedPermanently: false,
      isReconnecting: true,
      reconnectAttempt: 0,
    }));

    await window.swingAnalysis.reconnect();
  };

  // 연결되어 있으면 모달 숨김
  if (status.isConnected) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {status.isReconnecting ? (
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              영상 분석 시스템 연결 상태
            </h3>
          </div>
        </div>

        {/* 본문 */}
        <div className="mb-6">
          {status.isReconnecting ? (
            <div>
              <p className="text-gray-700 mb-2">
                영상 분석 시스템에 재연결을 시도하고 있습니다...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>재연결 시도 중</span>
                <span className="font-semibold">
                  {status.reconnectAttempt} / {status.maxReconnectAttempts}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(status.reconnectAttempt / status.maxReconnectAttempts) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : status.hasFailedPermanently ? (
            <div>
              <p className="text-gray-700 mb-2">
                영상 분석 시스템과의 연결이 끊어졌습니다.
              </p>
              <p className="text-sm text-gray-600">
                자동 재연결이 실패했습니다. 아래 버튼을 눌러 수동으로 재연결을 시도하거나, 앱을 재시작해주세요.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-2">
                영상 분석 시스템과의 연결이 끊어졌습니다.
              </p>
              <p className="text-sm text-gray-600">
                자동으로 재연결을 시도하고 있습니다. 잠시만 기다려주세요.
              </p>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3">
          {status.hasFailedPermanently && (
            <button
              onClick={handleManualReconnect}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              재연결 시도
            </button>
          )}
          
          {!status.isReconnecting && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              앱 재시작
            </button>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 연결이 계속 끊어진다면:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Python이 설치되어 있는지 확인하세요</li>
            <li>DLL 파일이 올바른 위치에 있는지 확인하세요</li>
            <li>백그라운드에서 실행 중인 다른 프로그램을 종료해보세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

