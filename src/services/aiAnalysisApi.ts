/**
 * AI 분석 백엔드 API 서비스
 */

import { getShopSettings } from './settingsService';

// 백엔드 API 기본 URL
const API_BASE_URL = 'https://api.playgts.com/api';

// ==========================================
// 타입 정의
// ==========================================

export interface SessionStartParams {
  user_id?: number | null;
  club_type: 'driver' | '3wood' | '5wood' | '3iron' | '4iron' | '5iron' | '6iron' | '7iron' | '8iron' | '9iron' | 'pw' | 'aw' | 'sw' | string;
  gender: 'male' | 'female';
  age_group: '10s' | '20s' | '30s' | '40s' | '50s' | '60s' | '70s' | string;
  handicap?: number | null;
  swing_count?: number;
  shop_id?: number;  // 추가
  pcid?: string;     // 추가
}

export interface Session {
  id: number;
  session_uuid: string;
  user_id: number | null;
  club_type: string;
  gender: string;
  age_group: string;
  handicap: number | null;
  swing_count: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SwingData {
  club_speed: number;
  ball_speed: number;
  launch_angle: number;
  spin_rate: number;
  carry_distance: number;
  carry_side: number;
  total_distance: number;
  total_side: number;
  shot_shape: string;
  side_spin: number;
}

export interface AnalysisResult {
  distance: {
    score: number;
    avg_carry: number;
    optimal_carry: number;
    optimization_rate: number;
  };
  shot_shape: {
    dominant: string;
    distribution: Record<string, number>;
    avg_side_spin: number;
    avg_curve: number;
  };
  consistency: {
    score: number;
    dispersion_area: number;
    dispersion_radius: number;
    std_dev_carry: number;
    std_dev_side: number;
    points: Array<{ x: number; y: number }>;
  };
  overall_score: number;
}

export interface ImprovementData {
  improvable: boolean;
  improvable_percentage?: number;
  current?: any;
  optimal?: any;
  difference?: number;
  message?: string;
  description?: string;
}

export interface Improvements {
  main_message?: string;
  improvements?: {
    distance?: ImprovementData & {
      current: number;
      optimal: number;
      difference: number;
    };
    ball_flight?: ImprovementData & {
      current: string; // "슬라이스" | "훅" | "스트레이트"
      side_spin: number;
      optimal_range: [number, number];
      excess_spin: number;
      avg_curve: number;
    };
    smash_factor?: ImprovementData & {
      current: number;
      optimal: number;
      difference: number;
    };
    launch_angle?: ImprovementData & {
      current: number;
      optimal: number;
      difference: number;
    };
    spin_rate?: ImprovementData & {
      current: number;
      optimal: number;
      difference: number;
    };
  };
  standards?: {
    club_speed: number;
    optimal_carry_distance: number;
    optimal_ball_speed: number;
    optimal_launch_angle: number;
    optimal_spin_rate: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==========================================
// API 함수들
// ==========================================

/**
 * 설정 조회
 */
export async function getConfig() {
  const response = await fetch(`${API_BASE_URL}/ai-analysis/config`);
  if (!response.ok) {
    throw new Error('설정 조회 실패');
  }
  return response.json();
}

/**
 * 세션 시작
 */
export async function startSession(params: SessionStartParams): Promise<ApiResponse<{ session_uuid: string; session: Session }>> {
  // shop_id와 pcid 자동 추가
  const shopSettings = getShopSettings();
  const finalShopId = params.shop_id ?? shopSettings.shop_id;
  const finalPcid = params.pcid ?? shopSettings.pcid;
  
  const requestBody: any = {
    ...params,
  };
  
  // shop_id와 pcid가 null이 아닐 때만 추가
  if (finalShopId !== null && finalShopId !== undefined) {
    requestBody.shop_id = finalShopId;
  }
  if (finalPcid !== null && finalPcid !== undefined) {
    requestBody.pcid = finalPcid;
  }

  console.log('[API] startSession 요청 데이터:', requestBody);
  console.log('[API] shopSettings:', shopSettings);

  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[API] startSession 에러 응답:', error);
    console.error('[API] 요청 데이터:', requestBody);
    throw new Error(error.message || '세션 시작 실패');
  }

  return response.json();
}

/**
 * 스윙 데이터 저장
 */
export async function saveSwing(sessionUuid: string, shotData: SwingData, video?: File): Promise<ApiResponse<any>> {
  const formData = new FormData();

  if (video) {
    formData.append('video', video);
  }

  // shot_data를 FormData에 추가
  Object.entries(shotData).forEach(([key, value]) => {
    formData.append(`shot_data[${key}]`, String(value));
  });

  // shop_id와 pcid 자동 추가
  const shopSettings = getShopSettings();
  if (shopSettings.shop_id) {
    formData.append('shop_id', String(shopSettings.shop_id));
  }
  if (shopSettings.pcid) {
    formData.append('pcid', shopSettings.pcid);
  }

  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions/${sessionUuid}/swings`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '스윙 데이터 저장 실패');
  }

  return response.json();
}

/**
 * 세션 조회 (분석 결과 포함)
 */
export async function getSession(sessionUuid: string): Promise<ApiResponse<{ session: Session; analysis?: AnalysisResult; improvements?: Improvements }>> {
  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions/${sessionUuid}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '세션 조회 실패');
  }

  return response.json();
}

/**
 * 세션 목록 조회
 */
export async function getSessions(params?: {
  user_id?: number;
  status?: string;
  club_type?: string;
  per_page?: number;
  page?: number;
}): Promise<ApiResponse<{ sessions: Session[]; pagination: any }>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const url = `${API_BASE_URL}/ai-analysis/sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '세션 목록 조회 실패');
  }

  return response.json();
}

/**
 * 세션 취소
 */
export async function cancelSession(sessionUuid: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions/${sessionUuid}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '세션 취소 실패');
  }

  return response.json();
}

/**
 * 세션 삭제
 */
export async function deleteSession(sessionUuid: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions/${sessionUuid}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '세션 삭제 실패');
  }

  return response.json();
}

/**
 * 세션 재분석
 */
export async function reanalyzeSession(sessionUuid: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions/${sessionUuid}/reanalyze`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '재분석 실패');
  }

  return response.json();
}

/**
 * 영상 분석 결과 저장
 */
export async function saveVideoAnalysis(
  sessionUuid: string, 
  swingNumber: number, 
  resultCode: number, 
  analysisResult: any
): Promise<ApiResponse<any>> {
  // shop_id와 pcid 자동 추가
  const shopSettings = getShopSettings();
  const requestBody: any = {
    swing_number: swingNumber,
    result_code: resultCode,
    analysis_result: analysisResult,
  };
  
  // shop_id와 pcid가 null이 아닐 때만 추가
  if (shopSettings.shop_id !== null && shopSettings.shop_id !== undefined) {
    requestBody.shop_id = shopSettings.shop_id;
  }
  if (shopSettings.pcid !== null && shopSettings.pcid !== undefined) {
    requestBody.pcid = shopSettings.pcid;
  }
  
  console.log('[API] saveVideoAnalysis 요청 데이터:', requestBody);

  const response = await fetch(`${API_BASE_URL}/ai-analysis/sessions/${sessionUuid}/video-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '영상 분석 결과 저장 실패');
  }

  return response.json();
}


