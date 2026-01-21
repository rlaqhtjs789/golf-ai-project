/**
 * 세션 시작 폼 컴포넌트
 */

import { useState } from 'react';
import { startSession, type SessionStartParams } from '@/services/aiAnalysisApi';
import { useAnalysisStore } from '@/stores/analysisStore';

export default function SessionStartForm() {
  const { setSession, setLoading, setError } = useAnalysisStore();

  const [formData, setFormData] = useState<SessionStartParams>({
    club_type: 'driver',
    gender: 'male',
    age_group: '30s',
    handicap: null,
    swing_count: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    try {
      const response = await startSession(formData);
      
      if (response.success) {
        setSession(response.data.session, response.data.session_uuid);
        
        // Electron 메인 프로세스에 세션 시작 알림
        if (window.swingAnalysis) {
          await window.swingAnalysis.startSession(
            response.data.session_uuid, 
            formData.swing_count || 10
          );
          console.log('✅ Electron 센서 모니터링 시작');
        }
        
        // 스윙 분석 페이지로 이동
        window.location.href = `/analysis/swing?session=${response.data.session_uuid}`;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '세션 시작 실패');
      console.error('세션 시작 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        스윙 분석 시작하기
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 클럽 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            클럽 선택 *
          </label>
          <select
            value={formData.club_type}
            onChange={(e) => setFormData({ ...formData, club_type: e.target.value as any })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="driver">드라이버</option>
            <option value="wood">우드</option>
            <option value="hybrid">하이브리드</option>
            <option value="iron">아이언</option>
            <option value="wedge">웨지</option>
          </select>
        </div>

        {/* 성별 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성별 *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                formData.gender === 'male'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              남성
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                formData.gender === 'female'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              여성
            </button>
          </div>
        </div>

        {/* 연령대 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연령대 *
          </label>
          <select
            value={formData.age_group}
            onChange={(e) => setFormData({ ...formData, age_group: e.target.value as any })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="10s">10대</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대</option>
            <option value="50s">50대</option>
            <option value="60s">60대</option>
            <option value="70s">70대 이상</option>
          </select>
        </div>

        {/* 핸디캡 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            핸디캡 (선택)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="54"
            value={formData.handicap || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                handicap: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="핸디캡을 입력하세요 (0-54)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            핸디캡을 모르시면 비워두셔도 됩니다
          </p>
        </div>

        {/* 스윙 횟수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            스윙 횟수
          </label>
          <input
            type="number"
            min="3"
            max="20"
            value={formData.swing_count || 10}
            onChange={(e) =>
              setFormData({
                ...formData,
                swing_count: parseInt(e.target.value) || 10,
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            권장: 10회 (최소 3회, 최대 20회)
          </p>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={useAnalysisStore.getState().isLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {useAnalysisStore.getState().isLoading ? '시작 중...' : '분석 시작하기'}
        </button>
      </form>

      {/* 에러 메시지 */}
      {useAnalysisStore.getState().error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{useAnalysisStore.getState().error}</p>
        </div>
      )}

      {/* 안내 사항 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📋 분석 진행 방법</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>1. 기본 정보를 입력하고 '분석 시작하기' 클릭</li>
          <li>2. 런치모니터로 설정한 횟수만큼 스윙</li>
          <li>3. 첫 번째 스윙은 영상 촬영 필수</li>
          <li>4. 모든 스윙 완료 후 AI 분석 결과 확인</li>
        </ul>
      </div>
    </div>
  );
}

