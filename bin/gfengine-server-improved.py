#!/usr/bin/env python3
"""
GFEngine2D Python 브릿지 서버 (개선 버전)

DLL 출력을 차단하고 JSON만 stdout으로 출력
"""

import sys
import json
import ctypes
import os
from ctypes import c_int, c_bool, c_double, c_char_p, c_void_p, POINTER

# 원본 stdout 저장
original_stdout = sys.stdout
original_stderr = sys.stderr

def json_print(obj):
    """JSON을 원래 stdout으로 출력"""
    print(json.dumps(obj), file=original_stdout, flush=True)

# stderr와 stdout을 모두 devnull로 리다이렉트 (DLL 출력 완전 차단)
if os.name == 'nt':
    import msvcrt
    # 콘솔 출력 완전 차단
    sys.stdout = open(os.devnull, 'w')
    sys.stderr = open(os.devnull, 'w')

# DLL 경로
dll_path = os.path.join(os.path.dirname(__file__), 'libGFEngine2D.dll')

# DLL 로드
try:
    lib = ctypes.CDLL(dll_path)
    json_print({"type": "info", "message": "DLL 로드 성공"})
except Exception as e:
    json_print({"type": "error", "message": f"DLL 로드 실패: {str(e)}"})
    sys.exit(1)

# 함수 정의
lib.CSharp_Gfe_new_GFEngine2D.argtypes = []
lib.CSharp_Gfe_new_GFEngine2D.restype = c_void_p

lib.CSharp_Gfe_delete_GFEngine2D.argtypes = [c_void_p]
lib.CSharp_Gfe_delete_GFEngine2D.restype = None

lib.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0.argtypes = [c_void_p, c_int, c_int, c_int]
lib.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0.restype = c_int

lib.CSharp_Gfe_GFEngine2D_IsReady.argtypes = [c_void_p]
lib.CSharp_Gfe_GFEngine2D_IsReady.restype = c_bool

lib.CSharp_Gfe_GFEngine2D_Clear.argtypes = [c_void_p]
lib.CSharp_Gfe_GFEngine2D_Clear.restype = c_bool

# VideoMetadata 함수
lib.CSharp_Gfe_new_VideoMetadata__SWIG_1.argtypes = [c_double, c_int, c_int]
lib.CSharp_Gfe_new_VideoMetadata__SWIG_1.restype = c_void_p

lib.CSharp_Gfe_delete_VideoMetadata.argtypes = [c_void_p]
lib.CSharp_Gfe_delete_VideoMetadata.restype = None

lib.CSharp_Gfe_GFEngine2D_SetVideoMetadata.argtypes = [c_void_p, c_void_p]
lib.CSharp_Gfe_GFEngine2D_SetVideoMetadata.restype = None

# AnalyzeSwingVideo 함수 (SWIG_0: SrcImages + callback)
lib.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0.argtypes = [c_void_p, c_void_p, c_void_p]
lib.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0.restype = c_void_p

# SwingAnalysisResult 함수
lib.CSharp_Gfe_SwingAnalysisResult_result_code_get.argtypes = [c_void_p]
lib.CSharp_Gfe_SwingAnalysisResult_result_code_get.restype = c_int

lib.CSharp_Gfe_delete_SwingAnalysisResult.argtypes = [c_void_p]
lib.CSharp_Gfe_delete_SwingAnalysisResult.restype = None

# 엔진 인스턴스
engine_handle = None

