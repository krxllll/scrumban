import { cn } from "../../../shared/utils/cn";
import type { BoardColumnViewModel } from "../model/types.ts";
import { AddTaskButton } from "./AddTaskButton";
import { TaskCard } from "./TaskCard";
import { WipIndicator } from "./WipIndicator";

type BoardColumnProps = {
  column: BoardColumnViewModel;
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
    <section className="glass-panel flex flex-1 flex-col min-w-[200px] overflow-hidden rounded-[20px]">
      <div className={cn("h-1 w-full shrink-0", accentClasses[column.accent])} />
      <div className="flex items-center justify-between gap-2 px-3.5 pb-3 pt-4">
        <h2 className="text-base font-semibold text-text-primary">{column.title}</h2>
        <WipIndicator count={column.tasks.length} limit={column.wipLimit ?? undefined} />
      </div>

      <div className="flex flex-col gap-2 px-3">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-auto p-3">
        <AddTaskButton />
      </div>
    </section>
  );
}
