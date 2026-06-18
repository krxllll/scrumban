import { CalendarDays, Filter, KanbanSquare, ListChecks, ListFilter, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { BoardContainer } from "../../features/board/ui/BoardContainer";
import { SprintSummary } from "../../features/board/ui/SprintSummary";
import { mapBoardData } from "../../features/board/model/mapBoardData";
import { useBoardData } from "../../features/board/model/useBoardData";
import { useAuth } from "../../features/auth/model/useAuth";
import { useTaskActions } from "../../features/tasks/model/useTaskActions";
import type { CreateTaskRequest } from "../../features/tasks/model/types";
import { CreateTaskModal } from "../../features/tasks/ui/CreateTaskModal";
import { AppShell } from "../../shared/components/layout/AppShell";
import { Button } from "../../shared/components/ui/Button";
import { Tabs } from "../../shared/components/ui/Tabs";

const boardTabs = [
  { label: "Board", icon: KanbanSquare, active: true },
  { label: "Backlog", icon: ListChecks },
  { label: "Sprints", icon: CalendarDays },
];

type CreateTaskModalState = {
  isOpen: boolean;
  initialColumnId: string | null;
};

export function BoardPage() {
  const { token } = useAuth();
  const {
    columns,
    tasks,
    project,
    isLoading,
    isMovingTask,
    errorMessage,
    refetch,
    moveTaskOnBoard,
  } = useBoardData(token);
  const {
    clearError: clearTaskActionError,
    createTaskAction,
    errorMessage: taskActionErrorMessage,
    isCreatingTask,
  } = useTaskActions(token);
  const [createTaskModal, setCreateTaskModal] = useState<CreateTaskModalState>({
    isOpen: false,
    initialColumnId: null,
  });
  const boardColumns = useMemo(
    () => mapBoardData(columns, tasks),
    [columns, tasks],
  );

  function openCreateTaskModal(initialColumnId: string | null): void {
    clearTaskActionError();
    setCreateTaskModal({
      isOpen: true,
      initialColumnId,
    });
  }

  function closeCreateTaskModal(): void {
    clearTaskActionError();
    setCreateTaskModal({
      isOpen: false,
      initialColumnId: null,
    });
  }

  async function handleCreateTask(payload: CreateTaskRequest): Promise<void> {
    if (!project) {
      return;
    }

    const selectedColumn = boardColumns.find(
      (column) => column.id === payload.columnId,
    );
    const position = selectedColumn?.tasks.length ?? 0;

    await createTaskAction(project.id, {
      ...payload,
      position,
    });
    closeCreateTaskModal();
    await refetch();
  }

  return (
    <AppShell onCreateTask={() => openCreateTaskModal(boardColumns[0]?.id ?? null)}>
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
              onCreateTask={(columnId) => openCreateTaskModal(columnId)}
              onTaskMove={moveTaskOnBoard}
            />
          </>
        )}
      </div>
      <CreateTaskModal
        columns={boardColumns}
        errorMessage={taskActionErrorMessage}
        initialColumnId={createTaskModal.initialColumnId}
        isOpen={createTaskModal.isOpen}
        isSubmitting={isCreatingTask}
        onClose={closeCreateTaskModal}
        onSubmit={handleCreateTask}
      />
    </AppShell>
  );
}
