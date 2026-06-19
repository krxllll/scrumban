import { useCallback, useState } from "react";
import { createTask, deleteTask, updateTask } from "../api/tasksApi";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "./types";

type UseTaskActionsResult = {
  isSubmittingTask: boolean;
  errorMessage: string | null;
  clearError: () => void;
  createTaskAction: (
    projectId: string,
    payload: CreateTaskRequest,
  ) => Promise<Task>;
  updateTaskAction: (
    projectId: string,
    taskId: string,
    payload: UpdateTaskRequest,
  ) => Promise<Task>;
  deleteTaskAction: (projectId: string, taskId: string) => Promise<void>;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export function useTaskActions(token: string | null): UseTaskActionsResult {
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
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

      setIsSubmittingTask(true);
      setErrorMessage(null);

      try {
        return await createTask(token, projectId, payload);
      } catch (error) {
        const message = getErrorMessage(error, "Failed to create task");

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSubmittingTask(false);
      }
    },
    [token],
  );

  const updateTaskAction = useCallback(
    async (projectId: string, taskId: string, payload: UpdateTaskRequest) => {
      if (!token) {
        const message = "Unable to update task without an active session";
        setErrorMessage(message);
        throw new Error(message);
      }

      setIsSubmittingTask(true);
      setErrorMessage(null);

      try {
        return await updateTask(token, projectId, taskId, payload);
      } catch (error) {
        const message = getErrorMessage(error, "Failed to update task");

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSubmittingTask(false);
      }
    },
    [token],
  );

  const deleteTaskAction = useCallback(
    async (projectId: string, taskId: string) => {
      if (!token) {
        const message = "Unable to delete task without an active session";
        setErrorMessage(message);
        throw new Error(message);
      }

      setIsSubmittingTask(true);
      setErrorMessage(null);

      try {
        await deleteTask(token, projectId, taskId);
      } catch (error) {
        const message = getErrorMessage(error, "Failed to delete task");

        setErrorMessage(message);
        throw error;
      } finally {
        setIsSubmittingTask(false);
      }
    },
    [token],
  );

  return {
    isSubmittingTask,
    errorMessage,
    clearError,
    createTaskAction,
    updateTaskAction,
    deleteTaskAction,
  };
}
