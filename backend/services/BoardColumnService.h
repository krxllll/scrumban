#pragma once

#include "../models/BoardColumn.h"

#include <optional>
#include <string>
#include <vector>

namespace scrumban {

class BoardColumnService {
public:
    [[nodiscard]] static std::vector<BoardColumn> getColumnsForProject(const std::string& projectId,
                                                                       const std::string& userId);

    [[nodiscard]] static BoardColumn createColumn(const std::string& projectId,
                                                  const std::string& userId,
                                                  const std::string& name,
                                                  int position,
                                                  const std::optional<int>& wipLimit);

    [[nodiscard]] static BoardColumn updateColumn(const std::string& projectId,
                                                  const std::string& columnId,
                                                  const std::string& userId,
                                                  const std::string& name,
                                                  int position,
                                                  const std::optional<int>& wipLimit);

    static void deleteColumn(const std::string& projectId,
                             const std::string& columnId,
                             const std::string& userId);

private:
    static void validateProjectAndUserIds(const std::string& projectId, const std::string& userId);
    static void validateColumnInput(const std::string& name, int position, const std::optional<int>& wipLimit);
    static void ensureColumnBelongsToProject(const std::string& projectId, const std::string& columnId);
};

}  // namespace scrumban
