#pragma once

#include <drogon/HttpController.h>

#include <functional>
#include <string>

namespace scrumban {

class ProjectController : public drogon::HttpController<ProjectController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ProjectController::listProjects, "/api/projects", drogon::Get);
    ADD_METHOD_TO(ProjectController::createProject, "/api/projects", drogon::Post);
    ADD_METHOD_TO(ProjectController::getProject, "/api/projects/{projectId}", drogon::Get);
    METHOD_LIST_END

    static void listProjects(const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback);

    static void createProject(const drogon::HttpRequestPtr& request,
                              std::function<void(const drogon::HttpResponsePtr&)>&& callback);

    static void getProject(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                           const std::string& projectId);
};

}  // namespace scrumban
