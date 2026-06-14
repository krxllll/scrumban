#pragma once

#include "../models/Comment.h"

#include <string>
#include <vector>

namespace scrumban {

class CommentService {
public:
    [[nodiscard]] static std::vector<Comment> getCommentsForTask(const std::string& projectId,
                                                                 const std::string& taskId,
                                                                 const std::string& userId);

    [[nodiscard]] static Comment createComment(const std::string& projectId,
                                               const std::string& taskId,
                                               const std::string& userId,
                                               const std::string& content);

    [[nodiscard]] static Comment updateComment(const std::string& projectId,
                                               const std::string& taskId,
                                               const std::string& commentId,
                                               const std::string& userId,
                                               const std::string& content);

    static void deleteComment(const std::string& projectId,
                              const std::string& taskId,
                              const std::string& commentId,
                              const std::string& userId);

private:
    static void validateProjectTaskAndUserIds(const std::string& projectId,
                                              const std::string& taskId,
                                              const std::string& userId);
    static void validateCommentId(const std::string& commentId);
    static void validateContent(const std::string& content);
    static void ensureProjectMember(const std::string& projectId, const std::string& userId);
    static void ensureTaskBelongsToProject(const std::string& projectId, const std::string& taskId);
    static void ensureCommentBelongsToTask(const std::string& commentId, const std::string& taskId);
    static void ensureCommentAuthor(const std::string& commentId, const std::string& userId);
};

}  // namespace scrumban
