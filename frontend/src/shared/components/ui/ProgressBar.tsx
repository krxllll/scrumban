import { cn } from "../../utils/cn";

type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/12", className)}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}
