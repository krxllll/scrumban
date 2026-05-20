type WipIndicatorProps = {
  count: number;
  limit?: number;
};

export function WipIndicator({ count, limit }: WipIndicatorProps) {
  return <span className="text-[11px] font-medium text-text-secondary">WIP: {limit ? `${count}/${limit}` : "—"}</span>;
}
