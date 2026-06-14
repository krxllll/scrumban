#include "BoardColumnRepository.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>

namespace scrumban {

std::optional<BoardColumn> BoardColumnRepository::findById(const std::string& id) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, project_id, name, position, wip_limit, created_at, updated_at "
        "FROM board_columns "
        "WHERE id = $1",
        id);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToBoardColumn(result[0]);
}

std::vector<BoardColumn> BoardColumnRepository::findByProjectId(const std::string& projectId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, project_id, name, position, wip_limit, created_at, updated_at "
        "FROM board_columns "
        "WHERE project_id = $1 "
        "ORDER BY position ASC",
        projectId);

    std::vector<BoardColumn> columns;
    columns.reserve(result.size());

    for (const auto& row : result) {
        columns.push_back(mapRowToBoardColumn(row));
    }

    return columns;
}

BoardColumn BoardColumnRepository::create(const std::string& projectId,
                                          const std::string& name,
                                          int position,
                                          const std::optional<int>& wipLimit) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "INSERT INTO board_columns (project_id, name, position, wip_limit) "
        "VALUES ($1, $2, $3, $4) "
        "RETURNING id, project_id, name, position, wip_limit, created_at, updated_at",
        projectId,
        name,
        position,
        wipLimit);

    return mapRowToBoardColumn(result[0]);
}

BoardColumn BoardColumnRepository::update(const std::string& id,
                                          const std::string& name,
                                          int position,
                                          const std::optional<int>& wipLimit) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "UPDATE board_columns "
        "SET name = $2, position = $3, wip_limit = $4, updated_at = now() "
        "WHERE id = $1 "
        "RETURNING id, project_id, name, position, wip_limit, created_at, updated_at",
        id,
        name,
        position,
        wipLimit);

    return mapRowToBoardColumn(result[0]);
}

void BoardColumnRepository::remove(const std::string& id) {
    drogon::app().getDbClient("default")->execSqlSync(
        "DELETE FROM board_columns "
        "WHERE id = $1",
        id);
}

bool BoardColumnRepository::belongsToProject(const std::string& columnId, const std::string& projectId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM board_columns "
        "WHERE id = $1 AND project_id = $2 "
        "LIMIT 1",
        columnId,
        projectId);

    return !result.empty();
}

BoardColumn BoardColumnRepository::mapRowToBoardColumn(const drogon::orm::Row& row) {
    std::optional<int> wipLimit;
    if (!row["wip_limit"].isNull()) {
        wipLimit = row["wip_limit"].as<int>();
    }

    return BoardColumn{
        row["id"].as<std::string>(),
        row["project_id"].as<std::string>(),
        row["name"].as<std::string>(),
        row["position"].as<int>(),
        wipLimit,
        row["created_at"].as<std::string>(),
        row["updated_at"].as<std::string>(),
    };
}

}  // namespace scrumban
