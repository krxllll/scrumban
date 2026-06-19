import { CalendarDays, Filter, KanbanSquare, ListChecks, ListFilter, Rows3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BoardContainer } from "../../features/board/ui/BoardContainer";
import { SprintSummary } from "../../features/board/ui/SprintSummary";
import { mapBoardData } from "../../features/board/model/mapBoardData";
import { useBoardData } from "../../features/board/model/useBoardData";
import { useAuth } from "../../features/auth/model/useAuth";
import {
  createProjectBoardPath,
  createProjectRouteSlug,
} from "../../features/projects/model/projectSlug";
import { useProjectSelection } from "../../features/projects/model/useProjectSelection";
import { useTaskActions } from "../../features/tasks/model/useTaskActions";
import type {
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from "../../features/tasks/model/types";
import {
  TaskFormModal,
  type TaskFormModalMode,
  type TaskFormValues,
} from "../../features/tasks/ui/TaskFormModal";
import { AppShell } from "../../shared/components/layout/AppShell";
import { Button } from "../../shared/components/ui/Button";
import { Tabs } from "../../shared/components/ui/Tabs";

const boardTabs = [
  { label: "Board", icon: KanbanSquare, active: true },
  { label: "Backlog", icon: ListChecks },
  { label: "Sprints", icon: CalendarDays },
];

type TaskFormModalState = {
  isOpen: boolean;
  mode: TaskFormModalMode;
  initialColumnId: string | null;
  taskId: string | null;
};

export function BoardPage() {
  const { token, user } = useAuth();
  const { projectSlug } = useParams<{ projectSlug?: string }>();
  const navigate = useNavigate();
  const {
    projects,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    projectErrorMessage,
    selectProject,
  } = useProjectSelection(token);
  const {
    columns,
    tasks,
    isLoading,
    isMovingTask,
    errorMessage,
    refetch,
    moveTaskOnBoard,
  } = useBoardData(token, selectedProjectId);
  const {
    clearError: clearTaskActionError,
    createTaskAction,
    deleteTaskAction,
    errorMessage: taskActionErrorMessage,
    isSubmittingTask,
    updateTaskAction,
  } = useTaskActions(token);
  const [taskFormModal, setTaskFormModal] = useState<TaskFormModalState>({
    isOpen: false,
    mode: "create",
    initialColumnId: null,
    taskId: null,
  });
  const boardColumns = useMemo(
    () => mapBoardData(columns, tasks),
    [columns, tasks],
  );
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === taskFormModal.taskId) ?? null,
    [taskFormModal.taskId, tasks],
  );

  useEffect(() => {
    if (isLoadingProjects || projectErrorMessage || projects.length === 0) {
      return;
    }

    const projectFromSlug = projectSlug
      ? projects.find(
          (project) => createProjectRouteSlug(project) === projectSlug,
        )
      : null;
    const nextProject = projectFromSlug ?? projects[0];

    if (selectedProjectId !== nextProject.id) {
      selectProject(nextProject.id);
    }

    const nextPath = createProjectBoardPath(nextProject);

    if (projectSlug !== createProjectRouteSlug(nextProject)) {
      navigate(nextPath, { replace: true });
    }
  }, [
    isLoadingProjects,
    navigate,
    projectErrorMessage,
    projects,
    projectSlug,
    selectProject,
    selectedProjectId,
  ]);

  function handleSelectProject(projectId: string): void {
    const project = projects.find((item) => item.id === projectId);

    selectProject(projectId);

    if (project) {
      navigate(createProjectBoardPath(project));
    }
  }

  function openCreateTaskModal(initialColumnId: string | null): void {
    clearTaskActionError();
    setTaskFormModal({
      isOpen: true,
      mode: "create",
      initialColumnId,
      taskId: null,
    });
  }

  function openEditTaskModal(taskId: string): void {
    clearTaskActionError();
    setTaskFormModal({
      isOpen: true,
      mode: "edit",
      initialColumnId: null,
      taskId,
    });
  }

  function closeTaskFormModal(): void {
    clearTaskActionError();
    setTaskFormModal({
      isOpen: false,
      mode: "create",
      initialColumnId: null,
      taskId: null,
    });
  }

  async function handleCreateTask(values: TaskFormValues): Promise<void> {
    if (!selectedProject) {
      return;
    }

    const selectedColumn = boardColumns.find(
      (column) => column.id === values.columnId,
    );
    const position = selectedColumn?.tasks.length ?? 0;
    const payload: CreateTaskRequest = {
      columnId: values.columnId,
      title: values.title,
      priority: values.priority,
      description: values.description,
      dueDate: values.dueDate,
      storyPoints: values.storyPoints,
      assigneeId: values.assigneeId,
      position,
    };

    await createTaskAction(selectedProject.id, payload);
    closeTaskFormModal();
    await refetch();
  }

  async function handleUpdateTask(values: TaskFormValues): Promise<void> {
    if (!selectedProject || !selectedTask) {
      return;
    }

    const payload: UpdateTaskRequest = {
      epicId: selectedTask.epicId,
      parentTaskId: selectedTask.parentTaskId,
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate,
      storyPoints: values.storyPoints,
      assigneeId: values.assigneeId,
      position: selectedTask.position,
    };

    await updateTaskAction(selectedProject.id, selectedTask.id, payload);
    closeTaskFormModal();
    await refetch();
  }

  async function handleTaskFormSubmit(values: TaskFormValues): Promise<void> {
    if (taskFormModal.mode === "edit") {
      await handleUpdateTask(values);
      return;
    }

    await handleCreateTask(values);
  }

  async function handleDeleteTask(): Promise<void> {
    if (!selectedProject || !selectedTask) {
      return;
    }

    await deleteTaskAction(selectedProject.id, selectedTask.id);
    closeTaskFormModal();
    await refetch();
  }

  return (
    <AppShell
      activeProjectId={selectedProjectId}
      isLoadingProjects={isLoadingProjects}
      onCreateTask={() => openCreateTaskModal(boardColumns[0]?.id ?? null)}
      onSelectProject={handleSelectProject}
      projectTitle={
        isLoadingProjects
          ? "Loading project..."
          : selectedProject?.name ?? "No project selected"
      }
      projects={projects}
    >
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

        {!isLoadingProjects && projectErrorMessage && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-error">
            {projectErrorMessage}
          </div>
        )}

        {!isLoading &&
          errorMessage &&
          !selectedProject &&
          !projectErrorMessage && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-error">
            {errorMessage}
          </div>
        )}

        {!isLoadingProjects &&
          !isLoading &&
          !projectErrorMessage &&
          !errorMessage &&
          !selectedProject && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-text-secondary">
            No projects found
          </div>
        )}

        {!isLoading && selectedProject && (
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
              onEditTask={openEditTaskModal}
              onTaskMove={moveTaskOnBoard}
            />
          </>
        )}
      </div>
      <TaskFormModal
        columns={boardColumns}
        currentUser={user}
        errorMessage={taskActionErrorMessage}
        initialColumnId={taskFormModal.initialColumnId}
        isOpen={taskFormModal.isOpen}
        isSubmitting={isSubmittingTask}
        mode={taskFormModal.mode}
        onClose={closeTaskFormModal}
        onDelete={taskFormModal.mode === "edit" ? handleDeleteTask : undefined}
        onSubmit={handleTaskFormSubmit}
        onTaskCommentsChanged={refetch}
        projectId={selectedProject?.id ?? null}
        task={selectedTask}
        token={token}
      />
    </AppShell>
  );
}
