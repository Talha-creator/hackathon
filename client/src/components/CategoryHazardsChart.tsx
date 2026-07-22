export interface CategoryHazardStat {
  category: string;
  count: number;
}

interface CategoryHazardsChartProps {
  stats: CategoryHazardStat[];
}

const CATEGORY_COLOR_VARS: Record<string, string> = {
  "Access, Egress & Fire Safety": "--cat-1",
  "Housekeeping & Walkways": "--cat-2",
  "People, PPE & Behaviour": "--cat-3",
  "Environment & Equipment": "--cat-4",
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryHazardsChart({ stats }: CategoryHazardsChartProps) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  let offset = 0;

  return (
    <div className="cat-donut flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <style>{`
        .cat-donut {
          --cat-1: #2a78d6;
          --cat-2: #eda100;
          --cat-3: #e87ba4;
          --cat-4: #008300;
        }
        @media (prefers-color-scheme: dark) {
          .cat-donut {
            --cat-1: #3987e5;
            --cat-2: #c98500;
            --cat-3: #d55181;
            --cat-4: #008300;
          }
        }
      `}</style>
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            className="text-gray-100 dark:text-white/5"
          />
          {total > 0 &&
            stats.map((stat) => {
              if (stat.count === 0) return null;
              const length = (stat.count / total) * CIRCUMFERENCE;
              const dashoffset = -offset;
              offset += length;
              return (
                <circle
                  key={stat.category}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={`var(${CATEGORY_COLOR_VARS[stat.category] ?? "--cat-1"})`}
                  strokeWidth="14"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="butt"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{total}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">hazards</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {stats.map((stat) => (
          <div key={stat.category} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: `var(${CATEGORY_COLOR_VARS[stat.category] ?? "--cat-1"})` }}
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">{stat.category}</span>
            <span className="tabular-nums text-gray-500 dark:text-gray-400">{stat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
