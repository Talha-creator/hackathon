import type { NormalizedAuditResult } from "../types/audit.types";
import { isConcern } from "./severity";

export interface ComplianceReportItem {
  section: string;
  question: string;
}

export interface ComplianceReport {
  siteName: string;
  auditId: string;
  summary: string;
  overallPercentage: number;
  actionItems: ComplianceReportItem[];
  passedItems: ComplianceReportItem[];
}

export function buildComplianceReport(result: NormalizedAuditResult): ComplianceReport {
  const actionItems: ComplianceReportItem[] = [];
  const passedItems: ComplianceReportItem[] = [];

  for (const q of result.questions) {
    const item: ComplianceReportItem = { section: q.section, question: q.question };
    if (isConcern(q.answer, q.concern)) actionItems.push(item);
    else passedItems.push(item);
  }

  const total = result.questions.length;
  const overallPercentage = total > 0 ? Math.round((passedItems.length / total) * 100) : 0;

  return {
    siteName: result.siteName || result.auditId,
    auditId: result.auditId,
    summary: result.summary,
    overallPercentage,
    actionItems,
    passedItems,
  };
}
