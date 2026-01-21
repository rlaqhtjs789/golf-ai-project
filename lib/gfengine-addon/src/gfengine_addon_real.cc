/**
 * GFEngine2D N-API C++ Addon (Real API)
 * 
 * 실제 GFEngine2D DLL 함수 사용
 * 함수명: CSharp_Gfe_* 형식
 */

#include <napi.h>
#include <windows.h>
#include <string>
#include <vector>

// DLL 핸들
HMODULE hDLL = NULL;

// 함수 포인터 타입 정의
typedef void* (*NewGFEngine2D_t)();
typedef void (*DeleteGFEngine2D_t)(void*);
typedef const char* (*Version_t)();
typedef int (*Initialize_t)(void*, int, int, int);
typedef bool (*IsReady_t)(void*);
typedef bool (*Clear_t)(void*);

// 함수 포인터
NewGFEngine2D_t NewGFEngine2D = nullptr;
DeleteGFEngine2D_t DeleteGFEngine2D = nullptr;
Version_t Version = nullptr;
Initialize_t Initialize = nullptr;
IsReady_t IsReady = nullptr;
Clear_t Clear = nullptr;

// 엔진 핸들 (전역)
void* engineHandle = nullptr;

/**
 * DLL 로드
 */
Napi::Value LoadDLL(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "DLL 경로가 필요합니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string dllPath = info[0].As<Napi::String>().Utf8Value();
  
  // DLL 로드
  hDLL = LoadLibraryA(dllPath.c_str());
  if (hDLL == NULL) {
    Napi::Error::New(env, "DLL 로드 실패").ThrowAsJavaScriptException();
    return env.Null();
  }

  // 함수 로드
  NewGFEngine2D = (NewGFEngine2D_t)GetProcAddress(hDLL, "CSharp_Gfe_new_GFEngine2D");
  DeleteGFEngine2D = (DeleteGFEngine2D_t)GetProcAddress(hDLL, "CSharp_Gfe_delete_GFEngine2D");
  Version = (Version_t)GetProcAddress(hDLL, "CSharp_Gfe_GFEngine2D_Version");
  Initialize = (Initialize_t)GetProcAddress(hDLL, "CSharp_Gfe_GFEngine2D_Initialize__SWIG_0");
  IsReady = (IsReady_t)GetProcAddress(hDLL, "CSharp_Gfe_GFEngine2D_IsReady");
  Clear = (Clear_t)GetProcAddress(hDLL, "CSharp_Gfe_GFEngine2D_Clear");

  if (!NewGFEngine2D || !DeleteGFEngine2D || !Version || !Initialize) {
    Napi::Error::New(env, "필수 함수 로드 실패").ThrowAsJavaScriptException();
    return env.Null();
  }

  // 엔진 인스턴스 생성
  engineHandle = NewGFEngine2D();
  if (engineHandle == nullptr) {
    Napi::Error::New(env, "엔진 인스턴스 생성 실패").ThrowAsJavaScriptException();
    return env.Null();
  }

  return Napi::Boolean::New(env, true);
}

/**
 * 버전 정보
 */
Napi::Value GetVersion(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (Version == nullptr) {
    Napi::Error::New(env, "DLL이 로드되지 않았습니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  const char* version = Version();
  if (version == nullptr) {
    return Napi::String::New(env, "unknown");
  }

  return Napi::String::New(env, version);
}

/**
 * 초기화
 */
Napi::Value InitializeEngine(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (engineHandle == nullptr || Initialize == nullptr) {
    Napi::Error::New(env, "엔진이 준비되지 않았습니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (info.Length() < 3) {
    Napi::TypeError::New(env, "3개의 인자가 필요합니다 (direction, clubType, handedId)").ThrowAsJavaScriptException();
    return env.Null();
  }

  int direction = info[0].As<Napi::Number>().Int32Value();
  int clubType = info[1].As<Napi::Number>().Int32Value();
  int handedId = info[2].As<Napi::Number>().Int32Value();

  int result = Initialize(engineHandle, direction, clubType, handedId);

  Napi::Object resultObj = Napi::Object::New(env);
  resultObj.Set("success", Napi::Boolean::New(env, result == 0));
  resultObj.Set("code", Napi::Number::New(env, result));

  // 준비 상태 확인
  if (IsReady) {
    bool isReady = IsReady(engineHandle);
    resultObj.Set("isReady", Napi::Boolean::New(env, isReady));
  }

  return resultObj;
}

/**
 * 준비 상태 확인
 */
Napi::Value CheckIsReady(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (engineHandle == nullptr || IsReady == nullptr) {
    return Napi::Boolean::New(env, false);
  }

  bool isReady = IsReady(engineHandle);
  return Napi::Boolean::New(env, isReady);
}

/**
 * Clear
 */
Napi::Value ClearEngine(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (engineHandle == nullptr || Clear == nullptr) {
    return Napi::Boolean::New(env, false);
  }

  bool cleared = Clear(engineHandle);
  return Napi::Boolean::New(env, cleared);
}

/**
 * DLL 언로드
 */
Napi::Value UnloadDLL(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (engineHandle && DeleteGFEngine2D) {
    DeleteGFEngine2D(engineHandle);
    engineHandle = nullptr;
  }

  if (hDLL) {
    FreeLibrary(hDLL);
    hDLL = NULL;
  }

  NewGFEngine2D = nullptr;
  DeleteGFEngine2D = nullptr;
  Version = nullptr;
  Initialize = nullptr;
  IsReady = nullptr;
  Clear = nullptr;

  return Napi::Boolean::New(env, true);
}

/**
 * 모듈 초기화
 */
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("loadDLL", Napi::Function::New(env, LoadDLL));
  exports.Set("getVersion", Napi::Function::New(env, GetVersion));
  exports.Set("initialize", Napi::Function::New(env, InitializeEngine));
  exports.Set("isReady", Napi::Function::New(env, CheckIsReady));
  exports.Set("clear", Napi::Function::New(env, ClearEngine));
  exports.Set("unloadDLL", Napi::Function::New(env, UnloadDLL));
  
  return exports;
}

NODE_API_MODULE(gfengine_addon, Init)


