/**
 * GFEngine2D TypeScript 타입 정의
 * Electron Preload에서 노출된 window.gfengine API에 대한 타입 정의
 */

// ==========================================
// Enum 타입
// ==========================================

/**
 * 촬영 방향
 */
export enum CameraDirection {
  Front = 0, // 정면
  Side = 1,  // 측면
}

/**
 * 클럽 타입
 */
export enum ClubType {
  Driver = 0, // 드라이버
  Iron = 1,   // 아이언
  Putter = 2, // 퍼터
}

/**
 * 손잡이
 */
export enum HandedType {
  RightHanded = 0, // 오른손잡이
  LeftHanded = 1,  // 왼손잡이
}

// ==========================================
// 요청/응답 타입
// ==========================================

/**
 * 엔진 초기화 응답
 */
export interface InitializeResponse {
  success: boolean;
  message?: string;
}

/**
 * 라이선스 정보
 */
export interface LicenseInfo {
  isValid: boolean;
  expiryDate?: string;
}

/**
 * 분석 옵션
 */
export interface AnalysisOptions {
  direction: CameraDirection;
  clubType: ClubType;
  handedId: HandedType;
}

/**
 * 진행 상황
 */
export interface AnalysisProgress {
  progress: number; // 0-100
  stage: string;    // 진행 단계 설명
}

/**
 * 스윙 데이터
 */
export interface SwingData {
  clubSpeed: number;      // 클럽 스피드 (mph)
  ballSpeed: number;      // 볼 스피드 (mph)
  smashFactor: number;    // 스매시 팩터
  launchAngle: number;    // 발사 각도 (도)
  backSpin: number;       // 백스핀 (rpm)
  sideSpin: number;       // 사이드스핀 (rpm)
  carryDistance: number;  // 캐리 거리 (야드)
  totalDistance: number;  // 총 거리 (야드)
}

/**
 * 스윙 페이즈
 */
export interface SwingPhase {
  phase: string;       // 페이즈 이름
  timestamp: number;   // 시간 (초)
  confidence: number;  // 신뢰도 (0-1)
}

/**
 * 키 프레임
 */
export interface KeyFrame {
  time: number;        // 시간 (초)
  description: string; // 설명
}

/**
 * 비디오 메타데이터
 */
export interface VideoMetadata {
  duration: number;    // 길이 (초)
  width: number;       // 너비 (px)
  height: number;      // 높이 (px)
  fps: number;         // FPS
  totalFrames: number; // 총 프레임 수
}

/**
 * 분석 결과
 */
export interface AnalysisResult {
  analysisId: number;
  videoPath: string;
  timestamp: string;
  swingData: SwingData;
  swingPhases: SwingPhase[];
  keyFrames: KeyFrame[];
  videoMetadata: VideoMetadata;
}

/**
 * 파일 선택 결과
 */
export interface FileSelectResult {
  filePath?: string;
  cancelled: boolean;
}

/**
 * 에러 정보
 */
export interface GFEngineError {
  message: string;
  stack?: string;
}

// ==========================================
// GFEngine API 인터페이스
// ==========================================

/**
 * window.gfengine API
 */
export interface GFEngineAPI {
  // 엔진 초기화 및 기본 정보
  initialize: (
    direction: CameraDirection,
    clubType: ClubType,
    handedId: HandedType
  ) => Promise<InitializeResponse>;
  
  getVersion: () => Promise<string>;
  
  checkLicense: () => Promise<LicenseInfo>;
  
  // 영상 분석
  analyzeVideo: (
    videoPath: string,
    options: AnalysisOptions
  ) => Promise<AnalysisResult>;
  
  cancelAnalysis: () => Promise<boolean>;
  
  // 이벤트 리스너
  onProgress: (callback: (data: AnalysisProgress) => void) => () => void;
  
  onAnalysisComplete: (callback: (data: AnalysisResult) => void) => () => void;
  
  onError: (callback: (error: GFEngineError) => void) => () => void;
  
  // 파일 시스템
  selectVideoFile: () => Promise<FileSelectResult>;
  
  // 유틸리티
  getAppVersion: () => Promise<string>;
  
  log: (level: 'info' | 'warn' | 'error', message: string) => void;
}

/**
 * Electron API
 */
export interface ElectronAPI {
  isDev: boolean;
  platform: string;
}

// ==========================================
// Window 확장
// ==========================================

declare global {
  interface Window {
    gfengine: GFEngineAPI;
    electron: ElectronAPI;
  }
}

export {};

