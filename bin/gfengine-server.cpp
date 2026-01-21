/**
 * GFEngine2D Server Process
 * 
 * 별도 프로세스로 실행되는 GFEngine2D 래퍼
 * stdin/stdout을 통해 JSON 메시지로 Node.js와 통신
 * 
 * 빌드 방법:
 * g++ -o gfengine-server.exe gfengine-server.cpp -L. -lGFEngine2D -std=c++17
 * 
 * 또는 Visual Studio:
 * cl /EHsc gfengine-server.cpp /link libGFEngine2D.lib
 */

#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include <vector>
#include <map>
#include <windows.h>

// JSON 라이브러리 (단순 구현 - nlohmann/json 사용 권장)
// 여기서는 간단한 JSON 빌더만 구현
class SimpleJSON {
private:
    std::map<std::string, std::string> data;

public:
    void set(const std::string& key, const std::string& value) {
        data[key] = "\"" + value + "\"";
    }

    void set(const std::string& key, int value) {
        data[key] = std::to_string(value);
    }

    void set(const std::string& key, double value) {
        data[key] = std::to_string(value);
    }

    void set(const std::string& key, bool value) {
        data[key] = value ? "true" : "false";
    }

    std::string build() {
        std::string result = "{";
        bool first = true;
        for (const auto& pair : data) {
            if (!first) result += ",";
            result += "\"" + pair.first + "\":" + pair.second;
            first = false;
        }
        result += "}";
        return result;
    }
};

// DLL 함수 포인터 타입
extern "C" {
    typedef void* (*CreateEngine_t)();
    typedef void (*DestroyEngine_t)(void*);
    typedef int (*Initialize_t)(void*, int, int, int);
    typedef const char* (*GetVersion_t)(void*);
    typedef void* (*AnalyzeSwingVideo_t)(void*, const char*, int, int);
    typedef int (*GetResultCode_t)(void*);
    typedef void* (*GetResultValue_t)(void*);
    typedef void (*DestroyResult_t)(void*);
    
    // SwingResultInterface 메서드
    typedef int (*GetFrameIndex_t)(void*, int);
    typedef void* (*GetSwingProblem_t)(void*);
    typedef int (*GetProblemCount_t)(void*);
    typedef void* (*GetProblem_t)(void*, int);
    typedef int (*GetProblemType_t)(void*);
    typedef int (*GetProblemSeverity_t)(void*);
    typedef double (*GetProblemScore_t)(void*);
    typedef int (*GetProblemEvidenceStepId_t)(void*);
    typedef void* (*GetSwingPlane_t)(void*);
    typedef double (*GetSwingTempo_t)(void*);
    typedef double (*GetShoulderStanceRatio_t)(void*);
}

// DLL 핸들 및 함수 포인터
HMODULE hDLL = NULL;
void* engineInstance = NULL;

CreateEngine_t CreateEngine = nullptr;
DestroyEngine_t DestroyEngine = nullptr;
Initialize_t Initialize = nullptr;
GetVersion_t GetVersion = nullptr;
AnalyzeSwingVideo_t AnalyzeSwingVideo = nullptr;
GetResultCode_t GetResultCode = nullptr;
GetResultValue_t GetResultValue = nullptr;
DestroyResult_t DestroyResult = nullptr;

GetFrameIndex_t GetFrameIndex = nullptr;
GetSwingProblem_t GetSwingProblem = nullptr;
GetProblemCount_t GetProblemCount = nullptr;
GetProblem_t GetProblem = nullptr;
GetProblemType_t GetProblemType = nullptr;
GetProblemSeverity_t GetProblemSeverity = nullptr;
GetProblemScore_t GetProblemScore = nullptr;
GetProblemEvidenceStepId_t GetProblemEvidenceStepId = nullptr;
GetSwingPlane_t GetSwingPlane = nullptr;
GetSwingTempo_t GetSwingTempo = nullptr;
GetShoulderStanceRatio_t GetShoulderStanceRatio = nullptr;

/**
 * DLL 로드 및 함수 바인딩
 */
