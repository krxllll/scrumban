#pragma once

#include "../models/BoardColumn.h"

#include <drogon/orm/Row.h>

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class BoardColumnRepository {
public:
    [[nodiscard]] static std::optional<BoardColumn> findById(const std::string& id);
    [[nodiscard]] static std::vector<BoardColumn> findByProjectId(const std::string& projectId);

    [[nodiscard]] static BoardColumn create(const std::string& projectId,
                                            const std::string& name,
                                            int position,
                                            const std::optional<int>& wipLimit = std::nullopt);

    [[nodiscard]] static BoardColumn update(const std::string& id,
                                            const std::string& name,
                                            int position,
                                            const std::optional<int>& wipLimit);

    static void remove(const std::string& id);

    [[nodiscard]] static bool belongsToProject(const std::string& columnId, const std::string& projectId);

private:
    static BoardColumn mapRowToBoardColumn(const drogon::orm::Row& row);
};

}  // namespace scrumban
