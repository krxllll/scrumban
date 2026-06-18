import { useDraggable } from "@dnd-kit/core";
import { CalendarDays, MessageCircle } from "lucide-react";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Badge } from "../../../shared/components/ui/Badge";
import { cn } from "../../../shared/utils/cn";
import type {
  BoardLabel,
  BoardPriority,
  BoardTaskViewModel,
} from "../model/types.ts";

type TaskCardProps = {
  task: BoardTaskViewModel;
  isDragging?: boolean;
  isMoveDisabled?: boolean;
};

type TaskCardPreviewProps = {
  task: BoardTaskViewModel;
};

type TaskCardShellProps = TaskCardPreviewProps & {
  className?: string;
};

const labelTones: Record<BoardLabel, "accent" | "info" | "warning" | "error" | "muted"> = {
  Feature: "accent",
  Bug: "error",
  Improvement: "info",
  Documentation: "warning",
  Task: "muted",
};

const priorityTones: Record<BoardPriority, "warning" | "error" | "muted"> = {
  Urgent: "error",
  High: "warning",
  Medium: "muted",
  Low: "muted",
};

function TaskCardContent({ task }: TaskCardPreviewProps) {
  return (
    <>
      <div className="flex items-start gap-2">
        <h3 className="flex-1 text-sm font-semibold text-text-primary">{task.title}</h3>
        <Avatar className="h-6 w-6 text-[10px]" name={task.assignee} tone={task.assigneeTone} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={labelTones[task.label]}>{task.label}</Badge>
        <Badge tone={priorityTones[task.priority]}>{task.priority}</Badge>
      </div>

      <div className="mt-3 flex items-center justify-around text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} />
          {task.dueDate}
        </span>
        <span>{task.storyPoints} pts</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={12} />
          {task.comments}
        </span>
      </div>
    </>
  );
}

function TaskCardShell({ className, task }: TaskCardShellProps) {
  const blocked = Boolean(task.blockedReason);

  return (
    <article
      className={cn(
        "rounded-2xl glass-panel p-3.5",
        blocked && "border-error/40 bg-error/[0.08]",
        className,
      )}
    >
      <TaskCardContent task={task} />
    </article>
  );
}

export function TaskCardDragPreview({ task }: TaskCardPreviewProps) {
  return <TaskCardShell className="shadow-2xl" task={task} />;
}

export function TaskCard({
  isDragging = false,
  isMoveDisabled = false,
  task,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
    data: {
      columnId: task.columnId,
    },
    disabled: isMoveDisabled,
  });

  return (
    <div
      className={cn(
        "touch-none transition-opacity",
        isDragging && "opacity-0",
        !isMoveDisabled && "cursor-grab active:cursor-grabbing",
      )}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <TaskCardShell task={task} />
    </div>
  );
}
