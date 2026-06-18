import { api } from "../../../shared/lib/apiClient";
import type { CreateProjectRequest, Project } from "../model/types";

export function getProjects(token: string): Promise<Project[]> {
  return api.get<Project[]>("/api/projects", { token });
}

export function createProject(
  token: string,
  payload: CreateProjectRequest,
): Promise<Project> {
  return api.post<Project>("/api/projects", payload, { token });
}

export function getProject(
  token: string,
  projectId: string,
): Promise<Project> {
  return api.get<Project>(`/api/projects/${projectId}`, { token });
}

export const projectsApi = {
  getProjects,
  createProject,
  getProject,
};
