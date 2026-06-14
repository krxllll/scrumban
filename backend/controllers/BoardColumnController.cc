#include "BoardColumnController.h"

#include "../models/BoardColumn.h"
#include "../services/BoardColumnService.h"
#include "../utils/JwtUtils.h"

#include <json/json.h>

#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

namespace scrumban {
namespace {

Json::Value boardColumnToJson(const BoardColumn& column) {
    Json::Value body;
    body["id"] = column.id();
    body["projectId"] = column.projectId();
    body["name"] = column.name();
    body["position"] = column.position();
    body["createdAt"] = column.createdAt();
    body["updatedAt"] = column.updatedAt();

    if (column.wipLimit().has_value()) {
        body["wipLimit"] = *column.wipLimit();
    } else {
        body["wipLimit"] = Json::nullValue;
    }

    return body;
}

Json::Value boardColumnsToJson(const std::vector<BoardColumn>& columns) {
    Json::Value body(Json::arrayValue);
    for (const auto& column : columns) {
        body.append(boardColumnToJson(column));
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

std::optional<int> getRequiredInt(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || !body[field].isInt()) {
        return std::nullopt;
    }

    return body[field].asInt();
}

std::optional<std::optional<int>> getOptionalInt(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || body[field].isNull()) {
        return std::optional<int>{std::nullopt};
    }

    if (!body[field].isInt()) {
        return std::nullopt;
    }

    return std::optional{body[field].asInt()};
}

bool isColumnValidationError(const std::string& message) {
    return message == "Project id is required" || message == "User id is required" ||
           message == "Board column id is required" || message == "Board column name is required" ||
           message == "Board column position must be greater than or equal to 0" ||
           message == "Board column WIP limit must be greater than 0";
}

}  // namespace

void BoardColumnController::listColumns(const drogon::HttpRequestPtr& request,
                                        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                        const std::string& projectId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto columns = BoardColumnService::getColumnsForProject(projectId, *userId);
        callback(makeJsonResponse(boardColumnsToJson(columns), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (message == "Project not found") {
            callback(makeErrorResponse(message, drogon::k404NotFound));
            return;
        }

        if (message == "User is not a member of this project") {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load board columns", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load board columns", drogon::k500InternalServerError));
    }
}

void BoardColumnController::createColumn(const drogon::HttpRequestPtr& request,
                                         std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                         const std::string& projectId) {
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
        const auto position = getRequiredInt(*body, "position");
        const auto wipLimit = getOptionalInt(*body, "wipLimit");
        if (!name.has_value()) {
            callback(makeErrorResponse("Board column name is required", drogon::k400BadRequest));
            return;
        }

        if (!position.has_value()) {
            callback(makeErrorResponse("Board column position is required", drogon::k400BadRequest));
            return;
        }

        if (!wipLimit.has_value()) {
            callback(makeErrorResponse("Board column WIP limit must be an integer or null", drogon::k400BadRequest));
            return;
        }

        const BoardColumn column = BoardColumnService::createColumn(projectId, *userId, *name, *position, *wipLimit);
        callback(makeJsonResponse(boardColumnToJson(column), drogon::k201Created));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isColumnValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }

        if (message == "User is not the owner of this project") {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not create board column", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not create board column", drogon::k500InternalServerError));
    }
}

void BoardColumnController::updateColumn(const drogon::HttpRequestPtr& request,
                                         std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                         const std::string& projectId,
                                         const std::string& columnId) {
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
        const auto position = getRequiredInt(*body, "position");
        const auto wipLimit = getOptionalInt(*body, "wipLimit");
        if (!name.has_value()) {
            callback(makeErrorResponse("Board column name is required", drogon::k400BadRequest));
            return;
        }

        if (!position.has_value()) {
            callback(makeErrorResponse("Board column position is required", drogon::k400BadRequest));
            return;
        }

        if (!wipLimit.has_value()) {
            callback(makeErrorResponse("Board column WIP limit must be an integer or null", drogon::k400BadRequest));
            return;
        }

        const BoardColumn column =
            BoardColumnService::updateColumn(projectId, columnId, *userId, *name, *position, *wipLimit);
        callback(makeJsonResponse(boardColumnToJson(column), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isColumnValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }

        if (message == "User is not the owner of this project" ||
            message == "Board column does not belong to this project") {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not update board column", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not update board column", drogon::k500InternalServerError));
    }
}

void BoardColumnController::deleteColumn(const drogon::HttpRequestPtr& request,
                                         std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                         const std::string& projectId,
                                         const std::string& columnId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        BoardColumnService::deleteColumn(projectId, columnId, *userId);

        Json::Value body;
        body["deleted"] = true;
        callback(makeJsonResponse(body, drogon::k200OK));
    } catch (const std::runtime_error& error) {
        if (const std::string message = error.what(); message == "User is not the owner of this project" ||
                                                      message == "Board column does not belong to this project") {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not delete board column", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not delete board column", drogon::k500InternalServerError));
    }
}

}  // namespace scrumban
