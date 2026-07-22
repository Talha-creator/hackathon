import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import {
  getAuditPhoto,
  getAuditResult,
  getAuditStatus,
  getAuditVideo,
  listAudits,
  uploadPhotos,
  uploadVideo,
} from "../controllers/audit.controller.js";
import { assignAuditId } from "../middleware/upload.middleware.js";
import { config } from "../config.js";
import { PHOTOS_DIR, VIDEOS_DIR } from "../utils/file.utils.js";

const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const MAX_VIDEO_UPLOAD_BYTES = 500 * 1024 * 1024;

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${req.auditId}${ext}`);
  },
});

function videoFileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Unsupported video format. Use .mp4, .mov, or .webm."));
    return;
  }
  cb(null, true);
}

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
});

const ALLOWED_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const MAX_PHOTO_UPLOAD_BYTES = 20 * 1024 * 1024;

const photoStorage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const dir = path.join(PHOTOS_DIR, req.auditId ?? "unknown");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req: Request & { _photoIndex?: number }, file, cb) => {
    const index = (req._photoIndex = (req._photoIndex ?? 0) + 1);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `photo-${String(index).padStart(2, "0")}${ext}`);
  },
});

function photoFileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (!ALLOWED_PHOTO_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Unsupported photo format. Use .jpg, .png, .webp, or .heic."));
    return;
  }
  cb(null, true);
}

const photoUpload = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: { fileSize: MAX_PHOTO_UPLOAD_BYTES, files: config.maxPhotosPerAudit },
});

const router = Router();

router.post("/upload", assignAuditId, videoUpload.single("video"), uploadVideo);
router.post("/upload-photos", assignAuditId, photoUpload.array("photos", config.maxPhotosPerAudit), uploadPhotos);
router.get("/", listAudits);
router.get("/:id/status", getAuditStatus);
router.get("/:id/video", getAuditVideo);
router.get("/:id/photo/:index", getAuditPhoto);
router.get("/:id", getAuditResult);

export default router;
