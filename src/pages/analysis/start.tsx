/**
 * 분석 시작 페이지
 */

import SessionStartForm from '@/components/SessionStartForm';

export default function AnalysisStartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ⛳ GTSN Golf AI
          </h1>
          <p className="text-xl text-gray-600">
            AI 기반 골프 스윙 분석 시스템
          </p>
        </div>

        {/* 폼 */}
        <SessionStartForm />

        {/* 특징 */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2">비거리 분석</h3>
            <p className="text-sm text-gray-600">
              클럽 스피드 기준 최적화율 계산
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="font-bold text-lg mb-2">구질 분석</h3>
            <p className="text-sm text-gray-600">
              드로우, 페이드, 슬라이스 패턴 분석
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold text-lg mb-2">일관성 분석</h3>
            <p className="text-sm text-gray-600">
              착지점 분포도 및 안정성 평가
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

