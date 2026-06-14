#include "TaskService.h"

#include "ProjectService.h"
#include "../repositories/BoardColumnRepository.h"
#include "../repositories/TaskRepository.h"

#include <stdexcept>

namespace scrumban {

std::vector<Task> TaskService::getTasksForProject(const std::string& projectId,
                                                  const std::string& userId) {
    validateProjectAndUserIds(projectId, userId);
    ensureProjectMember(projectId, userId);

    return TaskRepository::findByProjectId(projectId);
}

std::optional<Task> TaskService::getTaskById(const std::string& projectId,
                                             const std::string& taskId,
                                             const std::string& userId) {
    validateProjectAndUserIds(projectId, userId);
    validateTaskId(taskId);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);

    return TaskRepository::findById(taskId);
}

Task TaskService::createTask(const std::string& projectId,
                             const std::string& userId,
                             const std::string& columnId,
                             const std::optional<std::string>& epicId,
                             const std::optional<std::string>& parentTaskId,
                             const std::string& title,
                             const std::optional<std::string>& description,
                             const TaskPriority priority,
                             const std::optional<std::string>& dueDate,
                             const std::optional<int>& storyPoints,
                             const std::optional<std::string>& assigneeId,
                             const int position) {
    validateProjectAndUserIds(projectId, userId);
    validateColumnId(columnId);
    validateTaskInput(title, position, storyPoints);
    ensureProjectMember(projectId, userId);
    ensureColumnBelongsToProject(projectId, columnId);

    return TaskRepository::create(projectId,
                                  columnId,
                                  epicId,
                                  parentTaskId,
                                  title,
                                  description,
                                  priority,
                                  dueDate,
                                  storyPoints,
                                  assigneeId,
                                  userId,
                                  position);
}

Task TaskService::updateTask(const std::string& projectId,
                             const std::string& taskId,
                             const std::string& userId,
                             const std::optional<std::string>& epicId,
                             const std::optional<std::string>& parentTaskId,
                             const std::string& title,
                             const std::optional<std::string>& description,
                             const TaskPriority priority,
                             const std::optional<std::string>& dueDate,
                             const std::optional<int>& storyPoints,
                             const std::optional<std::string>& assigneeId,
                             const int position) {
    validateProjectAndUserIds(projectId, userId);
    validateTaskId(taskId);
    validateTaskInput(title, position, storyPoints);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);

    return TaskRepository::update(taskId,
                                  epicId,
                                  parentTaskId,
                                  title,
                                  description,
                                  priority,
                                  dueDate,
                                  storyPoints,
                                  assigneeId,
                                  position);
}

Task TaskService::moveTask(const std::string& projectId,
                           const std::string& taskId,
                           const std::string& userId,
                           const std::string& columnId,
                           const int position) {
    validateProjectAndUserIds(projectId, userId);
    validateTaskId(taskId);
    validateColumnId(columnId);
    if (position < 0) {
        throw std::runtime_error("Task position must be greater than or equal to 0");
    }

    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);
    ensureColumnBelongsToProject(projectId, columnId);

    return TaskRepository::moveToColumn(taskId, columnId, position);
}

void TaskService::deleteTask(const std::string& projectId,
                             const std::string& taskId,
                             const std::string& userId) {
    validateProjectAndUserIds(projectId, userId);
    validateTaskId(taskId);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);

    TaskRepository::remove(taskId);
}

void TaskService::validateProjectAndUserIds(const std::string& projectId, const std::string& userId) {
    if (projectId.empty()) {
        throw std::runtime_error("Project id is required");
    }

    if (userId.empty()) {
        throw std::runtime_error("User id is required");
    }
}

void TaskService::validateTaskId(const std::string& taskId) {
    if (taskId.empty()) {
        throw std::runtime_error("Task id is required");
    }
}

void TaskService::validateColumnId(const std::string& columnId) {
    if (columnId.empty()) {
        throw std::runtime_error("Board column id is required");
    }
}

void TaskService::validateTaskInput(const std::string& title,
                                    const int position,
                                    const std::optional<int>& storyPoints) {
    if (title.empty()) {
        throw std::runtime_error("Task title is required");
    }

    if (position < 0) {
        throw std::runtime_error("Task position must be greater than or equal to 0");
    }

    if (storyPoints.has_value() && *storyPoints < 0) {
        throw std::runtime_error("Task story points must be greater than or equal to 0");
    }
}

void TaskService::ensureProjectMember(const std::string& projectId, const std::string& userId) {
    if (const auto project = ProjectService::getProjectById(projectId, userId); !project.has_value()) {
        throw std::runtime_error("Project not found");
    }
}

void TaskService::ensureTaskBelongsToProject(const std::string& projectId, const std::string& taskId) {
    if (!TaskRepository::belongsToProject(taskId, projectId)) {
        throw std::runtime_error("Task does not belong to this project");
    }
}

void TaskService::ensureColumnBelongsToProject(const std::string& projectId, const std::string& columnId) {
    if (!BoardColumnRepository::belongsToProject(columnId, projectId)) {
        throw std::runtime_error("Board column does not belong to this project");
    }
}

}  // namespace scrumban
