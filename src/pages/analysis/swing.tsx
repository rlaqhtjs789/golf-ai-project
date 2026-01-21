/**
 * 스윙 페이지
 *
 * @route /swing
 *
 * 플로우:
 * 1. 첫 번째 스윙 (swing-first): 스윙화면-1 → 스윙화면-2 → 스윙화면-3 → 솔루션 영상
 * 2. 두 번째 스윙 (swing-second): 스윙화면두번째-1 → 스윙화면-2 → 스윙화면-3 → 솔루션 차트
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore, selectCurrentStep, selectFirstSwingProgress, selectSecondSwingProgress, selectSwingCount, selectVideoAnalysisResults, selectSessionUuid } from '@/features/golf-session/model/sessionStore'
import { SWING_COUNT_PER_SESSION } from '@/shared/constants/swing'
import { BallTrajectory } from '@/components/BallTrajectory'
import { saveSwing, saveVideoAnalysis } from '@/services/aiAnalysisApi'

type SwingPhase = 'preparing' | 'swinging' | 'loading'

// 초기 측정 데이터
const getInitialMeasurement = () => ({
  clubSpeed: '0',
  ballSpeed: '0',
  launchAngle: '0',
  direction: '-',
  lateralDistance: '0',
  distance: '0',
  sideSpin: '-',
  backSpin: '0',
  ballFlight: '-',
})

// 임시 측정 데이터 생성 함수
const generateMockData = () => ({
  clubSpeed: (48 + Math.random() * 5).toFixed(1),
  ballSpeed: (33 + Math.random() * 5).toFixed(1),
  launchAngle: (18 + Math.random() * 5).toFixed(1),
  direction: Math.random() > 0.5 ? `L${(Math.random() * 2).toFixed(1)}` : `R${(Math.random() * 2).toFixed(1)}`,
  lateralDistance: (1 + Math.random() * 3).toFixed(1),
  distance: (200 + Math.random() * 70).toFixed(1),
  sideSpin: `${Math.random() > 0.5 ? 'R' : 'L'}${Math.floor(300 + Math.random() * 300)}`,
  backSpin: String(Math.floor(4000 + Math.random() * 1000)),
  ballFlight: ['슬라이스', '훅', '스트레이트'][Math.floor(Math.random() * 3)],
})

function SwingPage() {
  const navigate = useNavigate()
  const currentStep = useSessionStore(selectCurrentStep)
  const firstSwingProgress = useSessionStore(selectFirstSwingProgress)
  const secondSwingProgress = useSessionStore(selectSecondSwingProgress)
  const swingCount = useSessionStore(selectSwingCount)
  const videoAnalysisResults = useSessionStore(selectVideoAnalysisResults)
  const sessionUuid = useSessionStore(selectSessionUuid)
  const { setStep, setFirstSwingProgress, setSecondSwingProgress, addSwingToHistory, setSwingCount, addVideoAnalysisResult } = useSessionStore()

  const [phase, setPhase] = useState<SwingPhase>('preparing')
  const [currentMeasurement, setCurrentMeasurement] = useState(getInitialMeasurement())
  const [measurements, setMeasurements] = useState<Array<typeof currentMeasurement>>([])
  
  // 볼 궤적 상태 (3개의 샷 각각 저장)
  const [ballTrajectories, setBallTrajectories] = useState<Array<Array<{ x: number; y: number; z: number }>>>([])
  
  // 영상 분석 상태
  const [videoAnalysisStatus, setVideoAnalysisStatus] = useState<{
    isAnalyzing: boolean;
    currentVideo: 'front' | 'side' | null;
    stage: string;
    progress: number;
    error: string | null;
    hasVideo: boolean; // 영상 데이터가 있는지 여부
    videoAnalysisComplete: boolean; // 영상 분석이 완료되었는지 여부
  }>({
    isAnalyzing: false,
    currentVideo: null,
    stage: '',
    progress: 0,
    error: null,
    hasVideo: false,
    videoAnalysisComplete: false,
  })

  // 첫 번째 스윙인지 두 번째 스윙인지 확인
  const isFirstSwing = currentStep === 'swing-first'

  // 시스템 준비 완료 대기 (Electron 수집 모드 활성화 대기)
  useEffect(() => {
    if (phase !== 'preparing') return

    console.log('[swing] 시스템 준비 중... (Electron 수집 모드 활성화 대기)')
    
    // Electron 환경이 아니면 즉시 전환
    if (!window.swingAnalysis) {
      console.log('[swing] Electron 환경 아님 - 즉시 전환')
      setPhase('swinging')
      return
    }

    // 일정 시간 대기 후 전환 (Electron 수집 모드 활성화 완료 대기)
    const timer = setTimeout(() => {
      console.log('[swing] ✅ 시스템 준비 완료 - 스윙 모드로 전환')
      setPhase('swinging')
    }, 1500) // 1.5초 대기 (setup.tsx의 IPC 호출 완료 대기)

    return () => clearTimeout(timer)
  }, [phase])

  // 샷 데이터 및 영상 분석 이벤트 리스너 + startSession 확인
  useEffect(() => {
    if (!window.swingAnalysis) {
      console.log('[swing] ⚠️ window.swingAnalysis 없음 - Electron 환경이 아님')
      return
    }

    console.log('✅ 스윙 분석 리스너 등록')
    
    // 영상 분석 결과 리스너 등록 확인
    console.log('[swing] 📡 Registering onVideoResult listener...')
    console.log('[swing] 📡 window.swingAnalysis.onVideoResult exists:', typeof window.swingAnalysis?.onVideoResult)
    
    // 샷 데이터 수신 이벤트 - 각 샷마다 바로 solution으로 이동
    // 리스너를 먼저 등록 (이벤트를 놓치지 않도록)
    console.log('[swing] 📡 Registering onNewShot listener...')
    console.log('[swing] 📡 window.swingAnalysis.onNewShot exists:', typeof window.swingAnalysis?.onNewShot)
    const unsubNewShot = window.swingAnalysis.onNewShot(async (receivedData: any) => {
      // 최신 상태 값 가져오기 (클로저 문제 방지)
      const currentStore = useSessionStore.getState()
      const currentSwingCount = currentStore.swingCount
      const currentSessionUuid = currentStore.sessionUuid
      
      console.log(`\n${'='.repeat(60)}`)
      console.log(`[swing] 🎯 onNewShot callback triggered!`)
      
      // 궤적 데이터를 제외한 샷 데이터만 로그 출력
      const logData = { ...receivedData }
      if (logData.data && logData.data._Positions) {
        logData.data = { ...logData.data, _Positions: `[${logData.data._Positions.length}개 좌표]` }
      }
      if (logData._Positions) {
        logData._Positions = `[${logData._Positions.length}개 좌표]`
      }
      
      // 데이터 구조 확인: { sessionUuid, data } 또는 직접 shotData
      const actualShotData = receivedData.data || receivedData
      const actualSessionUuid = receivedData.sessionUuid || currentSessionUuid
      
      // 궤적 데이터를 제외한 샷 데이터만 로그 출력
      const logShotData = { ...actualShotData }
      if (logShotData._Positions) {
        logShotData._Positions = `[${logShotData._Positions.length}개 좌표]`
      }
      console.log(`[swing] 📋 세션 UUID:`, actualSessionUuid)
      
      // API 호출: 샷 데이터 저장
      if (actualSessionUuid) {
        try {
          console.log(`[swing] 📤 API 호출 시작: saveSwing(${actualSessionUuid})`)
          // 모든 샷 데이터 필드를 그대로 전송 (필터링하지 않음)
          // 단, _Positions는 제외 (궤적 데이터는 너무 크므로 API로 전송하지 않음)
          // 소수점이 있는 숫자 필드는 1자리로 제한
          const apiShotData: any = {}
          
          // 원본 데이터의 모든 필드를 복사 (단, _Positions 제외)
          Object.keys(actualShotData).forEach(key => {
            // _Positions는 API 전송에서 제외
            if (key === '_Positions') {
              return
            }
            
            const value = actualShotData[key]
            // 숫자 필드 중 소수점이 있는 경우 1자리로 제한
            if (typeof value === 'number' && !Number.isInteger(value) && key !== 'club' && key !== 'shotCount' && key !== 'apexCount' && key !== 'carryCount' && key !== 'posCount') {
              apiShotData[key] = Number(value.toFixed(1))
            } else {
              apiShotData[key] = value
            }
          })
          
          // club 필드가 없거나 null이면 0으로 설정
          if (apiShotData.club === undefined || apiShotData.club === null) {
            apiShotData.club = 0
          }
          
          console.log(`[swing] 📋 API 전송 데이터 (궤적 제외):`, apiShotData)
          console.log(`[swing] 📤 API 전송 데이터:`, apiShotData)
          
          const response = await saveSwing(actualSessionUuid, apiShotData as any)
          console.log(`[swing] ✅ API 호출 성공:`, response)
        } catch (error: any) {
          console.error(`[swing] ❌ API 호출 실패:`, error)
          console.error(`[swing] 에러 상세:`, error.message)
        }
      } else {
        console.error(`[swing] ⚠️ 세션 UUID 없음 - API 호출 스킵`)
      }
      
      // 1. 측정값 업데이트
      const measurement = {
        clubSpeed: actualShotData.clubSpeed || actualShotData.club_speed || '0',
        ballSpeed: actualShotData.ballSpeed || actualShotData.ball_speed || '0',
        launchAngle: actualShotData.launchAngle || actualShotData.launch_angle || '0',
        direction: actualShotData.azimuth?.toFixed(1) || '0',
        lateralDistance: actualShotData.carrySide?.toFixed(1) || '0',
        distance: Number(actualShotData.dist || actualShotData.total_distance || actualShotData.carry || 0), // 비거리 데이터를 숫자로 저장
        sideSpin: actualShotData.sideSpin || actualShotData.side_spin || '0',
        backSpin: actualShotData.backSpin || actualShotData.back_spin || '0',
        ballFlight: actualShotData.shotShape || 'straight',
      }
      setCurrentMeasurement(measurement)
      setMeasurements(prev => [...prev, measurement])
      
      // 2. 볼 궤적 업데이트 (배열에 추가)
      if (actualShotData._Positions && Array.isArray(actualShotData._Positions)) {
        // 궤적 데이터는 로그에 출력하지 않음
        setBallTrajectories(prev => [...prev, actualShotData._Positions])
      }
      
      // 3. 진행률 업데이트 (체크박스) - 최신 값 사용
      // Zustand store에서 최신 값을 직접 가져오기
      const store = useSessionStore.getState()
      const currentIsFirstSwing = store.currentStep === 'swing-first'
      const currentProgress = currentIsFirstSwing ? store.firstSwingProgress : store.secondSwingProgress
      const nextProgress = currentProgress + 1
      
      if (currentIsFirstSwing) {
        setFirstSwingProgress(nextProgress)
      } else {
        setSecondSwingProgress(nextProgress)
      }
      
      // 4. 모든 샷 데이터를 받았는지 확인
      if (nextProgress >= SWING_COUNT_PER_SESSION) {
        // 모든 샷 데이터 수신 완료 → SwingData 생성 및 히스토리에 추가
        console.log(`   ✅ shot Data received (${nextProgress}/${SWING_COUNT_PER_SESSION})`)
        
        // 현재 measurements 배열에서 SwingData 생성
        const currentMeasurements = [...measurements, measurement]
        const swingNumber = currentStore.swingCount
        
        // 평균값 계산
        const avgClubSpeed = currentMeasurements.reduce((sum, m) => sum + Number(m.clubSpeed || 0), 0) / currentMeasurements.length
        const avgBallSpeed = currentMeasurements.reduce((sum, m) => sum + Number(m.ballSpeed || 0), 0) / currentMeasurements.length
        const avgDistance = currentMeasurements.reduce((sum, m) => {
          // distance는 이미 숫자이거나 문자열일 수 있으므로 Number로 변환
          const dist = typeof m.distance === 'number' ? m.distance : Number(m.distance || 0)
          return sum + dist
        }, 0) / currentMeasurements.length
        const avgAngle = currentMeasurements.reduce((sum, m) => sum + Number(m.launchAngle || 0), 0) / currentMeasurements.length
        const avgSpin = currentMeasurements.reduce((sum, m) => sum + (Number(m.backSpin || 0) + Number(m.sideSpin || 0)), 0) / currentMeasurements.length
        
        // SwingMeasurement 형식으로 변환
        const swingMeasurements = currentMeasurements.map((m, idx) => ({
          swingNumber: swingNumber,
          clubSpeed: Number(m.clubSpeed || 0),
          ballSpeed: Number(m.ballSpeed || 0),
          distance: Number(m.distance || 0),
          angle: Number(m.launchAngle || 0),
          spin: Number(m.backSpin || 0) + Number(m.sideSpin || 0),
          timestamp: Date.now() + idx * 1000, // 각 샷마다 1초 간격
        }))
        
        // SwingData 생성
        const swingData = {
          swingNumber,
          measurements: swingMeasurements,
          averages: {
            clubSpeed: avgClubSpeed,
            ballSpeed: avgBallSpeed,
            distance: avgDistance,
            angle: avgAngle,
            spin: avgSpin,
          },
          completedAt: Date.now(),
        }
        
        console.log(`   📊 SwingData 생성:`, swingData)
        
        // 히스토리에 추가
        addSwingToHistory(swingData)
        
        // 첫 번째 스윙이고 영상 분석이 필요한 경우 영상 분석 결과 대기
        const isFirstSwing = currentStore.currentStep === 'swing-first'
        const hasVideoData = videoAnalysisStatus.isAnalyzing || videoAnalysisStatus.hasVideo
        
        console.log(`   → loading phase로 전환 (영상 분석 대기: ${isFirstSwing && hasVideoData})`)
        // setTimeout으로 상태 업데이트 후 phase 변경
        setTimeout(() => {
          setPhase('loading')
        }, 100)
      } else {
        // 아직 더 받아야 함 → swinging phase 유지
        console.log(`   ⏳ 아직 ${SWING_COUNT_PER_SESSION - nextProgress}개 더 필요 (${nextProgress}/${SWING_COUNT_PER_SESSION})`)
        // phase는 'swinging'으로 유지 (다음 샷 대기)
      }
    })

    const unsubStart = window.swingAnalysis.onVideoAnalysisStart?.((data: any) => {
      console.log(`🎬 영상 분석 시작: ${data.videoType}`)
      setVideoAnalysisStatus(prev => ({
        ...prev,
        isAnalyzing: true,
        hasVideo: true, // 영상 데이터가 있음
        currentVideo: data.videoType,
        stage: '영상 분석 준비 중...',
        progress: 0,
        error: null,
        videoAnalysisComplete: false,
      }))
    })

    const unsubProgress = window.swingAnalysis.onVideoAnalysisProgress?.((data: any) => {
      console.log(`⏳ 영상 분석 진행: ${data.videoType} - ${data.stage} ${data.progress}%`)
      setVideoAnalysisStatus(prev => ({
        ...prev,
        stage: data.stage === 'frame-extraction' ? '프레임 추출 중...' : '분석 중...',
        progress: data.progress,
      }))
    })

    const unsubComplete = window.swingAnalysis.onVideoAnalysisComplete?.((data: any) => {
      console.log(`✅ 영상 분석 완료: ${data.videoType}`)
      setVideoAnalysisStatus(prev => ({
        ...prev,
        stage: '분석 완료!',
        progress: 100,
        videoAnalysisComplete: true, // 영상 분석 완료 표시
      }))
    })

    const unsubError = window.swingAnalysis.onVideoAnalysisError?.((data: any) => {
      console.error(`❌ 영상 분석 에러: ${data.videoType} - ${data.error}`)
      setVideoAnalysisStatus(prev => ({
        ...prev,
        isAnalyzing: false,
        currentVideo: data.videoType,
        stage: '분석 실패',
        progress: 0,
        error: data.error,
        videoAnalysisComplete: true, // 에러 발생 시에도 완료 처리
      }))
    })

    // 영상 분석 결과 수신 및 API 전송
    const unsubVideoResult = window.swingAnalysis.onVideoResult(async (data: any) => {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`[swing] 🎬 영상 분석 결과 수신 (onVideoResult 콜백)`)
      console.log(`[swing] 📦 수신된 데이터:`, {
        hasSessionUuid: !!data?.sessionUuid,
        hasResults: !!data?.results,
        hasFront: !!data?.results?.front,
        hasSide: !!data?.results?.side,
        sessionUuid: data?.sessionUuid,
      })
      console.log(`${'='.repeat(60)}\n`)
      
      const { sessionUuid, results } = data
      
      if (!sessionUuid || !results) {
        console.error(`[swing] ⚠️ 영상 분석 결과 데이터 불완전:`)
        console.error(`[swing]   sessionUuid:`, sessionUuid)
        console.error(`[swing]   results:`, results)
        console.error(`[swing]   전체 data:`, data)
        return
      }
      
      console.log(`[swing] ✅ 데이터 검증 통과 - 처리 시작`)

      // 각 영상 분석 결과를 store에 추가하고 API로 전송
      try {
        console.log(`[swing] 📊 영상 분석 결과 전체 데이터:`, results)
        
        // 정면 영상 분석 결과
        if (results.front) {
          console.log(`[swing] 📤 정면 영상 분석 결과 처리 중...`)
          console.log(`[swing] 📋 정면 원본 데이터:`, results.front)
          
          // 데이터 구조 확인: results.front는 { value: {...}, result_code: ... } 형태일 수 있음
          const frontResult = results.front.value || results.front.result?.value || results.front.result?.analysis_result || results.front
          const frontResultCode = results.front.result_code ?? results.front.result?.result_code ?? 0
          
          console.log(`[swing] 📋 정면 분석 결과 데이터 (파싱 후):`, frontResult)
          console.log(`[swing] 📋 정면 result_code:`, frontResultCode)
          
          // Store에 추가
          addVideoAnalysisResult({
            videoType: 'front',
            result: {
              result_code: frontResultCode,
              value: frontResult,
            },
          })
          console.log(`[swing] ✅ 정면 영상 분석 결과 Store에 추가 완료`)
          
          // API로 전송
          await saveVideoAnalysis(
            sessionUuid,
            1, // 첫 번째 스윙
            frontResultCode, // result_code (0 = 성공)
            frontResult // analysis_result (API 문서 구조)
          )
          console.log(`[swing] ✅ 정면 영상 분석 결과 API 전송 완료`)
        }

        // 측면 영상 분석 결과
        if (results.side) {
          console.log(`[swing] 📤 측면 영상 분석 결과 처리 중...`)
          console.log(`[swing] 📋 측면 원본 데이터:`, results.side)
          
          // 데이터 구조 확인: results.side는 { value: {...}, result_code: ... } 형태일 수 있음
          const sideResult = results.side.value || results.side.result?.value || results.side.result?.analysis_result || results.side
          const sideResultCode = results.side.result_code ?? results.side.result?.result_code ?? 0
          
          console.log(`[swing] 📋 측면 분석 결과 데이터 (파싱 후):`, sideResult)
          console.log(`[swing] 📋 측면 result_code:`, sideResultCode)
          
          // Store에 추가
          addVideoAnalysisResult({
            videoType: 'side',
            result: {
              result_code: sideResultCode,
              value: sideResult,
            },
          })
          console.log(`[swing] ✅ 측면 영상 분석 결과 Store에 추가 완료`)
          
          // API로 전송
          await saveVideoAnalysis(
            sessionUuid,
            1, // 첫 번째 스윙
            sideResultCode, // result_code (0 = 성공)
            sideResult // analysis_result (API 문서 구조)
          )
          console.log(`[swing] ✅ 측면 영상 분석 결과 API 전송 완료`)
        }
        
        // 모든 영상 분석 결과 처리 완료 후 상태 업데이트
        const hasFront = !!results.front
        const hasSide = !!results.side
        const allComplete = (hasFront && hasSide) || (hasFront && !hasSide) || (!hasFront && hasSide)
        
        if (allComplete) {
          console.log(`[swing] ✅ 모든 영상 분석 결과 처리 완료`)
          setVideoAnalysisStatus(prev => ({
            ...prev,
            videoAnalysisComplete: true,
            isAnalyzing: false,
          }))
        }
      } catch (error: any) {
        console.error(`[swing] ❌ 영상 분석 결과 처리 실패:`, error)
        console.error(`[swing] 에러 상세:`, error.message)
        console.error(`[swing] 에러 스택:`, error.stack)
        // 에러 발생 시에도 완료 처리 (에러 상태로 표시)
        setVideoAnalysisStatus(prev => ({
          ...prev,
          videoAnalysisComplete: true,
          isAnalyzing: false,
          error: error.message,
        }))
      }
    })

    // startSession이 호출되었는지 확인하고, 필요하면 호출
    const ensureSessionStarted = async () => {
      try {
        console.log('[swing] 🔍 Checking session status...')
        const status = await window.swingAnalysis.getStatus()
        console.log('[swing] 📊 Session status:', status)
        console.log('[swing] 📊 Current sessionUuid:', sessionUuid)
        
        // 세션이 활성화되지 않았고 sessionUuid가 있으면 startSession 호출
        if (!status.isActive && sessionUuid) {
          console.log('[swing] ⚠️ Session not active, starting session...')
          console.log('[swing] 📡 Calling window.swingAnalysis.startSession...')
          const result = await window.swingAnalysis.startSession(sessionUuid, SWING_COUNT_PER_SESSION)
          console.log('[swing] 📡 IPC result:', result)
          if (result.success) {
            console.log('[swing] ✅ Session started successfully from swing page')
          } else {
            console.error('[swing] ❌ Failed to start session:', result.error)
          }
        } else if (status.isActive) {
          console.log('[swing] ✅ Session already active')
        } else {
          console.warn('[swing] ⚠️ Session UUID not available yet, waiting...')
        }
      } catch (error) {
        console.error('[swing] ❌ Error checking/starting session:', error)
      }
    }
    
    // 세션 시작 확인 (즉시 + sessionUuid 변경 시)
    let sessionTimer: NodeJS.Timeout | null = null
    
    // 즉시 확인 (sessionUuid가 이미 있는 경우)
    if (sessionUuid) {
      console.log('[swing] 🚀 sessionUuid available, checking session immediately...')
      ensureSessionStarted()
    } else {
      // sessionUuid가 없으면 잠시 후 다시 확인
      sessionTimer = setTimeout(() => {
        console.log('[swing] ⏰ Delayed session check (sessionUuid might be set now)...')
        ensureSessionStarted()
      }, 1000)
    }

    return () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer)
      }
      unsubNewShot()
      unsubStart()
      unsubProgress()
      unsubComplete()
      unsubError()
      unsubVideoResult()
    }
  }, [sessionUuid]) // sessionUuid가 변경되면 다시 실행 (swingCount 제거 - 리스너는 한 번만 등록)

  useEffect(() => {
    console.log('[swing] 첫번째 useEffect, currentStep:', currentStep, 'phase:', phase)

    // loading phase일 때는 상태 변경을 무시 (solution으로 navigate 중)
    if (phase === 'loading') {
      console.log('[swing] phase === loading, 조기 return')
      return
    }

    // 첫 번째 스윙이 아닌 상태로 진입하면 홈으로 리다이렉트
    if (currentStep !== 'swing-first' && currentStep !== 'swing-second') {
      console.log('[swing] 조건 불만족! 홈으로 이동. currentStep:', currentStep)
      navigate('/')
      return
    }
    console.log('[swing] 조건 만족! 계속 진행.')

    // preparing phase는 별도 useEffect에서 처리
    // 여기서는 phase가 preparing이 아닐 때만 처리
  }, [currentStep, navigate, phase])

  // swinging phase: 센서에서 실제 샷 데이터가 올 때까지 대기
  // onNewShot 이벤트가 발생하면 자동으로 loading phase로 전환됨
  // (자동 카운팅 제거 - 실제 데이터만 사용)

  useEffect(() => {
    if (phase !== 'loading') return

    // 최신 상태 값 가져오기
    const currentStore = useSessionStore.getState()
    const currentIsFirstSwing = currentStore.currentStep === 'swing-first'
    
    // 첫 번째 스윙이고 영상 데이터가 있는 경우 영상 분석 완료 대기
    const shouldWaitForVideo = currentIsFirstSwing && videoAnalysisStatus.hasVideo
    
    if (shouldWaitForVideo && !videoAnalysisStatus.videoAnalysisComplete) {
      // 영상 분석 완료 대기 중
      console.log('[swing] Loading phase - 영상 분석 완료 대기 중...')
      console.log(`[swing]   isAnalyzing: ${videoAnalysisStatus.isAnalyzing}`)
      console.log(`[swing]   videoAnalysisComplete: ${videoAnalysisStatus.videoAnalysisComplete}`)
      return // 영상 분석 완료까지 대기
    }
    
    // 영상 분석 완료되었거나 영상이 없는 경우 솔루션으로 이동
    console.log('[swing] Loading phase - 솔루션으로 이동 준비 완료')
    console.log(`[swing]   shouldWaitForVideo: ${shouldWaitForVideo}`)
    console.log(`[swing]   videoAnalysisComplete: ${videoAnalysisStatus.videoAnalysisComplete}`)
    
    // 짧은 딜레이 후 solution으로 이동 (UI 업데이트 시간 확보)
    const timer = setTimeout(() => {
      navigateToSolution()
    }, 1000) // 1초 후 이동
    
    return () => clearTimeout(timer)

    function navigateToSolution() {
      // 최신 상태 값 가져오기
      const currentStore = useSessionStore.getState()
      const currentSwingCount = currentStore.swingCount
      const currentIsFirstSwing = currentStore.currentStep === 'swing-first'
      
      console.log(`[swing] 솔루션으로 이동 시작 (${currentSwingCount}번째 샷)`)

      // 스윙 카운트 증가 (다음 샷 준비)
      setSwingCount(currentSwingCount + 1)

      // 첫 번째 샷: solution-video
      // 두 번째 이후 샷: solution-chart
      if (currentIsFirstSwing) {
        console.log('[swing] 첫 번째 샷 → solution-video')
        setStep('solution-video')
      } else {
        console.log(`[swing] ${currentSwingCount}번째 샷 → solution-chart`)
        setStep('solution-chart')
      }

      // solution 페이지로 이동
      console.log('[swing] navigate(/analysis/solution)')
      navigate('/analysis/solution')
    }
  }, [phase, navigate, setStep, setSwingCount, videoAnalysisStatus.hasVideo, videoAnalysisStatus.videoAnalysisComplete])

  // Phase 1: 시스템 준비 중
  if (phase === 'preparing') {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mb-8">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-green-500"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            시스템 준비 중입니다...
          </h1>
          <p className="text-gray-400 text-lg">
            센서 연결 및 데이터 수집 모드를 활성화하고 있습니다.
          </p>
        </div>
      </div>
    )
  }

  // Phase 3: 로딩
  if (phase === 'loading') {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-12">
            {videoAnalysisStatus.isAnalyzing ? '영상 분석 중...' : '스윙 데이터 처리 중...'}
          </h2>

          {/* 영상 분석 상태 표시 */}
          {videoAnalysisStatus.isAnalyzing && (
            <div className="mb-8 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                  {videoAnalysisStatus.currentVideo === 'front' ? '📹 정면 영상' : '📹 측면 영상'}
                </span>
              </div>
              <p className="text-lg text-gray-300 mb-4">{videoAnalysisStatus.stage}</p>
              
              {/* 진행률 바 */}
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${videoAnalysisStatus.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{videoAnalysisStatus.progress}%</p>
            </div>
          )}

          {/* 에러 표시 */}
          {videoAnalysisStatus.error && (
            <div className="mb-8 bg-red-500/10 rounded-2xl p-6 border border-red-500/30">
              <p className="text-red-400 text-lg">⚠️ {videoAnalysisStatus.error}</p>
            </div>
          )}

          {/* 로딩 스피너 */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-blue-200 rounded-full opacity-20"></div>
              <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>

          <p className="text-xl text-gray-300">
            GTS Ai가 회원님의 스윙·샷 데이터를 정밀 진단하고 있어요.
          </p>
        </div>
      </div>
    )
  }

  // Phase 2: 스윙 진행
  return (
    <div className="min-h-full flex flex-col py-8 px-4">
      {/* 상단: SWING_COUNT_PER_SESSION개 체크박스 */}
      <div className="mb-8 animate-fade-in">
        <div className="flex justify-center gap-4 flex-wrap max-w-4xl mx-auto">
          {Array.from({ length: SWING_COUNT_PER_SESSION }, (_, i) => {
            const num = i + 1
            const currentProgress = isFirstSwing ? firstSwingProgress : secondSwingProgress
            return (
            <div
              key={num}
              className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full border-4 transition-all duration-500 ${
                num <= currentProgress
                  ? "bg-linear-to-br from-green-400 to-emerald-600 border-green-400 shadow-lg shadow-green-500/50 scale-110"
                  : "bg-slate-800 border-slate-600"
              }`}>
              {/* 체크 표시 */}
              {num <= currentProgress && (
                <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {/* 번호 표시 (체크 전) */}
              {num > currentProgress && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm md:text-base font-bold text-gray-500">
                    {num}
                  </span>
                </div>
              )}
            </div>
            )
          })}
        </div>
      </div>

      {/* 하단: 볼 궤적 + 측정값 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full px-4">
          {/* 왼쪽: 볼 궤적 */}
          <div className="flex items-center justify-center">
            <BallTrajectory 
              trajectories={ballTrajectories} 
              className="w-full aspect-[3/2]"
            />
          </div>

          {/* 오른쪽: 측정값 */}
          <div className="flex items-center justify-center">
            <div className="w-full space-y-4">
              {/* 측정값 그리드 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 클럽스피드 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">클럽스피드 (m/s)</p>
                  <p className="text-3xl font-bold text-green-400">
                    {Number(currentMeasurement.clubSpeed).toFixed(1)}
                  </p>
                </div>

                {/* 볼스피드 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">볼스피드 (m/s)</p>
                  <p className="text-3xl font-bold text-green-400">
                    {Number(currentMeasurement.ballSpeed).toFixed(1)}
                  </p>
                </div>

                {/* 발사각 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">발사각 (°)</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {Number(currentMeasurement.launchAngle).toFixed(1)}
                  </p>
                </div>

                {/* 방향각 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">방향각 (°)</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {Number(currentMeasurement.direction).toFixed(1)}
                  </p>
                </div>

                {/* 좌우거리 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">좌우거리 (m)</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {Number(currentMeasurement.lateralDistance).toFixed(1)}
                  </p>
                </div>

                {/* 사이드스핀 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">사이드스핀 (rpm)</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {Number(currentMeasurement.sideSpin).toFixed(1)}
                  </p>
                </div>

                {/* 백스핀 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">백스핀 (rpm)</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {Number(currentMeasurement.backSpin).toFixed(1)}
                  </p>
                </div>

                {/* 구질 */}
                <div className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700">
                  <p className="text-sm text-gray-400 mb-2">구질</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {currentMeasurement.ballFlight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 CSS */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
export default SwingPage

