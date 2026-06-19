import type { Project } from "../../../features/projects/model/types";
import { cn } from "../../utils/cn";

type ProjectSwitcherProps = {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  onSelectProject?: (projectId: string) => void;
};

export function ProjectSwitcher({
  projects,
  activeProjectId,
  isLoading,
  onSelectProject,
}: ProjectSwitcherProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl px-3 py-2 text-sm font-medium text-text-secondary">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl px-3 py-2 text-sm font-medium text-text-secondary">
        No projects yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {projects.map((project) => {
        const active = project.id === activeProjectId;

        return (
          <button
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-xl px-3 text-left text-sm text-text-secondary transition-colors",
              active && "glass-panel font-semibold text-text-primary",
            )}
            key={project.id}
            onClick={() => onSelectProject?.(project.id)}
            type="button"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full bg-slate-500",
                active && "bg-accent",
              )}
            />
            <span className="truncate">{project.name}</span>
          </button>
        );
      })}
    </div>
  );
}
