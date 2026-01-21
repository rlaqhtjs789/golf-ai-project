#!/usr/bin/env python3
"""
GFEngine2D Python Bridge Server

Python ctypes를 사용하여 DLL을 로드하고
stdin/stdout으로 JSON 통신
"""

import sys
import json
import ctypes
from ctypes import *
from pathlib import Path

# DLL 경로
DLL_PATH = Path(__file__).parent / "libGFEngine2D.dll"

# 전역 변수
dll = None
engine_instance = None

# 함수 포인터 타입
CreateEngine = None
DestroyEngine = None
Initialize = None
GetVersion = None
AnalyzeSwingVideo = None
GetResultCode = None
GetResultValue = None
DestroyResult = None

GetFrameIndex = None
GetSwingProblem = None
GetProblemCount = None
GetProblem = None
GetProblemType = None
GetProblemSeverity = None
GetProblemScore = None
GetProblemEvidenceStepId = None
GetSwingPlane = None
GetSwingTempo = None
GetShoulderStanceRatio = None


def load_dll():
    """DLL 로드 및 함수 바인딩"""
    global dll, engine_instance
    global CreateEngine, DestroyEngine, Initialize, GetVersion
    global AnalyzeSwingVideo, GetResultCode, GetResultValue, DestroyResult
    global GetFrameIndex, GetSwingProblem, GetProblemCount, GetProblem
    global GetProblemType, GetProblemSeverity, GetProblemScore
    global GetProblemEvidenceStepId, GetSwingPlane, GetSwingTempo
    global GetShoulderStanceRatio

    try:
        # DLL 로드
        dll = ctypes.WinDLL(str(DLL_PATH))

        # 함수 바인딩
        CreateEngine = dll.CreateEngine
        CreateEngine.restype = c_void_p

        DestroyEngine = dll.DestroyEngine
        DestroyEngine.argtypes = [c_void_p]

        Initialize = dll.Initialize
        Initialize.argtypes = [c_void_p, c_int, c_int, c_int]
        Initialize.restype = c_int

        GetVersion = dll.GetVersion
        GetVersion.argtypes = [c_void_p]
        GetVersion.restype = c_char_p

        AnalyzeSwingVideo = dll.AnalyzeSwingVideo
        AnalyzeSwingVideo.argtypes = [c_void_p, c_char_p, c_int, c_int]
        AnalyzeSwingVideo.restype = c_void_p

        GetResultCode = dll.GetResultCode
        GetResultCode.argtypes = [c_void_p]
        GetResultCode.restype = c_int

        GetResultValue = dll.GetResultValue
        GetResultValue.argtypes = [c_void_p]
        GetResultValue.restype = c_void_p

        DestroyResult = dll.DestroyResult
        DestroyResult.argtypes = [c_void_p]

        # SwingResultInterface 메서드
        GetFrameIndex = dll.GetFrameIndex
        GetFrameIndex.argtypes = [c_void_p, c_int]
        GetFrameIndex.restype = c_int

        GetSwingProblem = dll.GetSwingProblem
        GetSwingProblem.argtypes = [c_void_p]
        GetSwingProblem.restype = c_void_p

        GetProblemCount = dll.GetProblemCount
        GetProblemCount.argtypes = [c_void_p]
        GetProblemCount.restype = c_int

        GetProblem = dll.GetProblem
        GetProblem.argtypes = [c_void_p, c_int]
        GetProblem.restype = c_void_p

        GetProblemType = dll.GetProblemType
        GetProblemType.argtypes = [c_void_p]
        GetProblemType.restype = c_int

        GetProblemSeverity = dll.GetProblemSeverity
        GetProblemSeverity.argtypes = [c_void_p]
        GetProblemSeverity.restype = c_int

        GetProblemScore = dll.GetProblemScore
        GetProblemScore.argtypes = [c_void_p]
        GetProblemScore.restype = c_double

        GetProblemEvidenceStepId = dll.GetProblemEvidenceStepId
        GetProblemEvidenceStepId.argtypes = [c_void_p]
        GetProblemEvidenceStepId.restype = c_int

        GetSwingPlane = dll.GetSwingPlane
        GetSwingPlane.argtypes = [c_void_p]
        GetSwingPlane.restype = c_void_p

        GetSwingTempo = dll.GetSwingTempo
        GetSwingTempo.argtypes = [c_void_p]
        GetSwingTempo.restype = c_double

        GetShoulderStanceRatio = dll.GetShoulderStanceRatio
        GetShoulderStanceRatio.argtypes = [c_void_p]
        GetShoulderStanceRatio.restype = c_double

        # 엔진 인스턴스 생성
        engine_instance = CreateEngine()
        if not engine_instance:
            raise Exception("Failed to create engine instance")

        return True

    except Exception as e:
        print(json.dumps({
            "type": "error",
            "message": f"Failed to load DLL: {str(e)}"
        }), file=sys.stderr, flush=True)
        return False


