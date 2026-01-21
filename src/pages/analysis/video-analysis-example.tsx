/**
 * 영상 분석 예제 페이지
 * 
 * 이 파일은 GFEngine API를 사용하는 방법을 보여주는 예제입니다.
 * 실제 프로젝트에서는 swing.tsx에 통합하면 됩니다.
 */

import { useEffect, useState } from 'react';
import { useGFEngine, useElectron } from '@/shared/hooks/useGFEngine';
import {
  CameraDirection,
  ClubType,
  HandedType,
  type AnalysisResult,
} from '@/shared/types/gfengine.d';
import { Button } from '@/shared/ui';

export default function VideoAnalysisExample() {
  const {
    isAvailable,
    isInitialized,
    isAnalyzing,
    progress,
    result,
    error,
    initialize,
    selectVideoFile,
    analyzeVideo,
    cancelAnalysis,
    getVersion,
    clearError,
  } = useGFEngine();

  const { isElectron, isDev, platform } = useElectron();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [engineVersion, setEngineVersion] = useState<string>('');

  // 엔진 초기화 및 버전 확인
  useEffect(() => {
    if (isAvailable && !isInitialized) {
      initializeEngine();
    }
  }, [isAvailable]);

  const initializeEngine = async () => {
    // 엔진 초기화
    const success = await initialize(
      CameraDirection.Front,
      ClubType.Driver,
      HandedType.RightHanded
    );

    if (success) {
      // 버전 정보 조회
      const version = await getVersion();
      setEngineVersion(version);
    }
  };

  // 파일 선택
  const handleSelectFile = async () => {
    const filePath = await selectVideoFile();
    if (filePath) {
      setSelectedFile(filePath);
    }
  };

  // 분석 시작
  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('비디오 파일을 먼저 선택하세요.');
      return;
    }

    try {
      const analysisResult = await analyzeVideo(selectedFile, {
        direction: CameraDirection.Front,
        clubType: ClubType.Driver,
        handedId: HandedType.RightHanded,
      });

      if (analysisResult) {
        console.log('분석 완료:', analysisResult);
        
        // TODO: 백엔드로 결과 전송
        // await sendAnalysisToBackend(analysisResult);
      }
    } catch (err) {
      console.error('분석 실패:', err);
    }
  };

  // 분석 취소
  const handleCancel = async () => {
    const cancelled = await cancelAnalysis();
    if (cancelled) {
      alert('분석이 취소되었습니다.');
    }
  };

  // Electron 환경이 아닌 경우
  if (!isElectron) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold">⚠️ Electron 환경 필요</h1>
          <p className="mb-4 text-gray-600">
            영상 분석 기능은 Electron 데스크톱 앱에서만 사용할 수 있습니다.
          </p>
          <p className="text-sm text-gray-500">
            다음 명령어로 실행하세요:
            <code className="mt-2 block rounded bg-gray-100 p-2">
              npm run electron:dev
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">🎥 영상 분석 예제</h1>
          <p className="text-gray-600">
            GFEngine2D를 사용한 골프 스윙 영상 분석
          </p>
          
          {/* 환경 정보 */}
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm">
            <p>
              <strong>플랫폼:</strong> {platform} | 
              <strong> 개발 모드:</strong> {isDev ? 'Yes' : 'No'} | 
              <strong> 엔진 버전:</strong> {engineVersion || '로딩 중...'}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              ✅ Electron 환경에서 실행 중입니다.
            </p>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-red-800">에러 발생</h3>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 파일 선택 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">1. 비디오 파일 선택</h2>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleSelectFile} disabled={isAnalyzing}>
              📁 파일 선택
            </Button>
            
            {selectedFile && (
              <div className="flex-1 truncate text-sm text-gray-600">
                <strong>선택된 파일:</strong> {selectedFile}
              </div>
            )}
          </div>
        </div>

        {/* 분석 실행 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">2. 분석 실행</h2>
          
          <div className="flex gap-4">
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing || !isInitialized}
              variant="primary"
            >
              {isAnalyzing ? '분석 중...' : '🚀 분석 시작'}
            </Button>
            
            {isAnalyzing && (
              <Button onClick={handleCancel} variant="danger">
                ❌ 취소
              </Button>
            )}
          </div>

          {/* 진행률 표시 */}
          {isAnalyzing && progress && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{progress.stage}</span>
                <span className="text-gray-600">{progress.progress}%</span>
              </div>
              
              {/* 프로그레스 바 */}
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 분석 결과 */}
        {result && (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">3. 분석 결과</h2>
            
            {/* 스윙 데이터 */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium">스윙 데이터</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <DataCard
                  label="클럽 스피드"
                  value={`${result.swingData.clubSpeed} mph`}
                />
                <DataCard
                  label="볼 스피드"
                  value={`${result.swingData.ballSpeed} mph`}
                />
                <DataCard
                  label="스매시 팩터"
                  value={result.swingData.smashFactor.toFixed(2)}
                />
                <DataCard
                  label="발사 각도"
                  value={`${result.swingData.launchAngle}°`}
                />
                <DataCard
                  label="백스핀"
                  value={`${result.swingData.backSpin} rpm`}
                />
                <DataCard
                  label="사이드스핀"
                  value={`${result.swingData.sideSpin} rpm`}
                />
                <DataCard
                  label="캐리 거리"
                  value={`${result.swingData.carryDistance} yd`}
                />
                <DataCard
                  label="총 거리"
                  value={`${result.swingData.totalDistance} yd`}
                />
              </div>
            </div>

            {/* 스윙 페이즈 */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium">스윙 페이즈</h3>
              <div className="space-y-2">
                {result.swingPhases.map((phase, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-3"
                  >
                    <span className="font-medium">{phase.phase}</span>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{phase.timestamp.toFixed(2)}s</span>
                      <span>신뢰도: {(phase.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 비디오 정보 */}
            <div>
              <h3 className="mb-3 text-lg font-medium">비디오 정보</h3>
              <div className="rounded bg-gray-50 p-4 text-sm">
                <p>
                  <strong>해상도:</strong> {result.videoMetadata.width} x{' '}
                  {result.videoMetadata.height}
                </p>
                <p>
                  <strong>FPS:</strong> {result.videoMetadata.fps.toFixed(2)}
                </p>
                <p>
                  <strong>총 프레임:</strong> {result.videoMetadata.totalFrames}
                </p>
                <p>
                  <strong>길이:</strong>{' '}
                  {result.videoMetadata.duration.toFixed(2)}초
                </p>
              </div>
            </div>

            {/* JSON 출력 */}
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-gray-700">
                전체 JSON 데이터 보기
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-gray-900 p-4 text-xs text-green-400">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// 데이터 카드 컴포넌트
function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

