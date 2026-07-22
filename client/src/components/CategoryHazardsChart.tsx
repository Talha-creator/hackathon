export interface CategoryHazardStat {
  category: string;
  count: number;
}

interface CategoryHazardsChartProps {
  stats: CategoryHazardStat[];
}

export function CategoryHazardsChart({ stats }: CategoryHazardsChartProps) {
  const max = Math.max(1, ...stats.map((s) => s.count));
  const sorted = [...stats].sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col gap-4">
      {sorted.map(({ category, count }) => {
        const widthPct = Math.max(count > 0 ? 3 : 0, (count / max) * 100);
        return (
          <div key={category}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {category}
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
                {count}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500 dark:bg-indigo-400"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
