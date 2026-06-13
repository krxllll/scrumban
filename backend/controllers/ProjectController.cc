#include "ProjectController.h"

#include "../models/Project.h"
#include "../services/ProjectService.h"
#include "../utils/JwtUtils.h"

#include <json/json.h>

#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

namespace scrumban {
namespace {

Json::Value projectToJson(const Project& project) {
    Json::Value body;
    body["id"] = project.id();
    body["name"] = project.name();
    body["ownerId"] = project.ownerId();
    body["createdAt"] = project.createdAt();
    body["updatedAt"] = project.updatedAt();

    if (project.description().has_value()) {
        body["description"] = *project.description();
    } else {
        body["description"] = Json::nullValue;
    }

    return body;
}

Json::Value projectsToJson(const std::vector<Project>& projects) {
    Json::Value body(Json::arrayValue);
    for (const auto& project : projects) {
        body.append(projectToJson(project));
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

std::optional<std::string> getRequiredString(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || !body[field].isString() || body[field].asString().empty()) {
        return std::nullopt;
    }

    return body[field].asString();
}

std::optional<std::optional<std::string>> getOptionalString(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || body[field].isNull()) {
        return std::optional<std::string>{std::nullopt};
    }

    if (!body[field].isString()) {
        return std::nullopt;
    }

    return std::optional{body[field].asString()};
}

}  // namespace

void ProjectController::listProjects(const drogon::HttpRequestPtr& request,
                                     std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto projects = ProjectService::getProjectsForUser(*userId);
        callback(makeJsonResponse(projectsToJson(projects), drogon::k200OK));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load projects", drogon::k500InternalServerError));
    }
}

void ProjectController::createProject(const drogon::HttpRequestPtr& request,
                                      std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto body = request->getJsonObject();
        if (!body) {
            callback(makeErrorResponse("Request body must be valid JSON", drogon::k400BadRequest));
            return;
        }

        const auto name = getRequiredString(*body, "name");
        const auto description = getOptionalString(*body, "description");
        if (!name.has_value()) {
            callback(makeErrorResponse("Project name is required", drogon::k400BadRequest));
            return;
        }

        if (!description.has_value()) {
            callback(makeErrorResponse("Project description must be a string", drogon::k400BadRequest));
            return;
        }

        const Project project = ProjectService::createProject(*name, *description, *userId);
        callback(makeJsonResponse(projectToJson(project), drogon::k201Created));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (message == "Project name is required" || message == "Project owner id is required") {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }

        callback(makeErrorResponse("Could not create project", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not create project", drogon::k500InternalServerError));
    }
}

void ProjectController::getProject(const drogon::HttpRequestPtr& request,
                                   std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                   const std::string& projectId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto project = ProjectService::getProjectById(projectId, *userId);
        if (!project.has_value()) {
            callback(makeErrorResponse("Project not found", drogon::k404NotFound));
            return;
        }

        callback(makeJsonResponse(projectToJson(*project), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (message == "User is not a member of this project") {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load project", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load project", drogon::k500InternalServerError));
    }
}

}  // namespace scrumban
