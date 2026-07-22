import fs from "node:fs";
import type { Request, Response } from "express";
import {
  createAuditRecord,
  getAuditRecord,
  listCachedAudits,
  updateAuditRecord,
} from "../services/audit.store.js";
import { analyzePhotoWalkthrough, analyzeVideoWalkthrough } from "../services/ai/gemini.provider.js";
import { transcodeForWeb } from "../services/video.transcoder.js";
import { toUserFacingError } from "../utils/errors.js";
import { getWebVideoPath, saveResultJson } from "../utils/file.utils.js";

function extractSiteName(req: Request, res: Response): string | undefined {
  const siteName = String(req.body.siteName ?? "").trim();
  if (!siteName) {
    res.status(400).json({ error: "Site name is required." });
    return undefined;
  }
  return siteName;
}

export function uploadVideo(req: Request, res: Response): void {
  if (!req.file || !req.auditId) {
    res.status(400).json({ error: "Video file is required." });
    return;
  }

  const siteName = extractSiteName(req, res);
  if (!siteName) return;

  const auditId = req.auditId;
  const videoPath = req.file.path;

  createAuditRecord({
    auditId,
    siteName,
    sourceType: "video",
    status: "uploaded",
    progress: 0,
    videoPath,
  });

  res.status(202).json({ auditId, status: "processing" });

  runVideoPipeline(auditId, siteName, videoPath).catch((err: unknown) => {
    console.error(`Video audit ${auditId} failed:`, err);
    updateAuditRecord(auditId, { status: "failed", error: toUserFacingError(err) });
  });
}

async function runVideoPipeline(auditId: string, siteName: string, videoPath: string): Promise<void> {
  updateAuditRecord(auditId, { status: "uploading_gemini", progress: 20 });
  updateAuditRecord(auditId, { status: "analyzing", progress: 60 });

  const [result] = await Promise.all([
    analyzeVideoWalkthrough({ auditId, siteName, videoPath }),
    transcodeForWeb(videoPath, getWebVideoPath(auditId)).catch((err: unknown) => {
      console.error(`Web video transcode failed for ${auditId}:`, err);
    }),
  ]);
  saveResultJson(auditId, result);

  updateAuditRecord(auditId, { status: "completed", progress: 100, result });
}

export function uploadPhotos(req: Request, res: Response): void {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0 || !req.auditId) {
    res.status(400).json({ error: "At least one photo is required." });
    return;
  }

  const siteName = extractSiteName(req, res);
  if (!siteName) return;

  const auditId = req.auditId;
  const photoPaths = files.map((file) => file.path);

  createAuditRecord({
    auditId,
    siteName,
    sourceType: "photo",
    status: "uploaded",
    progress: 0,
    photoPaths,
  });

  res.status(202).json({ auditId, status: "processing" });

  runPhotoPipeline(auditId, siteName, photoPaths).catch((err: unknown) => {
    console.error(`Photo audit ${auditId} failed:`, err);
    updateAuditRecord(auditId, { status: "failed", error: toUserFacingError(err) });
  });
}

async function runPhotoPipeline(
  auditId: string,
  siteName: string,
  photoPaths: string[],
): Promise<void> {
  updateAuditRecord(auditId, { status: "analyzing", progress: 40 });

  const result = await analyzePhotoWalkthrough({ auditId, siteName, photoPaths });
  saveResultJson(auditId, result);

  updateAuditRecord(auditId, { status: "completed", progress: 100, result });
}

export function getAuditStatus(req: Request, res: Response): void {
  const record = getAuditRecord(String(req.params.id));
  if (!record) {
    res.status(404).json({ error: "Audit not found." });
    return;
  }

  res.json({
    auditId: record.auditId,
    status: record.status,
    progress: record.progress,
    error: record.error,
  });
}

export function getAuditResult(req: Request, res: Response): void {
  const record = getAuditRecord(String(req.params.id));
  if (!record) {
    res.status(404).json({ error: "Audit not found." });
    return;
  }

  res.json(record);
}

export function listAudits(_req: Request, res: Response): void {
  res.json(listCachedAudits());
}

export function getAuditVideo(req: Request, res: Response): void {
  const record = getAuditRecord(String(req.params.id));
  if (!record || !record.videoPath) {
    res.status(404).json({ error: "Video not found for this audit." });
    return;
  }

  const webPath = getWebVideoPath(record.auditId);
  const servePath = fs.existsSync(webPath) ? webPath : record.videoPath;

  res.sendFile(servePath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "Video file not found on disk." });
    }
  });
}

export function getAuditPhoto(req: Request, res: Response): void {
  const record = getAuditRecord(String(req.params.id));
  if (!record || !record.photoPaths) {
    res.status(404).json({ error: "Photos not found for this audit." });
    return;
  }

  const index = Number(req.params.index);
  const photoPath = record.photoPaths[index];
  if (!photoPath) {
    res.status(404).json({ error: "Photo not found." });
    return;
  }

  res.sendFile(photoPath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "Photo file not found on disk." });
    }
  });
}
