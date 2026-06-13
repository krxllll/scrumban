#include "JwtUtils.h"

#include <drogon/drogon.h>
#include <json/json.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>

#include <array>
#include <chrono>
#include <fstream>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace scrumban {
namespace {

constexpr char kConfigPath[] = "backend/config/config.json";
constexpr char kJwtAlgorithm[] = "HS256";

std::int64_t currentUnixTime() {
    const auto now = std::chrono::system_clock::now();
    return std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
}

std::string base64UrlEncode(const std::string& input) {
    static constexpr char kAlphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

    std::string output;
    output.reserve(((input.size() + 2) / 3) * 4);

    std::size_t index = 0;
    while (index + 3 <= input.size()) {
        const auto first = static_cast<unsigned char>(input[index++]);
        const auto second = static_cast<unsigned char>(input[index++]);
        const auto third = static_cast<unsigned char>(input[index++]);

        output.push_back(kAlphabet[first >> 2]);
        output.push_back(kAlphabet[((first & 0x03) << 4) | (second >> 4)]);
        output.push_back(kAlphabet[((second & 0x0f) << 2) | (third >> 6)]);
        output.push_back(kAlphabet[third & 0x3f]);
    }

    if (const std::size_t remaining = input.size() - index; remaining == 1) {
        const auto first = static_cast<unsigned char>(input[index]);
        output.push_back(kAlphabet[first >> 2]);
        output.push_back(kAlphabet[(first & 0x03) << 4]);
    } else if (remaining == 2) {
        const auto first = static_cast<unsigned char>(input[index]);
        const auto second = static_cast<unsigned char>(input[index + 1]);
        output.push_back(kAlphabet[first >> 2]);
        output.push_back(kAlphabet[((first & 0x03) << 4) | (second >> 4)]);
        output.push_back(kAlphabet[(second & 0x0f) << 2]);
    }

    return output;
}

int base64UrlValue(const char value) {
    if (value >= 'A' && value <= 'Z') {
        return value - 'A';
    }
    if (value >= 'a' && value <= 'z') {
        return value - 'a' + 26;
    }
    if (value >= '0' && value <= '9') {
        return value - '0' + 52;
    }
    if (value == '-') {
        return 62;
    }
    if (value == '_') {
        return 63;
    }
    return -1;
}

std::optional<std::string> base64UrlDecode(const std::string& input) {
    if (input.size() % 4 == 1) {
        return std::nullopt;
    }

    std::string output;
    output.reserve((input.size() * 3) / 4);

    int buffer = 0;
    int bits = 0;
    for (const char character : input) {
        const int value = base64UrlValue(character);
        if (value < 0) {
            return std::nullopt;
        }

        buffer = (buffer << 6) | value;
        bits += 6;

        if (bits >= 8) {
            bits -= 8;
            output.push_back(static_cast<char>((buffer >> bits) & 0xff));
        }
    }

    return output;
}

std::string writeCompactJson(const Json::Value& value) {
    Json::StreamWriterBuilder builder;
    builder["indentation"] = "";
    return Json::writeString(builder, value);
}

std::optional<Json::Value> parseJson(const std::string& json) {
    const Json::CharReaderBuilder builder;
    std::string errors;
    Json::Value value;

    if (std::istringstream stream(json); !Json::parseFromStream(builder, stream, &value, &errors)) {
        return std::nullopt;
    }

    return value;
}

std::optional<Json::Value> readJwtConfigFromFile() {
    std::ifstream configFile(kConfigPath);
    if (!configFile.is_open()) {
        return std::nullopt;
    }

    std::string errors;
    Json::Value root;

    if (const Json::CharReaderBuilder builder; !Json::parseFromStream(builder, configFile, &root, &errors)) {
        return std::nullopt;
    }

    if (!root.isMember("jwt") || !root["jwt"].isObject()) {
        return std::nullopt;
    }

    return root["jwt"];
}

Json::Value readJwtConfig() {
    if (const Json::Value& customConfig = drogon::app().getCustomConfig(); customConfig.isMember("jwt") && customConfig["jwt"].isObject()) {
        return customConfig["jwt"];
    }

    if (const auto fileConfig = readJwtConfigFromFile(); fileConfig.has_value()) {
        return *fileConfig;
    }

    throw std::runtime_error("JWT config is missing");
}

std::string readJwtSecret() {
    const Json::Value jwtConfig = readJwtConfig();
    if (!jwtConfig.isMember("secret") || !jwtConfig["secret"].isString() || jwtConfig["secret"].asString().empty()) {
        throw std::runtime_error("JWT secret is missing");
    }

    return jwtConfig["secret"].asString();
}

std::int64_t readExpirationSeconds() {
    const Json::Value jwtConfig = readJwtConfig();
    if (!jwtConfig.isMember("expiration_seconds") || !jwtConfig["expiration_seconds"].isNumeric()) {
        throw std::runtime_error("JWT expiration is missing");
    }

    const auto expirationSeconds = jwtConfig["expiration_seconds"].asInt64();
    if (expirationSeconds <= 0) {
        throw std::runtime_error("JWT expiration must be positive");
    }

    return expirationSeconds;
}

std::string hmacSha256(const std::string& data, const std::string& secret) {
    std::array<unsigned char, EVP_MAX_MD_SIZE> digest{};
    unsigned int digestLength = 0;

    HMAC(EVP_sha256(),
         secret.data(),
         static_cast<int>(secret.size()),
         reinterpret_cast<const unsigned char*>(data.data()),
         data.size(),
         digest.data(),
         &digestLength);

    return {reinterpret_cast<const char*>(digest.data()), digestLength};
}

bool constantTimeEquals(const std::string& lhs, const std::string& rhs) {
    if (lhs.size() != rhs.size()) {
        return false;
    }

    unsigned char difference = 0;
    for (std::size_t i = 0; i < lhs.size(); ++i) {
        difference |= static_cast<unsigned char>(lhs[i] ^ rhs[i]);
    }

    return difference == 0;
}

std::vector<std::string> splitToken(const std::string& token) {
    std::vector<std::string> parts;
    std::size_t start = 0;

    while (start <= token.size()) {
        const std::size_t separator = token.find('.', start);
        if (separator == std::string::npos) {
            parts.push_back(token.substr(start));
            break;
        }

        parts.push_back(token.substr(start, separator - start));
        start = separator + 1;
    }

    return parts;
}

std::optional<Json::Value> validatedPayload(const std::string& token) {
    const std::vector<std::string> parts = splitToken(token);
    if (parts.size() != 3 || parts[0].empty() || parts[1].empty() || parts[2].empty()) {
        return std::nullopt;
    }

    const auto headerJson = base64UrlDecode(parts[0]);
    const auto payloadJson = base64UrlDecode(parts[1]);
    const auto signature = base64UrlDecode(parts[2]);
    if (!headerJson.has_value() || !payloadJson.has_value() || !signature.has_value()) {
        return std::nullopt;
    }

    const auto header = parseJson(*headerJson);
    const auto payload = parseJson(*payloadJson);
    if (!header.has_value() || !payload.has_value()) {
        return std::nullopt;
    }

    if (!header->isMember("alg") || (*header)["alg"].asString() != kJwtAlgorithm) {
        return std::nullopt;
    }

    if (!payload->isMember("exp") || !(*payload)["exp"].isNumeric()) {
        return std::nullopt;
    }

    if ((*payload)["exp"].asInt64() <= currentUnixTime()) {
        return std::nullopt;
    }

    const std::string signingInput = parts[0] + "." + parts[1];
    if (const std::string expectedSignature = hmacSha256(signingInput, readJwtSecret()); !constantTimeEquals(expectedSignature, *signature)) {
        return std::nullopt;
    }

    return *payload;
}

}  // namespace

std::string JwtUtils::generateToken(const std::string& userId, const std::string& email) {
    Json::Value header;
    header["alg"] = kJwtAlgorithm;
    header["typ"] = "JWT";

    Json::Value payload;
    payload["userId"] = userId;
    payload["email"] = email;
    payload["exp"] = currentUnixTime() + readExpirationSeconds();

    const std::string encodedHeader = base64UrlEncode(writeCompactJson(header));
    const std::string encodedPayload = base64UrlEncode(writeCompactJson(payload));
    const std::string signingInput = encodedHeader + "." + encodedPayload;
    const std::string encodedSignature = base64UrlEncode(hmacSha256(signingInput, readJwtSecret()));

    return signingInput + "." + encodedSignature;
}

std::optional<std::string> JwtUtils::extractUserId(const std::string& token) {
    const auto payload = validatedPayload(token);
    if (!payload.has_value() || !payload->isMember("userId") || !(*payload)["userId"].isString()) {
        return std::nullopt;
    }

    std::string userId = (*payload)["userId"].asString();
    if (userId.empty()) {
        return std::nullopt;
    }

    return userId;
}

bool JwtUtils::validateToken(const std::string& token) {
    return validatedPayload(token).has_value();
}

}  // namespace scrumban
