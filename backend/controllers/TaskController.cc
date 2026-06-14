#include "TaskController.h"

#include "../models/Task.h"
#include "../repositories/TaskRepository.h"
#include "../services/TaskService.h"
#include "../utils/JwtUtils.h"

#include <json/json.h>

#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

namespace scrumban {
namespace {

Json::Value taskToJson(const Task& task) {
    Json::Value body;
    body["id"] = task.id();
    body["projectId"] = task.projectId();
    body["columnId"] = task.columnId();
    body["title"] = task.title();
    body["priority"] = taskPriorityToString(task.priority());
    body["reporterId"] = task.reporterId();
    body["position"] = task.position();
    body["createdAt"] = task.createdAt();
    body["updatedAt"] = task.updatedAt();

    body["epicId"] = task.epicId().has_value() ? Json::Value(*task.epicId()) : Json::Value(Json::nullValue);
    body["parentTaskId"] =
        task.parentTaskId().has_value() ? Json::Value(*task.parentTaskId()) : Json::Value(Json::nullValue);
    body["description"] =
        task.description().has_value() ? Json::Value(*task.description()) : Json::Value(Json::nullValue);
    body["dueDate"] = task.dueDate().has_value() ? Json::Value(*task.dueDate()) : Json::Value(Json::nullValue);
    body["storyPoints"] =
        task.storyPoints().has_value() ? Json::Value(*task.storyPoints()) : Json::Value(Json::nullValue);
    body["assigneeId"] =
        task.assigneeId().has_value() ? Json::Value(*task.assigneeId()) : Json::Value(Json::nullValue);

    return body;
}

Json::Value tasksToJson(const std::vector<Task>& tasks) {
    Json::Value body(Json::arrayValue);
    for (const auto& task : tasks) {
        body.append(taskToJson(task));
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

std::optional<std::optional<std::string>> optionalStringFromJson(const Json::Value& body,
                                                                 const std::string& field) {
    if (!body.isMember(field) || body[field].isNull()) {
        return std::optional<std::string>{std::nullopt};
    }

    if (!body[field].isString()) {
        return std::nullopt;
    }

    return std::optional{body[field].asString()};
}

std::optional<std::optional<int>> optionalIntFromJson(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || body[field].isNull()) {
        return std::optional<int>{std::nullopt};
    }

    if (!body[field].isInt()) {
        return std::nullopt;
    }

    return std::optional{body[field].asInt()};
}

std::optional<int> intFromJsonOrDefault(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || body[field].isNull()) {
        return 0;
    }

    if (!body[field].isInt()) {
        return std::nullopt;
    }

    return body[field].asInt();
}

std::optional<TaskPriority> taskPriorityFromJsonOrDefault(const Json::Value& body,
                                                          const std::string& field) {
    if (!body.isMember(field) || body[field].isNull()) {
        return TaskPriority::MEDIUM;
    }

    if (!body[field].isString()) {
        return std::nullopt;
    }

    try {
        return taskPriorityFromString(body[field].asString());
    } catch (const std::invalid_argument&) {
        return std::nullopt;
    }
}

bool isTaskValidationError(const std::string& message) {
    return message == "Project id is required" || message == "User id is required" ||
           message == "Task id is required" || message == "Board column id is required" ||
           message == "Task title is required" ||
           message == "Task position must be greater than or equal to 0" ||
           message == "Task story points must be greater than or equal to 0";
}

bool isTaskForbiddenError(const std::string& message) {
    return message == "Project not found" || message == "User is not a member of this project" ||
           message == "Task does not belong to this project" ||
           message == "Board column does not belong to this project";
}

}  // namespace

void TaskController::listTasks(const drogon::HttpRequestPtr& request,
                               std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                               const std::string& projectId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto tasks = TaskService::getTasksForProject(projectId, *userId);
        callback(makeJsonResponse(tasksToJson(tasks), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        if (const std::string message = error.what(); isTaskForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load tasks", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load tasks", drogon::k500InternalServerError));
    }
}

void TaskController::createTask(const drogon::HttpRequestPtr& request,
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

        const auto columnId = requiredStringFromJson(*body, "columnId");
        const auto title = requiredStringFromJson(*body, "title");
        const auto epicId = optionalStringFromJson(*body, "epicId");
        const auto parentTaskId = optionalStringFromJson(*body, "parentTaskId");
        const auto description = optionalStringFromJson(*body, "description");
        const auto priority = taskPriorityFromJsonOrDefault(*body, "priority");
        const auto dueDate = optionalStringFromJson(*body, "dueDate");
        const auto storyPoints = optionalIntFromJson(*body, "storyPoints");
        const auto assigneeId = optionalStringFromJson(*body, "assigneeId");
        const auto position = intFromJsonOrDefault(*body, "position");

        if (!columnId.has_value()) {
            callback(makeErrorResponse("Task columnId is required", drogon::k400BadRequest));
            return;
        }
        if (!title.has_value()) {
            callback(makeErrorResponse("Task title is required", drogon::k400BadRequest));
            return;
        }
        if (!epicId.has_value() || !parentTaskId.has_value() || !description.has_value() || !dueDate.has_value() ||
            !assigneeId.has_value()) {
            callback(makeErrorResponse("Nullable task fields must be strings or null", drogon::k400BadRequest));
            return;
        }
        if (!priority.has_value()) {
            callback(makeErrorResponse("Task priority must be LOW, MEDIUM, HIGH, or URGENT", drogon::k400BadRequest));
            return;
        }
        if (!storyPoints.has_value()) {
            callback(makeErrorResponse("Task storyPoints must be an integer or null", drogon::k400BadRequest));
            return;
        }
        if (!position.has_value()) {
            callback(makeErrorResponse("Task position must be an integer", drogon::k400BadRequest));
            return;
        }

        const Task task = TaskService::createTask(projectId,
                                                  *userId,
                                                  *columnId,
                                                  *epicId,
                                                  *parentTaskId,
                                                  *title,
                                                  *description,
                                                  *priority,
                                                  *dueDate,
                                                  *storyPoints,
                                                  *assigneeId,
                                                  *position);
        callback(makeJsonResponse(taskToJson(task), drogon::k201Created));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isTaskValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }
        if (isTaskForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not create task", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not create task", drogon::k500InternalServerError));
    }
}

