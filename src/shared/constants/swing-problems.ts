/**
 * 스윙 문제 유형 매핑
 * GFEngine2D가 반환하는 문제 유형 코드를 한글 설명으로 변환
 */

export interface SwingProblemType {
  type: number
  typeName: string
  koreanName: string
  description: string
  category: 'posture' | 'swing-path' | 'timing' | 'balance' | 'rotation'
  imageUrl?: string // 문제점 이미지 URL (optional, evidenceImage를 사용)
}

export interface SwingSeverity {
  severity: number
  severityName: string
  koreanName: string
  color: string
}

/**
 * 문제 심각도 매핑
 */
export const SWING_SEVERITIES: Record<number, SwingSeverity> = {
  0: {
    severity: 0,
    severityName: 'kBad',
    koreanName: '심각',
    color: 'red',
  },
  1: {
    severity: 1,
    severityName: 'kNotBad',
    koreanName: '주의',
    color: 'yellow',
  },
  2: {
    severity: 2,
    severityName: 'kGood',
    koreanName: '양호',
    color: 'blue',
  },
}

/**
 * 정면 카메라 문제 유형 (Front View)
 */
export const FRONT_PROBLEM_TYPES: Record<string, SwingProblemType> = {
  kFrontTopSway: {
    type: 9,
    typeName: 'kFrontTopSway',
    koreanName: '백스윙 상체 흔들림',
    description: '백스윙 탑에서 상체가 좌우로 흔들리는 현상',
    category: 'balance',
    imageUrl: '/images/problems/front-top-sway.jpg',
  },
  kFrontTopReverse: {
    type: 10,
    typeName: 'kFrontTopReverse',
    koreanName: '리버스 피벗',
    description: '백스윙 시 체중이 반대 방향으로 이동하는 현상',
    category: 'balance',
  },
  kFrontTopUpright: {
    type: 11,
    typeName: 'kFrontTopUpright',
    koreanName: '상체 과도한 직립',
    description: '백스윙 탑에서 상체가 너무 직립된 자세',
    category: 'posture',
  },
  kFrontTopArmsync: {
    type: 12,
    typeName: 'kFrontTopArmsync',
    koreanName: '팔 동기화 불일치',
    description: '양팔의 움직임이 불균형한 상태',
    category: 'swing-path',
  },
  kFrontDownSpinOut: {
    type: 13,
    typeName: 'kFrontDownSpinOut',
    koreanName: '다운스윙 스핀아웃',
    description: '다운스윙 시 상체가 먼저 열리는 현상',
    category: 'rotation',
  },
  kFrontDownSlide: {
    type: 14,
    typeName: 'kFrontDownSlide',
    koreanName: '슬라이딩',
    description: '다운스윙 시 하체가 목표 방향으로 과도하게 밀리는 현상',
    category: 'balance',
  },
  kFrontDownDipping: {
    type: 15,
    typeName: 'kFrontDownDipping',
    koreanName: '디핑',
    description: '다운스윙 시 상체가 아래로 내려가는 현상',
    category: 'posture',
  },
  kFrontImpactChicken: {
    type: 16,
    typeName: 'kFrontImpactChicken',
    koreanName: '치킨윙',
    description: '임팩트 시 왼쪽 팔꿈치가 구부러지는 현상',
    category: 'swing-path',
  },
  kFrontImpactFlip: {
    type: 17,
    typeName: 'kFrontImpactFlip',
    koreanName: '손목 플립',
    description: '임팩트 전후로 손목이 과도하게 뒤집히는 현상',
    category: 'timing',
  },
  kFrontFinishBalance: {
    type: 18,
    typeName: 'kFrontFinishBalance',
    koreanName: '피니시 밸런스 불안',
    description: '피니시 동작에서 균형을 잃는 현상',
    category: 'balance',
  },
}

/**
 * 측면 카메라 문제 유형 (Side View)
 */
