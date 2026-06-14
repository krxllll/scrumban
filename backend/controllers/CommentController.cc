#include "CommentController.h"

#include "../models/Comment.h"
#include "../services/CommentService.h"
#include "../utils/JwtUtils.h"

#include <json/json.h>

#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

namespace scrumban {
namespace {

Json::Value commentToJson(const Comment& comment) {
    Json::Value body;
    body["id"] = comment.id();
    body["taskId"] = comment.taskId();
    body["authorId"] = comment.authorId();
    body["content"] = comment.content();
    body["createdAt"] = comment.createdAt();
    body["updatedAt"] = comment.updatedAt();
    return body;
}

Json::Value commentsToJson(const std::vector<Comment>& comments) {
    Json::Value body(Json::arrayValue);
    for (const auto& comment : comments) {
        body.append(commentToJson(comment));
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

std::optional<std::string> requiredStringFromJson(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || !body[field].isString() || body[field].asString().empty()) {
        return std::nullopt;
    }

    return body[field].asString();
}

bool isCommentValidationError(const std::string& message) {
    return message == "Project id is required" || message == "Task id is required" ||
           message == "User id is required" || message == "Comment id is required" ||
           message == "Comment content is required";
}

bool isCommentForbiddenError(const std::string& message) {
    return message == "Project not found" || message == "User is not a member of this project" ||
           message == "Task does not belong to this project" ||
           message == "Comment does not belong to this task" ||
           message == "User is not the author of this comment";
}

}  // namespace

void CommentController::listComments(const drogon::HttpRequestPtr& request,
                                     std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                     const std::string& projectId,
                                     const std::string& taskId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto comments = CommentService::getCommentsForTask(projectId, taskId, *userId);
        callback(makeJsonResponse(commentsToJson(comments), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        if (const std::string message = error.what(); isCommentForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load comments", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load comments", drogon::k500InternalServerError));
    }
}

void CommentController::createComment(const drogon::HttpRequestPtr& request,
                                      std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                      const std::string& projectId,
                                      const std::string& taskId) {
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

        const auto content = requiredStringFromJson(*body, "content");
        if (!content.has_value()) {
            callback(makeErrorResponse("Comment content is required", drogon::k400BadRequest));
            return;
        }

        const auto comment = CommentService::createComment(projectId, taskId, *userId, *content);
        callback(makeJsonResponse(commentToJson(comment), drogon::k201Created));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isCommentValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }
        if (isCommentForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not create comment", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not create comment", drogon::k500InternalServerError));
    }
}

void CommentController::updateComment(const drogon::HttpRequestPtr& request,
                                      std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                      const std::string& projectId,
                                      const std::string& taskId,
                                      const std::string& commentId) {
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

        const auto content = requiredStringFromJson(*body, "content");
        if (!content.has_value()) {
            callback(makeErrorResponse("Comment content is required", drogon::k400BadRequest));
            return;
        }

        const auto comment = CommentService::updateComment(projectId, taskId, commentId, *userId, *content);
        callback(makeJsonResponse(commentToJson(comment), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isCommentValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }
        if (isCommentForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not update comment", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not update comment", drogon::k500InternalServerError));
    }
}

void CommentController::deleteComment(const drogon::HttpRequestPtr& request,
                                      std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                      const std::string& projectId,
                                      const std::string& taskId,
                                      const std::string& commentId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        CommentService::deleteComment(projectId, taskId, commentId, *userId);

        Json::Value body;
        body["deleted"] = true;
        callback(makeJsonResponse(body, drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isCommentForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not delete comment", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not delete comment", drogon::k500InternalServerError));
    }
}

}  // namespace scrumban
