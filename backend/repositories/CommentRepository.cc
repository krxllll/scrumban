#include "CommentRepository.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>

namespace scrumban {

std::optional<Comment> CommentRepository::findById(const std::string& id) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, task_id, author_id, content, created_at, updated_at "
        "FROM comments "
        "WHERE id = $1",
        id);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToComment(result[0]);
}

std::vector<Comment> CommentRepository::findByTaskId(const std::string& taskId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, task_id, author_id, content, created_at, updated_at "
        "FROM comments "
        "WHERE task_id = $1 "
        "ORDER BY created_at ASC",
        taskId);

    std::vector<Comment> comments;
    comments.reserve(result.size());

    for (const auto& row : result) {
        comments.push_back(mapRowToComment(row));
    }

    return comments;
}

Comment CommentRepository::create(const std::string& taskId,
                                  const std::string& authorId,
                                  const std::string& content) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "INSERT INTO comments (task_id, author_id, content) "
        "VALUES ($1, $2, $3) "
        "RETURNING id, task_id, author_id, content, created_at, updated_at",
        taskId,
        authorId,
        content);

    return mapRowToComment(result[0]);
}

Comment CommentRepository::update(const std::string& id,
                                  const std::string& content) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "UPDATE comments "
        "SET content = $2, updated_at = now() "
        "WHERE id = $1 "
        "RETURNING id, task_id, author_id, content, created_at, updated_at",
        id,
        content);

    return mapRowToComment(result[0]);
}

void CommentRepository::remove(const std::string& id) {
    drogon::app().getDbClient("default")->execSqlSync(
        "DELETE FROM comments "
        "WHERE id = $1",
        id);
}

bool CommentRepository::belongsToTask(const std::string& commentId,
                                      const std::string& taskId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM comments "
        "WHERE id = $1 AND task_id = $2 "
        "LIMIT 1",
        commentId,
        taskId);

    return !result.empty();
}

bool CommentRepository::isAuthor(const std::string& commentId,
                                 const std::string& userId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM comments "
        "WHERE id = $1 AND author_id = $2 "
        "LIMIT 1",
        commentId,
        userId);

    return !result.empty();
}

Comment CommentRepository::mapRowToComment(const drogon::orm::Row& row) {
    return Comment{
        row["id"].as<std::string>(),
        row["task_id"].as<std::string>(),
        row["author_id"].as<std::string>(),
        row["content"].as<std::string>(),
        row["created_at"].as<std::string>(),
        row["updated_at"].as<std::string>(),
    };
}

}  // namespace scrumban
