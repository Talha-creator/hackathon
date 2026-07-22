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
   * Whether this answer represents a safety/compliance concern. Independent
   * of raw Yes/No polarity — some official questions are phrased inversely.
   * Optional because cached results predating this field won't have it.
   */
  concern?: boolean;
  confidence: number;
  reason: string;
  evidenceTimestamp: string;
}

export type FindingSeverity = "Low" | "Medium" | "High" | "Critical";

export interface AuditFinding {
  findingNumber: number;
  section: string;
  /** Question ids (e.g. "1.1") this finding evidences. Optional for older cached results. */
  questionRefs?: string[];
  timestamp: string;
  /** Optional for older cached results — derive from the timeline when absent. */
  location?: string;
  observation: string;
  severity: FindingSeverity;
  timescale: string;
  recommendedAction: string;
  /** Optional for older cached results. */
  evidenceReference?: string;
  /** Optional for older cached results. */
  notes?: string;
}

export interface NormalizedAuditResult {
  auditId: string;
  /** Optional for older cached results predating the site name field. */
  siteName?: string;
  /** Optional for older cached results, all of which were video audits. */
  sourceType?: SourceType;
  timeline: TimelineEntry[];
  questions: AuditQuestion[];
  findings: AuditFinding[];
  summary: string;
  videoPath?: string;
  photoPaths?: string[];
}

export interface AuditRecord {
  auditId: string;
  siteName?: string;
  sourceType?: SourceType;
  status: AuditStatus;
  progress: number;
  videoPath?: string;
  photoPaths?: string[];
  result?: NormalizedAuditResult;
  error?: string;
}

export interface UploadResponse {
  auditId: string;
  status: "processing";
}

/** Lightweight summary of a cached audit result, used to populate a "load a past audit" selector. */
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

export interface StatusResponse {
  auditId: string;
  status: AuditStatus;
  progress: number;
  error?: string;
}
