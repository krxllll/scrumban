import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-accent text-background shadow-[0_0_24px_rgba(124,224,127,0.18)]",
  secondary: "border border-glass-border bg-white/[0.06] text-text-primary",
  ghost: "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary",
};

export function Button({ children, className, variant = "secondary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
