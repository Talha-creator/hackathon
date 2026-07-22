import fs from "node:fs";
import path from "node:path";

export const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
export const VIDEOS_DIR = path.join(UPLOADS_ROOT, "videos");
export const PHOTOS_DIR = path.join(UPLOADS_ROOT, "photos");
export const RESULTS_DIR = path.resolve(process.cwd(), "results");

export function ensureStorageDirs(): void {
  for (const dir of [VIDEOS_DIR, PHOTOS_DIR, RESULTS_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveResultJson(auditId: string, result: unknown): string {
  const filePath = path.join(RESULTS_DIR, `${auditId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), "utf-8");
  return filePath;
}

/** Browser-playable H.264 copy of an uploaded video, alongside the original. */
export function getWebVideoPath(auditId: string): string {
  return path.join(VIDEOS_DIR, `${auditId}.web.mp4`);
}
