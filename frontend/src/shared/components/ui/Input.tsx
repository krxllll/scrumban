import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 rounded-xl border border-glass-border bg-background/40 px-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-accent/50",
        className,
      )}
      {...props}
    />
  );
}
