/**
 * 볼 궤적 시각화 컴포넌트
 * 
 * _Positions 배열의 x, y, z 좌표를 사용하여 볼의 궤적을 Canvas에 그립니다.
 * 여러 개의 궤적을 다른 색상으로 표시할 수 있습니다.
 */
import { useEffect, useRef } from 'react'

interface Position {
  x: number
  y: number
  z: number
}

interface BallTrajectoryProps {
  trajectories: Position[][] // 여러 샷의 궤적 배열
  className?: string
}

// 각 샷별 색상 정의
const TRAJECTORY_COLORS = [
  { stroke: '#3b82f6', fill: '#3b82f6', name: '1번 샷' }, // 파란색
  { stroke: '#10b981', fill: '#10b981', name: '2번 샷' }, // 초록색
  { stroke: '#a855f7', fill: '#a855f7', name: '3번 샷' }, // 보라색
]

export function BallTrajectory({ trajectories, className = '' }: BallTrajectoryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !trajectories || trajectories.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    const width = canvas.width
    const height = canvas.height

    // 배경 클리어
    ctx.fillStyle = '#1e293b' // slate-800
    ctx.fillRect(0, 0, width, height)

    // 모든 궤적의 좌표 범위 계산 (Top-down view: x-z 평면)
    // 각 궤적을 시간 순서대로 정렬 (z 좌표가 증가하는 방향 = 골프공이 날아가는 방향)
    const sortedTrajectories = trajectories.map(positions => {
      // z 좌표 기준으로 정렬 (시작점 z < 끝점 z)
      const sorted = [...positions].sort((a, b) => a.z - b.z)
      return sorted
    })
    
    const allPositions = sortedTrajectories.flat()
    const xCoords = allPositions.map(p => p.x)
    const zCoords = allPositions.map(p => p.z)
    
    // 시작점들의 x 좌표 (가운데 정렬을 위해)
    const startXCoords = sortedTrajectories.map(positions => positions[0]?.x).filter(x => x !== undefined)
    const startXCenter = startXCoords.length > 0 
      ? startXCoords.reduce((sum, x) => sum + x, 0) / startXCoords.length 
      : 0
    
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minZ = Math.min(...zCoords)
    const maxZ = Math.max(...zCoords)
    
    // x 좌표 범위 계산 (실제 데이터 범위 사용, 과도한 확대 방지)
    // 시작점 중심 기준으로 좌우 편차 계산
    const leftDeviation = Math.abs(minX - startXCenter)
    const rightDeviation = Math.abs(maxX - startXCenter)
    const maxDeviation = Math.max(leftDeviation, rightDeviation, 1) // 최소 1 보장
    
    // 실제 x 좌표 범위 사용 (대칭 확대하지 않음)
    // 골프공은 거의 직선으로 날아가므로 실제 편차만 표시
    const rangeX = maxDeviation * 2.5 // 약간의 여유만 추가 (과도한 확대 방지)
    
    // 디버깅: 좌표 범위 확인
    console.log('[BallTrajectory] 좌표 범위:', {
      x: { min: minX, max: maxX, center: startXCenter, leftDeviation, rightDeviation, maxDeviation, range: rangeX },
      z: { min: minZ, max: maxZ, range: maxZ - minZ },
      positionsCount: allPositions.length
    })
    
    // 범위가 너무 작으면 최소값 보장 (일직선 방지)
    const rangeZ = Math.max(maxZ - minZ, 1)

    // 여백 추가
    const padding = 40
    const drawWidth = width - padding * 2
    const drawHeight = height - padding * 2

    // 좌표 변환 함수 (골프 좌표계 → Canvas 좌표계)
    // x 좌표: 시작점 중심으로 매핑 (가운데에서 시작, 실제 편차만 표시)
    const toCanvasX = (x: number) => {
      // 시작점 중심 기준으로 오프셋 계산
      const offsetX = x - startXCenter
      // 실제 편차 범위로 정규화 (중심이 0.5가 되도록)
      const normalizedX = 0.5 + (offsetX / rangeX)
      return padding + normalizedX * drawWidth
    }
    const toCanvasY = (z: number) => {
      // z축을 y축으로 매핑 (위쪽이 먼 거리)
      return height - padding - ((z - minZ) / rangeZ) * drawHeight
    }

    // 그리드 그리기
    ctx.strokeStyle = '#334155' // slate-700
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    
    // 세로 그리드
    for (let i = 0; i <= 10; i++) {
      const x = padding + (drawWidth / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }
    
    // 가로 그리드
    for (let i = 0; i <= 10; i++) {
      const y = padding + (drawHeight / 10) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }
    
    ctx.setLineDash([])

    // 각 궤적을 다른 색상으로 그리기 (정렬된 궤적 사용)
    sortedTrajectories.forEach((positions, index) => {
      if (!positions || positions.length === 0) return
      
      const color = TRAJECTORY_COLORS[index] || TRAJECTORY_COLORS[0]
      
      // 시작점 표시
      ctx.fillStyle = color.fill
      ctx.beginPath()
      ctx.arc(toCanvasX(positions[0].x), toCanvasY(positions[0].z), 5, 0, Math.PI * 2)
      ctx.fill()

      // 궤적 그리기
      ctx.strokeStyle = color.stroke
      ctx.lineWidth = 3
      ctx.shadowColor = color.stroke
      ctx.shadowBlur = 10
      ctx.globalAlpha = 0.8 // 약간 투명하게
      ctx.beginPath()
      
      // 첫 번째 점으로 이동
      const firstX = toCanvasX(positions[0].x)
      const firstZ = toCanvasY(positions[0].z)
      ctx.moveTo(firstX, firstZ)
      
      // 디버깅: 첫 몇 개 좌표 확인
      if (index === 0) {
        console.log('[BallTrajectory] 첫 번째 궤적 좌표 샘플:', {
          first: { x: positions[0].x, z: positions[0].z, canvasX: firstX, canvasZ: firstZ },
          second: { x: positions[1]?.x, z: positions[1]?.z },
          third: { x: positions[2]?.x, z: positions[2]?.z },
          last: { x: positions[positions.length - 1]?.x, z: positions[positions.length - 1]?.z }
        })
      }
      
      // 모든 점을 시간 순서대로 연결 (골프공이 날아가는 방향)
      // z 좌표가 증가하는 방향이 골프공이 날아가는 방향 (시작점 → 끝점)
      for (let i = 1; i < positions.length; i++) {
        const canvasX = toCanvasX(positions[i].x)
        const canvasZ = toCanvasY(positions[i].z)
        ctx.lineTo(canvasX, canvasZ)
      }
      
      // 부드러운 곡선을 위해 quadraticCurveTo 사용 (선택사항)
      // 하지만 일단 직선 연결로 유지
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1.0

      // 착지점 표시
      const lastPos = positions[positions.length - 1]
      ctx.fillStyle = color.fill
      ctx.beginPath()
      ctx.arc(toCanvasX(lastPos.x), toCanvasY(lastPos.z), 5, 0, Math.PI * 2)
      ctx.fill()
      
      // 샷 번호 표시 (착지점 옆)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(`${index + 1}`, toCanvasX(lastPos.x) + 10, toCanvasY(lastPos.z) + 4)
    })

    // 범례
    ctx.font = '14px sans-serif'
    trajectories.forEach((positions, index) => {
      if (!positions || positions.length === 0) return
      const color = TRAJECTORY_COLORS[index] || TRAJECTORY_COLORS[0]
      ctx.fillStyle = color.fill
      ctx.fillText(`● ${color.name}`, padding, 25 + index * 20)
    })

  }, [trajectories])

  if (!trajectories || trajectories.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 rounded-3xl border-4 border-slate-700 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">⛳</div>
          <p className="text-gray-400 text-sm">궤적 대기 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-slate-800 rounded-3xl border-4 border-slate-700 p-4 ${className}`}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-full"
      />
    </div>
  )
}
