import { BarChart3, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/model/useAuth";
import { Avatar } from "../ui/Avatar";
import { ProjectSwitcher } from "../navigation/ProjectSwitcher";
import { Button } from "../ui/Button";

const projects = ["Mobile App Redesign", "Website Update", "Research Tracker"];

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    navigate("/login", { replace: true });
  }

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

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Projects</p>
          <button className="text-text-secondary transition-colors hover:text-text-primary" type="button" aria-label="Add project">
            <Plus size={14} />
          </button>
        </div>
        <ProjectSwitcher projects={projects} activeProject="Mobile App Redesign" />
      </section>

      <div className="mt-auto flex items-center justify-between p-2 pt-4 border-t border-glass-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8" name="Roman Kroliak" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-text-primary">Roman Kroliak</p>
            <p className="truncate text-xs text-text-secondary">Project owner</p>
          </div>
        </div>
        <Button
          aria-label="Log out"
          className="h-[32px]"
          onClick={handleLogout}
          variant="ghost"
        >
          <LogOut size={16} />
        </Button>
      </div>
    </aside>
  );
}
