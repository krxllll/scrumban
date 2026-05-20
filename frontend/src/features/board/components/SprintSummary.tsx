import { ProgressBar } from "../../../shared/components/ui/ProgressBar";
import { sprintSummary } from "../mockBoardData";

const stats = [
  { label: "Total tasks", value: sprintSummary.totalTasks },
  { label: "Completed", value: sprintSummary.completed },
  { label: "In progress", value: sprintSummary.inProgress },
  { label: "Blocked", value: sprintSummary.blocked },
];

export function SprintSummary() {
  return (
    <section className="glass-panel flex min-h-24 items-center gap-6 rounded-[22px] px-5 py-4">
      <div className="min-w-[360px] flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">Sprint goal</p>
        <p className="mt-2 max-w-[560px] text-sm font-medium leading-5 text-text-primary">{sprintSummary.goal}</p>
      </div>
      <div className="flex shrink-0 gap-5">
        {stats.map((stat) => (
          <div className="w-[78px]" key={stat.label}>
            <p className="text-[22px] font-bold leading-7 text-text-primary">{stat.value}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="w-[124px] shrink-0">
        <ProgressBar value={sprintSummary.progress} />
        <p className="mt-2 text-sm font-semibold text-accent">{sprintSummary.progress}%</p>
      </div>
    </section>
  );
}
