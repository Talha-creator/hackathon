import type {
  AuditListItem,
  AuditRecord,
  StatusResponse,
  UploadResponse,
} from "../types/audit.types";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`);
  }
  return data as T;
}

export async function uploadVideo(file: File, siteName: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("siteName", siteName);

  const res = await fetch("https://your-render-app.onrender.com/api/audit/upload", {
    method: "POST",
    body: formData,
  });

  return parseJsonOrThrow<UploadResponse>(res);
}

export async function uploadPhotos(files: File[], siteName: string): Promise<UploadResponse> {
  const formData = new FormData();
  for (const file of files) formData.append("photos", file);
  formData.append("siteName", siteName);

  const res = await fetch("https://your-render-app.onrender.com/api/audit/upload-photos", {
    method: "POST",
    body: formData,
  });

  return parseJsonOrThrow<UploadResponse>(res);
}

export async function getAuditStatus(auditId: string): Promise<StatusResponse> {
  const res = await fetch(`https://your-render-app.onrender.com/api/audit/${auditId}/status`);
  return parseJsonOrThrow<StatusResponse>(res);
}

export async function getAuditResult(auditId: string): Promise<AuditRecord> {
  const res = await fetch(`https://your-render-app.onrender.com/api/audit/${auditId}`);
  return parseJsonOrThrow<AuditRecord>(res);
}

export function getAuditVideoUrl(auditId: string): string {
  return `https://your-render-app.onrender.com/api/audit/${auditId}/video`;
}

export function getAuditPhotoUrl(auditId: string, index: number): string {
  return `https://your-render-app.onrender.com/api/audit/${auditId}/photo/${index}`;
}

export async function listAudits(): Promise<AuditListItem[]> {
  const res = await fetch("https://your-render-app.onrender.com/api/audit");
  return parseJsonOrThrow<AuditListItem[]>(res);
}
