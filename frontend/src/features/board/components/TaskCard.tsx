import { CSS } from "@dnd-kit/utilities";
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

export function TaskCard({
  isDragging = false,
  isMoveDisabled = false,
  task,
}: TaskCardProps) {
  const blocked = Boolean(task.blockedReason);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      columnId: task.columnId,
    },
    disabled: isMoveDisabled,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      className={cn(
        "rounded-2xl glass-panel p-3.5 touch-none transition-opacity",
        blocked && "border-error/40 bg-error/[0.08]",
        isDragging && "opacity-60",
        !isMoveDisabled && "cursor-grab active:cursor-grabbing",
      )}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
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
    </article>
  );
}
