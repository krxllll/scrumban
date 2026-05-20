import { BarChart3, CalendarDays, KanbanSquare, ListChecks, Plus, Settings } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { ProjectSwitcher } from "../navigation/ProjectSwitcher";
import { cn } from "../../utils/cn";

const navItems = [
  { label: "Board", icon: KanbanSquare, active: true },
  { label: "Backlog", icon: ListChecks },
  { label: "Sprints", icon: CalendarDays },
  { label: "Settings", icon: Settings },
];

const projects = ["Mobile App Redesign", "Website Update", "Research Tracker"];

export function Sidebar() {
  return (
    <aside className="glass-panel relative flex min-h-[calc(100vh-48px)] w-60 shrink-0 flex-col rounded-[28px] px-[18px] pb-[18px] pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-background shadow-[0_0_26px_rgba(124,224,127,0.26)]">
          <BarChart3 size={18} strokeWidth={2.8} />
        </div>
        <div>
          <p className="text-xl font-bold leading-6">Scrumban</p>
          <p className="mt-1 text-xs text-text-secondary">Plan. Flow. Deliver.</p>
        </div>
      </div>

      <nav className="mt-7 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={cn(
                "flex h-11 items-center gap-3 rounded-[14px] px-3.5 text-sm font-medium text-text-secondary transition-colors",
                item.active && "border border-accent/20 bg-white/12 text-text-primary",
              )}
              key={item.label}
              type="button"
            >
              <Icon className={cn("h-4 w-4", item.active && "text-accent")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <section className="mt-7">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">Projects</p>
          <button className="text-text-secondary transition-colors hover:text-text-primary" type="button" aria-label="Add project">
            <Plus size={14} />
          </button>
        </div>
        <ProjectSwitcher projects={projects} activeProject="Mobile App Redesign" />
      </section>

      <div className="mt-auto flex items-center gap-3 border border-white/[0.08] bg-white/[0.03] px-2 py-1.5">
        <Avatar className="h-8 w-8" name="Roman Kroliak" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary">Roman Kroliak</p>
          <p className="truncate text-xs text-text-secondary">Project owner</p>
        </div>
      </div>
    </aside>
  );
}
