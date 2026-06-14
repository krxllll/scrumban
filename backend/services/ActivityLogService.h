#pragma once

#include "../activity/ActivityEvent.h"
#include "../models/ActivityLog.h"

#include <string>
#include <vector>

namespace scrumban {

class ActivityLogService {
public:
    [[nodiscard]] static ActivityLog record(const ActivityEvent& event);
    [[nodiscard]] static std::vector<ActivityLog> getLogsForTask(const std::string& taskId);
    [[nodiscard]] static std::vector<ActivityLog> getLogsForTasks(const std::vector<std::string>& taskIds);

private:
    static void validateTaskId(const std::string& taskId);
    static void validateActivityEvent(const ActivityEvent& event);
};

}  // namespace scrumban
