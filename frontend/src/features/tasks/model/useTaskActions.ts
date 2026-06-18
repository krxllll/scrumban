import { useCallback, useState } from "react";
import { createTask } from "../api/tasksApi";
import type { CreateTaskRequest, Task } from "./types";

type UseTaskActionsResult = {
  isCreatingTask: boolean;
  errorMessage: string | null;
  clearError: () => void;
  createTaskAction: (
    projectId: string,
    payload: CreateTaskRequest,
  ) => Promise<Task>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to create task";
}

export function useTaskActions(token: string | null): UseTaskActionsResult {
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const createTaskAction = useCallback(
    async (projectId: string, payload: CreateTaskRequest) => {
      if (!token) {
        const message = "Unable to create task without an active session";
        setErrorMessage(message);
        throw new Error(message);
      }

      setIsCreatingTask(true);
      setErrorMessage(null);

      try {
        return await createTask(token, projectId, payload);
      } catch (error) {
        const message = getErrorMessage(error);

        setErrorMessage(message);
        throw error;
      } finally {
        setIsCreatingTask(false);
      }
    },
    [token],
  );

  return {
    isCreatingTask,
    errorMessage,
    clearError,
    createTaskAction,
  };
}