void TaskController::getTask(const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                             const std::string& projectId,
                             const std::string& taskId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto task = TaskService::getTaskById(projectId, taskId, *userId);
        if (!task.has_value()) {
            callback(makeErrorResponse("Task not found", drogon::k404NotFound));
            return;
        }

        callback(makeJsonResponse(taskToJson(*task), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (message == "Task does not belong to this project" && !TaskRepository::findById(taskId).has_value()) {
            callback(makeErrorResponse("Task not found", drogon::k404NotFound));
            return;
        }

        if (isTaskForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not load task", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load task", drogon::k500InternalServerError));
    }
}

void TaskController::updateTask(const drogon::HttpRequestPtr& request,
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

        const auto title = requiredStringFromJson(*body, "title");
        const auto epicId = optionalStringFromJson(*body, "epicId");
        const auto parentTaskId = optionalStringFromJson(*body, "parentTaskId");
        const auto description = optionalStringFromJson(*body, "description");
        const auto priority = taskPriorityFromJsonOrDefault(*body, "priority");
        const auto dueDate = optionalStringFromJson(*body, "dueDate");
        const auto storyPoints = optionalIntFromJson(*body, "storyPoints");
        const auto assigneeId = optionalStringFromJson(*body, "assigneeId");
        const auto position = intFromJsonOrDefault(*body, "position");

        if (!title.has_value()) {
            callback(makeErrorResponse("Task title is required", drogon::k400BadRequest));
            return;
        }
        if (!epicId.has_value() || !parentTaskId.has_value() || !description.has_value() || !dueDate.has_value() ||
            !assigneeId.has_value()) {
            callback(makeErrorResponse("Nullable task fields must be strings or null", drogon::k400BadRequest));
            return;
        }
        if (!priority.has_value()) {
            callback(makeErrorResponse("Task priority must be LOW, MEDIUM, HIGH, or URGENT", drogon::k400BadRequest));
            return;
        }
        if (!storyPoints.has_value()) {
            callback(makeErrorResponse("Task storyPoints must be an integer or null", drogon::k400BadRequest));
            return;
        }
        if (!position.has_value()) {
            callback(makeErrorResponse("Task position must be an integer", drogon::k400BadRequest));
            return;
        }

        const Task task = TaskService::updateTask(projectId,
                                                  taskId,
                                                  *userId,
                                                  *epicId,
                                                  *parentTaskId,
                                                  *title,
                                                  *description,
                                                  *priority,
                                                  *dueDate,
                                                  *storyPoints,
                                                  *assigneeId,
                                                  *position);
        callback(makeJsonResponse(taskToJson(task), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isTaskValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }
        if (isTaskForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not update task", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not update task", drogon::k500InternalServerError));
    }
}

void TaskController::moveTask(const drogon::HttpRequestPtr& request,
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

        const auto columnId = requiredStringFromJson(*body, "columnId");
        const auto position = intFromJsonOrDefault(*body, "position");
        if (!columnId.has_value()) {
            callback(makeErrorResponse("Task columnId is required", drogon::k400BadRequest));
            return;
        }
        if (!position.has_value()) {
            callback(makeErrorResponse("Task position must be an integer", drogon::k400BadRequest));
            return;
        }

        const Task task = TaskService::moveTask(projectId, taskId, *userId, *columnId, *position);
        callback(makeJsonResponse(taskToJson(task), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isTaskValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }
        if (isTaskForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not move task", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not move task", drogon::k500InternalServerError));
    }
}

void TaskController::deleteTask(const drogon::HttpRequestPtr& request,
                                std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                const std::string& projectId,
                                const std::string& taskId) {
    try {
        const auto userId = extractAuthenticatedUserId(request);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        TaskService::deleteTask(projectId, taskId, *userId);

        Json::Value body;
        body["deleted"] = true;
        callback(makeJsonResponse(body, drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (isTaskValidationError(message)) {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }
        if (isTaskForbiddenError(message)) {
            callback(makeErrorResponse(message, drogon::k403Forbidden));
            return;
        }

        callback(makeErrorResponse("Could not delete task", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not delete task", drogon::k500InternalServerError));
    }
}

}  // namespace scrumban
