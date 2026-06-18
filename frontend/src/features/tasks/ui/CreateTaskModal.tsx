import { X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { BoardColumnViewModel } from "../../board/model/types";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { cn } from "../../../shared/utils/cn";
import type { CreateTaskRequest, TaskPriority } from "../model/types";

type CreateTaskModalProps = {
  columns: BoardColumnViewModel[];
  errorMessage: string | null;
  initialColumnId: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskRequest) => Promise<void>;
};

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

function getInitialColumnId(
  columns: BoardColumnViewModel[],
  initialColumnId: string | null,
): string {
  return columns.some((column) => column.id === initialColumnId)
    ? initialColumnId ?? ""
    : columns[0]?.id ?? "";
}

export function CreateTaskModal({
  columns,
  errorMessage,
  initialColumnId,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateTaskModalProps) {
  const selectedInitialColumnId = useMemo(
    () => getInitialColumnId(columns, initialColumnId),
    [columns, initialColumnId],
  );
  const [title, setTitle] = useState("");
  const [columnId, setColumnId] = useState(selectedInitialColumnId);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle("");
    setColumnId(selectedInitialColumnId);
    setPriority("MEDIUM");
    setDescription("");
    setDueDate("");
    setStoryPoints("");
    setValidationMessage(null);
  }, [isOpen, selectedInitialColumnId]);

  if (!isOpen) {
    return null;
  }

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

  const visibleErrorMessage = validationMessage ?? errorMessage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/65 px-4 backdrop-blur-sm">
      <form
        className="glass-panel w-full max-w-[500px] rounded-[22px] border-glass-border bg-[#111B2A]/95 p-5 shadow-[0_28px_120px_rgba(0,0,0,0.55)]"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-text-primary">Create task</h2>
          <button
            aria-label="Close create task modal"
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-text-primary"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

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
                className="mt-2 h-10 w-full rounded-xl border border-glass-border bg-background/40 px-3 text-sm text-text-primary outline-none focus:border-accent/50"
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

        <div className="mt-5 flex justify-end gap-2">
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
            {isSubmitting ? "Creating..." : "Create task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
