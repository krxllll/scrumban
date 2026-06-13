#include "PasswordHasher.h"

#include <openssl/rand.h>
#include <openssl/sha.h>

#include <array>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>

namespace scrumban {
namespace {

constexpr std::size_t kSaltSize = 16;
constexpr char kAlgorithm[] = "sha256";

std::string toHex(const unsigned char* data, std::size_t size) {
    std::ostringstream stream;
    stream << std::hex << std::setfill('0');

    for (std::size_t i = 0; i < size; ++i) {
        stream << std::setw(2) << static_cast<int>(data[i]);
    }

    return stream.str();
}

std::string sha256Hex(const std::string& saltHex, const std::string& password) {
    SHA256_CTX context;
    SHA256_Init(&context);
    SHA256_Update(&context, saltHex.data(), saltHex.size());
    SHA256_Update(&context, password.data(), password.size());

    std::array<unsigned char, SHA256_DIGEST_LENGTH> digest{};
    SHA256_Final(digest.data(), &context);

    return toHex(digest.data(), digest.size());
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

}  // namespace

std::string PasswordHasher::hashPassword(const std::string& password) {
    std::array<unsigned char, kSaltSize> salt{};
    if (RAND_bytes(salt.data(), salt.size()) != 1) {
        throw std::runtime_error("Failed to generate password salt");
    }

    const std::string saltHex = toHex(salt.data(), salt.size());
    const std::string hashHex = sha256Hex(saltHex, password);

    return std::string(kAlgorithm) + "$" + saltHex + "$" + hashHex;
}

bool PasswordHasher::verifyPassword(const std::string& password, const std::string& passwordHash) {
    const std::size_t firstSeparator = passwordHash.find('$');
    if (firstSeparator == std::string::npos) {
        return false;
    }

    const std::size_t secondSeparator = passwordHash.find('$', firstSeparator + 1);
    if (secondSeparator == std::string::npos || passwordHash.find('$', secondSeparator + 1) != std::string::npos) {
        return false;
    }

    if (const std::string algorithm = passwordHash.substr(0, firstSeparator); algorithm != kAlgorithm) {
        return false;
    }

    const std::string saltHex = passwordHash.substr(firstSeparator + 1, secondSeparator - firstSeparator - 1);
    const std::string expectedHashHex = passwordHash.substr(secondSeparator + 1);
    if (saltHex.empty() || expectedHashHex.empty()) {
        return false;
    }

    const std::string actualHashHex = sha256Hex(saltHex, password);
    return constantTimeEquals(actualHashHex, expectedHashHex);
}

}  // namespace scrumban
