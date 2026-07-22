import type { FindingSeverity } from "../types/audit.types";
import { SEVERITY_ORDER } from "../utils/severity";

interface SeverityBarChartProps {
  counts: Record<FindingSeverity, number>;
}

const SEVERITY_HEX: Record<FindingSeverity, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#3b82f6",
};

export function SeverityBarChart({ counts }: SeverityBarChartProps) {
  const max = Math.max(1, ...SEVERITY_ORDER.map((s) => counts[s]));

  return (
    <div className="flex flex-col gap-3">
      {SEVERITY_ORDER.map((severity) => {
        const count = counts[severity];
        const widthPct = Math.max(count > 0 ? 4 : 0, (count / max) * 100);
        return (
          <div key={severity} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs font-medium text-gray-600 dark:text-gray-400">
              {severity}
            </span>
            <div className="h-4 min-w-0 flex-1 rounded-full bg-gray-100 dark:bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: SEVERITY_HEX[severity] }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
