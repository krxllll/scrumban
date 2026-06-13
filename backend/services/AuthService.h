#pragma once

#include "../models/User.h"

#include <string>

namespace scrumban {

class AuthService {
public:
    static User registerUser(const std::string& name,
                             const std::string& email,
                             const std::string& password);

    static User login(const std::string& email, const std::string& password);
};

}  // namespace scrumban
