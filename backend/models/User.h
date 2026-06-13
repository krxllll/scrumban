#pragma once

#include <optional>
#include <string>
#include <utility>

namespace scrumban {

class User {
public:
    User() = default;

    User(std::string id,
         std::string name,
         std::string email,
         std::string passwordHash,
         std::optional<std::string> avatarUrl,
         std::string createdAt,
         std::string updatedAt)
        : id_(std::move(id)),
          name_(std::move(name)),
          email_(std::move(email)),
          passwordHash_(std::move(passwordHash)),
          avatarUrl_(std::move(avatarUrl)),
          createdAt_(std::move(createdAt)),
          updatedAt_(std::move(updatedAt)) {}

    [[nodiscard]] const std::string& id() const { return id_; }
    [[nodiscard]] const std::string& name() const { return name_; }
    [[nodiscard]] const std::string& email() const { return email_; }
    [[nodiscard]] const std::string& passwordHash() const { return passwordHash_; }
    [[nodiscard]] const std::optional<std::string>& avatarUrl() const { return avatarUrl_; }
    [[nodiscard]] const std::string& createdAt() const { return createdAt_; }
    [[nodiscard]] const std::string& updatedAt() const { return updatedAt_; }

    [[nodiscard]] bool hasAvatar() const { return avatarUrl_.has_value() && !avatarUrl_->empty(); }

    void setName(std::string name) { name_ = std::move(name); }
    void setEmail(std::string email) { email_ = std::move(email); }
    void setPasswordHash(std::string passwordHash) { passwordHash_ = std::move(passwordHash); }
    void setAvatarUrl(std::optional<std::string> avatarUrl) { avatarUrl_ = std::move(avatarUrl); }
    void setUpdatedAt(std::string updatedAt) { updatedAt_ = std::move(updatedAt); }

private:
    std::string id_;
    std::string name_;
    std::string email_;
    std::string passwordHash_;
    std::optional<std::string> avatarUrl_;
    std::string createdAt_;
    std::string updatedAt_;
};

}  // namespace scrumban
