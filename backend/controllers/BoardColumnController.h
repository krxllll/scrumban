#pragma once

#include <drogon/HttpController.h>

#include <functional>
#include <string>

namespace scrumban {

class BoardColumnController : public drogon::HttpController<BoardColumnController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(BoardColumnController::listColumns, "/api/projects/{projectId}/columns", drogon::Get);
    ADD_METHOD_TO(BoardColumnController::createColumn, "/api/projects/{projectId}/columns", drogon::Post);
    ADD_METHOD_TO(BoardColumnController::updateColumn, "/api/projects/{projectId}/columns/{columnId}", drogon::Put);
    ADD_METHOD_TO(BoardColumnController::deleteColumn, "/api/projects/{projectId}/columns/{columnId}", drogon::Delete);
    METHOD_LIST_END

    static void listColumns(const drogon::HttpRequestPtr& request,
                            std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                            const std::string& projectId);

    static void createColumn(const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                             const std::string& projectId);

    static void updateColumn(const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                             const std::string& projectId,
                             const std::string& columnId);

    static void deleteColumn(const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                             const std::string& projectId,
                             const std::string& columnId);
};

}  // namespace scrumban
