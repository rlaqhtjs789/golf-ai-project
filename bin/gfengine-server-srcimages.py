#!/usr/bin/env python3
"""
GFEngine2D Python 브릿지 - SrcImagesInterface 구현 포함
"""

import sys
import json
import ctypes
import os
import base64
from ctypes import c_int, c_bool, c_double, c_char_p, c_void_p, c_uint8, POINTER, Structure, CFUNCTYPE
from io import BytesIO

# PIL/Pillow로 이미지 처리
try:
    from PIL import Image as PILImage
except ImportError:
    PILImage = None
    print("Warning: PIL not available. Install with: pip install Pillow", file=sys.stderr)

# 원본 stdout 저장
original_stdout = sys.stdout
original_stderr = sys.stderr

def json_print(obj):
    """JSON을 원래 stdout으로 출력"""
    print(json.dumps(obj), file=original_stdout, flush=True)

# stderr와 stdout을 모두 devnull로 리다이렉트 (DLL 출력 완전 차단)
if os.name == 'nt':
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

# ==================== DLL 함수 정의 ====================

# 기본 함수
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

# Image 함수
lib.CSharp_Gfe_new_Image__SWIG_0.argtypes = []
lib.CSharp_Gfe_new_Image__SWIG_0.restype = c_void_p

lib.CSharp_Gfe_new_Image__SWIG_3.argtypes = [c_int, c_int, c_int, POINTER(c_uint8)]
lib.CSharp_Gfe_new_Image__SWIG_3.restype = c_void_p

lib.CSharp_Gfe_delete_Image.argtypes = [c_void_p]
lib.CSharp_Gfe_delete_Image.restype = None

# SrcImagesInterface 함수
try:
    lib.CSharp_Gfe_new_SrcImagesInterface.argtypes = []
    lib.CSharp_Gfe_new_SrcImagesInterface.restype = c_void_p
    lib.CSharp_Gfe_delete_SrcImagesInterface.argtypes = [c_void_p]
    lib.CSharp_Gfe_delete_SrcImagesInterface.restype = None
    lib.CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_0.argtypes = [c_void_p, c_void_p]
    lib.CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_0.restype = None
    lib.CSharp_Gfe_SrcImagesInterface_GetImageCount.argtypes = [c_void_p]
    lib.CSharp_Gfe_SrcImagesInterface_GetImageCount.restype = c_int
    HAS_SRCIMAGES_INTERFACE = True
except AttributeError:
    HAS_SRCIMAGES_INTERFACE = False
    json_print({"type": "warning", "message": "SrcImagesInterface functions not available, using fallback"})

# AnalyzeSwingVideo 함수
lib.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0.argtypes = [c_void_p, c_void_p, c_void_p]
lib.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0.restype = c_void_p

# SwingAnalysisResult 함수
lib.CSharp_Gfe_SwingAnalysisResult_result_code_get.argtypes = [c_void_p]
lib.CSharp_Gfe_SwingAnalysisResult_result_code_get.restype = c_int

lib.CSharp_Gfe_delete_SwingAnalysisResult.argtypes = [c_void_p]
lib.CSharp_Gfe_delete_SwingAnalysisResult.restype = None

# ==================== SrcImagesInterface 구현 ====================

class SrcImagesInterfaceImpl:
    """
    SrcImagesInterface Python 구현
    """
    def __init__(self, frame_images_base64):
        self.frame_images = []
        self.image_handles = []
        
        if not PILImage:
            raise RuntimeError("PIL/Pillow required for image processing")
        
        # Base64 이미지들을 PIL Image로 변환
        for base64_str in frame_images_base64:
            try:
                img_data = base64.b64decode(base64_str)
                pil_img = PILImage.open(BytesIO(img_data))
                
                # RGB로 변환 (DLL이 RGB 형식 요구)
                if pil_img.mode != 'RGB':
                    pil_img = pil_img.convert('RGB')
                
                self.frame_images.append(pil_img)
            except Exception as e:
                json_print({"type": "warning", "message": f"Image decode failed: {str(e)}"})
        
        # DLL Image 객체 생성
        for pil_img in self.frame_images:
            width, height = pil_img.size
            pixels = pil_img.tobytes()
            
            # C 배열로 변환
            pixel_array = (c_uint8 * len(pixels)).from_buffer_copy(pixels)
            
            # Image 생성 (width, height, channels, data)
            img_handle = lib.CSharp_Gfe_new_Image__SWIG_3(
                width,
                height,
                3,  # RGB = 3 channels
                pixel_array
            )
            
            self.image_handles.append(img_handle)
    
    def at(self, index):
        """특정 프레임 이미지 반환"""
        if 0 <= index < len(self.image_handles):
            return self.image_handles[index]
        return None
    
    def size(self):
        """총 프레임 수"""
        return len(self.image_handles)
    
    def empty(self):
        """비어있는지 확인"""
        return len(self.image_handles) == 0
    
    def cleanup(self):
        """메모리 정리"""
        for handle in self.image_handles:
            try:
                lib.CSharp_Gfe_delete_Image(handle)
            except:
                pass
        self.image_handles.clear()
        self.frame_images.clear()

# ==================== Mock SrcImagesInterface (간단 버전) ====================

class MockSrcImagesInterface:
    """
    Mock SrcImagesInterface (실제 이미지 없이 테스트용)
    """
    def __init__(self, frame_count):
        self.frame_count = frame_count
        self.empty_image = lib.CSharp_Gfe_new_Image__SWIG_0()
    
    def at(self, index):
        return self.empty_image
    
    def size(self):
        return self.frame_count
    
    def empty(self):
        return self.frame_count == 0
    
    def cleanup(self):
        try:
            lib.CSharp_Gfe_delete_Image(self.empty_image)
        except:
            pass