bool loadDLL() {
    hDLL = LoadLibraryA("libGFEngine2D.dll");
    if (hDLL == NULL) {
        std::cerr << "Error: Failed to load libGFEngine2D.dll" << std::endl;
        return false;
    }

    // 함수 로드
    CreateEngine = (CreateEngine_t)GetProcAddress(hDLL, "CreateEngine");
    DestroyEngine = (DestroyEngine_t)GetProcAddress(hDLL, "DestroyEngine");
    Initialize = (Initialize_t)GetProcAddress(hDLL, "Initialize");
    GetVersion = (GetVersion_t)GetProcAddress(hDLL, "GetVersion");
    AnalyzeSwingVideo = (AnalyzeSwingVideo_t)GetProcAddress(hDLL, "AnalyzeSwingVideo");
    GetResultCode = (GetResultCode_t)GetProcAddress(hDLL, "GetResultCode");
    GetResultValue = (GetResultValue_t)GetProcAddress(hDLL, "GetResultValue");
    DestroyResult = (DestroyResult_t)GetProcAddress(hDLL, "DestroyResult");
    
    GetFrameIndex = (GetFrameIndex_t)GetProcAddress(hDLL, "GetFrameIndex");
    GetSwingProblem = (GetSwingProblem_t)GetProcAddress(hDLL, "GetSwingProblem");
    GetProblemCount = (GetProblemCount_t)GetProcAddress(hDLL, "GetProblemCount");
    GetProblem = (GetProblem_t)GetProcAddress(hDLL, "GetProblem");
    GetProblemType = (GetProblemType_t)GetProcAddress(hDLL, "GetProblemType");
    GetProblemSeverity = (GetProblemSeverity_t)GetProcAddress(hDLL, "GetProblemSeverity");
    GetProblemScore = (GetProblemScore_t)GetProcAddress(hDLL, "GetProblemScore");
    GetProblemEvidenceStepId = (GetProblemEvidenceStepId_t)GetProcAddress(hDLL, "GetProblemEvidenceStepId");
    GetSwingPlane = (GetSwingPlane_t)GetProcAddress(hDLL, "GetSwingPlane");
    GetSwingTempo = (GetSwingTempo_t)GetProcAddress(hDLL, "GetSwingTempo");
    GetShoulderStanceRatio = (GetShoulderStanceRatio_t)GetProcAddress(hDLL, "GetShoulderStanceRatio");

    if (!CreateEngine || !Initialize || !AnalyzeSwingVideo) {
        std::cerr << "Error: Failed to load required functions" << std::endl;
        return false;
    }

    // 엔진 인스턴스 생성
    engineInstance = CreateEngine();
    if (engineInstance == NULL) {
        std::cerr << "Error: Failed to create engine instance" << std::endl;
        return false;
    }

    return true;
}

/**
 * JSON 파싱 (간단한 구현)
 */
std::map<std::string, std::string> parseJSON(const std::string& json) {
    std::map<std::string, std::string> result;
    // 간단한 파싱 (실제로는 nlohmann/json 사용 권장)
    // 여기서는 "key":"value" 패턴만 처리
    
    size_t pos = 0;
    while (pos < json.length()) {
        size_t keyStart = json.find("\"", pos);
        if (keyStart == std::string::npos) break;
        
        size_t keyEnd = json.find("\"", keyStart + 1);
        std::string key = json.substr(keyStart + 1, keyEnd - keyStart - 1);
        
        size_t valueStart = json.find(":", keyEnd) + 1;
        while (json[valueStart] == ' ') valueStart++;
        
        std::string value;
        if (json[valueStart] == '"') {
            size_t valueEnd = json.find("\"", valueStart + 1);
            value = json.substr(valueStart + 1, valueEnd - valueStart - 1);
            pos = valueEnd + 1;
        } else {
            size_t valueEnd = json.find_first_of(",}", valueStart);
            value = json.substr(valueStart, valueEnd - valueStart);
            pos = valueEnd;
        }
        
        result[key] = value;
    }
    
    return result;
}

/**
 * 응답 전송
 */
void sendResponse(int requestId, const std::string& dataJSON) {
    std::cout << "{\"type\":\"response\",\"requestId\":" << requestId 
              << ",\"data\":" << dataJSON << "}" << std::endl;
    std::cout.flush();
}

/**
 * 에러 응답
 */
void sendError(int requestId, const std::string& error) {
    std::cout << "{\"type\":\"response\",\"requestId\":" << requestId 
              << ",\"error\":\"" << error << "\"}" << std::endl;
    std::cout.flush();
}

/**
 * 진행 상황 전송
 */
void sendProgress(int progress, const std::string& stage) {
    std::cout << "{\"type\":\"progress\",\"data\":{\"progress\":" << progress 
              << ",\"stage\":\"" << stage << "\"}}" << std::endl;
    std::cout.flush();
}

/**
 * 분석 결과를 JSON으로 변환
 */
