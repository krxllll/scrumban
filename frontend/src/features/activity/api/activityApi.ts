import { api } from "../../../shared/lib/apiClient";
import type { ActivityLog } from "../model/types";

export function getTaskActivityLogs(
  token: string,
  projectId: string,
  taskId: string,
): Promise<ActivityLog[]> {
  return api.get<ActivityLog[]>(
    `/api/projects/${projectId}/tasks/${taskId}/activity`,
    { token },
  );
}

export function getProjectActivityLogs(
  token: string,
  projectId: string,
): Promise<ActivityLog[]> {
  return api.get<ActivityLog[]>(`/api/projects/${projectId}/activity`, {
    token,
  });
}

export const activityApi = {
  getTaskActivityLogs,
  getProjectActivityLogs,
};
