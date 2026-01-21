/**
 * 매장/타석 설정 페이지
 * 
 * @route /settings/shop
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getShopSettings, 
  saveShopSettings, 
  verifyAdminPassword,
  setAdminPassword,
  type ShopSettings 
} from '@/services/settingsService';

export default function ShopSettingsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [settings, setSettings] = useState<ShopSettings>({ shop_id: null, pcid: null });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 초기 로드 (인증 후)
  useEffect(() => {
    if (isAuthenticated) {
      const current = getShopSettings();
      setSettings(current);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verifyAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다');
      setPasswordInput('');
    }
  };

  const handlePasswordChange = () => {
    if (!newPassword) {
      setMessage({ type: 'error', text: '새 비밀번호를 입력해주세요' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: '비밀번호는 최소 4자 이상이어야 합니다' });
      return;
    }

    setAdminPassword(newPassword);
    setMessage({ type: 'success', text: '비밀번호가 변경되었습니다' });
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.shop_id || !settings.pcid) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      saveShopSettings(settings);
      setMessage({ type: 'success', text: '설정이 저장되었습니다' });
      
      // 2초 후 홈으로 이동
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: '저장에 실패했습니다' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // 비밀번호 인증 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        {/* 배경 애니메이션 */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* 자물쇠 아이콘 */}
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-red-500/20 rounded-full mb-4">
              <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">관리자 인증</h1>
            <p className="text-gray-400">비밀번호를 입력하세요</p>
            <p className="text-xs text-gray-600 mt-2">(기본 비밀번호: 999999)</p>
          </div>

          {/* 비밀번호 입력 폼 */}
          <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 p-8 shadow-2xl">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-6 py-4 bg-slate-900 text-white text-lg text-center rounded-xl border-2 border-slate-600 focus:border-red-500 focus:outline-none transition-colors tracking-widest"
                  autoFocus
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-400 text-center">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-xl transition-colors">
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white text-lg font-semibold rounded-xl transition-all shadow-lg shadow-red-500/30">
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 인증 후 설정 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* 배경 애니메이션 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            매장/타석 설정
          </h1>
          <p className="text-gray-400">
            이 설정은 앱 업데이트 후에도 유지됩니다
          </p>
        </div>

        {/* 설정 폼 */}
        <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 매장 ID */}
            <div>
              <label htmlFor="shop_id" className="block text-lg font-semibold text-gray-200 mb-3">
                매장 ID
              </label>
              <input
                type="number"
                id="shop_id"
                value={settings.shop_id || ''}
                onChange={(e) => setSettings({ ...settings, shop_id: parseInt(e.target.value) || null })}
                placeholder="예: 123"
                className="w-full px-6 py-4 bg-slate-900 text-white text-lg rounded-xl border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                숫자만 입력 가능합니다
              </p>
            </div>

            {/* PC ID */}
            <div>
              <label htmlFor="pcid" className="block text-lg font-semibold text-gray-200 mb-3">
                타석 ID (PC ID)
              </label>
              <input
                type="text"
                id="pcid"
                value={settings.pcid || ''}
                onChange={(e) => setSettings({ ...settings, pcid: e.target.value || null })}
                placeholder="예: PC001"
                className="w-full px-6 py-4 bg-slate-900 text-white text-lg rounded-xl border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                타석을 식별할 수 있는 고유 ID
              </p>
            </div>

            {/* 메시지 */}
            {message && (
              <div
                className={`p-4 rounded-xl ${
                  message.type === 'success'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                {message.text}
              </div>
            )}

            {/* 비밀번호 변경 버튼 */}
            <div className="pt-4 border-t-2 border-slate-700">
              {!showPasswordChange ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(true)}
                  className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  비밀번호 변경
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">비밀번호 변경</h3>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (최소 4자)"
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl border-2 border-slate-600 focus:border-green-500 focus:outline-none transition-colors"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordChange}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors">
                      변경
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-xl transition-colors">
                취소
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg font-semibold rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>

        {/* 현재 설정 정보 */}
        <div className="mt-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">현재 설정</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">매장 ID:</span>
              <span className="text-gray-300 font-mono">
                {settings.shop_id || '미설정'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">타석 ID:</span>
              <span className="text-gray-300 font-mono">
                {settings.pcid || '미설정'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
