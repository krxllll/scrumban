import { cn } from "../../utils/cn";

type AvatarProps = {
  name: string;
  className?: string;
  tone?: "green" | "blue" | "amber" | "rose";
};

const tones = {
  green: "from-accent to-success text-background",
  blue: "from-info to-cyan-500 text-background",
  amber: "from-warning to-orange-500 text-background",
  rose: "from-error to-pink-500 text-white",
};

export function Avatar({ name, className, tone = "green" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold",
        tones[tone],
        className,
      )}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
