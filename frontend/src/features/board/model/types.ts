export type BoardColumn = {
  id: string;
  projectId: string;
  name: string;
  position: number;
  wipLimit?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBoardColumnRequest = {
  name: string;
  position: number;
  wipLimit?: number | null;
};

export type UpdateBoardColumnRequest = {
  name: string;
  position: number;
  wipLimit?: number | null;
};

export type BoardLabel = "Feature" | "Bug" | "Improvement" | "Documentation" | "Task";

export type BoardPriority = "Urgent" | "High" | "Medium" | "Low";

export type BoardTaskViewModel = {
  id: string;
  columnId: string;
  title: string;
  label: BoardLabel;
  priority: BoardPriority;
  dueDate: string;
  storyPoints: number;
  comments: number;
  assignee: string;
  assigneeTone: "green" | "blue" | "amber" | "rose";
  blockedReason?: string;
};

export type BoardColumnViewModel = {
  id: string;
  title: string;
  accent: "neutral" | "info" | "blocked" | "warning" | "success";
  wipLimit?: number | null;
  tasks: BoardTaskViewModel[];
};
