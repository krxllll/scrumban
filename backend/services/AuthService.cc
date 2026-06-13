#include "AuthService.h"

#include "../repositories/UserRepository.h"
#include "../utils/PasswordHasher.h"

#include <stdexcept>

namespace scrumban {

User AuthService::registerUser(const std::string& name,
                               const std::string& email,
                               const std::string& password) {
    if (name.empty()) {
        throw std::runtime_error("Name is required");
    }

    if (email.empty()) {
        throw std::runtime_error("Email is required");
    }

    if (password.empty()) {
        throw std::runtime_error("Password is required");
    }

    if (UserRepository::existsByEmail(email)) {
        throw std::runtime_error("Email is already registered");
    }

    const std::string passwordHash = PasswordHasher::hashPassword(password);
    return UserRepository::create(name, email, passwordHash);
}

User AuthService::login(const std::string& email, const std::string& password) {
    if (email.empty()) {
        throw std::runtime_error("Email is required");
    }

    if (password.empty()) {
        throw std::runtime_error("Password is required");
    }

    const auto user = UserRepository::findByEmail(email);
    if (!user.has_value()) {
        throw std::runtime_error("User with this email does not exist");
    }

    if (!PasswordHasher::verifyPassword(password, user->passwordHash())) {
        throw std::runtime_error("Invalid password");
    }

    return *user;
}

}  // namespace scrumban
