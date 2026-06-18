import { CalendarDays, Filter, KanbanSquare, ListChecks, ListFilter, Rows3 } from "lucide-react";
import { useMemo } from "react";
import { BoardContainer } from "../../features/board/components/BoardContainer";
import { SprintSummary } from "../../features/board/components/SprintSummary";
import { mapBoardData } from "../../features/board/model/mapBoardData.ts";
import { useBoardData } from "../../features/board/model/useBoardData.ts";
import { useAuth } from "../../features/auth/model/useAuth.ts";
import { AppShell } from "../../shared/components/layout/AppShell";
import { Button } from "../../shared/components/ui/Button";
import { Tabs } from "../../shared/components/ui/Tabs";

const boardTabs = [
  { label: "Board", icon: KanbanSquare, active: true },
  { label: "Backlog", icon: ListChecks },
  { label: "Sprints", icon: CalendarDays },
];

export function BoardPage() {
  const { token } = useAuth();
  const {
    columns,
    tasks,
    project,
    isLoading,
    isMovingTask,
    errorMessage,
    moveTaskOnBoard,
  } = useBoardData(token);
  const boardColumns = useMemo(
    () => mapBoardData(columns, tasks),
    [columns, tasks],
  );

  return (
    <AppShell>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Tabs items={boardTabs} />
          <div className="flex flex-wrap items-center gap-2.5">
            <Button className="h-9 text-sm" variant="secondary">
              <Filter size={14} />
              Filter
            </Button>
            <Button className="h-9 text-sm" variant="secondary">
              <Rows3 size={14} />
              Group: Status
            </Button>
            <Button className="h-9 text-sm" variant="secondary">
              <ListFilter size={14} />
              Sort
            </Button>
          </div>
        </div>

        <SprintSummary />

        {isLoading && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-text-secondary">
            Loading board...
          </div>
        )}

        {!isLoading && errorMessage && !project && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-error">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && !project && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-text-secondary">
            No projects found
          </div>
        )}

        {!isLoading && project && (
          <>
            {errorMessage && (
              <div className="rounded-xl border border-error/30 bg-error/[0.08] px-4 py-3 text-sm font-semibold text-error">
                {errorMessage}
              </div>
            )}
            <BoardContainer
              columns={boardColumns}
              isMovingTask={isMovingTask}
              onTaskMove={moveTaskOnBoard}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
