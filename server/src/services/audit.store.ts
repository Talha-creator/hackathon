import fs from "node:fs";
import path from "node:path";
import { RESULTS_DIR } from "../utils/file.utils.js";
import type {
  AuditListItem,
  AuditRecord,
  NormalizedAuditResult,
} from "../types/audit.types.js";

const store = new Map<string, AuditRecord>();

export function createAuditRecord(record: AuditRecord): void {
  store.set(record.auditId, record);
}

export function getAuditRecord(auditId: string): AuditRecord | undefined {
  const inMemory = store.get(auditId);
  if (inMemory) return inMemory;

  return loadRecordFromDisk(auditId);
}

export function updateAuditRecord(
  auditId: string,
  patch: Partial<AuditRecord>,
): AuditRecord | undefined {
  const existing = store.get(auditId);
  if (!existing) return undefined;

  const updated = { ...existing, ...patch };
  store.set(auditId, updated);
  return updated;
}

/**
 * Cached audit results are persisted to disk as {auditId}.json regardless of
 * the in-memory store's lifetime. This lets completed audits survive a
 * server restart — useful while AI provider quota is limited, since it means
 * previously-run analyses stay viewable without a new API call.
 */
function loadRecordFromDisk(auditId: string): AuditRecord | undefined {
  const filePath = path.join(RESULTS_DIR, `${auditId}.json`);
  if (!fs.existsSync(filePath)) return undefined;

  try {
    const result = JSON.parse(fs.readFileSync(filePath, "utf-8")) as NormalizedAuditResult;
    const record: AuditRecord = {
      auditId: result.auditId,
      siteName: result.siteName,
      sourceType: result.sourceType,
      status: "completed",
      progress: 100,
      videoPath: result.videoPath,
      photoPaths: result.photoPaths,
      result,
    };
    store.set(auditId, record);
    return record;
  } catch {
    return undefined;
  }
}

/** Lists every cached audit result on disk, newest first. */
export function listCachedAudits(): AuditListItem[] {
  if (!fs.existsSync(RESULTS_DIR)) return [];

  const files = fs
    .readdirSync(RESULTS_DIR)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const filePath = path.join(RESULTS_DIR, name);
      return { filePath, mtime: fs.statSync(filePath).mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  const items: AuditListItem[] = [];
  for (const file of files) {
    try {
      const result = JSON.parse(
        fs.readFileSync(file.filePath, "utf-8"),
      ) as NormalizedAuditResult;
      const findings = result.findings ?? [];
      items.push({
        auditId: result.auditId,
        siteName: result.siteName ?? "",
        sourceType: result.sourceType ?? "video",
        savedAt: file.mtime.toISOString(),
        findingsCount: findings.length,
        criticalCount: findings.filter((f) => f.severity === "Critical").length,
        highCount: findings.filter((f) => f.severity === "High").length,
        summary: result.summary ?? "",
      });
    } catch {
      // Skip unreadable/malformed cache files.
    }
  }
  return items;
}
