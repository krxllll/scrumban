export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Task = {
  id: string;
  projectId: string;
  columnId: string;
  epicId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
  storyPoints?: number | null;
  assigneeId?: string | null;
  reporterId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskRequest = {
  columnId: string;
  epicId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  storyPoints?: number | null;
  assigneeId?: string | null;
  position?: number;
};

export type UpdateTaskRequest = {
  epicId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  storyPoints?: number | null;
  assigneeId?: string | null;
  position?: number;
};

export type MoveTaskRequest = {
  columnId: string;
  position?: number;
};
