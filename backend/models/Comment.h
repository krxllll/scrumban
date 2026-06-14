#pragma once

#include <string>
#include <utility>

namespace scrumban {

class Comment {
public:
    Comment() = default;

    Comment(std::string id,
            std::string taskId,
            std::string authorId,
            std::string content,
            std::string createdAt,
            std::string updatedAt)
        : id_(std::move(id)),
          taskId_(std::move(taskId)),
          authorId_(std::move(authorId)),
          content_(std::move(content)),
          createdAt_(std::move(createdAt)),
          updatedAt_(std::move(updatedAt)) {}

    [[nodiscard]] const std::string& id() const { return id_; }
    [[nodiscard]] const std::string& taskId() const { return taskId_; }
    [[nodiscard]] const std::string& authorId() const { return authorId_; }
    [[nodiscard]] const std::string& content() const { return content_; }
    [[nodiscard]] const std::string& createdAt() const { return createdAt_; }
    [[nodiscard]] const std::string& updatedAt() const { return updatedAt_; }

    [[nodiscard]] bool isEmpty() const { return content_.empty(); }

    void setContent(std::string content) { content_ = std::move(content); }
    void setUpdatedAt(std::string updatedAt) { updatedAt_ = std::move(updatedAt); }

private:
    std::string id_;
    std::string taskId_;
    std::string authorId_;
    std::string content_;
    std::string createdAt_;
    std::string updatedAt_;
};

}  // namespace scrumban
