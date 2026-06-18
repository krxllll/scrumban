import { useCallback, useEffect, useState } from "react";
import { getBoardColumns } from "../api/columnsApi.ts";
import type { BoardColumn } from "./types.ts";
import { getProjects } from "../../projects/api/projectsApi.ts";
import type { Project } from "../../projects/model/types.ts";
import { getTasks, moveTask } from "../../tasks/api/tasksApi.ts";
import type { Task } from "../../tasks/model/types.ts";

type UseBoardDataResult = {
  project: Project | null;
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

export function useBoardData(token: string | null): UseBoardDataResult {
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMovingTask, setIsMovingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBoardData = useCallback(async () => {
    if (!token) {
      setProject(null);
      setColumns([]);
      setTasks([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const projects = await getProjects(token);
      const firstProject = projects[0] ?? null;

      setProject(firstProject);

      if (!firstProject) {
        setColumns([]);
        setTasks([]);
        return;
      }

      const [loadedColumns, loadedTasks] = await Promise.all([
        getBoardColumns(token, firstProject.id),
        getTasks(token, firstProject.id),
      ]);

      setColumns(loadedColumns);
      setTasks(loadedTasks);
    } catch (error) {
      setProject(null);
      setColumns([]);
      setTasks([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadBoardData();
  }, [loadBoardData]);

  const moveTaskOnBoard = useCallback(
    async (taskId: string, columnId: string, position: number) => {
      if (!token || !project) {
        setErrorMessage("Unable to move task without an active project");
        return;
      }

      setIsMovingTask(true);
      setErrorMessage(null);

      try {
        await moveTask(token, project.id, taskId, { columnId, position });
        await loadBoardData();
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsMovingTask(false);
      }
    },
    [loadBoardData, project, token],
  );

  return {
    project,
    columns,
    tasks,
    isLoading,
    isMovingTask,
    errorMessage,
    refetch: loadBoardData,
    moveTaskOnBoard,
  };
}
