#pragma once

#include "../models/Task.h"

#include <drogon/orm/Result.h>

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class TaskRepository {
public:
    [[nodiscard]] static std::optional<Task> findById(const std::string& id);
    [[nodiscard]] static std::vector<Task> findByProjectId(const std::string& projectId);
    [[nodiscard]] static std::vector<Task> findByColumnId(const std::string& columnId);

    [[nodiscard]] static Task create(const std::string& projectId,
                                     const std::string& columnId,
                                     const std::optional<std::string>& epicId,
                                     const std::optional<std::string>& parentTaskId,
                                     const std::string& title,
                                     const std::optional<std::string>& description,
                                     TaskPriority priority,
                                     const std::optional<std::string>& dueDate,
                                     const std::optional<int>& storyPoints,
                                     const std::optional<std::string>& assigneeId,
                                     const std::string& reporterId,
                                     int position);

    [[nodiscard]] static Task update(const std::string& id,
                                     const std::optional<std::string>& epicId,
                                     const std::optional<std::string>& parentTaskId,
                                     const std::string& title,
                                     const std::optional<std::string>& description,
                                     TaskPriority priority,
                                     const std::optional<std::string>& dueDate,
                                     const std::optional<int>& storyPoints,
                                     const std::optional<std::string>& assigneeId,
                                     int position);

    [[nodiscard]] static Task moveToColumn(const std::string& id,
                                           const std::string& columnId,
                                           int position);

    static void remove(const std::string& id);

    [[nodiscard]] static bool belongsToProject(const std::string& taskId,
                                               const std::string& projectId);

private:
    static Task mapRowToTask(const drogon::orm::Row& row);
    static std::vector<Task> mapRowsToTasks(const drogon::orm::Result& result);
};

}  // namespace scrumban
