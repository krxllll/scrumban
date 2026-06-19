import type { Project } from "./types";

export function createProjectSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createProjectRouteSlug(project: Project): string {
  return createProjectSlug(project.name) || `project-${project.id}`;
}

export function createProjectBoardPath(project: Project): string {
  return `/projects/${createProjectRouteSlug(project)}`;
}

export function createProjectSettingsPath(project: Project): string {
  return `/projects/${createProjectRouteSlug(project)}/settings`;
}
