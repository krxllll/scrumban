#include "ActivityLogRepository.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>
#include <drogon/orm/SqlBinder.h>

#include <sstream>

namespace scrumban {

namespace {

constexpr const char* kActivityLogColumns =
    "id, task_id, user_id, action, old_value, new_value, created_at";

}  // namespace

ActivityLog ActivityLogRepository::create(const std::string& taskId,
                                          const std::optional<std::string>& userId,
                                          const std::string& action,
                                          const std::optional<std::string>& oldValue,
                                          const std::optional<std::string>& newValue) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "INSERT INTO activity_logs (task_id, user_id, action, old_value, new_value) "
        "VALUES ($1, $2, $3, $4, $5) "
        "RETURNING id, task_id, user_id, action, old_value, new_value, created_at",
        taskId,
        userId,
        action,
        oldValue,
        newValue);

    return mapRowToActivityLog(result[0]);
}

std::vector<ActivityLog> ActivityLogRepository::findByTaskId(const std::string& taskId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, task_id, user_id, action, old_value, new_value, created_at "
        "FROM activity_logs "
        "WHERE task_id = $1 "
        "ORDER BY created_at ASC",
        taskId);

    std::vector<ActivityLog> logs;
    logs.reserve(result.size());

    for (const auto& row : result) {
        logs.push_back(mapRowToActivityLog(row));
    }

    return logs;
}

std::vector<ActivityLog> ActivityLogRepository::findByTaskIds(const std::vector<std::string>& taskIds) {
    if (taskIds.empty()) {
        return {};
    }

    std::ostringstream sql;
    sql << "SELECT " << kActivityLogColumns << ' '
        << "FROM activity_logs "
        << "WHERE task_id IN (";

    for (std::size_t i = 0; i < taskIds.size(); ++i) {
        if (i > 0) {
            sql << ", ";
        }
        sql << '$' << (i + 1);
    }

    sql << ") "
        << "ORDER BY created_at ASC";

    auto client = drogon::app().getDbClient("default");
    auto binder = *client << sql.str();

    for (const auto& taskId : taskIds) {
        binder << taskId;
    }

    drogon::orm::Result result(nullptr);
    binder << drogon::orm::Mode::Blocking;
    binder >> [&result](const drogon::orm::Result& queryResult) {
        result = queryResult;
    };
    binder.exec();

    std::vector<ActivityLog> logs;
    logs.reserve(result.size());

    for (const auto& row : result) {
        logs.push_back(mapRowToActivityLog(row));
    }

    return logs;
}

std::optional<ActivityLog> ActivityLogRepository::findById(const std::string& id) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, task_id, user_id, action, old_value, new_value, created_at "
        "FROM activity_logs "
        "WHERE id = $1",
        id);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToActivityLog(result[0]);
}

ActivityLog ActivityLogRepository::mapRowToActivityLog(const drogon::orm::Row& row) {
    std::optional<std::string> userId;
    if (!row["user_id"].isNull()) {
        userId = row["user_id"].as<std::string>();
    }

    std::optional<std::string> oldValue;
    if (!row["old_value"].isNull()) {
        oldValue = row["old_value"].as<std::string>();
    }

    std::optional<std::string> newValue;
    if (!row["new_value"].isNull()) {
        newValue = row["new_value"].as<std::string>();
    }

    return ActivityLog{
        row["id"].as<std::string>(),
        row["task_id"].as<std::string>(),
        userId,
        row["action"].as<std::string>(),
        oldValue,
        newValue,
        row["created_at"].as<std::string>(),
    };
}

}  // namespace scrumban
