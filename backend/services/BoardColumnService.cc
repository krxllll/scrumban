#include "BoardColumnService.h"

#include "ProjectService.h"
#include "../repositories/BoardColumnRepository.h"

#include <stdexcept>

namespace scrumban {

std::vector<BoardColumn> BoardColumnService::getColumnsForProject(const std::string& projectId,
                                                                  const std::string& userId) {
    validateProjectAndUserIds(projectId, userId);

    if (const auto project = ProjectService::getProjectById(projectId, userId); !project.has_value()) {
        throw std::runtime_error("Project not found");
    }

    return BoardColumnRepository::findByProjectId(projectId);
}

BoardColumn BoardColumnService::createColumn(const std::string& projectId,
                                             const std::string& userId,
                                             const std::string& name,
                                             const int position,
                                             const std::optional<int>& wipLimit) {
    validateProjectAndUserIds(projectId, userId);
    validateColumnInput(name, position, wipLimit);
    ProjectService::ensureProjectOwner(projectId, userId);

    return BoardColumnRepository::create(projectId, name, position, wipLimit);
}

BoardColumn BoardColumnService::updateColumn(const std::string& projectId,
                                             const std::string& columnId,
                                             const std::string& userId,
                                             const std::string& name,
                                             const int position,
                                             const std::optional<int>& wipLimit) {
    validateProjectAndUserIds(projectId, userId);
    if (columnId.empty()) {
        throw std::runtime_error("Board column id is required");
    }

    validateColumnInput(name, position, wipLimit);
    ProjectService::ensureProjectOwner(projectId, userId);
    ensureColumnBelongsToProject(projectId, columnId);

    return BoardColumnRepository::update(columnId, name, position, wipLimit);
}

void BoardColumnService::deleteColumn(const std::string& projectId,
                                      const std::string& columnId,
                                      const std::string& userId) {
    validateProjectAndUserIds(projectId, userId);
    if (columnId.empty()) {
        throw std::runtime_error("Board column id is required");
    }

    ProjectService::ensureProjectOwner(projectId, userId);
    ensureColumnBelongsToProject(projectId, columnId);

    BoardColumnRepository::remove(columnId);
}

void BoardColumnService::validateProjectAndUserIds(const std::string& projectId, const std::string& userId) {
    if (projectId.empty()) {
        throw std::runtime_error("Project id is required");
    }

    if (userId.empty()) {
        throw std::runtime_error("User id is required");
    }
}

void BoardColumnService::validateColumnInput(const std::string& name,
                                             const int position,
                                             const std::optional<int>& wipLimit) {
    if (name.empty()) {
        throw std::runtime_error("Board column name is required");
    }

    if (position < 0) {
        throw std::runtime_error("Board column position must be greater than or equal to 0");
    }

    if (wipLimit.has_value() && *wipLimit <= 0) {
        throw std::runtime_error("Board column WIP limit must be greater than 0");
    }
}

void BoardColumnService::ensureColumnBelongsToProject(const std::string& projectId, const std::string& columnId) {
    if (!BoardColumnRepository::belongsToProject(columnId, projectId)) {
        throw std::runtime_error("Board column does not belong to this project");
    }
}

}  // namespace scrumban
