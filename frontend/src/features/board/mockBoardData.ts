export type BoardLabel = "Feature" | "Bug" | "Improvement" | "Documentation" | "Task";
export type BoardPriority = "Urgent" | "High" | "Medium" | "Low";

export type BoardTask = {
  id: string;
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

export type BoardColumn = {
  id: string;
  title: string;
  accent: "neutral" | "info" | "blocked" | "warning" | "success";
  wipLimit?: number;
  tasks: BoardTask[];
};

export const sprintSummary = {
  goal: "Improve the core board workflow, task editing, and sprint completion flow before v1.0.",
  totalTasks: 24,
  completed: 16,
  inProgress: 5,
  blocked: 2,
  progress: 67,
};

export const boardColumns: BoardColumn[] = [
  {
    id: "sprint-backlog",
    title: "Sprint Backlog",
    accent: "neutral",
    tasks: [
      {
        id: "task-auth",
        title: "User authentication",
        label: "Feature",
        priority: "High",
        dueDate: "May 20",
        storyPoints: 3,
        comments: 2,
        assignee: "Marta Nowak",
        assigneeTone: "green",
      },
      {
        id: "task-onboarding",
        title: "Design onboarding flow",
        label: "Task",
        priority: "Medium",
        dueDate: "May 21",
        storyPoints: 2,
        comments: 1,
        assignee: "Roman Kroliak",
        assigneeTone: "blue",
      },
      {
        id: "task-api",
        title: "Connect task API",
        label: "Improvement",
        priority: "Low",
        dueDate: "May 22",
        storyPoints: 5,
        comments: 3,
        assignee: "Anna Zielinska",
        assigneeTone: "green",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    accent: "info",
    wipLimit: 4,
    tasks: [
      {
        id: "task-dnd",
        title: "Implement drag and drop",
        label: "Feature",
        priority: "Urgent",
        dueDate: "May 25",
        storyPoints: 5,
        comments: 6,
        assignee: "Roman Kroliak",
        assigneeTone: "green",
      },
      {
        id: "task-modal",
        title: "Create task modal",
        label: "Feature",
        priority: "Medium",
        dueDate: "May 26",
        storyPoints: 8,
        comments: 2,
        assignee: "Pawel Wisniewski",
        assigneeTone: "green",
      },
    ],
  },
  {
    id: "blocked",
    title: "Blocked",
    accent: "blocked",
    wipLimit: 3,
    tasks: [
      {
        id: "task-endpoint",
        title: "Waiting for backend endpoint",
        label: "Bug",
        priority: "Urgent",
        dueDate: "May 26",
        storyPoints: 5,
        comments: 4,
        assignee: "Kasia Lewandowska",
        assigneeTone: "rose",
        blockedReason: "Blocked: waiting for backend endpoint",
      },
      {
        id: "task-validation",
        title: "Fix API validation bug",
        label: "Bug",
        priority: "High",
        dueDate: "May 27",
        storyPoints: 3,
        comments: 2,
        assignee: "Tomasz Kowalski",
        assigneeTone: "rose",
        blockedReason: "Blocked: validation contract unclear",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    accent: "warning",
    wipLimit: 3,
    tasks: [
      {
        id: "task-responsive",
        title: "Review responsive board",
        label: "Improvement",
        priority: "Medium",
        dueDate: "May 27",
        storyPoints: 3,
        comments: 1,
        assignee: "Marta Nowak",
        assigneeTone: "green",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    accent: "success",
    tasks: [
      {
        id: "task-setup",
        title: "Project setup",
        label: "Task",
        priority: "Low",
        dueDate: "May 12",
        storyPoints: 1,
        comments: 0,
        assignee: "Roman Kroliak",
        assigneeTone: "green",
      },
      {
        id: "task-tokens",
        title: "Design tokens",
        label: "Documentation",
        priority: "Low",
        dueDate: "May 13",
        storyPoints: 2,
        comments: 1,
        assignee: "Anna Zielinska",
        assigneeTone: "green",
      },
      {
        id: "task-sidebar",
        title: "Sidebar layout",
        label: "Feature",
        priority: "Medium",
        dueDate: "May 15",
        storyPoints: 3,
        comments: 2,
        assignee: "Roman Kroliak",
        assigneeTone: "green",
      },
    ],
  },
];
