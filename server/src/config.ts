export interface AppConfig {
  port: number;
  geminiApiKey: string;
  geminiModel: string;
  /** Upper bound on photos accepted/analyzed in a single photo audit. */
  maxPhotosPerAudit: number;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 3001),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
  maxPhotosPerAudit: Number(process.env.MAX_PHOTOS_PER_AUDIT ?? 20),
};

export function assertGeminiConfigured(): void {
  if (!config.geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to server/.env before running the Gemini provider.",
    );
  }
}
