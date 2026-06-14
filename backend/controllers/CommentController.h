#pragma once

#include <drogon/HttpController.h>

#include <functional>
#include <string>

namespace scrumban {

class CommentController : public drogon::HttpController<CommentController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(CommentController::listComments,
                  "/api/projects/{projectId}/tasks/{taskId}/comments",
                  drogon::Get);
    ADD_METHOD_TO(CommentController::createComment,
                  "/api/projects/{projectId}/tasks/{taskId}/comments",
                  drogon::Post);
    ADD_METHOD_TO(CommentController::updateComment,
                  "/api/projects/{projectId}/tasks/{taskId}/comments/{commentId}",
                  drogon::Put);
    ADD_METHOD_TO(CommentController::deleteComment,
                  "/api/projects/{projectId}/tasks/{taskId}/comments/{commentId}",
                  drogon::Delete);
    METHOD_LIST_END

    static void listComments(const drogon::HttpRequestPtr& request,
                             std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                             const std::string& projectId,
                             const std::string& taskId);

    static void createComment(const drogon::HttpRequestPtr& request,
                              std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                              const std::string& projectId,
                              const std::string& taskId);

    static void updateComment(const drogon::HttpRequestPtr& request,
                              std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                              const std::string& projectId,
                              const std::string& taskId,
                              const std::string& commentId);

    static void deleteComment(const drogon::HttpRequestPtr& request,
                              std::function<void(const drogon::HttpResponsePtr&)>&& callback,
                              const std::string& projectId,
                              const std::string& taskId,
                              const std::string& commentId);
};

}  // namespace scrumban
