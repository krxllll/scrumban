import { Plus } from "lucide-react";

export function AddTaskButton() {
  return (
    <button
      className="glass-panel flex h-9 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-text-primary transition-colors hover:bg-white/[0.09]"
      type="button"
    >
      <Plus size={14} />
      Add task
    </button>
  );
}
