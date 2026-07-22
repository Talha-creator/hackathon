import { CheckCircle2, Download, ShieldAlert } from "lucide-react";
import type { ComplianceReport } from "../utils/complianceReport";
import { downloadCompliancePdf } from "../utils/generateCompliancePdf";

interface ComplianceReportCardProps {
  report: ComplianceReport;
}

export function ComplianceReportCard({ report }: ComplianceReportCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Compliance Report
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            A site-manager-ready summary, ready to share.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadCompliancePdf(report)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF Report
        </button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-lg font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          {report.overallPercentage}%
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Overall site security
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Checklist pass rate across all questionnaire items
          </p>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
        <ShieldAlert className="h-4 w-4" />
        Action Needed
      </div>
      {report.actionItems.length > 0 ? (
        <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-4 py-2.5">Section</th>
                <th className="px-4 py-2.5">Item</th>
              </tr>
            </thead>
            <tbody>
              {report.actionItems.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-100 align-top dark:border-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-gray-600 dark:text-gray-300">
                    {item.section}
                  </td>
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                    {item.question} — <span className="text-red-600 dark:text-red-400">action needed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-xs text-gray-400 dark:text-gray-500">None</p>
      )}

      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        No Action Needed
      </div>
      {report.passedItems.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {report.passedItems.map((item, index) => (
            <li key={index} className="text-xs text-gray-600 dark:text-gray-300">
              {item.question} — <span className="text-emerald-600 dark:text-emerald-400">passed</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500">None</p>
      )}
    </div>
  );
}
