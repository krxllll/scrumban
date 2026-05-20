import { Filter, ListFilter, Rows3 } from "lucide-react";
import { BoardContainer } from "../../features/board/components/BoardContainer";
import { SprintSummary } from "../../features/board/components/SprintSummary";
import { AppShell } from "../../shared/components/layout/AppShell";
import { Button } from "../../shared/components/ui/Button";
import { Tabs } from "../../shared/components/ui/Tabs";

const boardTabs = [
  { label: "Board", icon: "▦", active: true },
  { label: "Backlog", icon: "☰" },
  { label: "Sprints", icon: "◴" },
];

export function BoardPage() {
  return (
    <AppShell>
      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Tabs items={boardTabs} />
          <Button className="h-9 text-[13px]" variant="secondary">
            <Filter size={14} />
            Filter
          </Button>
          <Button className="h-9 text-[13px]" variant="secondary">
            <Rows3 size={14} />
            Group: Status
          </Button>
          <Button className="h-9 text-[13px]" variant="secondary">
            <ListFilter size={14} />
            Sort
          </Button>
        </div>

        <SprintSummary />

        <section className="glass-panel min-h-[calc(100vh-322px)] overflow-hidden rounded-[24px] p-3.5">
          <BoardContainer />
        </section>
      </div>
    </AppShell>
  );
}
