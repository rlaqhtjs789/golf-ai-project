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
    const allPositions = trajectories.flat()
    const xCoords = allPositions.map(p => p.x)
    const zCoords = allPositions.map(p => p.z)
    
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minZ = Math.min(...zCoords)
    const maxZ = Math.max(...zCoords)
    
    const rangeX = maxX - minX || 1
    const rangeZ = maxZ - minZ || 1

    // 여백 추가
    const padding = 40
    const drawWidth = width - padding * 2
    const drawHeight = height - padding * 2

    // 좌표 변환 함수 (골프 좌표계 → Canvas 좌표계)
    const toCanvasX = (x: number) => {
      return padding + ((x - minX) / rangeX) * drawWidth
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

    // 각 궤적을 다른 색상으로 그리기
    trajectories.forEach((positions, index) => {
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
      ctx.moveTo(toCanvasX(positions[0].x), toCanvasY(positions[0].z))
      
      for (let i = 1; i < positions.length; i++) {
        ctx.lineTo(toCanvasX(positions[i].x), toCanvasY(positions[i].z))
      }
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
