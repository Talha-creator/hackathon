import type { FindingSeverity } from "../types/audit.types";
import { SEVERITY_ORDER } from "../utils/severity";

interface SeverityDoughnutChartProps {
  counts: Record<FindingSeverity, number>;
}

const SEVERITY_HEX: Record<FindingSeverity, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
};

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SeverityDoughnutChart({ counts }: SeverityDoughnutChartProps) {
  const total = SEVERITY_ORDER.reduce((sum, s) => sum + counts[s], 0);
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
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
            SEVERITY_ORDER.map((severity) => {
              const count = counts[severity];
              if (count === 0) return null;
              const length = (count / total) * CIRCUMFERENCE;
              const dashoffset = -offset;
              offset += length;
              return (
                <circle
                  key={severity}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={SEVERITY_HEX[severity]}
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
          <span className="text-xs text-gray-500 dark:text-gray-400">findings</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {SEVERITY_ORDER.map((severity) => (
          <div key={severity} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: SEVERITY_HEX[severity] }}
            />
            <span className="font-medium text-gray-700 dark:text-gray-300">{severity}</span>
            <span className="tabular-nums text-gray-500 dark:text-gray-400">{counts[severity]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
