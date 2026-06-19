#include "TaskRepository.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>

#include <algorithm>
#include <vector>

namespace scrumban {

namespace {

struct TaskPositionUpdate {
    std::string id;
};

void moveTaskToRequestedPosition(std::vector<Task>& tasks,
                                 const Task& task,
                                 const int requestedPosition) {
    tasks.erase(std::remove_if(tasks.begin(),
                               tasks.end(),
                               [&task](const Task& currentTask) {
                                   return currentTask.id() == task.id();
                               }),
                tasks.end());

    const auto clampedPosition = std::clamp(requestedPosition,
                                           0,
                                           static_cast<int>(tasks.size()));

    tasks.insert(tasks.begin() + clampedPosition, task);
}

}  // namespace

std::optional<Task> TaskRepository::findById(const std::string& id) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
        "priority, due_date, story_points, assignee_id, reporter_id, position, "
        "created_at, updated_at "
        "FROM tasks "
        "WHERE id = $1",
        id);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToTask(result[0]);
}

std::vector<Task> TaskRepository::findByProjectId(const std::string& projectId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
        "priority, due_date, story_points, assignee_id, reporter_id, position, "
        "created_at, updated_at "
        "FROM tasks "
        "WHERE project_id = $1 "
        "ORDER BY position ASC, created_at ASC",
        projectId);

    std::vector<Task> tasks;
    tasks.reserve(result.size());

    for (const auto& row : result) {
        tasks.push_back(mapRowToTask(row));
    }

    return tasks;
}

std::vector<Task> TaskRepository::findByColumnId(const std::string& columnId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
        "priority, due_date, story_points, assignee_id, reporter_id, position, "
        "created_at, updated_at "
        "FROM tasks "
        "WHERE column_id = $1 "
        "ORDER BY position ASC, created_at ASC",
        columnId);

    std::vector<Task> tasks;
    tasks.reserve(result.size());

    for (const auto& row : result) {
        tasks.push_back(mapRowToTask(row));
    }

    return tasks;
}

Task TaskRepository::create(const std::string& projectId,
                            const std::string& columnId,
                            const std::optional<std::string>& epicId,
                            const std::optional<std::string>& parentTaskId,
                            const std::string& title,
                            const std::optional<std::string>& description,
                            const TaskPriority priority,
                            const std::optional<std::string>& dueDate,
                            const std::optional<int>& storyPoints,
                            const std::optional<std::string>& assigneeId,
                            const std::string& reporterId,
                            int position) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "INSERT INTO tasks ("
        "project_id, column_id, epic_id, parent_task_id, title, description, "
        "priority, due_date, story_points, assignee_id, reporter_id, position"
        ") "
        "VALUES ($1, $2, $3, $4, $5, $6, $7::task_priority, $8::date, $9, $10, $11, $12) "
        "RETURNING id, project_id, column_id, epic_id, parent_task_id, title, description, "
        "priority, due_date, story_points, assignee_id, reporter_id, position, "
        "created_at, updated_at",
        projectId,
        columnId,
        epicId,
        parentTaskId,
        title,
        description,
        taskPriorityToString(priority),
        dueDate,
        storyPoints,
        assigneeId,
        reporterId,
        position);

    return mapRowToTask(result[0]);
}

Task TaskRepository::update(const std::string& id,
                            const std::optional<std::string>& epicId,
                            const std::optional<std::string>& parentTaskId,
                            const std::string& title,
                            const std::optional<std::string>& description,
                            const TaskPriority priority,
                            const std::optional<std::string>& dueDate,
                            const std::optional<int>& storyPoints,
                            const std::optional<std::string>& assigneeId,
                            int position) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "UPDATE tasks "
        "SET epic_id = $2, parent_task_id = $3, title = $4, description = $5, "
        "priority = $6::task_priority, due_date = $7::date, story_points = $8, "
        "assignee_id = $9, position = $10, updated_at = now() "
        "WHERE id = $1 "
        "RETURNING id, project_id, column_id, epic_id, parent_task_id, title, description, "
        "priority, due_date, story_points, assignee_id, reporter_id, position, "
        "created_at, updated_at",
        id,
        epicId,
        parentTaskId,
        title,
        description,
        taskPriorityToString(priority),
        dueDate,
        storyPoints,
        assigneeId,
        position);

    return mapRowToTask(result[0]);
}

