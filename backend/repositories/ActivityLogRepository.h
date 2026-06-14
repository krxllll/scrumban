#pragma once

#include "../models/ActivityLog.h"

#include <drogon/orm/Row.h>

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class ActivityLogRepository {
public:
    [[nodiscard]] static ActivityLog create(const std::string& taskId,
                                            const std::optional<std::string>& userId,
                                            const std::string& action,
                                            const std::optional<std::string>& oldValue,
                                            const std::optional<std::string>& newValue);

    [[nodiscard]] static std::vector<ActivityLog> findByTaskId(const std::string& taskId);
    [[nodiscard]] static std::vector<ActivityLog> findByTaskIds(const std::vector<std::string>& taskIds);
    [[nodiscard]] static std::vector<ActivityLog> findRecentByProjectId(const std::string& projectId, int limit);
    [[nodiscard]] static std::optional<ActivityLog> findById(const std::string& id);

private:
    static ActivityLog mapRowToActivityLog(const drogon::orm::Row& row);
};

}  // namespace scrumban
