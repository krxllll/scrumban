import {
  CalendarDays,
  KanbanSquare,
  ListChecks,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBoardColumn,
  deleteBoardColumn,
  getBoardColumns,
  updateBoardColumn,
} from "../../features/board/api/columnsApi";
import type { BoardColumn } from "../../features/board/model/types";
import { useAuth } from "../../features/auth/model/useAuth";
import {
  createProject,
  updateProject,
} from "../../features/projects/api/projectsApi";
import {
  createProjectBoardPath,
  createProjectRouteSlug,
  createProjectSettingsPath,
} from "../../features/projects/model/projectSlug";
import { useProjectSelection } from "../../features/projects/model/useProjectSelection";
import {
  CreateProjectModal,
  type CreateProjectFormValues,
} from "../../features/projects/ui/CreateProjectModal";
import { AppShell } from "../../shared/components/layout/AppShell";
import { Button } from "../../shared/components/ui/Button";
import { Input } from "../../shared/components/ui/Input";
import { Tabs } from "../../shared/components/ui/Tabs";
import { ApiError } from "../../shared/lib/apiClient";

type ColumnFormValues = {
  name: string;
  wipLimit: number | null;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message.trim()) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function parseWipLimit(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error("WIP limit must be empty or greater than or equal to 0");
  }

  return Math.floor(parsedValue);
}

type ColumnSettingsRowProps = {
  column: BoardColumn;
  isSubmitting: boolean;
  onDelete: (column: BoardColumn) => Promise<void>;
  onSave: (column: BoardColumn, values: ColumnFormValues) => Promise<void>;
};

