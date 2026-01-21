#!/usr/bin/env python3
"""
GFEngine2D Python Bridge Server (Real API)

실제 GFEngine2D API 사용
함수명: CSharp_Gfe_* 형식
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
engine_handle = None


def load_dll():
    """DLL 로드 및 함수 바인딩"""
    global dll, engine_handle

    try:
        # DLL 로드
        dll = ctypes.CDLL(str(DLL_PATH))

        # 버전 정보 (static 함수)
        dll.CSharp_Gfe_GFEngine2D_Version.restype = c_char_p
        dll.CSharp_Gfe_GFEngine2D_Version.argtypes = []

        # 엔진 생성/삭제
        dll.CSharp_Gfe_new_GFEngine2D.restype = c_void_p
        dll.CSharp_Gfe_new_GFEngine2D.argtypes = []

        dll.CSharp_Gfe_delete_GFEngine2D.restype = None
        dll.CSharp_Gfe_delete_GFEngine2D.argtypes = [c_void_p]

        # 초기화 (SWIG_0 버전 - 손잡이 포함)
        dll.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0.restype = c_int
        dll.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0.argtypes = [
            c_void_p,  # handle
            c_int,     # direction
            c_int,     # clubType
            c_int      # handedId
        ]

        # 준비 상태 확인
        dll.CSharp_Gfe_GFEngine2D_IsReady.restype = c_bool
        dll.CSharp_Gfe_GFEngine2D_IsReady.argtypes = [c_void_p]

        # Clear
        dll.CSharp_Gfe_GFEngine2D_Clear.restype = c_bool
        dll.CSharp_Gfe_GFEngine2D_Clear.argtypes = [c_void_p]

        # 엔진 인스턴스 생성
        engine_handle = dll.CSharp_Gfe_new_GFEngine2D()
        if not engine_handle:
            raise Exception("Failed to create engine handle")

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


def handle_request(request):
    """요청 처리"""
    request_id = request.get("requestId")
    method = request.get("method")

    try:
        if method == "initialize":
            direction = request.get("direction", 0)
            club_type = request.get("clubType", 0)
            handed_id = request.get("handedId", 0)

            # 초기화 호출
            result = dll.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0(
                engine_handle,
                direction,
                club_type,
                handed_id
            )

            # 준비 상태 확인
            is_ready = dll.CSharp_Gfe_GFEngine2D_IsReady(engine_handle)

            send_response(request_id, {
                "success": result == 0,
                "code": result,
                "isReady": is_ready
            })

        elif method == "getVersion":
            # 버전 정보 (static 함수)
            version_bytes = dll.CSharp_Gfe_GFEngine2D_Version()
            version_str = version_bytes.decode('utf-8') if version_bytes else "unknown"
            
            send_response(request_id, {"version": version_str})

        elif method == "isReady":
            # 준비 상태 확인
            is_ready = dll.CSharp_Gfe_GFEngine2D_IsReady(engine_handle)
            
            send_response(request_id, {"ready": is_ready})

        elif method == "clear":
            # Clear
            cleared = dll.CSharp_Gfe_GFEngine2D_Clear(engine_handle)
            
            send_response(request_id, {"success": cleared})

        elif method == "analyzeVideo":
            # 비디오 분석은 SrcImagesInterface 구현 필요
            # 현재는 미구현
            send_error(request_id, "Video analysis not implemented yet. Need SrcImagesInterface.")

        elif method == "ping":
            send_response(request_id, {"pong": True})

        else:
            send_error(request_id, f"Unknown method: {method}")

    except Exception as e:
        send_error(request_id, f"Exception: {str(e)}")


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
        if engine_handle and dll:
            dll.CSharp_Gfe_delete_GFEngine2D(engine_handle)


if __name__ == "__main__":
    main()


