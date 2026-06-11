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
    <section className="glass-panel flex flex-wrap items-center gap-6 rounded-3xl p-4">
      <div className="min-w-[320px] flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Sprint goal</p>
        <p className="mt-2 max-w-[560px] text-sm font-medium leading-5 text-text-primary">{sprintSummary.goal}</p>
      </div>
      <div className="flex items-center gap-5 shrink-0">
          <div className="flex gap-5">
              {stats.map((stat) => (
                  <div className="w-16" key={stat.label}>
                      <p className="text-2xl font-bold leading-7 text-text-primary text-center">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-text-secondary text-center">{stat.label}</p>
                  </div>
              ))}
          </div>
          <div className="w-[124px]">
              <ProgressBar value={sprintSummary.progress}/>
              <p className="mt-2 text-sm font-semibold text-accent text-center">{sprintSummary.progress}%</p>
          </div>
      </div>
    </section>
  );
}
