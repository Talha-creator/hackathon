import { useEffect, useMemo, useState } from "react";
import { AlertOctagon, Building2, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuditResult, listAudits } from "../services/api";
import type { AuditListItem, NormalizedAuditResult } from "../types/audit.types";
import { StatTile } from "../components/StatTile";
import { CategoryHazardsChart, type CategoryHazardStat } from "../components/CategoryHazardsChart";
import { isConcern } from "../utils/severity";

const HAZARD_CATEGORIES = [
  "Access, Egress & Fire Safety",
  "Housekeeping & Walkways",
  "People, PPE & Behaviour",
  "Environment & Equipment",
];

const LEAST_SECURE_LIMIT = 3;

function securityBadgeClass(percentage: number): string {
  if (percentage >= 70) {
    return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (percentage >= 40) {
    return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
  }
  return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
}

function Dashboard() {
  const [audits, setAudits] = useState<AuditListItem[] | null>(null);
  const [results, setResults] = useState<NormalizedAuditResult[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    listAudits()
      .then(async (items) => {
        setAudits(items);
        const records = await Promise.all(
          items.map((item) => getAuditResult(item.auditId).catch(() => null)),
        );
        setResults(
          records
            .map((record) => record?.result)
            .filter((result): result is NormalizedAuditResult => Boolean(result)),
        );
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  const totalHazards = useMemo(
    () => results.reduce((sum, result) => sum + result.findings.length, 0),
    [results],
  );

  const totalSites = useMemo(() => {
    if (!audits) return 0;
    return new Set(audits.map((audit) => audit.siteName || audit.auditId)).size;
  }, [audits]);

  const categoryStats: CategoryHazardStat[] = useMemo(() => {
    const counts = new Map(HAZARD_CATEGORIES.map((category) => [category, 0]));
    for (const result of results) {
      for (const finding of result.findings) {
        counts.set(finding.section, (counts.get(finding.section) ?? 0) + 1);
      }
    }
    return HAZARD_CATEGORIES.map((category) => ({ category, count: counts.get(category) ?? 0 }));
  }, [results]);

  const leastSecureSites = useMemo(() => {
    return results
      .map((result) => {
        const total = result.questions.length;
        const concerns = result.questions.filter((q) => isConcern(q.answer, q.concern)).length;
        const percentage = total > 0 ? Math.round(((total - concerns) / total) * 100) : 0;
        return {
          auditId: result.auditId,
          siteName: result.siteName || result.auditId,
          percentage,
          hazards: result.findings.length,
        };
      })
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, LEAST_SECURE_LIMIT);
  }, [results]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <AlertOctagon className="h-8 w-8 text-red-500" />
        <p className="font-medium text-gray-900 dark:text-gray-100">Couldn't load audit data</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{loadError}</p>
      </div>
    );
  }

  if (audits === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Sparkles className="h-8 w-8 text-indigo-500" />
        <p className="font-medium text-gray-900 dark:text-gray-100">No audits yet</p>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          Run your first walkthrough analysis in Security Audit to see stats here.
        </p>
        <Link
          to="/dashboard/audit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Security Audit
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overall statistics across all audits
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Total hazards" value={String(totalHazards)} icon={ShieldAlert} accent="critical" />
        <StatTile label="Total sites covered" value={String(totalSites)} icon={Building2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Hazards by category
          </h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Total hazards found across all sites, grouped by compliance section
          </p>
          <CategoryHazardsChart stats={categoryStats} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Least secure sites
          </h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            Lowest questionnaire compliance — needing the most attention
          </p>
          {leastSecureSites.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">No data available</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-2.5">Site</th>
                    <th className="px-4 py-2.5">Security</th>
                    <th className="px-4 py-2.5">Hazards</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {leastSecureSites.map((site) => (
                    <tr key={site.auditId} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{site.siteName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${securityBadgeClass(site.percentage)}`}
                        >
                          {site.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{site.hazards}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/dashboard/site-audits?auditId=${site.auditId}`}
                          className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
