#pragma once

#include "../models/Project.h"

#include <drogon/orm/Row.h>

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class ProjectRepository {
public:
    [[nodiscard]] static std::optional<Project> findById(const std::string& id);
    static std::vector<Project> findByOwnerId(const std::string& ownerId);
    static std::vector<Project> findByMemberId(const std::string& userId);

    static Project create(const std::string& name,
                          const std::optional<std::string>& description,
                          const std::string& ownerId);

    static bool isMember(const std::string& projectId, const std::string& userId);
    static bool isOwner(const std::string& projectId, const std::string& userId);

private:
    static Project mapRowToProject(const drogon::orm::Row& row);
};

}  // namespace scrumban
