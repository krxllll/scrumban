import { CalendarDays, MessageCircle, ShieldAlert } from "lucide-react";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Badge } from "../../../shared/components/ui/Badge";
import { cn } from "../../../shared/utils/cn";
import type { BoardLabel, BoardPriority, BoardTask } from "../mockBoardData";

type TaskCardProps = {
  task: BoardTask;
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

export function TaskCard({ task }: TaskCardProps) {
  const blocked = Boolean(task.blockedReason);

  return (
    <article
      className={cn(
        "rounded-2xl border border-glass-border bg-white/[0.07] p-3.5 shadow-card",
        blocked && "border-error/40 bg-error/[0.08]",
      )}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-h-8 flex-1 text-[13px] font-semibold leading-4 text-text-primary">{task.title}</h3>
        <Avatar className="h-6 w-6 text-[10px]" name={task.assignee} tone={task.assigneeTone} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={labelTones[task.label]}>{task.label}</Badge>
        <Badge tone={priorityTones[task.priority]}>{task.priority}</Badge>
      </div>

      {task.blockedReason ? (
        <p className="mt-3 flex items-center gap-1.5 truncate text-[11px] font-medium text-error">
          <ShieldAlert size={12} />
          {task.blockedReason}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-3 text-[11px] text-text-secondary">
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