Task TaskRepository::moveToColumn(const std::string& id,
                                  const std::string& columnId,
                                  int position) {
    const auto transaction = drogon::app().getDbClient("default")->newTransaction();

    try {
        const auto taskResult = transaction->execSqlSync(
            "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
            "priority, due_date, story_points, assignee_id, reporter_id, position, "
            "created_at, updated_at "
            "FROM tasks "
            "WHERE id = $1 "
            "FOR UPDATE",
            id);

        if (taskResult.empty()) {
            throw std::runtime_error("Task not found");
        }

        const auto movingTask = mapRowToTask(taskResult[0]);
        const auto& sourceColumnId = movingTask.columnId();

        const auto sourceResult = transaction->execSqlSync(
            "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
            "priority, due_date, story_points, assignee_id, reporter_id, position, "
            "created_at, updated_at "
            "FROM tasks "
            "WHERE column_id = $1 "
            "ORDER BY position ASC, created_at ASC "
            "FOR UPDATE",
            sourceColumnId);
        auto sourceTasks = mapRowsToTasks(sourceResult);

        std::vector<Task> targetTasks;
        if (sourceColumnId == columnId) {
            moveTaskToRequestedPosition(sourceTasks, movingTask, position);
        } else {
            sourceTasks.erase(std::remove_if(sourceTasks.begin(),
                                            sourceTasks.end(),
                                            [&movingTask](const Task& currentTask) {
                                                return currentTask.id() == movingTask.id();
                                            }),
                              sourceTasks.end());

            const auto targetResult = transaction->execSqlSync(
                "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
                "priority, due_date, story_points, assignee_id, reporter_id, position, "
                "created_at, updated_at "
                "FROM tasks "
                "WHERE column_id = $1 "
                "ORDER BY position ASC, created_at ASC "
                "FOR UPDATE",
                columnId);
            targetTasks = mapRowsToTasks(targetResult);
            moveTaskToRequestedPosition(targetTasks, movingTask, position);
        }

        std::vector<TaskPositionUpdate> temporaryUpdates;
        temporaryUpdates.reserve(sourceTasks.size() + targetTasks.size() + 1);

        for (const auto& task : sourceTasks) {
            temporaryUpdates.push_back({task.id()});
        }
        for (const auto& task : targetTasks) {
            temporaryUpdates.push_back({task.id()});
        }
        if (std::none_of(temporaryUpdates.begin(),
                         temporaryUpdates.end(),
                         [&movingTask](const TaskPositionUpdate& update) {
                             return update.id == movingTask.id();
                         })) {
            temporaryUpdates.push_back({movingTask.id()});
        }

        for (std::size_t index = 0; index < temporaryUpdates.size(); ++index) {
            constexpr int temporaryPositionOffset = 1000000;
            transaction->execSqlSync(
                "UPDATE tasks "
                "SET position = $2, updated_at = now() "
                "WHERE id = $1",
                temporaryUpdates[index].id,
                temporaryPositionOffset + static_cast<int>(index));
        }

        for (std::size_t index = 0; index < sourceTasks.size(); ++index) {
            transaction->execSqlSync(
                "UPDATE tasks "
                "SET column_id = $2, position = $3, updated_at = now() "
                "WHERE id = $1",
                sourceTasks[index].id(),
                sourceColumnId,
                static_cast<int>(index));
        }

        for (std::size_t index = 0; index < targetTasks.size(); ++index) {
            transaction->execSqlSync(
                "UPDATE tasks "
                "SET column_id = $2, position = $3, updated_at = now() "
                "WHERE id = $1",
                targetTasks[index].id(),
                columnId,
                static_cast<int>(index));
        }

        const auto result = transaction->execSqlSync(
            "SELECT id, project_id, column_id, epic_id, parent_task_id, title, description, "
            "priority, due_date, story_points, assignee_id, reporter_id, position, "
            "created_at, updated_at "
            "FROM tasks "
            "WHERE id = $1",
            id);

        return mapRowToTask(result[0]);
    } catch (...) {
        transaction->rollback();
        throw;
    }
}

void TaskRepository::remove(const std::string& id) {
    drogon::app().getDbClient("default")->execSqlSync(
        "DELETE FROM tasks "
        "WHERE id = $1",
        id);
}

bool TaskRepository::belongsToProject(const std::string& taskId,
                                      const std::string& projectId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM tasks "
        "WHERE id = $1 AND project_id = $2 "
        "LIMIT 1",
        taskId,
        projectId);

    return !result.empty();
}

Task TaskRepository::mapRowToTask(const drogon::orm::Row& row) {
    std::optional<std::string> epicId;
    if (!row["epic_id"].isNull()) {
        epicId = row["epic_id"].as<std::string>();
    }

    std::optional<std::string> parentTaskId;
    if (!row["parent_task_id"].isNull()) {
        parentTaskId = row["parent_task_id"].as<std::string>();
    }

    std::optional<std::string> description;
    if (!row["description"].isNull()) {
        description = row["description"].as<std::string>();
    }

    std::optional<std::string> dueDate;
    if (!row["due_date"].isNull()) {
        dueDate = row["due_date"].as<std::string>();
    }

    std::optional<int> storyPoints;
    if (!row["story_points"].isNull()) {
        storyPoints = row["story_points"].as<int>();
    }

    std::optional<std::string> assigneeId;
    if (!row["assignee_id"].isNull()) {
        assigneeId = row["assignee_id"].as<std::string>();
    }

    return Task{
        row["id"].as<std::string>(),
        row["project_id"].as<std::string>(),
        row["column_id"].as<std::string>(),
        epicId,
        parentTaskId,
        row["title"].as<std::string>(),
        description,
        taskPriorityFromString(row["priority"].as<std::string>()),
        dueDate,
        storyPoints,
        assigneeId,
        row["reporter_id"].as<std::string>(),
        row["position"].as<int>(),
        row["created_at"].as<std::string>(),
        row["updated_at"].as<std::string>(),
    };
}

std::vector<Task> TaskRepository::mapRowsToTasks(const drogon::orm::Result& result) {
    std::vector<Task> tasks;
    tasks.reserve(result.size());

    for (const auto& row : result) {
        tasks.push_back(mapRowToTask(row));
    }

    return tasks;
}

}  // namespace scrumban
