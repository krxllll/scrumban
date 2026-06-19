import { useCallback, useEffect, useMemo, useState } from "react";
import { getProjects } from "../api/projectsApi";
import type { Project } from "./types";

type UseProjectSelectionResult = {
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  isLoadingProjects: boolean;
  projectErrorMessage: string | null;
  selectProject: (projectId: string) => void;
  refetchProjects: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to load projects";
}

export function useProjectSelection(
  token: string | null,
): UseProjectSelectionResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectErrorMessage, setProjectErrorMessage] = useState<string | null>(
    null,
  );

  const loadProjects = useCallback(async () => {
    if (!token) {
      setProjects([]);
      setSelectedProjectId(null);
      setProjectErrorMessage(null);
      setIsLoadingProjects(false);
      return;
    }

    setIsLoadingProjects(true);
    setProjectErrorMessage(null);

    try {
      const loadedProjects = await getProjects(token);

      setProjects(loadedProjects);
      setSelectedProjectId((currentProjectId) => {
        const currentProjectStillExists = loadedProjects.some(
          (project) => project.id === currentProjectId,
        );

        if (currentProjectStillExists) {
          return currentProjectId;
        }

        return loadedProjects[0]?.id ?? null;
      });
    } catch (error) {
      setProjects([]);
      setSelectedProjectId(null);
      setProjectErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingProjects(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const selectedProject = useMemo(
    () =>
      projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  return {
    projects,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    projectErrorMessage,
    selectProject: setSelectedProjectId,
    refetchProjects: loadProjects,
  };
}
