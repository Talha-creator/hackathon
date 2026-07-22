export interface SectionStat {
  section: string;
  total: number;
  concerns: number;
}

interface SectionComplianceMetersProps {
  stats: SectionStat[];
}

function meterColor(ratio: number): string {
  if (ratio === 0) return "#0ca30c";
  if (ratio < 0.34) return "#fab219";
  if (ratio < 0.67) return "#ec835a";
  return "#d03b3b";
}

export function SectionComplianceMeters({ stats }: SectionComplianceMetersProps) {
  return (
    <div className="flex flex-col gap-4">
      {stats.map(({ section, total, concerns }) => {
        const compliant = total - concerns;
        const ratio = total > 0 ? concerns / total : 0;
        const compliantPct = total > 0 ? (compliant / total) * 100 : 100;

        return (
          <div key={section}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {section}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {compliant}/{total} compliant
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${compliantPct}%`, backgroundColor: meterColor(ratio) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
