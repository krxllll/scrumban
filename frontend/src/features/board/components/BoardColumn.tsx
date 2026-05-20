import { Badge } from "../../../shared/components/ui/Badge";
import { cn } from "../../../shared/utils/cn";
import type { BoardColumn as BoardColumnData } from "../mockBoardData";
import { AddTaskButton } from "./AddTaskButton";
import { TaskCard } from "./TaskCard";
import { WipIndicator } from "./WipIndicator";

type BoardColumnProps = {
  column: BoardColumnData;
};

const accentClasses = {
  neutral: "bg-[#8BA3C7]",
  info: "bg-info",
  blocked: "bg-error",
  warning: "bg-warning",
  success: "bg-success",
};

export function BoardColumn({ column }: BoardColumnProps) {
  return (
    <section className="flex w-[206px] shrink-0 flex-col overflow-hidden rounded-[20px] border border-glass-border bg-white/[0.05]">
      <div className={cn("h-1 w-full shrink-0", accentClasses[column.accent])} />
      <div className="flex items-center gap-2 px-3 pb-3 pt-4">
        <h2 className="w-[96px] text-sm font-semibold leading-5 text-text-primary">{column.title}</h2>
        <Badge className="px-2.5" tone="muted">
          {column.tasks.length}
        </Badge>
        <WipIndicator count={column.tasks.length} limit={column.wipLimit} />
      </div>

      <div className="flex flex-col gap-2.5 px-2.5">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-auto p-2.5">
        <AddTaskButton />
      </div>
    </section>
  );
}
