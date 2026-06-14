#include "ActivityLogController.h"

#include "../models/ActivityLog.h"
#include "../repositories/TaskRepository.h"
#include "../services/ActivityLogService.h"
#include "../services/ProjectService.h"
#include "../utils/JwtUtils.h"

#include <json/json.h>

#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

namespace scrumban {
namespace {

constexpr int kProjectActivityLimit = 50;

Json::Value activityLogToJson(const ActivityLog& log) {
    Json::Value body;
    body["id"] = log.id();
    body["taskId"] = log.taskId();
    body["userId"] = log.userId().has_value() ? Json::Value(*log.userId()) : Json::Value(Json::nullValue);
    body["action"] = log.action();
    body["oldValue"] = log.oldValue().has_value() ? Json::Value(*log.oldValue()) : Json::Value(Json::nullValue);
    body["newValue"] = log.newValue().has_value() ? Json::Value(*log.newValue()) : Json::Value(Json::nullValue);
    body["createdAt"] = log.createdAt();
    return body;
}

Json::Value activityLogsToJson(const std::vector<ActivityLog>& logs) {
    Json::Value body(Json::arrayValue);
    for (const auto& log : logs) {
        body.append(activityLogToJson(log));
    }

    return body;
}

drogon::HttpResponsePtr makeJsonResponse(const Json::Value& body, const drogon::HttpStatusCode statusCode) {
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->setStatusCode(statusCode);
    return response;
}

drogon::HttpResponsePtr makeErrorResponse(const std::string& message, const drogon::HttpStatusCode statusCode) {
    Json::Value body;
    body["error"] = message;
    return makeJsonResponse(body, statusCode);
}

std::optional<std::string> extractBearerToken(const drogon::HttpRequestPtr& request) {
    const std::string authorization = request->getHeader("Authorization");
    constexpr char prefix[] = "Bearer ";

    if (authorization.rfind(prefix, 0) != 0) {
        return std::nullopt;
    }

    std::string token = authorization.substr(sizeof(prefix) - 1);
    if (token.empty()) {
        return std::nullopt;
    }

    return token;
}

std::optional<std::string> extractAuthenticatedUserId(const drogon::HttpRequestPtr& request) {
    const auto token = extractBearerToken(request);
    if (!token.has_value() || !JwtUtils::validateToken(*token)) {
        return std::nullopt;
    }

    return JwtUtils::extractUserId(*token);
}

void ensureProjectMember(const std::string& projectId, const std::string& userId) {
    if (const auto project = ProjectService::getProjectById(projectId, userId); !project.has_value()) {
        throw std::runtime_error("Project not found");
    }
}

void ensureTaskBelongsToProject(const std::string& projectId, const std::string& taskId) {
    if (!TaskRepository::belongsToProject(taskId, projectId)) {
        throw std::runtime_error("Task does not belong to this project");
    }
}

bool isActivityForbiddenError(const std::string& message) {
    return message == "Project not found" || message == "User is not a member of this project" ||
           message == "Task does not belong to this project";
}

}  // namespace

void ActivityLogController::listTaskActivity(const drogon::HttpRequestPtr& request,
                                             std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                             const std::string& projectId,
                                             const std::string& taskId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        ensureProjectMember(projectId, *userId);
        ensureTaskBelongsToProject(projectId, taskId);

        const auto logs = ActivityLogService::getLogsForTask(taskId);
        callback(makeJsonResponse(activityLogsToJson(logs), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        if (const std::string message = error.what(); isActivityForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load activity logs", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load activity logs", drogon::k500InternalServerError));
    }
}

void ActivityLogController::listProjectActivity(const drogon::HttpRequestPtr& request,
                                                std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                                const std::string& projectId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        ensureProjectMember(projectId, *userId);

        const auto logs = ActivityLogService::getRecentLogsForProject(projectId, kProjectActivityLimit);
        callback(makeJsonResponse(activityLogsToJson(logs), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        if (const std::string message = error.what(); isActivityForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load activity logs", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load activity logs", drogon::k500InternalServerError));
    }
}

}  // namespace scrumban
