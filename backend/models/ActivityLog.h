#pragma once

#include <optional>
#include <string>
#include <utility>

namespace scrumban {

class ActivityLog {
public:
    ActivityLog() = default;

    ActivityLog(std::string id,
                std::string taskId,
                std::optional<std::string> userId,
                std::string action,
                std::optional<std::string> oldValue,
                std::optional<std::string> newValue,
                std::string createdAt)
        : id_(std::move(id)),
          taskId_(std::move(taskId)),
          userId_(std::move(userId)),
          action_(std::move(action)),
          oldValue_(std::move(oldValue)),
          newValue_(std::move(newValue)),
          createdAt_(std::move(createdAt)) {}

    [[nodiscard]] const std::string& id() const { return id_; }
    [[nodiscard]] const std::string& taskId() const { return taskId_; }
    [[nodiscard]] const std::optional<std::string>& userId() const { return userId_; }
    [[nodiscard]] const std::string& action() const { return action_; }
    [[nodiscard]] const std::optional<std::string>& oldValue() const { return oldValue_; }
    [[nodiscard]] const std::optional<std::string>& newValue() const { return newValue_; }
    [[nodiscard]] const std::string& createdAt() const { return createdAt_; }

    [[nodiscard]] bool hasUser() const { return userId_.has_value() && !userId_->empty(); }
    [[nodiscard]] bool hasOldValue() const { return oldValue_.has_value() && !oldValue_->empty(); }
    [[nodiscard]] bool hasNewValue() const { return newValue_.has_value() && !newValue_->empty(); }

private:
    std::string id_;
    std::string taskId_;
    std::optional<std::string> userId_;
    std::string action_;
    std::optional<std::string> oldValue_;
    std::optional<std::string> newValue_;
    std::string createdAt_;
};

}  // namespace scrumban
