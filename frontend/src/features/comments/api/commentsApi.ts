import { api } from "../../../shared/lib/apiClient";
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "../model/types";

type DeleteResponse = {
  deleted: boolean;
};

export function getTaskComments(
  token: string,
  projectId: string,
  taskId: string,
): Promise<Comment[]> {
  return api.get<Comment[]>(
    `/api/projects/${projectId}/tasks/${taskId}/comments`,
    { token },
  );
}

export function createComment(
  token: string,
  projectId: string,
  taskId: string,
  payload: CreateCommentRequest,
): Promise<Comment> {
  return api.post<Comment>(
    `/api/projects/${projectId}/tasks/${taskId}/comments`,
    payload,
    { token },
  );
}

export function updateComment(
  token: string,
  projectId: string,
  taskId: string,
  commentId: string,
  payload: UpdateCommentRequest,
): Promise<Comment> {
  return api.put<Comment>(
    `/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    payload,
    { token },
  );
}

export function deleteComment(
  token: string,
  projectId: string,
  taskId: string,
  commentId: string,
): Promise<DeleteResponse> {
  return api.del<DeleteResponse>(
    `/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    { token },
  );
}

export const commentsApi = {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
};
