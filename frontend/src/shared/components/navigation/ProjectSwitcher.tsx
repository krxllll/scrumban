import { cn } from "../../utils/cn";

type ProjectSwitcherProps = {
  projects: string[];
  activeProject: string;
};

export function ProjectSwitcher({ projects, activeProject }: ProjectSwitcherProps) {
  return (
    <div className="flex flex-col gap-2">
      {projects.map((project) => {
        const active = project === activeProject;

        return (
          <button
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-xl px-3 text-left text-sm text-text-secondary transition-colors",
              active && "glass-panel font-semibold text-text-primary",
            )}
            key={project}
            type="button"
          >
            <span className={cn("h-2 w-2 rounded-full bg-slate-500", active && "bg-accent")} />
            <span className="truncate">{project}</span>
          </button>
        );
      })}
    </div>
  );
}
