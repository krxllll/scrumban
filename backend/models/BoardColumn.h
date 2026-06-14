#pragma once

#include <optional>
#include <string>
#include <utility>

namespace scrumban {

class BoardColumn {
public:
    BoardColumn() = default;

    BoardColumn(std::string id,
                std::string projectId,
                std::string name,
                int position,
                std::optional<int> wipLimit,
                std::string createdAt,
                std::string updatedAt)
        : id_(std::move(id)),
          projectId_(std::move(projectId)),
          name_(std::move(name)),
          position_(position),
          wipLimit_(wipLimit),
          createdAt_(std::move(createdAt)),
          updatedAt_(std::move(updatedAt)) {}

    [[nodiscard]] const std::string& id() const { return id_; }
    [[nodiscard]] const std::string& projectId() const { return projectId_; }
    [[nodiscard]] const std::string& name() const { return name_; }
    [[nodiscard]] int position() const { return position_; }
    [[nodiscard]] const std::optional<int>& wipLimit() const { return wipLimit_; }
    [[nodiscard]] const std::string& createdAt() const { return createdAt_; }
    [[nodiscard]] const std::string& updatedAt() const { return updatedAt_; }

    [[nodiscard]] bool hasWipLimit() const { return wipLimit_.has_value(); }
    [[nodiscard]] bool isWipExceeded(int taskCount) const { return wipLimit_.has_value() && taskCount > *wipLimit_; }

    void setName(std::string name) { name_ = std::move(name); }
    void setPosition(int position) { position_ = position; }
    void setWipLimit(std::optional<int> wipLimit) { wipLimit_ = wipLimit; }
    void setUpdatedAt(std::string updatedAt) { updatedAt_ = std::move(updatedAt); }

private:
    std::string id_;
    std::string projectId_;
    std::string name_;
    int position_{0};
    std::optional<int> wipLimit_;
    std::string createdAt_;
    std::string updatedAt_;
};

}  // namespace scrumban