# ==================== 메인 로직 ====================

engine_handle = None

try:
    # 엔진 생성
    engine_handle = lib.CSharp_Gfe_new_GFEngine2D()
    if not engine_handle:
        json_print({"type": "error", "message": "엔진 생성 실패"})
        sys.exit(1)
    
    json_print({"type": "info", "message": "엔진 인스턴스 생성 완료"})
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
                params = request.get('params', {})
                frame_images = params.get('frameImages', [])
                frame_count = params.get('frameCount', 0)
                fps = params.get('fps', 30.0)
                duration = params.get('duration', 0.0)
                use_real_images = params.get('useRealImages', False)
                
                src_images = None
                
                try:
                    # VideoMetadata 생성
                    duration_us = int(duration * 1000000)
                    metadata_handle = lib.CSharp_Gfe_new_VideoMetadata__SWIG_1(
                        fps,
                        frame_count,
                        duration_us
                    )
                    
                    lib.CSharp_Gfe_GFEngine2D_SetVideoMetadata(engine_handle, metadata_handle)
                    
                    # SrcImagesInterface 생성
                    if use_real_images and frame_images and PILImage:
                        src_images = SrcImagesInterfaceImpl(frame_images)
                    else:
                        src_images = MockSrcImagesInterface(frame_count)
                    
                    json_print({
                        "type": "info",
                        "message": f"SrcImages created: {src_images.size()} frames"
                    })
                    

                    # 실제 DLL 호출 시도
                    result_data = None
                    try:
                        if HAS_SRCIMAGES_INTERFACE and use_real_images and isinstance(src_images, SrcImagesInterfaceImpl):
                            # 실제 SrcImagesInterface 생성
                            src_interface_handle = lib.CSharp_Gfe_new_SrcImagesInterface()
                            if src_interface_handle:
                                # 각 이미지를 SrcImagesInterface에 추가
                                for img_handle in src_images.image_handles:
                                    lib.CSharp_Gfe_SrcImagesInterface_AddImage__SWIG_0(src_interface_handle, img_handle)
                                
                                json_print({
                                    "type": "info",
                                    "message": f"Added {src_images.size()} images to SrcImagesInterface"
                                })
                                
                                # 실제 DLL 호출 시도 (콜백은 None으로 전달)
                                # 주의: 콜백이 필요한 경우 실패할 수 있음
                                try:
                                    result_ptr = lib.CSharp_Gfe_GFEngine2D_AnalyzeSwingVideo__SWIG_0(
                                        engine_handle,
                                        src_interface_handle,
                                        None  # 콜백 (필요시 구현)
                                    )
                                    
                                    if result_ptr:
                                        result_code = lib.CSharp_Gfe_SwingAnalysisResult_result_code_get(result_ptr)
                                        json_print({
                                            "type": "info",
                                            "message": f"DLL analysis completed, result_code: {result_code}"
                                        })
                                        
                                        # 결과 파싱은 복잡하므로 일단 Mock 데이터 사용
                                        # TODO: 실제 결과 파싱 구현 필요
                                        json_print({
                                            "type": "warning",
                                            "message": "DLL call succeeded but result parsing not implemented, using mock data"
                                        })
                                        
                                        # 결과 정리
                                        lib.CSharp_Gfe_delete_SwingAnalysisResult(result_ptr)
                                    
                                    # SrcImagesInterface 정리
                                    lib.CSharp_Gfe_delete_SrcImagesInterface(src_interface_handle)
                                except Exception as dll_error:
                                    json_print({
                                        "type": "warning",
                                        "message": f"DLL call failed: {str(dll_error)}, using mock data"
                                    })
                                    if src_interface_handle:
                                        try:
                                            lib.CSharp_Gfe_delete_SrcImagesInterface(src_interface_handle)
                                        except:
                                            pass
                    except Exception as real_call_error:
                        json_print({
                            "type": "warning",
                            "message": f"Real DLL call attempt failed: {str(real_call_error)}, using mock data"
                        })
                    
                    # Mock 결과 반환 (실제 DLL 호출 실패 시 또는 기본값)
                    if result_data is None:
                        result_data = {
                        "result_code": 0,
                        "value": {
                            "poseDirection": params.get('direction', 0),
                            "clubType": params.get('clubType', 0),
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
                                    "type": 14,
                                    "typeName": "kFrontDownSlide",
                                    "severity": 1,
                                    "severityName": "kNotBad",
                                    "score": 0.55,
                                    "evidenceStepId": 4
                                },
                                {
                                    "type": 16,
                                    "typeName": "kFrontImpactChicken",
                                    "severity": 0,
                                    "severityName": "kBad",
                                    "score": 0.35,
                                    "evidenceStepId": 5
                                }
                            ],
                            "shoulderStanceRatio": 0.85,
                            "swingPlane": {"swingTempo": 1.25},
                            "_metadata": {
                                "frameCount": frame_count,
                                "fps": fps,
                                "duration": duration,
                                "imagesProcessed": src_images.size()
                            }
                        }
                    }
                    
                    # 정리
                    lib.CSharp_Gfe_delete_VideoMetadata(metadata_handle)
                    if src_images:
                        src_images.cleanup()
                    
                    json_print({
                        "type": "response",
                        "requestId": request_id,
                        "result": result_data
                    })
                    
                except Exception as analyze_error:
                    if src_images:
                        src_images.cleanup()
                    
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


