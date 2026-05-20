import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "accent" | "info" | "warning" | "error" | "muted" | "success";
};

const tones = {
  accent: "bg-accent/15 text-accent",
  info: "bg-info/15 text-info",
  warning: "bg-warning/15 text-warning",
  error: "bg-error/15 text-error",
  muted: "bg-slate-400/15 text-text-secondary",
  success: "bg-success/15 text-success",
};

export function Badge({ children, className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", tones[tone], className)}
      {...props}
    >
      {children}
    </span>
  );
}
