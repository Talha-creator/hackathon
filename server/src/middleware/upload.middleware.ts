import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function assignAuditId(req: Request, _res: Response, next: NextFunction): void {
  req.auditId = `aud_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  next();
}
