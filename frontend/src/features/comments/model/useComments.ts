import { useCallback, useEffect, useState } from "react";
import {
  createComment,
  deleteComment,
  getTaskComments,
  updateComment,
} from "../api/commentsApi";
import type { Comment } from "./types";

type UseCommentsResult = {
  comments: Comment[];
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  errorMessage: string | null;
  loadComments: () => Promise<void>;
  createCommentAction: (content: string) => Promise<Comment>;
  updateCommentAction: (
    commentId: string,
    content: string,
  ) => Promise<Comment>;
  deleteCommentAction: (commentId: string) => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function validateCommentContent(content: string): string {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Comment content is required");
  }

  return trimmedContent;
}

export function useComments(
  token: string | null,
  projectId: string | null,
  taskId: string | null,
): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const loadComments = useCallback(async () => {
    if (!token || !projectId || !taskId) {
      setComments([]);
      setErrorMessage(null);
      setIsLoadingComments(false);
      return;
    }

    setIsLoadingComments(true);
    setErrorMessage(null);

    try {
      const loadedComments = await getTaskComments(token, projectId, taskId);

      setComments(loadedComments);
    } catch (error) {
      setComments([]);
      setErrorMessage(getErrorMessage(error, "Failed to load comments"));
    } finally {
      setIsLoadingComments(false);
    }
  }, [projectId, taskId, token]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const createCommentAction = useCallback(
    async (content: string) => {
      if (!token || !projectId || !taskId) {
        const message = "Unable to create comment without an active task";
        setErrorMessage(message);
        throw new Error(message);
      }

      let trimmedContent: string;
      try {
        trimmedContent = validateCommentContent(content);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Failed to create comment"));
        throw error;
      }

      setIsSubmittingComment(true);
      setErrorMessage(null);

      try {
        const createdComment = await createComment(token, projectId, taskId, {
          content: trimmedContent,
        });

        setComments((currentComments) => [...currentComments, createdComment]);
        return createdComment;
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Failed to create comment"));
        throw error;
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [projectId, taskId, token],
  );

  const updateCommentAction = useCallback(
    async (commentId: string, content: string) => {
      if (!token || !projectId || !taskId) {
        const message = "Unable to update comment without an active task";
        setErrorMessage(message);
        throw new Error(message);
      }

      let trimmedContent: string;
      try {
        trimmedContent = validateCommentContent(content);
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Failed to update comment"));
        throw error;
      }

      setIsSubmittingComment(true);
      setErrorMessage(null);

      try {
        const updatedComment = await updateComment(
          token,
          projectId,
          taskId,
          commentId,
          { content: trimmedContent },
        );

        setComments((currentComments) =>
          currentComments.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment,
          ),
        );
        return updatedComment;
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Failed to update comment"));
        throw error;
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [projectId, taskId, token],
  );

  const deleteCommentAction = useCallback(
    async (commentId: string) => {
      if (!token || !projectId || !taskId) {
        const message = "Unable to delete comment without an active task";
        setErrorMessage(message);
        throw new Error(message);
      }

      setIsSubmittingComment(true);
      setErrorMessage(null);

      try {
        await deleteComment(token, projectId, taskId, commentId);
        setComments((currentComments) =>
          currentComments.filter((comment) => comment.id !== commentId),
        );
      } catch (error) {
        setErrorMessage(getErrorMessage(error, "Failed to delete comment"));
        throw error;
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [projectId, taskId, token],
  );

  return {
    comments,
    isLoadingComments,
    isSubmittingComment,
    errorMessage,
    loadComments,
    createCommentAction,
    updateCommentAction,
    deleteCommentAction,
    clearError,
  };
}
