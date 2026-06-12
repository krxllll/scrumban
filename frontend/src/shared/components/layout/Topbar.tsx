import { Plus, Search } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { UserMenu } from "../navigation/UserMenu";

export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3">
      <div className="flex min-w-0 flex-1 items-end gap-3">
        <h1 className="truncate text-3xl font-bold text-text-primary">Mobile App Redesign</h1>
        <Badge className="shrink-0 text-sm" tone="accent">
          Sprint 5 · Active
        </Badge>
      </div>

      <label className="relative hidden xl:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input className="pl-9 text-sm" placeholder="Search tasks..." />
      </label>

      <Button className="px-3.5 text-sm" variant="primary">
        <Plus size={16} />
        Create task
      </Button>
      <UserMenu />
    </header>
  );
}
