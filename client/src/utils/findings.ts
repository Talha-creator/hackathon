import type { AuditFinding, AuditQuestion, TimelineEntry } from "../types/audit.types";

export interface NormalizedFinding extends AuditFinding {
  location: string;
  questionRefs: string[];
  evidenceReference: string;
  notes: string;
}

/**
 * Fills in fields that older cached results (produced before the Findings
 * Log schema was extended) don't have, by deriving them from the timeline
 * and questionnaire that shipped alongside the same audit.
 */
export function normalizeFinding(
  finding: AuditFinding,
  timeline: TimelineEntry[],
  questions: AuditQuestion[],
): NormalizedFinding {
  const location =
    finding.location ??
    timeline.find((entry) => entry.timestamp === finding.timestamp)?.location ??
    "—";

  const questionRefs =
    finding.questionRefs ??
    questions
      .filter((q) => q.section === finding.section && (q.concern ?? q.answer === "No"))
      .map((q) => q.id);

  const evidenceReference =
    finding.evidenceReference ??
    `${finding.timestamp}${location !== "—" ? ` (${location})` : ""}`;

  const notes = finding.notes ?? "";

  return { ...finding, location, questionRefs, evidenceReference, notes };
}
