import { useCallback, useEffect, useRef, useState } from "react";
import { getTasks, moveTask } from "../../tasks/api/tasksApi";
import type { Task } from "../../tasks/model/types";
import { getBoardColumns } from "../api/columnsApi";
import type { BoardColumn } from "./types";

type UseBoardDataResult = {
  columns: BoardColumn[];
  tasks: Task[];
  isLoading: boolean;
  isMovingTask: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  moveTaskOnBoard: (
    taskId: string,
    columnId: string,
    position: number,
  ) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to load board data";
}

export function useBoardData(
  token: string | null,
  projectId: string | null,
): UseBoardDataResult {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadBoardData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!token || !projectId) {
      setColumns([]);
      setTasks([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [loadedColumns, loadedTasks] = await Promise.all([
        getBoardColumns(token, projectId),
        getTasks(token, projectId),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setColumns(loadedColumns);
      setTasks(loadedTasks);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setColumns([]);
      setTasks([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [projectId, token]);

  useEffect(() => {
    void loadBoardData();
  }, [loadBoardData]);

  const moveTaskOnBoard = useCallback(
    async (taskId: string, columnId: string, position: number) => {
      if (!token || !projectId) {
        setErrorMessage("Unable to move task without an active project");
        return;
      }

      setIsMovingTask(true);
      setErrorMessage(null);

      try {
        await moveTask(token, projectId, taskId, { columnId, position });
        await loadBoardData();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsMovingTask(false);
      }
    },
    [loadBoardData, projectId, token],
  );

  return {
    columns,
    tasks,
    isLoading,
    isMovingTask,
    errorMessage,
    refetch: loadBoardData,
    moveTaskOnBoard,
  };
}
