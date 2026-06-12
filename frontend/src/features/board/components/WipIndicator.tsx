import {Badge} from "../../../shared/components/ui/Badge.tsx";

type WipIndicatorProps = {
  count: number;
  limit?: number;
};

export function WipIndicator({ count, limit }: WipIndicatorProps) {
  return (
    <span className="text-sm font-medium text-text-secondary">
      <Badge tone="muted">
        {count}
      </Badge>

      {limit && <span> / {limit}</span>}
    </span>
  );
}