function ColumnSettingsRow({
  column,
  isSubmitting,
  onDelete,
  onSave,
}: ColumnSettingsRowProps) {
  const [name, setName] = useState(column.name);
  const [wipLimit, setWipLimit] = useState(column.wipLimit?.toString() ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(column.name);
    setWipLimit(column.wipLimit?.toString() ?? "");
    setErrorMessage(null);
  }, [column]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Column name is required");
      return;
    }

    try {
      setErrorMessage(null);
      await onSave(column, {
        name: trimmedName,
        wipLimit: parseWipLimit(wipLimit),
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Could not update column"));
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete column "${column.name}"?`)) {
      return;
    }

    try {
      setErrorMessage(null);
      await onDelete(column);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Could not delete column"));
    }
  }

  return (
    <form
      className="rounded-2xl border border-glass-border bg-white/[0.04] p-4"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto]">
        <label className="block">
          <span className="text-sm font-medium text-text-primary">Name</span>
          <Input
            className="mt-2 w-full"
            disabled={isSubmitting}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-primary">
            WIP limit
          </span>
          <Input
            className="mt-2 w-full"
            disabled={isSubmitting}
            min={0}
            onChange={(event) => setWipLimit(event.target.value)}
            placeholder="None"
            type="number"
            value={wipLimit}
          />
        </label>

        <div className="flex items-end gap-2">
          <Button
            className="min-w-20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
            variant="primary"
          >
            <Save size={14} />
            Save
          </Button>
          <Button
            aria-label={`Delete ${column.name}`}
            className="text-error hover:bg-error/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={handleDelete}
            variant="ghost"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-3 rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

export function SettingsPage() {
  const { token } = useAuth();
  const { projectSlug } = useParams<{ projectSlug?: string }>();
  const navigate = useNavigate();
  const {
    projects,
    selectedProjectId,
    selectedProject,
    isLoadingProjects,
    projectErrorMessage,
    refetchProjects,
    selectProject,
  } = useProjectSelection(token);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [columnErrorMessage, setColumnErrorMessage] = useState<string | null>(
    null,
  );
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectFormError, setProjectFormError] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnWipLimit, setNewColumnWipLimit] = useState("");
  const [newColumnError, setNewColumnError] = useState<string | null>(null);
  const [isSavingColumn, setIsSavingColumn] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [createProjectErrorMessage, setCreateProjectErrorMessage] = useState<
    string | null
  >(null);
  const settingsTabs = useMemo(
    () => [
      { label: "Board", icon: KanbanSquare },
      { label: "Backlog", icon: ListChecks },
      { label: "Sprints", icon: CalendarDays },
      { label: "Settings", icon: Settings, active: true },
    ],
    [],
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

    if (projectSlug !== createProjectRouteSlug(nextProject)) {
      navigate(createProjectSettingsPath(nextProject), { replace: true });
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

  useEffect(() => {
    setProjectName(selectedProject?.name ?? "");
    setProjectDescription(selectedProject?.description ?? "");
    setProjectFormError(null);
  }, [selectedProject]);

  useEffect(() => {
    let ignore = false;

    async function loadColumns() {
      if (!token || !selectedProjectId) {
        setColumns([]);
        setColumnErrorMessage(null);
        setIsLoadingColumns(false);
        return;
      }

      setIsLoadingColumns(true);
      setColumnErrorMessage(null);

      try {
        const loadedColumns = await getBoardColumns(token, selectedProjectId);

        if (!ignore) {
          setColumns(
            [...loadedColumns].sort(
              (left, right) => left.position - right.position,
            ),
          );
        }
      } catch (error) {
        if (!ignore) {
          setColumns([]);
          setColumnErrorMessage(
            getErrorMessage(error, "Could not load board columns"),
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingColumns(false);
        }
      }
    }

    void loadColumns();

    return () => {
      ignore = true;
    };
  }, [selectedProjectId, token]);

  async function refetchColumns(): Promise<void> {
    if (!token || !selectedProjectId) {
      setColumns([]);
      return;
    }

    const loadedColumns = await getBoardColumns(token, selectedProjectId);
    setColumns(
      [...loadedColumns].sort((left, right) => left.position - right.position),
    );
  }

  function handleSelectProject(projectId: string): void {
    const project = projects.find((item) => item.id === projectId);

    selectProject(projectId);

    if (project) {
      navigate(createProjectSettingsPath(project));
    }
  }

  function handleSelectTab(label: string): void {
    if (!selectedProject) {
      return;
    }

    if (label === "Board") {
      navigate(createProjectBoardPath(selectedProject));
      return;
    }

    if (label === "Settings") {
      navigate(createProjectSettingsPath(selectedProject));
    }
  }

  function openCreateProjectModal(): void {
    setCreateProjectErrorMessage(null);
    setIsCreateProjectModalOpen(true);
  }

  function closeCreateProjectModal(): void {
    if (isCreatingProject) {
      return;
    }

    setCreateProjectErrorMessage(null);
    setIsCreateProjectModalOpen(false);
  }

  async function handleCreateProject(
    values: CreateProjectFormValues,
  ): Promise<void> {
    if (!token) {
      setCreateProjectErrorMessage("Unable to create project without signing in");
      return;
    }

    setIsCreatingProject(true);
    setCreateProjectErrorMessage(null);

    try {
      const createdProject = await createProject(token, values);

      await refetchProjects();
      selectProject(createdProject.id);
      navigate(createProjectBoardPath(createdProject));
      setIsCreateProjectModalOpen(false);
    } catch (error) {
      setCreateProjectErrorMessage(
        getErrorMessage(error, "Failed to create project"),
      );
      throw error;
    } finally {
      setIsCreatingProject(false);
    }
  }

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedProject) {
      return;
    }

    const trimmedName = projectName.trim();
    const trimmedDescription = projectDescription.trim();

    if (!trimmedName) {
      setProjectFormError("Project name is required");
      return;
    }

    setIsSavingProject(true);
    setProjectFormError(null);

    try {
      const updatedProject = await updateProject(token, selectedProject.id, {
        name: trimmedName,
        description: trimmedDescription ? trimmedDescription : null,
      });

      await refetchProjects();
      selectProject(updatedProject.id);
      navigate(createProjectSettingsPath(updatedProject), { replace: true });
    } catch (error) {
      setProjectFormError(getErrorMessage(error, "Could not save project"));
    } finally {
      setIsSavingProject(false);
    }
  }

  async function handleCreateColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedProject) {
      return;
    }

    const trimmedName = newColumnName.trim();

    if (!trimmedName) {
      setNewColumnError("Column name is required");
      return;
    }

    setIsSavingColumn(true);
    setNewColumnError(null);

    try {
      await createBoardColumn(token, selectedProject.id, {
        name: trimmedName,
        position: columns.length,
        wipLimit: parseWipLimit(newColumnWipLimit),
      });
      setNewColumnName("");
      setNewColumnWipLimit("");
      await refetchColumns();
    } catch (error) {
      setNewColumnError(getErrorMessage(error, "Could not create column"));
    } finally {
      setIsSavingColumn(false);
    }
  }

  async function handleUpdateColumn(
    column: BoardColumn,
    values: ColumnFormValues,
  ): Promise<void> {
    if (!token || !selectedProject) {
      return;
    }

    setIsSavingColumn(true);

    try {
      await updateBoardColumn(token, selectedProject.id, column.id, {
        name: values.name,
        position: column.position,
        wipLimit: values.wipLimit,
      });
      await refetchColumns();
    } finally {
      setIsSavingColumn(false);
    }
  }

  async function handleDeleteColumn(column: BoardColumn): Promise<void> {
    if (!token || !selectedProject) {
      return;
    }

    setIsSavingColumn(true);

    try {
      await deleteBoardColumn(token, selectedProject.id, column.id);
      await refetchColumns();
    } finally {
      setIsSavingColumn(false);
    }
  }

  return (
    <AppShell
      activeProjectId={selectedProjectId}
      isCreateTaskDisabled
      isLoadingProjects={isLoadingProjects}
      onCreateProject={openCreateProjectModal}
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
          <Tabs items={settingsTabs} onSelect={handleSelectTab} />
        </div>

        {!isLoadingProjects && projectErrorMessage && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-error">
            {projectErrorMessage}
          </div>
        )}

        {!isLoadingProjects && !projectErrorMessage && !selectedProject && (
          <div className="glass-panel flex min-h-[560px] items-center justify-center rounded-[20px] text-sm font-semibold text-text-secondary">
            No projects found
          </div>
        )}

        {selectedProject && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <section className="glass-panel rounded-[20px] p-5">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  Project details
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Update the project name and description.
                </p>
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleSaveProject}>
                <label className="block">
                  <span className="text-sm font-medium text-text-primary">
                    Project name <span className="text-error">*</span>
                  </span>
                  <Input
                    className="mt-2 w-full"
                    disabled={isSavingProject}
                    onChange={(event) => setProjectName(event.target.value)}
                    value={projectName}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-text-primary">
                    Description
                  </span>
                  <textarea
                    className="mt-2 min-h-28 w-full resize-y rounded-xl border border-glass-border bg-background/40 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent/50"
                    disabled={isSavingProject}
                    onChange={(event) =>
                      setProjectDescription(event.target.value)
                    }
                    placeholder="Add description (optional)"
                    value={projectDescription}
                  />
                </label>

                {projectFormError && (
                  <p className="rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
                    {projectFormError}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    className="min-w-32 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSavingProject}
                    type="submit"
                    variant="primary"
                  >
                    {isSavingProject ? "Saving..." : "Save project"}
                  </Button>
                </div>
              </form>
            </section>

            <section className="glass-panel rounded-[20px] p-5">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  Board columns
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Rename columns, set WIP limits, or add a new board stage.
                </p>
              </div>

              <form
                className="mt-5 rounded-2xl border border-glass-border bg-white/[0.04] p-4"
                onSubmit={handleCreateColumn}
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_auto]">
                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">
                      New column
                    </span>
                    <Input
                      className="mt-2 w-full"
                      disabled={isSavingColumn}
                      onChange={(event) => setNewColumnName(event.target.value)}
                      placeholder="Column name"
                      value={newColumnName}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-text-primary">
                      WIP limit
                    </span>
                    <Input
                      className="mt-2 w-full"
                      disabled={isSavingColumn}
                      min={0}
                      onChange={(event) =>
                        setNewColumnWipLimit(event.target.value)
                      }
                      placeholder="None"
                      type="number"
                      value={newColumnWipLimit}
                    />
                  </label>

                  <div className="flex items-end">
                    <Button
                      className="min-w-28 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSavingColumn}
                      type="submit"
                      variant="primary"
                    >
                      <Plus size={14} />
                      Add
                    </Button>
                  </div>
                </div>

                {newColumnError && (
                  <p className="mt-3 rounded-xl border border-error/30 bg-error/[0.08] px-3 py-2 text-sm font-semibold text-error">
                    {newColumnError}
                  </p>
                )}
              </form>

              <div className="mt-4 space-y-3">
                {isLoadingColumns && (
                  <div className="rounded-2xl border border-glass-border bg-white/[0.04] p-4 text-sm font-semibold text-text-secondary">
                    Loading columns...
                  </div>
                )}

                {!isLoadingColumns && columnErrorMessage && (
                  <div className="rounded-2xl border border-error/30 bg-error/[0.08] p-4 text-sm font-semibold text-error">
                    {columnErrorMessage}
                  </div>
                )}

                {!isLoadingColumns &&
                  !columnErrorMessage &&
                  columns.length === 0 && (
                  <div className="rounded-2xl border border-glass-border bg-white/[0.04] p-4 text-sm font-semibold text-text-secondary">
                    No columns yet. Add one above to start using this board.
                  </div>
                )}

                {!isLoadingColumns &&
                  !columnErrorMessage &&
                  columns.map((column) => (
                    <ColumnSettingsRow
                      column={column}
                      isSubmitting={isSavingColumn}
                      key={column.id}
                      onDelete={handleDeleteColumn}
                      onSave={handleUpdateColumn}
                    />
                  ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <CreateProjectModal
        errorMessage={createProjectErrorMessage}
        isOpen={isCreateProjectModalOpen}
        isSubmitting={isCreatingProject}
        onClose={closeCreateProjectModal}
        onSubmit={handleCreateProject}
      />
    </AppShell>
  );
}
