#pragma once

#include <optional>
#include <string>
#include <utility>

namespace scrumban {

class ActivityEvent {
public:
    virtual ~ActivityEvent() = default;

    [[nodiscard]] virtual std::string taskId() const = 0;
    [[nodiscard]] virtual std::optional<std::string> userId() const = 0;
    [[nodiscard]] virtual std::string action() const = 0;
    [[nodiscard]] virtual std::optional<std::string> oldValue() const = 0;
    [[nodiscard]] virtual std::optional<std::string> newValue() const = 0;
};

class TaskCreatedEvent final : public ActivityEvent {
public:
    TaskCreatedEvent(std::string taskId, std::string userId, std::string title)
        : taskId_(std::move(taskId)),
          userId_(std::move(userId)),
          title_(std::move(title)) {}

    [[nodiscard]] std::string taskId() const override { return taskId_; }
    [[nodiscard]] std::optional<std::string> userId() const override { return userId_; }
    [[nodiscard]] std::string action() const override { return "TASK_CREATED"; }
    [[nodiscard]] std::optional<std::string> oldValue() const override { return std::nullopt; }
    [[nodiscard]] std::optional<std::string> newValue() const override { return title_; }

private:
    std::string taskId_;
    std::string userId_;
    std::string title_;
};

class TaskUpdatedEvent final : public ActivityEvent {
public:
    TaskUpdatedEvent(std::string taskId, std::string userId, std::string oldValue, std::string newValue)
        : taskId_(std::move(taskId)),
          userId_(std::move(userId)),
          oldValue_(std::move(oldValue)),
          newValue_(std::move(newValue)) {}

    [[nodiscard]] std::string taskId() const override { return taskId_; }
    [[nodiscard]] std::optional<std::string> userId() const override { return userId_; }
    [[nodiscard]] std::string action() const override { return "TASK_UPDATED"; }
    [[nodiscard]] std::optional<std::string> oldValue() const override { return oldValue_; }
    [[nodiscard]] std::optional<std::string> newValue() const override { return newValue_; }

private:
    std::string taskId_;
    std::string userId_;
    std::string oldValue_;
    std::string newValue_;
};

class TaskMovedEvent final : public ActivityEvent {
public:
    TaskMovedEvent(std::string taskId, std::string userId, std::string oldColumnId, std::string newColumnId)
        : taskId_(std::move(taskId)),
          userId_(std::move(userId)),
          oldColumnId_(std::move(oldColumnId)),
          newColumnId_(std::move(newColumnId)) {}

    [[nodiscard]] std::string taskId() const override { return taskId_; }
    [[nodiscard]] std::optional<std::string> userId() const override { return userId_; }
    [[nodiscard]] std::string action() const override { return "TASK_MOVED"; }
    [[nodiscard]] std::optional<std::string> oldValue() const override { return oldColumnId_; }
    [[nodiscard]] std::optional<std::string> newValue() const override { return newColumnId_; }

private:
    std::string taskId_;
    std::string userId_;
    std::string oldColumnId_;
    std::string newColumnId_;
};

class TaskDeletedEvent final : public ActivityEvent {
public:
    TaskDeletedEvent(std::string taskId, std::string userId, std::string title)
        : taskId_(std::move(taskId)),
          userId_(std::move(userId)),
          title_(std::move(title)) {}

    [[nodiscard]] std::string taskId() const override { return taskId_; }
    [[nodiscard]] std::optional<std::string> userId() const override { return userId_; }
    [[nodiscard]] std::string action() const override { return "TASK_DELETED"; }
    [[nodiscard]] std::optional<std::string> oldValue() const override { return title_; }
    [[nodiscard]] std::optional<std::string> newValue() const override { return std::nullopt; }

private:
    std::string taskId_;
    std::string userId_;
    std::string title_;
};

class CommentCreatedEvent final : public ActivityEvent {
public:
    CommentCreatedEvent(std::string taskId, std::string userId, std::string commentId)
        : taskId_(std::move(taskId)),
          userId_(std::move(userId)),
          commentId_(std::move(commentId)) {}

    [[nodiscard]] std::string taskId() const override { return taskId_; }
    [[nodiscard]] std::optional<std::string> userId() const override { return userId_; }
    [[nodiscard]] std::string action() const override { return "COMMENT_CREATED"; }
    [[nodiscard]] std::optional<std::string> oldValue() const override { return std::nullopt; }
    [[nodiscard]] std::optional<std::string> newValue() const override { return commentId_; }

private:
    std::string taskId_;
    std::string userId_;
    std::string commentId_;
};

}  // namespace scrumban
