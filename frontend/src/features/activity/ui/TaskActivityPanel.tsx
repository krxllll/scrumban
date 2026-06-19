import { useActivityLogs } from "../model/useActivityLogs";
import type { ActivityLog } from "../model/types";

type TaskActivityPanelProps = {
  token: string | null;
  projectId: string | null;
  taskId: string | null;
};

function formatActivityDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatActivityAction(action: string): string {
  const knownActions: Record<string, string> = {
    TASK_CREATED: "Task created",
    TASK_UPDATED: "Task updated",
    TASK_MOVED: "Task moved",
    TASK_DELETED: "Task deleted",
    COMMENT_CREATED: "Comment added",
  };

  return knownActions[action] ?? titleCase(action.replace(/_/g, " "));
}

function formatActivityDescription(log: ActivityLog): string | null {
  if (log.oldValue && log.newValue) {
    return `${log.oldValue} -> ${log.newValue}`;
  }

  if (log.newValue) {
    return log.newValue;
  }

  return null;
}

export function TaskActivityPanel({
  token,
  projectId,
  taskId,
}: TaskActivityPanelProps) {
  const { activityLogs, errorMessage, isLoadingActivityLogs } = useActivityLogs(
    token,
    {
      type: "task",
      projectId,
      taskId,
    },
  );

  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
      {errorMessage && (
        <p className="rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
          {errorMessage}
        </p>
      )}

      {isLoadingActivityLogs && (
        <p className="rounded-xl border border-glass-border bg-white/[0.03] px-3 py-3 text-sm font-medium text-text-secondary">
          Loading activity...
        </p>
      )}

      {!isLoadingActivityLogs && activityLogs.length === 0 && (
        <p className="rounded-xl border border-glass-border bg-white/[0.03] px-3 py-3 text-sm font-medium text-text-secondary">
          No activity yet
        </p>
      )}

      {!isLoadingActivityLogs &&
        activityLogs.map((log, index) => {
          const description = formatActivityDescription(log);

          return (
            <article className="relative flex gap-3" key={log.id}>
              <div className="flex flex-col items-center pt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_rgba(124,224,127,0.35)]" />
                {index < activityLogs.length - 1 && (
                  <span className="mt-1 h-full min-h-12 w-px bg-glass-border" />
                )}
              </div>

              <div className="glass-panel flex-1 rounded-xl px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {formatActivityAction(log.action)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {log.userId ? "User" : "System"}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-text-secondary">
                    {formatActivityDate(log.createdAt)}
                  </time>
                </div>

                {description && (
                  <p className="mt-2 text-sm leading-5 text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
            </article>
          );
        })}
    </div>
  );
}
