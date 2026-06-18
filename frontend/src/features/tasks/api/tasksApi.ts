import { api } from "../../../shared/lib/apiClient";
import type {
  CreateTaskRequest,
  MoveTaskRequest,
  Task,
  UpdateTaskRequest,
} from "../model/types.ts";

type DeleteResponse = {
  deleted: boolean;
};

export function getTasks(token: string, projectId: string): Promise<Task[]> {
  return api.get<Task[]>(`/api/projects/${projectId}/tasks`, { token });
}

export function createTask(
  token: string,
  projectId: string,
  payload: CreateTaskRequest,
): Promise<Task> {
  return api.post<Task>(`/api/projects/${projectId}/tasks`, payload, {
    token,
  });
}

export function getTask(
  token: string,
  projectId: string,
  taskId: string,
): Promise<Task> {
  return api.get<Task>(`/api/projects/${projectId}/tasks/${taskId}`, {
    token,
  });
}

export function updateTask(
  token: string,
  projectId: string,
  taskId: string,
  payload: UpdateTaskRequest,
): Promise<Task> {
  return api.put<Task>(
    `/api/projects/${projectId}/tasks/${taskId}`,
    payload,
    { token },
  );
}

export function moveTask(
  token: string,
  projectId: string,
  taskId: string,
  payload: MoveTaskRequest,
): Promise<Task> {
  return api.patch<Task>(
    `/api/projects/${projectId}/tasks/${taskId}/move`,
    payload,
    { token },
  );
}

export function deleteTask(
  token: string,
  projectId: string,
  taskId: string,
): Promise<DeleteResponse> {
  return api.del<DeleteResponse>(`/api/projects/${projectId}/tasks/${taskId}`, {
    token,
  });
}

export const tasksApi = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
};
