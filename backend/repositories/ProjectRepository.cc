#include "ProjectRepository.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/orm/DbClient.h>
#include <drogon/orm/Result.h>

namespace scrumban {

std::optional<Project> ProjectRepository::findById(const std::string& id) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, name, description, owner_id, created_at, updated_at "
        "FROM projects "
        "WHERE id = $1",
        id);

    if (result.empty()) {
        return std::nullopt;
    }

    return mapRowToProject(result[0]);
}

std::vector<Project> ProjectRepository::findByOwnerId(const std::string& ownerId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT id, name, description, owner_id, created_at, updated_at "
        "FROM projects "
        "WHERE owner_id = $1 "
        "ORDER BY created_at DESC",
        ownerId);

    std::vector<Project> projects;
    projects.reserve(result.size());

    for (const auto& row : result) {
        projects.push_back(mapRowToProject(row));
    }

    return projects;
}

std::vector<Project> ProjectRepository::findByMemberId(const std::string& userId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT p.id, p.name, p.description, p.owner_id, p.created_at, p.updated_at "
        "FROM projects p "
        "JOIN project_members pm ON pm.project_id = p.id "
        "WHERE pm.user_id = $1 "
        "ORDER BY p.created_at DESC",
        userId);

    std::vector<Project> projects;
    projects.reserve(result.size());

    for (const auto& row : result) {
        projects.push_back(mapRowToProject(row));
    }

    return projects;
}

Project ProjectRepository::create(const std::string& name,
                                  const std::optional<std::string>& description,
                                  const std::string& ownerId) {
    const auto transaction = drogon::app().getDbClient("default")->newTransaction();

    try {
        const auto result = transaction->execSqlSync(
            "INSERT INTO projects (name, description, owner_id) "
            "VALUES ($1, $2, $3) "
            "RETURNING id, name, description, owner_id, created_at, updated_at",
            name,
            description,
            ownerId);

        const auto project = mapRowToProject(result[0]);

        transaction->execSqlSync(
            "INSERT INTO project_members (project_id, user_id, role) "
            "VALUES ($1, $2, 'OWNER') "
            "ON CONFLICT (project_id, user_id) DO UPDATE SET role = 'OWNER'",
            project.id(),
            ownerId);

        return project;
    } catch (...) {
        transaction->rollback();
        throw;
    }
}

bool ProjectRepository::isMember(const std::string& projectId, const std::string& userId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM project_members "
        "WHERE project_id = $1 AND user_id = $2 "
        "LIMIT 1",
        projectId,
        userId);

    return !result.empty();
}

bool ProjectRepository::isOwner(const std::string& projectId, const std::string& userId) {
    const auto result = drogon::app().getDbClient("default")->execSqlSync(
        "SELECT 1 "
        "FROM projects p "
        "LEFT JOIN project_members pm "
        "ON pm.project_id = p.id AND pm.user_id = $2 AND pm.role = 'OWNER' "
        "WHERE p.id = $1 AND (p.owner_id = $2 OR pm.user_id IS NOT NULL) "
        "LIMIT 1",
        projectId,
        userId);

    return !result.empty();
}

Project ProjectRepository::mapRowToProject(const drogon::orm::Row& row) {
    std::optional<std::string> description;
    if (!row["description"].isNull()) {
        description = row["description"].as<std::string>();
    }

    return Project{
        row["id"].as<std::string>(),
        row["name"].as<std::string>(),
        description,
        row["owner_id"].as<std::string>(),
        row["created_at"].as<std::string>(),
        row["updated_at"].as<std::string>(),
    };
}

}  // namespace scrumban
