#pragma once

#include "../models/Task.h"

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class TaskService {
public:
    [[nodiscard]] static std::vector<Task> getTasksForProject(const std::string& projectId,
                                                              const std::string& userId);

    [[nodiscard]] static std::optional<Task> getTaskById(const std::string& projectId,
                                                         const std::string& taskId,
                                                         const std::string& userId);

    [[nodiscard]] static Task createTask(const std::string& projectId,
                                         const std::string& userId,
                                         const std::string& columnId,
                                         const std::optional<std::string>& epicId,
                                         const std::optional<std::string>& parentTaskId,
                                         const std::string& title,
                                         const std::optional<std::string>& description,
                                         TaskPriority priority,
                                         const std::optional<std::string>& dueDate,
                                         const std::optional<int>& storyPoints,
                                         const std::optional<std::string>& assigneeId,
                                         int position);

    [[nodiscard]] static Task updateTask(const std::string& projectId,
                                         const std::string& taskId,
                                         const std::string& userId,
                                         const std::optional<std::string>& epicId,
                                         const std::optional<std::string>& parentTaskId,
                                         const std::string& title,
                                         const std::optional<std::string>& description,
                                         TaskPriority priority,
                                         const std::optional<std::string>& dueDate,
                                         const std::optional<int>& storyPoints,
                                         const std::optional<std::string>& assigneeId,
                                         int position);

    [[nodiscard]] static Task moveTask(const std::string& projectId,
                                       const std::string& taskId,
                                       const std::string& userId,
                                       const std::string& columnId,
                                       int position);

    static void deleteTask(const std::string& projectId,
                           const std::string& taskId,
                           const std::string& userId);

private:
    static void validateProjectAndUserIds(const std::string& projectId, const std::string& userId);
    static void validateTaskId(const std::string& taskId);
    static void validateColumnId(const std::string& columnId);
    static void validateTaskInput(const std::string& title,
                                  int position,
                                  const std::optional<int>& storyPoints);
    static void ensureProjectMember(const std::string& projectId, const std::string& userId);
    static void ensureTaskBelongsToProject(const std::string& projectId, const std::string& taskId);
    static void ensureColumnBelongsToProject(const std::string& projectId, const std::string& columnId);
};

}  // namespace scrumban
