#pragma once

#include <drogon/HttpController.h>

#include <functional>
#include <string>

namespace scrumban {

class TaskController : public drogon::HttpController<TaskController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(TaskController::listTasks, "/api/projects/{projectId}/tasks", drogon::Get);
    ADD_METHOD_TO(TaskController::createTask, "/api/projects/{projectId}/tasks", drogon::Post);
    ADD_METHOD_TO(TaskController::getTask, "/api/projects/{projectId}/tasks/{taskId}", drogon::Get);
    ADD_METHOD_TO(TaskController::updateTask, "/api/projects/{projectId}/tasks/{taskId}", drogon::Put);
    ADD_METHOD_TO(TaskController::moveTask, "/api/projects/{projectId}/tasks/{taskId}/move", drogon::Patch);
    ADD_METHOD_TO(TaskController::deleteTask, "/api/projects/{projectId}/tasks/{taskId}", drogon::Delete);
    METHOD_LIST_END

    static void listTasks(const drogon::HttpRequestPtr& request,
                          std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                          const std::string& projectId);

    static void createTask(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                           const std::string& projectId);

    static void getTask(const drogon::HttpRequestPtr& request,
                        std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                        const std::string& projectId,
                        const std::string& taskId);

    static void updateTask(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                           const std::string& projectId,
                           const std::string& taskId);

    static void moveTask(const drogon::HttpRequestPtr& request,
                         std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                         const std::string& projectId,
                         const std::string& taskId);

    static void deleteTask(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                           const std::string& projectId,
                           const std::string& taskId);
};

}  // namespace scrumban
