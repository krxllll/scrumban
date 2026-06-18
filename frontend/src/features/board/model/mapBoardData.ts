import type { Task, TaskPriority } from "../../tasks/model/types";
import type {
  BoardColumn,
  BoardColumnViewModel,
  BoardPriority,
} from "./types";

function mapPriority(priority: TaskPriority): BoardPriority {
  const priorities: Record<TaskPriority, BoardPriority> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };

  return priorities[priority];
}

function formatDueDate(dueDate?: string | null): string {
  if (!dueDate) {
    return "No date";
  }

  const date = new Date(dueDate);

  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getColumnAccent(
  columnName: string,
  columnIndex: number,
  totalColumns: number,
): BoardColumnViewModel["accent"] {
  const normalizedName = columnName.toLowerCase();

  if (normalizedName.includes("block")) {
    return "blocked";
  }

  if (normalizedName.includes("review")) {
    return "warning";
  }

  if (normalizedName.includes("done") || columnIndex === totalColumns - 1) {
    return "success";
  }

  if (normalizedName.includes("progress")) {
    return "info";
  }

  return columnIndex === 0 ? "neutral" : "info";
}

function getAssigneeTone(
  task: Task,
): BoardColumnViewModel["tasks"][number]["assigneeTone"] {
  const tones: BoardColumnViewModel["tasks"][number]["assigneeTone"][] = [
    "green",
    "blue",
    "amber",
    "rose",
  ];
  const toneSource = task.assigneeId ?? task.reporterId;
  const toneIndex = toneSource.length % tones.length;

  return tones[toneIndex];
}

export function mapBoardData(
  columns: BoardColumn[],
  tasks: Task[],
): BoardColumnViewModel[] {
  const tasksByColumn = tasks.reduce<Record<string, Task[]>>(
    (accumulator, task) => {
      const columnTasks = accumulator[task.columnId] ?? [];

      accumulator[task.columnId] = [...columnTasks, task];

      return accumulator;
    },
    {},
  );

  const sortedColumns = [...columns].sort(
    (left, right) => left.position - right.position,
  );

  return sortedColumns.map((column, columnIndex) => {
    const sortedTasks = [...(tasksByColumn[column.id] ?? [])].sort(
      (left, right) => left.position - right.position,
    );

    return {
      id: column.id,
      title: column.name,
      accent: getColumnAccent(column.name, columnIndex, sortedColumns.length),
      wipLimit: column.wipLimit,
      tasks: sortedTasks.map((task) => ({
        id: task.id,
        columnId: task.columnId,
        title: task.title,
        label: "Task",
        priority: mapPriority(task.priority),
        dueDate: formatDueDate(task.dueDate),
        storyPoints: task.storyPoints ?? 0,
        comments: 0,
        assignee: task.assigneeId ?? "Unassigned",
        assigneeTone: getAssigneeTone(task),
      })),
    };
  });
}
