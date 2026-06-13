#include "AuthController.h"

#include "../models/User.h"
#include "../repositories/UserRepository.h"
#include "../services/AuthService.h"
#include "../utils/JwtUtils.h"

#include <json/json.h>

#include <optional>
#include <stdexcept>
#include <string>

namespace scrumban {
namespace {

Json::Value userToJson(const User& user) {
    Json::Value body;
    body["id"] = user.id();
    body["name"] = user.name();
    body["email"] = user.email();
    body["createdAt"] = user.createdAt();
    body["updatedAt"] = user.updatedAt();

    if (user.avatarUrl().has_value()) {
        body["avatarUrl"] = *user.avatarUrl();
    } else {
        body["avatarUrl"] = Json::nullValue;
    }

    return body;
}

drogon::HttpResponsePtr makeJsonResponse(const Json::Value& body, const drogon::HttpStatusCode statusCode) {
    auto response = drogon::HttpResponse::newHttpJsonResponse(body);
    response->setStatusCode(statusCode);
    return response;
}

drogon::HttpResponsePtr makeErrorResponse(const std::string& message, const drogon::HttpStatusCode statusCode) {
    Json::Value body;
    body["error"] = message;
    return makeJsonResponse(body, statusCode);
}

std::optional<std::string> getRequiredString(const Json::Value& body, const std::string& field) {
    if (!body.isMember(field) || !body[field].isString() || body[field].asString().empty()) {
        return std::nullopt;
    }

    return body[field].asString();
}

std::optional<std::string> extractBearerToken(const drogon::HttpRequestPtr& request) {
    const std::string authorization = request->getHeader("Authorization");
    constexpr char prefix[] = "Bearer ";

    if (authorization.rfind(prefix, 0) != 0) {
        return std::nullopt;
    }

    std::string token = authorization.substr(sizeof(prefix) - 1);
    if (token.empty()) {
        return std::nullopt;
    }

    return token;
}

Json::Value makeAuthResponse(const User& user, const std::string& token) {
    Json::Value body;
    body["token"] = token;
    body["user"] = userToJson(user);
    return body;
}

}  // namespace

void AuthController::registerUser(const drogon::HttpRequestPtr& request,
                                  std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
    const auto body = request->getJsonObject();
    if (!body) {
        callback(makeErrorResponse("Request body must be valid JSON", drogon::k400BadRequest));
        return;
    }

    const auto name = getRequiredString(*body, "name");
    const auto email = getRequiredString(*body, "email");
    const auto password = getRequiredString(*body, "password");
    if (!name.has_value() || !email.has_value() || !password.has_value()) {
        callback(makeErrorResponse("Name, email, and password are required", drogon::k400BadRequest));
        return;
    }

    try {
        const User user = AuthService::registerUser(*name, *email, *password);
        const std::string token = JwtUtils::generateToken(user.id(), user.email());

        callback(makeJsonResponse(makeAuthResponse(user, token), drogon::k201Created));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (message == "Email is already registered") {
            callback(makeErrorResponse(message, drogon::k409Conflict));
            return;
        }

        if (message == "Name is required" || message == "Email is required" || message == "Password is required") {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }

        callback(makeErrorResponse("Registration failed", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Registration failed", drogon::k500InternalServerError));
    }
}

void AuthController::login(const drogon::HttpRequestPtr& request,
                           std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
    const auto body = request->getJsonObject();
    if (!body) {
        callback(makeErrorResponse("Request body must be valid JSON", drogon::k400BadRequest));
        return;
    }

    const auto email = getRequiredString(*body, "email");
    const auto password = getRequiredString(*body, "password");
    if (!email.has_value() || !password.has_value()) {
        callback(makeErrorResponse("Email and password are required", drogon::k400BadRequest));
        return;
    }

    try {
        const User user = AuthService::login(*email, *password);
        const std::string token = JwtUtils::generateToken(user.id(), user.email());

        callback(makeJsonResponse(makeAuthResponse(user, token), drogon::k200OK));
    } catch (const std::runtime_error& error) {
        const std::string message = error.what();
        if (message == "User with this email does not exist" || message == "Invalid password") {
            callback(makeErrorResponse("Invalid email or password", drogon::k401Unauthorized));
            return;
        }

        if (message == "Email is required" || message == "Password is required") {
            callback(makeErrorResponse(message, drogon::k400BadRequest));
            return;
        }

        callback(makeErrorResponse("Login failed", drogon::k500InternalServerError));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Login failed", drogon::k500InternalServerError));
    }
}

void AuthController::me(const drogon::HttpRequestPtr& request,
                        std::function<void(const drogon::HttpResponsePtr&)>&& callback) {
    try {
        const auto token = extractBearerToken(request);
        if (!token.has_value() || !JwtUtils::validateToken(*token)) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto userId = JwtUtils::extractUserId(*token);
        if (!userId.has_value()) {
            callback(makeErrorResponse("Missing or invalid authentication token", drogon::k401Unauthorized));
            return;
        }

        const auto user = UserRepository::findById(*userId);
        if (!user.has_value()) {
            callback(makeErrorResponse("User not found", drogon::k404NotFound));
            return;
        }

        Json::Value body;
        body["user"] = userToJson(*user);
        callback(makeJsonResponse(body, drogon::k200OK));
    } catch (const std::exception&) {
        callback(makeErrorResponse("Could not load authenticated user", drogon::k500InternalServerError));
    }
}

}  // namespace scrumban
