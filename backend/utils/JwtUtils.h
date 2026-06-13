#pragma once

#include <optional>
#include <string>

namespace scrumban {

class JwtUtils {
public:
    static std::string generateToken(const std::string& userId, const std::string& email);
    static std::optional<std::string> extractUserId(const std::string& token);
    static bool validateToken(const std::string& token);
};

}  // namespace scrumban
