#pragma once

#include "../models/User.h"

#include <drogon/orm/Row.h>

#include <optional>
#include <string>

namespace scrumban {

class UserRepository {
public:
    [[nodiscard]] static std::optional<User> findById(const std::string& id);
    [[nodiscard]] static std::optional<User> findByEmail(const std::string& email);
    [[nodiscard]] static bool existsByEmail(const std::string& email);

    [[nodiscard]] static User create(const std::string& name,
                                     const std::string& email,
                                     const std::string& passwordHash,
                                     const std::optional<std::string>& avatarUrl = std::nullopt);

private:
    static User mapRowToUser(const drogon::orm::Row& row);
};

}  // namespace scrumban
