import type { ComponentType } from "react";

interface StatTileProps {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "neutral" | "critical" | "good";
}

const ACCENT_STYLES: Record<NonNullable<StatTileProps["accent"]>, string> = {
  neutral: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  critical: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  good: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export function StatTile({ label, value, icon: Icon, accent = "neutral" }: StatTileProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENT_STYLES[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