def send_response(request_id, data):
    """응답 전송"""
    response = {
        "type": "response",
        "requestId": request_id,
        "data": data
    }
    print(json.dumps(response), flush=True)


def send_error(request_id, error_message):
    """에러 응답"""
    response = {
        "type": "response",
        "requestId": request_id,
        "error": error_message
    }
    print(json.dumps(response), flush=True)


def send_progress(progress, stage):
    """진행 상황 전송"""
    message = {
        "type": "progress",
        "data": {
            "progress": progress,
            "stage": stage
        }
    }
    print(json.dumps(message), flush=True)


def result_to_dict(result_ptr):
    """분석 결과를 딕셔너리로 변환"""
    if not result_ptr:
        return {"error": "null result"}

    result_code = GetResultCode(result_ptr)
    
    result_dict = {
        "result_code": result_code
    }

    if result_code == 0:  # Success
        value_ptr = GetResultValue(result_ptr)
        if value_ptr:
            # frameIndex
            frame_index = {
                "address": GetFrameIndex(value_ptr, 0),
                "takeAway": GetFrameIndex(value_ptr, 1),
                "backSwing": GetFrameIndex(value_ptr, 2),
                "top": GetFrameIndex(value_ptr, 3),
                "downSwing": GetFrameIndex(value_ptr, 4),
                "impact": GetFrameIndex(value_ptr, 5),
                "followThrough": GetFrameIndex(value_ptr, 6),
                "finish": GetFrameIndex(value_ptr, 7)
            }

            # problems
            problems = []
            swing_problem_ptr = GetSwingProblem(value_ptr)
            if swing_problem_ptr:
                problem_count = GetProblemCount(swing_problem_ptr)
                for i in range(problem_count):
                    problem_ptr = GetProblem(swing_problem_ptr, i)
                    if problem_ptr:
                        problems.append({
                            "type": GetProblemType(problem_ptr),
                            "severity": GetProblemSeverity(problem_ptr),
                            "score": GetProblemScore(problem_ptr),
                            "evidenceStepId": GetProblemEvidenceStepId(problem_ptr)
                        })

            # swingPlane
            swing_plane = {}
            swing_plane_ptr = GetSwingPlane(value_ptr)
            if swing_plane_ptr:
                swing_plane = {
                    "swingTempo": GetSwingTempo(swing_plane_ptr)
                }

            # shoulderStanceRatio
            shoulder_stance_ratio = GetShoulderStanceRatio(value_ptr)

            result_dict["value"] = {
                "frameIndex": frame_index,
                "problems": problems,
                "swingPlane": swing_plane,
                "shoulderStanceRatio": shoulder_stance_ratio
            }

    return result_dict


def handle_request(request):
    """요청 처리"""
    request_id = request.get("requestId")
    method = request.get("method")

    try:
        if method == "initialize":
            direction = request.get("direction", 0)
            club_type = request.get("clubType", 0)
            handed_id = request.get("handedId", 0)

            result = Initialize(engine_instance, direction, club_type, handed_id)
            send_response(request_id, {
                "success": result == 0,
                "code": result
            })

        elif method == "getVersion":
            version = GetVersion(engine_instance)
            version_str = version.decode('utf-8') if version else "unknown"
            send_response(request_id, {"version": version_str})

        elif method == "analyzeVideo":
            video_path = request.get("videoPath", "")
            direction = request.get("direction", 0)
            club_type = request.get("clubType", 0)

            # 진행 상황
            send_progress(10, "Initializing analysis")

            # 분석 실행
            result_ptr = AnalyzeSwingVideo(
                engine_instance,
                video_path.encode('utf-8'),
                direction,
                club_type
            )

            send_progress(90, "Processing results")

            # 결과 변환
            result_dict = result_to_dict(result_ptr)

            send_progress(100, "Complete")

            # 응답
            send_response(request_id, result_dict)

            # 결과 해제
            if DestroyResult:
                DestroyResult(result_ptr)

        elif method == "ping":
            send_response(request_id, {"pong": True})

        else:
            send_error(request_id, f"Unknown method: {method}")

    except Exception as e:
        send_error(request_id, str(e))


def main():
    """메인 루프"""
    # DLL 로드
    if not load_dll():
        sys.exit(1)

    # 준비 완료 알림
    print(json.dumps({"type": "ready"}), flush=True)

    # stdin에서 요청 읽기
    try:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue

            try:
                request = json.loads(line)
                handle_request(request)
            except json.JSONDecodeError as e:
                print(json.dumps({
                    "type": "error",
                    "message": f"JSON parse error: {str(e)}"
                }), file=sys.stderr, flush=True)

    except KeyboardInterrupt:
        pass
    finally:
        # 정리
        if engine_instance and DestroyEngine:
            DestroyEngine(engine_instance)


if __name__ == "__main__":
    main()

