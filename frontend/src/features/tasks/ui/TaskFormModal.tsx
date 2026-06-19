import { ListChecks, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { AuthUser } from "../../auth/model/types";
import type { BoardColumnViewModel } from "../../board/model/types";
import { TaskCommentsPanel } from "../../comments/ui/TaskCommentsPanel";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Tabs } from "../../../shared/components/ui/Tabs";
import { cn } from "../../../shared/utils/cn";
import type { Task, TaskPriority } from "../model/types";

export type TaskFormModalMode = "create" | "edit";

export type TaskFormValues = {
  columnId: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
  storyPoints?: number | null;
  assigneeId?: string | null;
};

type TaskFormModalProps = {
  columns: BoardColumnViewModel[];
  currentUser: AuthUser | null;
  errorMessage: string | null;
  initialColumnId: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  mode: TaskFormModalMode;
  projectId: string | null;
  task?: Task | null;
  token: string | null;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  onTaskCommentsChanged?: () => Promise<void> | void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

type TaskModalTab = "Details" | "Comments";

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

function getInitialColumnId(
  columns: BoardColumnViewModel[],
  initialColumnId: string | null,
  task?: Task | null,
): string {
  const preferredColumnId = task?.columnId ?? initialColumnId;

  return columns.some((column) => column.id === preferredColumnId)
    ? preferredColumnId ?? ""
    : columns[0]?.id ?? "";
}

function formatDateInputValue(dueDate?: string | null): string {
  if (!dueDate) {
    return "";
  }

  return dueDate.slice(0, 10);
}

export function TaskFormModal({
  columns,
  currentUser,
  errorMessage,
  initialColumnId,
  isOpen,
  isSubmitting,
  mode,
  projectId,
  task,
  token,
  onClose,
  onDelete,
  onTaskCommentsChanged,
  onSubmit,
}: TaskFormModalProps) {
  const selectedInitialColumnId = useMemo(
    () => getInitialColumnId(columns, initialColumnId, task),
    [columns, initialColumnId, task],
  );
  const [title, setTitle] = useState("");
  const [columnId, setColumnId] = useState(selectedInitialColumnId);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskModalTab>("Details");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(task?.title ?? "");
    setColumnId(selectedInitialColumnId);
    setPriority(task?.priority ?? "MEDIUM");
    setDescription(task?.description ?? "");
    setDueDate(formatDateInputValue(task?.dueDate));
    setStoryPoints(task?.storyPoints?.toString() ?? "");
    setValidationMessage(null);
    setActiveTab("Details");
  }, [isOpen, selectedInitialColumnId, task]);

  if (!isOpen) {
    return null;
  }

  const isEditMode = mode === "edit";
  const visibleErrorMessage = validationMessage ?? errorMessage;
  const canShowComments = isEditMode && Boolean(task && projectId);
  const modalTabs = [
    { label: "Details", icon: ListChecks, active: activeTab === "Details" },
    ...(canShowComments
      ? [{ label: "Comments", icon: MessageCircle, active: activeTab === "Comments" }]
      : []),
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const parsedStoryPoints = storyPoints === "" ? null : Number(storyPoints);

    if (!trimmedTitle) {
      setValidationMessage("Task title is required");
      return;
    }

    if (!columnId) {
      setValidationMessage("Task column is required");
      return;
    }

    if (
      parsedStoryPoints !== null &&
      (!Number.isFinite(parsedStoryPoints) || parsedStoryPoints < 0)
    ) {
      setValidationMessage("Story points must be empty or greater than or equal to 0");
      return;
    }

    setValidationMessage(null);

    try {
      await onSubmit({
        columnId,
        title: trimmedTitle,
        priority,
        description: trimmedDescription ? trimmedDescription : null,
        dueDate: dueDate || null,
        storyPoints:
          parsedStoryPoints === null ? null : Math.floor(parsedStoryPoints),
        assigneeId: null,
      });
    } catch {
      // The task action hook owns the visible API error message.
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this task?")) {
      return;
    }

    try {
      await onDelete();
    } catch {
      // The task action hook owns the visible API error message.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/65 px-4 backdrop-blur-sm">
      <form
        className="glass-panel w-full max-w-[500px] rounded-[22px] border-glass-border bg-[#111B2A]/95 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.55)]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditMode ? "Edit task" : "Create task"}
          </h2>
          <button
            aria-label={`Close ${isEditMode ? "edit" : "create"} task modal`}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-text-primary"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {isEditMode && canShowComments && (
          <div className="mt-4">
            <Tabs
              items={modalTabs}
              onSelect={(label) => setActiveTab(label as TaskModalTab)}
            />
          </div>
        )}

        {activeTab === "Details" && (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">
                Title <span className="text-error">*</span>
              </span>
              <Input
                className="mt-2 w-full"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter task title"
                required
                value={title}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-text-primary">
                  Column <span className="text-error">*</span>
                </span>
                <select
                  className={cn(
                    "mt-2 h-10 w-full rounded-xl border border-glass-border bg-background/40 px-3 text-sm text-text-primary outline-none focus:border-accent/50",
                    isEditMode && "cursor-not-allowed text-text-secondary",
                  )}
                  disabled={isEditMode}
                  onChange={(event) => setColumnId(event.target.value)}
                  required
                  value={columnId}
                >
                  {columns.map((column) => (
                    <option className="bg-[#111B2A]" key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-primary">
                  Priority <span className="text-error">*</span>
                </span>
                <select
                  className="mt-2 h-10 w-full rounded-xl border border-glass-border bg-background/40 px-3 text-sm text-text-primary outline-none focus:border-accent/50"
                  onChange={(event) => setPriority(event.target.value as TaskPriority)}
                  required
                  value={priority}
                >
                  {priorityOptions.map((option) => (
                    <option className="bg-[#111B2A]" key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Description</span>
              <textarea
                className="mt-2 min-h-20 w-full resize-y rounded-xl border border-glass-border bg-background/40 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent/50"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add description (optional)"
                value={description}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-text-primary">Due date</span>
                <Input
                  className="mt-2 w-full"
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  value={dueDate}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-text-primary">Assignee</span>
                <select
                  className="mt-2 h-10 w-full cursor-not-allowed rounded-xl border border-glass-border bg-background/40 px-3 text-sm text-text-secondary outline-none"
                  disabled
                  value="unassigned"
                >
                  <option value="unassigned">Unassigned</option>
                </select>
              </label>
            </div>

            <label className="block max-w-[112px]">
              <span className="text-sm font-medium text-text-primary">Story points</span>
              <Input
                className="mt-2 w-full"
                min={0}
                onChange={(event) => setStoryPoints(event.target.value)}
                placeholder="0"
                type="number"
                value={storyPoints}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-text-primary">Labels</span>
              <select
                className="mt-2 h-10 w-full cursor-not-allowed rounded-xl border border-glass-border bg-background/40 px-3 text-sm text-text-secondary outline-none"
                disabled
                value="Task"
              >
                <option value="Task">Task</option>
              </select>
            </label>

            {visibleErrorMessage && (
              <p className="rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
                {visibleErrorMessage}
              </p>
            )}
          </div>
        )}

        {activeTab === "Comments" && canShowComments && task && (
          <div className="mt-5">
            <TaskCommentsPanel
              currentUser={currentUser}
              onCommentsChanged={onTaskCommentsChanged}
              projectId={projectId}
              taskId={task.id}
              token={token}
            />
          </div>
        )}

        {activeTab === "Details" && (
          <div className="mt-5 flex items-center justify-between gap-2">
            {isEditMode ? (
              <Button
                className="text-error hover:bg-error/[0.08]"
                disabled={isSubmitting}
                onClick={handleDelete}
                variant="ghost"
              >
                Delete task
              </Button>
            ) : (
              <span />
            )}

            <div className="flex justify-end gap-2">
              <Button
                className="min-w-20"
                disabled={isSubmitting}
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                className={cn("min-w-28", isSubmitting && "opacity-70")}
                disabled={isSubmitting}
                type="submit"
                variant="primary"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Save changes"
                    : "Create task"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
