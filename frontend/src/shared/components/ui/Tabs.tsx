import { cn } from "../../utils/cn";

type TabItem = {
  label: string;
  icon?: string;
  active?: boolean;
};

type TabsProps = {
  items: TabItem[];
};

export function Tabs({ items }: TabsProps) {
  return (
    <div className="flex items-center gap-2">
      {items.map((item) => (
        <button
          className={cn(
            "h-9 rounded-xl px-3.5 text-sm font-semibold text-text-primary transition-colors",
            item.active && "border border-accent/20 bg-accent/15 text-accent",
          )}
          key={item.label}
          type="button"
        >
          {item.icon ? <span className="mr-1.5 text-xs">{item.icon}</span> : null}
          {item.label}
        </button>
      ))}
    </div>
  );
}
