/**
 * GFEngine Server Template
 * 
 * 별도 프로세스로 실행되는 GFEngine DLL 래퍼
 * stdin/stdout을 통해 JSON 메시지로 통신
 * 
 * 빌드 방법:
 * g++ -o gfengine-server.exe gfengine-server.cpp -L. -lGFEngine2D -std=c++17
 */

#include <iostream>
#include <string>
#include <sstream>
#include <windows.h>
#include "json.hpp" // nlohmann/json 라이브러리 (https://github.com/nlohmann/json)

using json = nlohmann::json;

// DLL 핸들
HMODULE hDLL = NULL;

// DLL 함수 포인터
typedef int (*GF_Initialize_t)(int, int, int);
typedef const char* (*GF_GetVersion_t)();
typedef int (*GF_AnalyzeFrame_t)(unsigned char*, int, int, float*);

GF_Initialize_t GF_Initialize = nullptr;
GF_GetVersion_t GF_GetVersion = nullptr;
GF_AnalyzeFrame_t GF_AnalyzeFrame = nullptr;

/**
 * DLL 로드
 */
bool loadDLL() {
    hDLL = LoadLibraryA("libGFEngine2D.dll");
    if (hDLL == NULL) {
        std::cerr << "DLL 로드 실패" << std::endl;
        return false;
    }

    GF_Initialize = (GF_Initialize_t)GetProcAddress(hDLL, "GF_Initialize");
    GF_GetVersion = (GF_GetVersion_t)GetProcAddress(hDLL, "GF_GetVersion");
    GF_AnalyzeFrame = (GF_AnalyzeFrame_t)GetProcAddress(hDLL, "GF_AnalyzeFrame");

    if (!GF_Initialize || !GF_GetVersion || !GF_AnalyzeFrame) {
        std::cerr << "DLL 함수 로드 실패" << std::endl;
        return false;
    }

    return true;
}

/**
 * 응답 전송
 */
void sendResponse(int requestId, const json& data) {
    json response = {
        {"type", "response"},
        {"requestId", requestId},
        {"data", data}
    };
    std::cout << response.dump() << std::endl;
    std::cout.flush();
}

/**
 * 에러 응답
 */
void sendError(int requestId, const std::string& error) {
    json response = {
        {"type", "response"},
        {"requestId", requestId},
        {"error", error}
    };
    std::cout << response.dump() << std::endl;
    std::cout.flush();
}

/**
 * 진행 상황 전송
 */
void sendProgress(int progress, const std::string& stage) {
    json message = {
        {"type", "progress"},
        {"data", {
            {"progress", progress},
            {"stage", stage}
        }}
    };
    std::cout << message.dump() << std::endl;
    std::cout.flush();
}

/**
 * 요청 처리
 */
void handleRequest(const json& request) {
    int requestId = request["requestId"];
    std::string method = request["method"];
    json params = request.value("params", json::object());

    try {
        if (method == "initialize") {
            int direction = params["direction"];
            int clubType = params["clubType"];
            int handedId = params["handedId"];

            int result = GF_Initialize(direction, clubType, handedId);
            sendResponse(requestId, {{"success", result == 0}});
        }
        else if (method == "getVersion") {
            const char* version = GF_GetVersion();
            sendResponse(requestId, {{"version", version}});
        }
        else if (method == "analyzeFrame") {
            // Base64 디코딩 및 프레임 분석
            // ... 구현 ...
            
            float results[8] = {0};
            // int status = GF_AnalyzeFrame(frameData, width, height, results);
            
            sendResponse(requestId, {
                {"clubSpeed", results[0]},
                {"ballSpeed", results[1]},
                {"launchAngle", results[2]}
            });
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
int main() {
    // DLL 로드
    if (!loadDLL()) {
        return 1;
    }

    // 준비 완료 알림
    json ready = {{"type", "ready"}};
    std::cout << ready.dump() << std::endl;
    std::cout.flush();

    // stdin에서 요청 읽기
    std::string line;
    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;

        try {
            json request = json::parse(line);
            handleRequest(request);
        }
        catch (const std::exception& e) {
            std::cerr << "요청 파싱 실패: " << e.what() << std::endl;
        }
    }

    // 정리
    if (hDLL) {
        FreeLibrary(hDLL);
    }

    return 0;
}


