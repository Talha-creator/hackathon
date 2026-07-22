import { ApiError } from "@google/genai";

const QUOTA_ERROR_PATTERN = /quota|resource_exhausted|rate limit|too many requests|\b429\b/i;

function isQuotaError(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 429) return true;
  const message = err instanceof Error ? err.message : String(err);
  return QUOTA_ERROR_PATTERN.test(message);
}

/**
 * Gemini quota/rate-limit errors surface as opaque API text (e.g. raw
 * "RESOURCE_EXHAUSTED" JSON) that means nothing to an end user. Swap those
 * for a plain-language message; everything else passes through unchanged.
 */
export function toUserFacingError(err: unknown): string {
  if (isQuotaError(err)) {
    return "AI is unable to process this audit right now because the usage limit has been reached. Please try again later.";
  }
  return err instanceof Error ? err.message : String(err);
}
