import { useEffect, useMemo, useState } from "react";
import { AlertOctagon, Building2, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuditResult, listAudits } from "../services/api";
import type { AuditListItem, NormalizedAuditResult } from "../types/audit.types";
import { StatTile } from "../components/StatTile";
import { CategoryHazardsChart, type CategoryHazardStat } from "../components/CategoryHazardsChart";

const HAZARD_CATEGORIES = [
  "Access, Egress & Fire Safety",
  "Housekeeping & Walkways",
  "People, PPE & Behaviour",
  "Environment & Equipment",
];

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

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
        <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Hazards by category
        </h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Total hazards found across all sites, grouped by compliance section
        </p>
        <CategoryHazardsChart stats={categoryStats} />
      </div>
    </div>
  );
}

export default Dashboard;
