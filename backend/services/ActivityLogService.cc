#include "ActivityLogService.h"

#include "../repositories/ActivityLogRepository.h"

#include <stdexcept>

namespace scrumban {

ActivityLog ActivityLogService::record(const ActivityEvent& event) {
    validateActivityEvent(event);

    return ActivityLogRepository::create(
        event.taskId(),
        event.userId(),
        event.action(),
        event.oldValue(),
        event.newValue());
}

std::vector<ActivityLog> ActivityLogService::getLogsForTask(const std::string& taskId) {
    validateTaskId(taskId);

    return ActivityLogRepository::findByTaskId(taskId);
}

std::vector<ActivityLog> ActivityLogService::getLogsForTasks(const std::vector<std::string>& taskIds) {
    if (taskIds.empty()) {
        return {};
    }

    for (const auto& taskId : taskIds) {
        validateTaskId(taskId);
    }

    return ActivityLogRepository::findByTaskIds(taskIds);
}

void ActivityLogService::validateTaskId(const std::string& taskId) {
    if (taskId.empty()) {
        throw std::runtime_error("Task id is required");
    }
}

void ActivityLogService::validateActivityEvent(const ActivityEvent& event) {
    validateTaskId(event.taskId());

    if (event.action().empty()) {
        throw std::runtime_error("Activity action is required");
    }
}

}  // namespace scrumban
