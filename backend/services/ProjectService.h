#pragma once

#include "../models/Project.h"

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class ProjectService {
public:
    [[nodiscard]] static Project createProject(const std::string& name,
                                               const std::optional<std::string>& description,
                                               const std::string& ownerId);

    [[nodiscard]] static std::optional<Project> getProjectById(const std::string& projectId,
                                                               const std::string& userId);

    [[nodiscard]] static std::vector<Project> getProjectsForUser(const std::string& userId);

    [[nodiscard]] static bool canManageProject(const std::string& projectId,
                                               const std::string& userId);

    static void ensureProjectOwner(const std::string& projectId, const std::string& userId);
};

}  // namespace scrumban
