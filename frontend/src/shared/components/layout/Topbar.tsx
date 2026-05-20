import { Plus, Search } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { UserMenu } from "../navigation/UserMenu";

export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate text-[28px] font-bold leading-9 text-text-primary">Mobile App Redesign</h1>
        <Badge className="shrink-0" tone="accent">
          Sprint 5 · Active
        </Badge>
      </div>

      <label className="relative hidden w-[190px] xl:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input className="h-[38px] pl-9 text-[13px]" placeholder="Search tasks..." />
      </label>

      <Button className="h-[34px] px-3.5 text-[13px]" variant="primary">
        <Plus size={15} />
        Create task
      </Button>
      <UserMenu />
    </header>
  );
}