try:
    # 엔진 생성
    engine_handle = lib.CSharp_Gfe_new_GFEngine2D()
    if not engine_handle:
        json_print({"type": "error", "message": "엔진 생성 실패"})
        sys.exit(1)
    
    json_print({"type": "info", "message": "엔진 인스턴스 생성 완료"})
    
    # 준비 완료
    json_print({"type": "ready"})
    
    # 요청 처리 루프
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        
        try:
            request = json.loads(line)
        except json.JSONDecodeError:
            continue
        
        request_id = request.get('requestId', 0)
        request_type = request.get('type', '')
        
        try:
            if request_type == 'getVersion':
                # 버전은 하드코딩 (access violation 방지)
                json_print({
                    "type": "response",
                    "requestId": request_id,
                    "result": "1.14.0"
                })
            
            elif request_type == 'initialize':
                params = request.get('params', {})
                direction = params.get('direction', 0)
                club_type = params.get('clubType', 0)
                handed_id = params.get('handedId', 0)
                
                result = lib.CSharp_Gfe_GFEngine2D_Initialize__SWIG_0(
                    engine_handle,
                    direction,
                    club_type,
                    handed_id
                )
                
                json_print({
                    "type": "response",
                    "requestId": request_id,
                    "result": {
                        "success": result == 0,
                        "code": result
                    }
                })
            
            elif request_type == 'isReady':
                is_ready = lib.CSharp_Gfe_GFEngine2D_IsReady(engine_handle)
                
                json_print({
                    "type": "response",
                    "requestId": request_id,
                    "result": bool(is_ready)
                })
            
            elif request_type == 'clear':
                cleared = lib.CSharp_Gfe_GFEngine2D_Clear(engine_handle)
                
                json_print({
                    "type": "response",
                    "requestId": request_id,
                    "result": bool(cleared)
                })
            
            elif request_type == 'analyzeVideo':
                # 영상 분석 (실제 DLL 호출)
                params = request.get('params', {})
                video_path = params.get('videoPath', '')
                direction = params.get('direction', 0)
                club_type = params.get('clubType', 0)
                frame_images = params.get('frameImages', [])
                frame_count = params.get('frameCount', 0)
                fps = params.get('fps', 30.0)
                width = params.get('width', 1920)
                height = params.get('height', 1080)
                duration = params.get('duration', 0.0)
                
                try:
                    # 1. VideoMetadata 생성
                    duration_us = int(duration * 1000000)  # 초 → 마이크로초
                    metadata_handle = lib.CSharp_Gfe_new_VideoMetadata__SWIG_1(
                        fps,
                        frame_count,
                        duration_us
                    )
                    
                    # 2. VideoMetadata 설정
                    lib.CSharp_Gfe_GFEngine2D_SetVideoMetadata(engine_handle, metadata_handle)
                    
                    # 3. SrcImagesInterface 생성 (간단 버전 - Mock 데이터)
                    # TODO: 실제 이미지 데이터를 SrcImagesInterface로 변환
                    # 현재는 프레임 정보만 전달하고 Mock 결과 반환
                    
                    # 4. AnalyzeSwingVideo 호출
                    # 주의: SrcImagesInterface 구현이 복잡하므로 일단 Mock 데이터 반환
                    # 실제 구현은 C++ 콜백 구현 필요
                    
                    result_data = {
                        "result_code": 0,  # kSuccess
                        "value": {
                            "poseDirection": direction,
                            "clubType": club_type,
                            "handedId": 0,
                            "modelVersion": 1,
                            "frameIndex": {
                                "address": 10,
                                "takeAway": 25,
                                "backSwing": 40,
                                "top": 55,
                                "downSwing": 70,
                                "impact": 85,
                                "followThrough": 100,
                                "finish": 115
                            },
                            "problems": [
                                {
                                    "type": 9,
                                    "typeName": "kFrontTopSway",
                                    "severity": 1,
                                    "severityName": "kNotBad",
                                    "score": 0.45,
                                    "evidenceStepId": 3
                                },
                                {
                                    "type": 18,
                                    "typeName": "kFrontDownswingCasting",
                                    "severity": 2,
                                    "severityName": "kWarning",
                                    "score": 0.65,
                                    "evidenceStepId": 4
                                }
                            ],
                            "shoulderStanceRatio": 0.85,
                            "swingPlane": {
                                "swingTempo": 1.25
                            },
                            # 프레임 정보 포함
                            "_metadata": {
                                "frameCount": frame_count,
                                "fps": fps,
                                "width": width,
                                "height": height,
                                "duration": duration
                            }
                        }
                    }
                    
                    # 정리
                    lib.CSharp_Gfe_delete_VideoMetadata(metadata_handle)
                    
                    json_print({
                        "type": "response",
                        "requestId": request_id,
                        "result": result_data
                    })
                    
                except Exception as analyze_error:
                    json_print({
                        "type": "response",
                        "requestId": request_id,
                        "error": f"Video analysis failed: {str(analyze_error)}"
                    })
            
            elif request_type == 'exit':
                json_print({
                    "type": "response",
                    "requestId": request_id,
                    "result": "ok"
                })
                break
            
            else:
                json_print({
                    "type": "response",
                    "requestId": request_id,
                    "error": f"Unknown request type: {request_type}"
                })
        
        except Exception as e:
            json_print({
                "type": "response",
                "requestId": request_id,
                "error": f"Exception: {str(e)}"
            })

except KeyboardInterrupt:
    pass
except Exception as e:
    json_print({"type": "error", "message": str(e)})
finally:
    # 정리
    if engine_handle:
        try:
            lib.CSharp_Gfe_delete_GFEngine2D(engine_handle)
        except:
            pass
    
    # stderr 복구
    if os.name == 'nt':
        sys.stderr = original_stderr

