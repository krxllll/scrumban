#pragma once

#include <string>

namespace scrumban {

class PasswordHasher {
public:
    static std::string hashPassword(const std::string& password);
    static bool verifyPassword(const std::string& password, const std::string& passwordHash);
};

}  // namespace scrumban
