#include "CommentService.h"

#include "ActivityLogService.h"
#include "ProjectService.h"
#include "../activity/ActivityEvent.h"
#include "../repositories/CommentRepository.h"
#include "../repositories/TaskRepository.h"

#include <stdexcept>

namespace scrumban {

std::vector<Comment> CommentService::getCommentsForTask(const std::string& projectId,
                                                        const std::string& taskId,
                                                        const std::string& userId) {
    validateProjectTaskAndUserIds(projectId, taskId, userId);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);

    return CommentRepository::findByTaskId(taskId);
}

Comment CommentService::createComment(const std::string& projectId,
                                      const std::string& taskId,
                                      const std::string& userId,
                                      const std::string& content) {
    validateProjectTaskAndUserIds(projectId, taskId, userId);
    validateContent(content);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);

    const auto createdComment = CommentRepository::create(taskId, userId, content);

    (void)ActivityLogService::record(CommentCreatedEvent(taskId, userId, createdComment.id()));

    return createdComment;
}

Comment CommentService::updateComment(const std::string& projectId,
                                      const std::string& taskId,
                                      const std::string& commentId,
                                      const std::string& userId,
                                      const std::string& content) {
    validateProjectTaskAndUserIds(projectId, taskId, userId);
    validateCommentId(commentId);
    validateContent(content);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);
    ensureCommentBelongsToTask(commentId, taskId);
    ensureCommentAuthor(commentId, userId);

    return CommentRepository::update(commentId, content);
}

void CommentService::deleteComment(const std::string& projectId,
                                   const std::string& taskId,
                                   const std::string& commentId,
                                   const std::string& userId) {
    validateProjectTaskAndUserIds(projectId, taskId, userId);
    validateCommentId(commentId);
    ensureProjectMember(projectId, userId);
    ensureTaskBelongsToProject(projectId, taskId);
    ensureCommentBelongsToTask(commentId, taskId);
    ensureCommentAuthor(commentId, userId);

    CommentRepository::remove(commentId);
}

void CommentService::validateProjectTaskAndUserIds(const std::string& projectId,
                                                   const std::string& taskId,
                                                   const std::string& userId) {
    if (projectId.empty()) {
        throw std::runtime_error("Project id is required");
    }

    if (taskId.empty()) {
        throw std::runtime_error("Task id is required");
    }

    if (userId.empty()) {
        throw std::runtime_error("User id is required");
    }
}

void CommentService::validateCommentId(const std::string& commentId) {
    if (commentId.empty()) {
        throw std::runtime_error("Comment id is required");
    }
}

void CommentService::validateContent(const std::string& content) {
    if (content.empty()) {
        throw std::runtime_error("Comment content is required");
    }
}

void CommentService::ensureProjectMember(const std::string& projectId, const std::string& userId) {
    if (const auto project = ProjectService::getProjectById(projectId, userId); !project.has_value()) {
        throw std::runtime_error("Project not found");
    }
}

void CommentService::ensureTaskBelongsToProject(const std::string& projectId, const std::string& taskId) {
    if (!TaskRepository::belongsToProject(taskId, projectId)) {
        throw std::runtime_error("Task does not belong to this project");
    }
}

void CommentService::ensureCommentBelongsToTask(const std::string& commentId, const std::string& taskId) {
    if (!CommentRepository::belongsToTask(commentId, taskId)) {
        throw std::runtime_error("Comment does not belong to this task");
    }
}

void CommentService::ensureCommentAuthor(const std::string& commentId, const std::string& userId) {
    if (!CommentRepository::isAuthor(commentId, userId)) {
        throw std::runtime_error("User is not the author of this comment");
    }
}

}  // namespace scrumban
