#include "UserRepository.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>

namespace scrumban {

std::optional<User> UserRepository::findById(const std::string& id) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, name, email, password_hash, avatar_url, created_at, updated_at "
        "FROM users "
        "WHERE id = $1",
        id);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToUser(result[0]);
}

std::optional<User> UserRepository::findByEmail(const std::string& email) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, name, email, password_hash, avatar_url, created_at, updated_at "
        "FROM users "
        "WHERE email = $1",
        email);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToUser(result[0]);
}

bool UserRepository::existsByEmail(const std::string& email) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM users "
        "WHERE email = $1 "
        "LIMIT 1",
        email);

    return !result.empty();
}

User UserRepository::create(const std::string& name,
                            const std::string& email,
                            const std::string& passwordHash,
                            const std::optional<std::string>& avatarUrl) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "INSERT INTO users (name, email, password_hash, avatar_url) "
        "VALUES ($1, $2, $3, $4) "
        "RETURNING id, name, email, password_hash, avatar_url, created_at, updated_at",
        name,
        email,
        passwordHash,
        avatarUrl);

    return mapRowToUser(result[0]);
}

User UserRepository::mapRowToUser(const drogon::orm::Row& row) {
    std::optional<std::string> avatarUrl;
    if (!row["avatar_url"].isNull()) {
        avatarUrl = row["avatar_url"].as<std::string>();
    }

    return User{
        row["id"].as<std::string>(),
        row["name"].as<std::string>(),
        row["email"].as<std::string>(),
        row["password_hash"].as<std::string>(),
        avatarUrl,
        row["created_at"].as<std::string>(),
        row["updated_at"].as<std::string>(),
    };
}

}  // namespace scrumban
