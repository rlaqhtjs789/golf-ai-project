/**
 * GFEngine2D TypeScript 타입 정의 (실제 구조 기반)
 */

// ==========================================
// Enum 타입
// ==========================================

/**
 * 촬영 방향
 */
export enum PoseDirection {
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
export enum HandedId {
  RightHanded = 0, // 오른손잡이
  LeftHanded = 1,  // 왼손잡이
}

/**
 * 결과 코드
 */
export enum ResultCode {
  kSuccess = 0,                     // 성공
  kCanceled = 1,                    // 취소됨
  kFailedResourceNotReady = 2,      // 리소스 준비 안됨
  kFailedEngineInternalError = 3,   // 엔진 내부 오류
  kFailedFindPosture = 4,           // 자세 찾기 실패
  kFailedWrongSwingDirection = 5,   // 잘못된 스윙 방향
  kFailedWrongHandedId = 6,         // 잘못된 손잡이
  kUnknown = 7,                     // 알 수 없는 오류
}

/**
 * 스윙 단계
 */
export enum StepId {
  kAddress = 0,        // 어드레스
  kTakeAway = 1,       // 테이크어웨이
  kBackSwing = 2,      // 백스윙
  kTop = 3,            // 탑
  kDownSwing = 4,      // 다운스윙
  kImpact = 5,         // 임팩트
  kFollowThrough = 6,  // 팔로우스루
  kFinish = 7,         // 피니시
}

/**
 * 스윙 문제 심각도
 */
export enum SwingProblemSeverity {
  kUnset = -1,   // 설정 안됨
  kBest = 0,     // 최고
  kNotBad = 1,   // 나쁘지 않음
  kWrong = 3,    // 잘못됨
}

// ==========================================
// 데이터 타입
// ==========================================

/**
 * 프레임 인덱스 (각 스윙 단계별)
 */
export interface FrameIndex {
  address: number;        // 어드레스
  takeAway: number;       // 테이크어웨이
  backSwing: number;      // 백스윙
  top: number;            // 탑
  downSwing: number;      // 다운스윙
  impact: number;         // 임팩트
  followThrough: number;  // 팔로우스루
  finish: number;         // 피니시
}

/**
 * 스윙 문제점
 */
export interface SwingProblem {
  type: number;              // 문제 타입 (숫자)
  typeName: string;          // 문제 타입 이름
  severity: SwingProblemSeverity; // 심각도
  severityName: string;      // 심각도 이름
  score: number;             // 점수 (0.0 ~ 1.0)
  evidenceStepId: StepId;    // 증거가 되는 스윙 단계
}

/**
 * 스윙 플레인
 */
export interface SwingPlane {
  swingTempo: number;  // 스윙 템포
  // handSwingPlanePoints, clubSwingPlanePoints는 C++에서만 사용
}

/**
 * 스윙 결과 인터페이스
 */
export interface SwingResultInterface {
  frameIndex: FrameIndex;           // 각 단계별 프레임 인덱스
  problems: SwingProblem[];         // 스윙 문제점 배열
  swingPlane: SwingPlane;           // 스윙 플레인 정보
  shoulderStanceRatio: number;      // 어깨 스탠스 비율
}

/**
 * 스윙 분석 결과 (최상위)
 */
export interface SwingAnalysisResult {
  resultCode: ResultCode;          // 결과 코드
  success: boolean;                // 성공 여부
  value: SwingResultInterface;     // 실제 분석 결과
}

/**
 * 분석 옵션
 */
export interface AnalysisOptions {
  direction: PoseDirection;
  clubType: ClubType;
  handedId?: HandedId;  // 선택적 (기본값: RightHanded)
}

/**
 * 진행 상황
 */
export interface AnalysisProgress {
  progress: number;  // 0-100
  stage: string;     // 진행 단계 설명
}

/**
 * 초기화 응답
 */
export interface InitializeResponse {
  success: boolean;
  code?: number;
  message?: string;
}

/**
 * 에러 정보
 */
export interface GFEngineError {
  message: string;
  code?: ResultCode;
  stack?: string;
}

// ==========================================
// GFEngine Process API
// ==========================================

/**
 * GFEngine Process API (Node.js 프로세스 래퍼)
 */
export interface GFEngineProcessAPI {
  // 프로세스 제어
  start: () => Promise<void>;
  stop: () => Promise<void>;
  ping: () => Promise<boolean>;
  
  // 엔진 기본
  initialize: (direction: PoseDirection, clubType: ClubType, handedId: HandedId) => Promise<InitializeResponse>;
  getVersion: () => Promise<string>;
  
  // 분석
  analyzeVideo: (videoPath: string, options: AnalysisOptions) => Promise<SwingAnalysisResult>;
  
  // 이벤트
  on(event: 'progress', listener: (data: AnalysisProgress) => void): this;
  on(event: 'exit', listener: (code: number) => void): this;
  on(event: 'ready', listener: () => void): this;
}

// ==========================================
// 헬퍼 함수 타입
// ==========================================

/**
 * 문제점 필터 옵션
 */
export interface ProblemFilterOptions {
  severity?: SwingProblemSeverity | SwingProblemSeverity[];
  stepId?: StepId | StepId[];
  minScore?: number;
  maxScore?: number;
}

/**
 * 유틸리티 함수들
 */
export interface GFEngineUtils {
  // 결과 코드 메시지
  getResultCodeMessage: (code: ResultCode) => string;
  
  // 문제점 이름
  getProblemTypeName: (type: number) => string;
  getSeverityName: (severity: SwingProblemSeverity) => string;
  
  // 문제점 필터링
  filterProblems: (problems: SwingProblem[], options: ProblemFilterOptions) => SwingProblem[];
  
  // 심각한 문제만 추출
  getCriticalProblems: (problems: SwingProblem[]) => SwingProblem[];
  
  // 단계별 문제점 그룹화
  groupProblemsByStep: (problems: SwingProblem[]) => Map<StepId, SwingProblem[]>;
}

export {};