export const SIDE_PROBLEM_TYPES: Record<string, SwingProblemType> = {
  kSideTopOverswing: {
    type: 1,
    typeName: 'kSideTopOverswing',
    koreanName: '오버스윙',
    description: '백스윙 탑에서 클럽이 과도하게 넘어가는 현상',
    category: 'swing-path',
  },
  kSideTopFlat: {
    type: 2,
    typeName: 'kSideTopFlat',
    koreanName: '플랫 스윙',
    description: '스윙 궤도가 너무 평평한 상태',
    category: 'swing-path',
  },
  kSideTopSteep: {
    type: 3,
    typeName: 'kSideTopSteep',
    koreanName: '스팁 스윙',
    description: '스윙 궤도가 너무 가파른 상태',
    category: 'swing-path',
  },
  kSideTopLowHand: {
    type: 4,
    typeName: 'kSideTopLowHand',
    koreanName: '낮은 손 위치',
    description: '백스윙 탑에서 손 위치가 너무 낮음',
    category: 'posture',
  },
  kSideTopOverrotation: {
    type: 5,
    typeName: 'kSideTopOverrotation',
    koreanName: '과도한 회전',
    description: '백스윙에서 몸통이 과도하게 회전하는 현상',
    category: 'rotation',
  },
  kSideDownCasting: {
    type: 6,
    typeName: 'kSideDownCasting',
    koreanName: '캐스팅',
    description: '다운스윙 초기에 손목 코킹이 풀리는 현상',
    category: 'timing',
  },
  kSideDownOverTheTop: {
    type: 7,
    typeName: 'kSideDownOverTheTop',
    koreanName: '아웃사이드인',
    description: '다운스윙 궤도가 바깥쪽에서 안쪽으로 들어오는 현상',
    category: 'swing-path',
  },
  kSideImpactScooping: {
    type: 8,
    typeName: 'kSideImpactScooping',
    koreanName: '스쿠핑',
    description: '임팩트 시 클럽헤드를 떠올리려는 동작',
    category: 'timing',
  },
}

/**
 * 통합 문제 유형 매핑
 */
export const ALL_PROBLEM_TYPES: Record<string, SwingProblemType> = {
  ...FRONT_PROBLEM_TYPES,
  ...SIDE_PROBLEM_TYPES,
}

/**
 * 문제 유형 이름으로 정보 찾기
 */
export function getProblemInfo(typeName: string): SwingProblemType | null {
  const problem = ALL_PROBLEM_TYPES[typeName]
  if (problem && !problem.imageUrl) {
    // 기본 이미지 설정
    problem.imageUrl = '/images/problems/default-problem.jpg'
  }
  return problem || null
}

/**
 * 심각도 정보 찾기
 */
export function getSeverityInfo(severity: number): SwingSeverity {
  return SWING_SEVERITIES[severity] || SWING_SEVERITIES[1]
}

/**
 * 문제를 카테고리별로 그룹화
 */
export function groupProblemsByCategory(problems: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}
  
  problems.forEach(problem => {
    const info = getProblemInfo(problem.typeName)
    if (info) {
      const category = info.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push({
        ...problem,
        ...info,
      })
    }
  })
  
  return grouped
}

/**
 * 점수가 가장 낮은(안좋은) 문제점 상위 N개 선택
 * @param problems 전체 문제 목록
 * @param topN 선택할 개수 (기본: 3)
 * @returns 점수가 낮은 순서로 정렬된 상위 N개
 */
export function getTopNProblems(problems: any[], topN: number = 3): any[] {
  // 점수가 낮을수록 안좋은 것이므로 오름차순 정렬
  const sorted = [...problems].sort((a, b) => {
    const scoreA = a.score !== undefined ? a.score : Infinity
    const scoreB = b.score !== undefined ? b.score : Infinity
    return scoreA - scoreB
  })
  
  return sorted.slice(0, topN).map((problem, index) => {
    const info = getProblemInfo(problem.typeName)
    return {
      id: index + 1,
      ...problem, // evidenceImage, evidenceFrameNumber 등 모든 원본 데이터 유지
      ...info, // koreanName, description, imageUrl 등 추가 정보
      percentage: calculateImprovementPercentage(problem.score, problem.severity),
    }
  })
}

/**
 * 문제 점수와 심각도를 기반으로 개선 가능 퍼센티지 계산
 * @param score 문제 점수 (0.0 ~ 1.0)
 * @param severity 심각도 (0: 심각, 1: 주의, 2: 양호)
 * @returns 개선 가능 퍼센티지
 */
function calculateImprovementPercentage(score: number, severity: number): number {
  // 기본 개선률 = (1 - score) * 100
  let baseImprovement = (1 - score) * 100
  
  // 심각도에 따라 가중치 적용
  const severityWeight = severity === 0 ? 1.5 : severity === 1 ? 1.2 : 1.0
  
  return Math.min(baseImprovement * severityWeight, 90) // 최대 90%
}

/**
 * 카테고리 한글 이름
 */
export const CATEGORY_NAMES: Record<string, string> = {
  posture: '자세',
  'swing-path': '스윙 궤도',
  timing: '타이밍',
  balance: '밸런스',
  rotation: '회전',
}
