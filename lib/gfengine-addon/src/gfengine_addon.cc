/**
 * GFEngine2D N-API C++ Addon
 * 
 * Node.js에서 GFEngine2D DLL을 직접 호출하는 네이티브 애드온
 * ffi-napi보다 안정적이고 성능이 좋습니다.
 */

#include <napi.h>
#include <windows.h>

// DLL 함수 포인터 타입 정의
typedef int (*GF_Initialize_t)(int, int, int);
typedef const char* (*GF_GetVersion_t)();
typedef int (*GF_AnalyzeFrame_t)(unsigned char*, int, int, float*);

// DLL 핸들 (전역)
HMODULE hDLL = NULL;

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
  
  hDLL = LoadLibraryA(dllPath.c_str());
  if (hDLL == NULL) {
    Napi::Error::New(env, "DLL 로드 실패").ThrowAsJavaScriptException();
    return env.Null();
  }

  return Napi::Boolean::New(env, true);
}

/**
 * 엔진 초기화
 */
Napi::Value Initialize(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (hDLL == NULL) {
    Napi::Error::New(env, "DLL이 로드되지 않았습니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  int direction = info[0].As<Napi::Number>().Int32Value();
  int clubType = info[1].As<Napi::Number>().Int32Value();
  int handedId = info[2].As<Napi::Number>().Int32Value();

  GF_Initialize_t GF_Initialize = (GF_Initialize_t)GetProcAddress(hDLL, "GF_Initialize");
  if (GF_Initialize == NULL) {
    Napi::Error::New(env, "GF_Initialize 함수를 찾을 수 없습니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  int result = GF_Initialize(direction, clubType, handedId);
  return Napi::Number::New(env, result);
}

/**
 * 버전 정보
 */
Napi::Value GetVersion(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (hDLL == NULL) {
    Napi::Error::New(env, "DLL이 로드되지 않았습니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  GF_GetVersion_t GF_GetVersion = (GF_GetVersion_t)GetProcAddress(hDLL, "GF_GetVersion");
  if (GF_GetVersion == NULL) {
    Napi::Error::New(env, "GF_GetVersion 함수를 찾을 수 없습니다").ThrowAsJavaScriptException();
    return env.Null();
  }

  const char* version = GF_GetVersion();
  return Napi::String::New(env, version);
}

/**
 * 프레임 분석 (비동기)
 */
class AnalyzeFrameWorker : public Napi::AsyncWorker {
public:
  AnalyzeFrameWorker(
    Napi::Function& callback,
    unsigned char* frameData,
    int width,
    int height
  ) : Napi::AsyncWorker(callback),
      frameData(frameData),
      width(width),
      height(height) {}

  ~AnalyzeFrameWorker() {
    delete[] frameData;
  }

  void Execute() override {
    GF_AnalyzeFrame_t GF_AnalyzeFrame = (GF_AnalyzeFrame_t)GetProcAddress(hDLL, "GF_AnalyzeFrame");
    if (GF_AnalyzeFrame == NULL) {
      SetError("GF_AnalyzeFrame 함수를 찾을 수 없습니다");
      return;
    }

    result = new float[8]; // 결과 데이터
    int status = GF_AnalyzeFrame(frameData, width, height, result);
    
    if (status != 0) {
      SetError("프레임 분석 실패");
    }
  }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::Object resultObj = Napi::Object::New(env);
    
    resultObj.Set("clubSpeed", Napi::Number::New(env, result[0]));
    resultObj.Set("ballSpeed", Napi::Number::New(env, result[1]));
    resultObj.Set("launchAngle", Napi::Number::New(env, result[2]));
    resultObj.Set("backSpin", Napi::Number::New(env, result[3]));
    resultObj.Set("sideSpin", Napi::Number::New(env, result[4]));
    
    delete[] result;
    
    Callback().Call({env.Null(), resultObj});
  }

private:
  unsigned char* frameData;
  int width;
  int height;
  float* result;
};

Napi::Value AnalyzeFrameAsync(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  Napi::Buffer<unsigned char> buffer = info[0].As<Napi::Buffer<unsigned char>>();
  int width = info[1].As<Napi::Number>().Int32Value();
  int height = info[2].As<Napi::Number>().Int32Value();
  Napi::Function callback = info[3].As<Napi::Function>();

  // 버퍼 복사 (워커 스레드에서 사용)
  size_t size = buffer.Length();
  unsigned char* frameData = new unsigned char[size];
  memcpy(frameData, buffer.Data(), size);

  AnalyzeFrameWorker* worker = new AnalyzeFrameWorker(callback, frameData, width, height);
  worker->Queue();

  return env.Undefined();
}

/**
 * DLL 해제
 */
Napi::Value UnloadDLL(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (hDLL != NULL) {
    FreeLibrary(hDLL);
    hDLL = NULL;
  }

  return Napi::Boolean::New(env, true);
}

/**
 * 모듈 초기화
 */
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("loadDLL", Napi::Function::New(env, LoadDLL));
  exports.Set("initialize", Napi::Function::New(env, Initialize));
  exports.Set("getVersion", Napi::Function::New(env, GetVersion));
  exports.Set("analyzeFrameAsync", Napi::Function::New(env, AnalyzeFrameAsync));
  exports.Set("unloadDLL", Napi::Function::New(env, UnloadDLL));
  
  return exports;
}

NODE_API_MODULE(gfengine_addon, Init)


