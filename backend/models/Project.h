#pragma once

#include <optional>
#include <string>
#include <utility>

namespace scrumban {

class Project {
public:
    Project() = default;

    Project(std::string id,
            std::string name,
            std::optional<std::string> description,
            std::string ownerId,
            std::string createdAt,
            std::string updatedAt)
        : id_(std::move(id)),
          name_(std::move(name)),
          description_(std::move(description)),
          ownerId_(std::move(ownerId)),
          createdAt_(std::move(createdAt)),
          updatedAt_(std::move(updatedAt)) {}

    [[nodiscard]] const std::string& id() const { return id_; }
    [[nodiscard]] const std::string& name() const { return name_; }
    [[nodiscard]] const std::optional<std::string>& description() const { return description_; }
    [[nodiscard]] const std::string& ownerId() const { return ownerId_; }
    [[nodiscard]] const std::string& createdAt() const { return createdAt_; }
    [[nodiscard]] const std::string& updatedAt() const { return updatedAt_; }

    [[nodiscard]] bool hasDescription() const { return description_.has_value() && !description_->empty(); }

    void setName(std::string name) { name_ = std::move(name); }
    void setDescription(std::optional<std::string> description) { description_ = std::move(description); }
    void setUpdatedAt(std::string updatedAt) { updatedAt_ = std::move(updatedAt); }

private:
    std::string id_;
    std::string name_;
    std::optional<std::string> description_;
    std::string ownerId_;
    std::string createdAt_;
    std::string updatedAt_;
};

}  // namespace scrumban
