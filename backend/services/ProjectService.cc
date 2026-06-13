#include "ProjectService.h"

#include "../repositories/ProjectRepository.h"

#include <stdexcept>

namespace scrumban {

Project ProjectService::createProject(const std::string& name,
                                      const std::optional<std::string>& description,
                                      const std::string& ownerId) {
    if (name.empty()) {
        throw std::runtime_error("Project name is required");
    }

    if (ownerId.empty()) {
        throw std::runtime_error("Project owner id is required");
    }

    return ProjectRepository::create(name, description, ownerId);
}

std::optional<Project> ProjectService::getProjectById(const std::string& projectId,
                                                      const std::string& userId) {
    if (projectId.empty()) {
        throw std::runtime_error("Project id is required");
    }

    if (userId.empty()) {
        throw std::runtime_error("User id is required");
    }

    if (!ProjectRepository::isMember(projectId, userId)) {
        throw std::runtime_error("User is not a member of this project");
    }

    return ProjectRepository::findById(projectId);
}

std::vector<Project> ProjectService::getProjectsForUser(const std::string& userId) {
    if (userId.empty()) {
        throw std::runtime_error("User id is required");
    }

    return ProjectRepository::findByMemberId(userId);
}

bool ProjectService::canManageProject(const std::string& projectId, const std::string& userId) {
    if (projectId.empty() || userId.empty()) {
        return false;
    }

    return ProjectRepository::isOwner(projectId, userId);
}

void ProjectService::ensureProjectOwner(const std::string& projectId, const std::string& userId) {
    if (projectId.empty()) {
        throw std::runtime_error("Project id is required");
    }

    if (userId.empty()) {
        throw std::runtime_error("User id is required");
    }

    if (!canManageProject(projectId, userId)) {
        throw std::runtime_error("User is not the owner of this project");
    }
}

}  // namespace scrumban
