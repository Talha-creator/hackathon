import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import type {
  AuditFinding,
  AuditQuestion,
  FindingSeverity,
  TimelineEntry,
} from "../types/audit.types";
import { SEVERITY_ORDER, SEVERITY_STYLES } from "../utils/severity";
import { normalizeFinding } from "../utils/findings";
import { downloadCsv, toCsv } from "../utils/csv";

interface FindingsTableProps {
  findings: AuditFinding[];
  timeline: TimelineEntry[];
  questions: AuditQuestion[];
  onEvidenceClick: (timestamp: string) => void;
  auditId?: string;
}

type SeverityFilter = FindingSeverity | "All";

const CSV_HEADERS = [
  "Finding #",
  "Section",
  "Q#",
  "Timestamp / Location",
  "Observation",
  "Severity",
  "Timescale",
  "Recommended Action",
  "Evidence Reference",
  "Notes",
];

export function FindingsTable({
  findings,
  timeline,
  questions,
  onEvidenceClick,
  auditId,
}: FindingsTableProps) {
  const [filter, setFilter] = useState<SeverityFilter>("All");

  const normalized = useMemo(
    () => findings.map((finding) => normalizeFinding(finding, timeline, questions)),
    [findings, timeline, questions],
  );

  const filtered = useMemo(
    () => (filter === "All" ? normalized : normalized.filter((f) => f.severity === filter)),
    [normalized, filter],
  );

  function handleExport() {
    const rows = normalized.map((f) => [
      String(f.findingNumber),
      f.section,
      f.questionRefs.join("; "),
      `${f.timestamp} — ${f.location}`,
      f.observation,
      f.severity,
      f.timescale,
      f.recommendedAction,
      f.evidenceReference,
      f.notes,
    ]);
    downloadCsv(`findings-log-${auditId ?? "export"}.csv`, toCsv(CSV_HEADERS, rows));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {(["All", ...SEVERITY_ORDER] as SeverityFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === option
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-gray-300 text-gray-600 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {option}
              {option !== "All" && (
                <span className="ml-1 opacity-70">
                  ({normalized.filter((f) => f.severity === option).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={normalized.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
        >
          <Download className="h-3.5 w-3.5" />
          Export Findings Log CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No findings in this category.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Timestamp / Location</th>
                <th className="px-4 py-3">Observation</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Timescale</th>
                <th className="px-4 py-3">Recommended Action</th>
                <th className="px-4 py-3">Evidence Reference</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((finding) => (
                <tr
                  key={finding.findingNumber}
                  onClick={() => onEvidenceClick(finding.timestamp)}
                  className="cursor-pointer border-t border-gray-100 align-top transition-colors hover:bg-indigo-50 dark:border-gray-800 dark:hover:bg-indigo-950/30"
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {finding.findingNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{finding.section}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {finding.timestamp}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {finding.location}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    {finding.observation}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[finding.severity]}`}
                    >
                      {finding.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {finding.timescale}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {finding.recommendedAction}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {finding.evidenceReference}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {finding.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
