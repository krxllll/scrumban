#pragma once

#include <optional>
#include <stdexcept>
#include <string>
#include <utility>

namespace scrumban {

enum class TaskPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
};

inline std::string taskPriorityToString(TaskPriority priority) {
    switch (priority) {
        case TaskPriority::LOW:
            return "LOW";
        case TaskPriority::MEDIUM:
            return "MEDIUM";
        case TaskPriority::HIGH:
            return "HIGH";
        case TaskPriority::URGENT:
            return "URGENT";
    }

    throw std::invalid_argument("Unknown task priority");
}

inline TaskPriority taskPriorityFromString(const std::string& value) {
    if (value == "LOW") {
        return TaskPriority::LOW;
    }
    if (value == "MEDIUM") {
        return TaskPriority::MEDIUM;
    }
    if (value == "HIGH") {
        return TaskPriority::HIGH;
    }
    if (value == "URGENT") {
        return TaskPriority::URGENT;
    }

    throw std::invalid_argument("Unknown task priority: " + value);
}

class Task {
public:
    Task() = default;

    Task(std::string id,
         std::string projectId,
         std::string columnId,
         std::optional<std::string> epicId,
         std::optional<std::string> parentTaskId,
         std::string title,
         std::optional<std::string> description,
         TaskPriority priority,
         std::optional<std::string> dueDate,
         std::optional<int> storyPoints,
         std::optional<std::string> assigneeId,
         std::string reporterId,
         int position,
         std::string createdAt,
         std::string updatedAt)
        : id_(std::move(id)),
          projectId_(std::move(projectId)),
          columnId_(std::move(columnId)),
          epicId_(std::move(epicId)),
          parentTaskId_(std::move(parentTaskId)),
          title_(std::move(title)),
          description_(std::move(description)),
          priority_(priority),
          dueDate_(std::move(dueDate)),
          storyPoints_(storyPoints),
          assigneeId_(std::move(assigneeId)),
          reporterId_(std::move(reporterId)),
          position_(position),
          createdAt_(std::move(createdAt)),
          updatedAt_(std::move(updatedAt)) {}

    [[nodiscard]] const std::string& id() const { return id_; }
    [[nodiscard]] const std::string& projectId() const { return projectId_; }
    [[nodiscard]] const std::string& columnId() const { return columnId_; }
    [[nodiscard]] const std::optional<std::string>& epicId() const { return epicId_; }
    [[nodiscard]] const std::optional<std::string>& parentTaskId() const { return parentTaskId_; }
    [[nodiscard]] const std::string& title() const { return title_; }
    [[nodiscard]] const std::optional<std::string>& description() const { return description_; }
    [[nodiscard]] TaskPriority priority() const { return priority_; }
    [[nodiscard]] const std::optional<std::string>& dueDate() const { return dueDate_; }
    [[nodiscard]] const std::optional<int>& storyPoints() const { return storyPoints_; }
    [[nodiscard]] const std::optional<std::string>& assigneeId() const { return assigneeId_; }
    [[nodiscard]] const std::string& reporterId() const { return reporterId_; }
    [[nodiscard]] int position() const { return position_; }
    [[nodiscard]] const std::string& createdAt() const { return createdAt_; }
    [[nodiscard]] const std::string& updatedAt() const { return updatedAt_; }

    [[nodiscard]] bool hasAssignee() const { return assigneeId_.has_value() && !assigneeId_->empty(); }
    [[nodiscard]] bool hasDueDate() const { return dueDate_.has_value() && !dueDate_->empty(); }
    [[nodiscard]] bool belongsToEpic() const { return epicId_.has_value() && !epicId_->empty(); }
    [[nodiscard]] bool hasParentTask() const { return parentTaskId_.has_value() && !parentTaskId_->empty(); }
    [[nodiscard]] bool hasStoryPoints() const { return storyPoints_.has_value(); }

    void setColumnId(std::string columnId) { columnId_ = std::move(columnId); }
    void setEpicId(std::optional<std::string> epicId) { epicId_ = std::move(epicId); }
    void setParentTaskId(std::optional<std::string> parentTaskId) { parentTaskId_ = std::move(parentTaskId); }
    void setTitle(std::string title) { title_ = std::move(title); }
    void setDescription(std::optional<std::string> description) { description_ = std::move(description); }
    void setPriority(TaskPriority priority) { priority_ = priority; }
    void setDueDate(std::optional<std::string> dueDate) { dueDate_ = std::move(dueDate); }
    void setStoryPoints(std::optional<int> storyPoints) { storyPoints_ = storyPoints; }
    void setAssigneeId(std::optional<std::string> assigneeId) { assigneeId_ = std::move(assigneeId); }
    void setPosition(int position) { position_ = position; }
    void setUpdatedAt(std::string updatedAt) { updatedAt_ = std::move(updatedAt); }

private:
    std::string id_;
    std::string projectId_;
    std::string columnId_;
    std::optional<std::string> epicId_;
    std::optional<std::string> parentTaskId_;
    std::string title_;
    std::optional<std::string> description_;
    TaskPriority priority_{TaskPriority::MEDIUM};
    std::optional<std::string> dueDate_;
    std::optional<int> storyPoints_;
    std::optional<std::string> assigneeId_;
    std::string reporterId_;
    int position_{0};
    std::string createdAt_;
    std::string updatedAt_;
};

}  // namespace scrumban
