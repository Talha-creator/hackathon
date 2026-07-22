export type SourceType = "video" | "photo";

export type AuditStatus = "uploaded" | "uploading_gemini" | "analyzing" | "completed" | "failed";

export interface TimelineEntry {
  timestamp: string;
  location: string;
  observations: string[];
}

export interface AuditQuestion {
  id: string;
  section: string;
  question: string;
  answer: string;
  /**
   * Whether this answer represents a safety/compliance concern needing
   * attention. Kept independent of the raw Yes/No polarity because some
   * official questions are phrased inversely (e.g. "Is anyone visible
   * WITHOUT the required PPE?", where "Yes" is the concerning answer).
   */
  concern: boolean;
  confidence: number;
  reason: string;
  evidenceTimestamp: string;
}

export type FindingSeverity = "Low" | "Medium" | "High" | "Critical";

export interface AuditFinding {
  findingNumber: number;
  section: string;
  /** Question ids (e.g. "1.1") from the questionnaire this finding evidences. */
  questionRefs: string[];
  timestamp: string;
  location: string;
  observation: string;
  severity: FindingSeverity;
  timescale: string;
  recommendedAction: string;
  /** Human-readable pointer to where the evidence can be reviewed. */
  evidenceReference: string;
  /** Optional caveats or extra context; empty string when none. */
  notes: string;
}

export interface NormalizedAuditResult {
  auditId: string;
  siteName: string;
  sourceType: SourceType;
  timeline: TimelineEntry[];
  questions: AuditQuestion[];
  findings: AuditFinding[];
  summary: string;
  /** Present when sourceType is "video". */
  videoPath?: string;
  /** Present when sourceType is "photo", in upload order. */
  photoPaths?: string[];
}

export interface AuditRecord {
  auditId: string;
  siteName: string;
  sourceType: SourceType;
  status: AuditStatus;
  progress: number;
  videoPath?: string;
  photoPaths?: string[];
  result?: NormalizedAuditResult;
  error?: string;
}

/** Lightweight summary of a cached audit, used to populate a "load a past
 * result" selector without shipping the full result payload. */
export interface AuditListItem {
  auditId: string;
  siteName: string;
  sourceType: SourceType;
  savedAt: string;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  summary: string;
}
