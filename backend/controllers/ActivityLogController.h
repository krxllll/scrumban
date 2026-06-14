#pragma once

#include <drogon/HttpController.h>

#include <functional>
#include <string>

namespace scrumban {

class ActivityLogController : public drogon::HttpController<ActivityLogController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ActivityLogController::listTaskActivity,
                  "/api/projects/{projectId}/tasks/{taskId}/activity",
                  drogon::Get);
    ADD_METHOD_TO(ActivityLogController::listProjectActivity,
                  "/api/projects/{projectId}/activity",
                  drogon::Get);
    METHOD_LIST_END

    static void listTaskActivity(const drogon::HttpRequestPtr& request,
                                 std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                 const std::string& projectId,
                                 const std::string& taskId);

    static void listProjectActivity(const drogon::HttpRequestPtr& request,
                                    std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                                    const std::string& projectId);
};

}  // namespace scrumban
