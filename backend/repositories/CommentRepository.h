#pragma once

#include "../models/Comment.h"

#include <drogon/orm/Row.h>

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class CommentRepository {
public:
    [[nodiscard]] static std::optional<Comment> findById(const std::string& id);
    [[nodiscard]] static std::vector<Comment> findByTaskId(const std::string& taskId);

    [[nodiscard]] static Comment create(const std::string& taskId,
                                        const std::string& authorId,
                                        const std::string& content);

    [[nodiscard]] static Comment update(const std::string& id,
                                        const std::string& content);

    static void remove(const std::string& id);

    [[nodiscard]] static bool belongsToTask(const std::string& commentId,
                                            const std::string& taskId);

    [[nodiscard]] static bool isAuthor(const std::string& commentId,
                                       const std::string& userId);

private:
    static Comment mapRowToComment(const drogon::orm::Row& row);
};

}  // namespace scrumban
