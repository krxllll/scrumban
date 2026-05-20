import { Plus } from "lucide-react";

export function AddTaskButton() {
  return (
    <button
      className="flex h-9 w-full items-center gap-2 rounded-xl border border-glass-border bg-white/[0.06] px-3.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/[0.09]"
      type="button"
    >
      <Plus size={15} />
      Add task
    </button>
  );
}
