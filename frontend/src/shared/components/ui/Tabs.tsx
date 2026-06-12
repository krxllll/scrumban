import { cn } from "../../utils/cn";
import { type LucideIcon } from 'lucide-react';

type TabItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type TabsProps = {
  items: TabItem[];
};

export function Tabs({ items }: TabsProps) {
  return (
    <div className="flex items-center gap-2.5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors text-text-primary",
              item.active && "border border-accent/20 bg-accent/15 text-accent",
            )}
            key={item.label}
            type="button"
          >
            <Icon size={16} className={cn(item.active && "text-accent")} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