std::string resultToJSON(void* result) {
    if (result == NULL) {
        return "{\"error\":\"null result\"}";
    }

    int resultCode = GetResultCode(result);
    
    std::stringstream json;
    json << "{";
    json << "\"result_code\":" << resultCode;
    
    if (resultCode == 0) {  // Success
        void* value = GetResultValue(result);
        if (value != NULL) {
            json << ",\"value\":{";
            
            // frameIndex
            json << "\"frameIndex\":{";
            json << "\"address\":" << GetFrameIndex(value, 0) << ",";
            json << "\"takeAway\":" << GetFrameIndex(value, 1) << ",";
            json << "\"backSwing\":" << GetFrameIndex(value, 2) << ",";
            json << "\"top\":" << GetFrameIndex(value, 3) << ",";
            json << "\"downSwing\":" << GetFrameIndex(value, 4) << ",";
            json << "\"impact\":" << GetFrameIndex(value, 5) << ",";
            json << "\"followThrough\":" << GetFrameIndex(value, 6) << ",";
            json << "\"finish\":" << GetFrameIndex(value, 7);
            json << "}";
            
            // problems
            void* swingProblem = GetSwingProblem(value);
            if (swingProblem != NULL) {
                int problemCount = GetProblemCount(swingProblem);
                json << ",\"problems\":[";
                
                for (int i = 0; i < problemCount; i++) {
                    if (i > 0) json << ",";
                    
                    void* problem = GetProblem(swingProblem, i);
                    if (problem != NULL) {
                        json << "{";
                        json << "\"type\":" << GetProblemType(problem) << ",";
                        json << "\"severity\":" << GetProblemSeverity(problem) << ",";
                        json << "\"score\":" << GetProblemScore(problem) << ",";
                        json << "\"evidenceStepId\":" << GetProblemEvidenceStepId(problem);
                        json << "}";
                    }
                }
                
                json << "]";
            }
            
            // swingPlane
            void* swingPlane = GetSwingPlane(value);
            if (swingPlane != NULL) {
                json << ",\"swingPlane\":{";
                json << "\"swingTempo\":" << GetSwingTempo(swingPlane);
                json << "}";
            }
            
            // shoulderStanceRatio
            json << ",\"shoulderStanceRatio\":" << GetShoulderStanceRatio(value);
            
            json << "}";  // value 닫기
        }
    }
    
    json << "}";  // 최상위 닫기
    
    return json.str();
}

/**
 * 요청 처리
 */
void handleRequest(const std::map<std::string, std::string>& request) {
    int requestId = std::stoi(request.at("requestId"));
    std::string method = request.at("method");

    try {
        if (method == "initialize") {
            int direction = std::stoi(request.at("direction"));
            int clubType = std::stoi(request.at("clubType"));
            int handedId = std::stoi(request.at("handedId"));

            int result = Initialize(engineInstance, direction, clubType, handedId);
            
            SimpleJSON response;
            response.set("success", result == 0);
            response.set("code", result);
            sendResponse(requestId, response.build());
        }
        else if (method == "getVersion") {
            const char* version = GetVersion(engineInstance);
            
            SimpleJSON response;
            response.set("version", version ? version : "unknown");
            sendResponse(requestId, response.build());
        }
        else if (method == "analyzeVideo") {
            std::string videoPath = request.at("videoPath");
            int direction = std::stoi(request.at("direction"));
            int clubType = std::stoi(request.at("clubType"));

            // 진행 상황 전송
            sendProgress(10, "Initializing analysis");
            
            // 비디오 분석
            void* result = AnalyzeSwingVideo(
                engineInstance,
                videoPath.c_str(),
                direction,
                clubType
            );
            
            sendProgress(90, "Processing results");
            
            // 결과를 JSON으로 변환
            std::string resultJSON = resultToJSON(result);
            
            sendProgress(100, "Complete");
            
            // 응답 전송
            sendResponse(requestId, resultJSON);
            
            // 결과 해제
            if (DestroyResult) {
                DestroyResult(result);
            }
        }
        else if (method == "ping") {
            SimpleJSON response;
            response.set("pong", true);
            sendResponse(requestId, response.build());
        }
        else {
            sendError(requestId, "Unknown method: " + method);
        }
    }
    catch (const std::exception& e) {
        sendError(requestId, std::string("Exception: ") + e.what());
    }
}

/**
 * 메인
 */
int main(int argc, char* argv[]) {
    // 버퍼링 비활성화 (즉시 출력)
    std::cout.setf(std::ios::unitbuf);
    
    // DLL 로드
    if (!loadDLL()) {
        std::cerr << "Failed to load DLL" << std::endl;
        return 1;
    }

    // 준비 완료 알림
    std::cout << "{\"type\":\"ready\"}" << std::endl;
    std::cout.flush();

    // stdin에서 요청 읽기
    std::string line;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        try {
            auto request = parseJSON(line);
            handleRequest(request);
        }
        catch (const std::exception& e) {
            std::cerr << "Request parsing failed: " << e.what() << std::endl;
        }
    }

    // 정리
    if (engineInstance && DestroyEngine) {
        DestroyEngine(engineInstance);
    }
    
    if (hDLL) {
        FreeLibrary(hDLL);
    }

    return 0;
}


