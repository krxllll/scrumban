import { useCallback, useEffect, useState } from "react";
import {
  getProjectActivityLogs,
  getTaskActivityLogs,
} from "../api/activityApi";
import type { ActivityLog } from "./types";

export type ActivityScope =
  | { type: "task"; projectId: string | null; taskId: string | null }
  | { type: "project"; projectId: string | null };

type UseActivityLogsResult = {
  activityLogs: ActivityLog[];
  isLoadingActivityLogs: boolean;
  errorMessage: string | null;
  loadActivityLogs: () => Promise<void>;
  clearError: () => void;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function useActivityLogs(
  token: string | null,
  scope: ActivityScope,
): UseActivityLogsResult {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingActivityLogs, setIsLoadingActivityLogs] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scopeType = scope.type;
  const projectId = scope.projectId;
  const taskId = scope.type === "task" ? scope.taskId : null;

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const loadActivityLogs = useCallback(async () => {
    if (!token || !projectId) {
      setActivityLogs([]);
      setErrorMessage(null);
      setIsLoadingActivityLogs(false);
      return;
    }

    if (scopeType === "task" && !taskId) {
      setActivityLogs([]);
      setErrorMessage(null);
      setIsLoadingActivityLogs(false);
      return;
    }

    setIsLoadingActivityLogs(true);
    setErrorMessage(null);

    try {
      let loadedActivityLogs: ActivityLog[];

      if (scopeType === "task") {
        const activeTaskId = taskId;

        if (!activeTaskId) {
          setActivityLogs([]);
          return;
        }

        loadedActivityLogs = await getTaskActivityLogs(
          token,
          projectId,
          activeTaskId,
        );
      } else {
        loadedActivityLogs = await getProjectActivityLogs(token, projectId);
      }

      setActivityLogs(loadedActivityLogs);
    } catch (error) {
      setActivityLogs([]);
      setErrorMessage(getErrorMessage(error, "Failed to load activity logs"));
    } finally {
      setIsLoadingActivityLogs(false);
    }
  }, [projectId, scopeType, taskId, token]);

  useEffect(() => {
    void loadActivityLogs();
  }, [loadActivityLogs]);

  return {
    activityLogs,
    isLoadingActivityLogs,
    errorMessage,
    loadActivityLogs,
    clearError,
  };
}
