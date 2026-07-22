import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertOctagon,
  ClipboardCheck,
  FileText,
  Layers,
  ListChecks,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getAuditResult, getAuditVideoUrl, listAudits } from "../services/api";
import type { AuditListItem, AuditRecord, FindingSeverity } from "../types/audit.types";
import { StatTile } from "../components/StatTile";
import { SeverityDoughnutChart } from "../components/SeverityDoughnutChart";
import { SectionComplianceMeters } from "../components/SectionComplianceMeters";
import { FindingsTable } from "../components/FindingsTable";
import { SummaryReport } from "../components/SummaryReport";
import { ComplianceReportCard } from "../components/ComplianceReportCard";
import { VideoPlayerSync } from "../components/VideoPlayerSync";
import { PhotoGallery } from "../components/PhotoGallery";
import { timestampToSeconds } from "../utils/timestamp";
import { isConcern } from "../utils/severity";
import { buildComplianceReport } from "../utils/complianceReport";

interface SectionStat {
  section: string;
  total: number;
  concerns: number;
}

const EMPTY_SEVERITY_COUNTS: Record<FindingSeverity, number> = {
  Critical: 0,
  High: 0,
  Medium: 0,
  Low: 0,
};

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "statistics", label: "Statistics" },
  { id: "findings", label: "Findings Log" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SiteAudits() {
  const [searchParams] = useSearchParams();
  const initialAuditIdRef = useRef(searchParams.get("auditId"));
  const [audits, setAudits] = useState<AuditListItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [record, setRecord] = useState<AuditRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const videoRef = useRef<HTMLVideoElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);

  function handleEvidenceClick(evidence: string) {
    evidenceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (record?.sourceType === "photo") {
      const match = /photo\s*(\d+)/i.exec(evidence);
      if (match) setSelectedPhotoIndex(Number(match[1]) - 1);
      return;
    }
    const video = videoRef.current;
    if (!video || !evidence) return;
    video.currentTime = timestampToSeconds(evidence);
    void video.play();
  }

  useEffect(() => {
    listAudits()
      .then((items) => {
        setAudits(items);
        const initialAuditId = initialAuditIdRef.current;
        const requested = initialAuditId && items.some((item) => item.auditId === initialAuditId);
        if (requested) setSelectedId(initialAuditId);
        else if (items.length > 0) setSelectedId(items[0].auditId);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setRecord(null);
    setSelectedPhotoIndex(0);
    getAuditResult(selectedId)
      .then(setRecord)
      .catch((err) => setLoadError(err instanceof Error ? err.message : String(err)));
  }, [selectedId]);

  const result = record?.result;

  const severityCounts = useMemo(() => {
    const counts = { ...EMPTY_SEVERITY_COUNTS };
    for (const finding of result?.findings ?? []) counts[finding.severity] += 1;
    return counts;
  }, [result]);

  const sectionStats: SectionStat[] = useMemo(() => {
    const bySection = new Map<string, SectionStat>();
    for (const question of result?.questions ?? []) {
      const entry = bySection.get(question.section) ?? {
        section: question.section,
        total: 0,
        concerns: 0,
      };
      entry.total += 1;
      if (isConcern(question.answer, question.concern)) entry.concerns += 1;
      bySection.set(question.section, entry);
    }
    return Array.from(bySection.values());
  }, [result]);

  const totalQuestions = result?.questions.length ?? 0;
  const totalConcerns = result?.questions.filter((q) => isConcern(q.answer, q.concern)).length ?? 0;
  const complianceRate =
    totalQuestions > 0 ? Math.round(((totalQuestions - totalConcerns) / totalQuestions) * 100) : 0;
  const urgentCount = severityCounts.Critical + severityCounts.High;
  const sectionsFlagged = sectionStats.filter((s) => s.concerns > 0).length;

  const complianceReport = useMemo(() => (result ? buildComplianceReport(result) : null), [result]);

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
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading audit data...</p>
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Site Audits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Health &amp; safety audit stats
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300"
          >
            {audits.map((audit) => (
              <option key={audit.auditId} value={audit.auditId}>
                {audit.siteName || audit.auditId}
              </option>
            ))}
          </select>
          <Link
            to="/dashboard/audit"
            className="whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Audit
          </Link>
        </div>
      </header>

      {!result ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          <div className="flex gap-1 border-b border-gray-200 dark:border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative -mb-px px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-300"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "summary" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Executive Summary
                </h2>
                <SummaryReport summary={result.summary} />
              </div>

              {complianceReport && <ComplianceReportCard report={complianceReport} />}
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile label="Total findings" value={String(result.findings.length)} icon={ListChecks} />
                <StatTile
                  label="Critical + high priority"
                  value={String(urgentCount)}
                  icon={AlertOctagon}
                  accent="critical"
                />
                <StatTile
                  label="Questionnaire compliance"
                  value={`${complianceRate}%`}
                  icon={ClipboardCheck}
                  accent={complianceRate >= 70 ? "good" : "neutral"}
                />
                <StatTile label="Sections flagged" value={`${sectionsFlagged}/${sectionStats.length}`} icon={Layers} />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
                  <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Findings by severity
                  </h2>
                  <SeverityDoughnutChart counts={severityCounts} />
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
                  <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Compliance by section
                  </h2>
                  <SectionComplianceMeters questions={result.questions} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "findings" && (
            <div className="flex flex-col gap-6">
              <div ref={evidenceRef} className="scroll-mt-6">
                {record?.sourceType === "photo" ? (
                  <PhotoGallery
                    auditId={result.auditId}
                    count={result.photoPaths?.length ?? 0}
                    selectedIndex={selectedPhotoIndex}
                    onSelect={setSelectedPhotoIndex}
                  />
                ) : (
                  <VideoPlayerSync ref={videoRef} src={getAuditVideoUrl(result.auditId)} />
                )}
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Findings Log
                </h2>
                <FindingsTable
                  findings={result.findings}
                  timeline={result.timeline}
                  questions={result.questions}
                  onEvidenceClick={handleEvidenceClick}
                  auditId={result.auditId}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SiteAudits;
