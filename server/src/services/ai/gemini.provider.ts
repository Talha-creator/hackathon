import { FileState, GoogleGenAI } from "@google/genai";
import type { File as GeminiFile } from "@google/genai";
import { assertGeminiConfigured, config } from "../../config.js";
import { buildStage1GeminiUserPrompt, STAGE1_GEMINI_SYSTEM } from "../../prompts/stage1_observation_gemini.js";
import { buildStage1PhotoUserPrompt, STAGE1_PHOTO_SYSTEM } from "../../prompts/stage1_observation_photo.js";
import { buildStage2UserPrompt, STAGE2_SYSTEM } from "../../prompts/stage2_assessment.js";
import { buildStage3UserPrompt, STAGE3_SYSTEM } from "../../prompts/stage3_findings.js";
import { buildStage4UserPrompt, STAGE4_SYSTEM } from "../../prompts/stage4_summary.js";
import type {
  AuditFinding,
  AuditQuestion,
  NormalizedAuditResult,
  TimelineEntry,
} from "../../types/audit.types.js";
import { encodeImages } from "./image.encoder.js";

const FILE_POLL_INTERVAL_MS = 3000;
const FILE_POLL_TIMEOUT_MS = 5 * 60 * 1000;

interface TextInputPart {
  type: "text";
  text: string;
}

interface VideoInputPart {
  type: "video";
  uri: string;
  mime_type: string;
}

interface ImageInputPart {
  type: "image";
  data: string;
  mime_type: string;
}

type InteractionInput = Array<TextInputPart | VideoInputPart | ImageInputPart>;

export interface VideoAuditRequest {
  auditId: string;
  siteName: string;
  videoPath: string;
}

export interface PhotoAuditRequest {
  auditId: string;
  siteName: string;
  photoPaths: string[];
}

function guessVideoMimeType(videoPath: string): string {
  const ext = videoPath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/mov";
    case "webm":
      return "video/webm";
    default:
      return "video/mp4";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getClient(): GoogleGenAI {
  assertGeminiConfigured();
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
}

async function uploadAndAwaitActive(client: GoogleGenAI, videoPath: string): Promise<GeminiFile> {
  const mimeType = guessVideoMimeType(videoPath);
  let file = await client.files.upload({ file: videoPath, config: { mimeType } });

  const deadline = Date.now() + FILE_POLL_TIMEOUT_MS;
  while (file.state === FileState.PROCESSING) {
    if (Date.now() > deadline) {
      throw new Error("Timed out waiting for Gemini to finish processing the uploaded video.");
    }
    await sleep(FILE_POLL_INTERVAL_MS);
    file = await client.files.get({ name: file.name ?? "" });
  }

  if (file.state !== FileState.ACTIVE || !file.uri || !file.mimeType) {
    throw new Error(`Gemini file upload did not become active (state: ${String(file.state)}).`);
  }

  return file;
}

async function runJsonStage<T>(
  client: GoogleGenAI,
  systemInstruction: string,
  input: InteractionInput | string,
): Promise<T> {
  const interaction = await client.interactions.create({
    model: config.geminiModel,
    system_instruction: systemInstruction,
    response_format: { type: "text", mime_type: "application/json" },
    input,
  });

  const text = interaction.output_text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
  }
}

async function runStage2(client: GoogleGenAI, timeline: TimelineEntry[]): Promise<AuditQuestion[]> {
  const result = await runJsonStage<{ questions: AuditQuestion[] }>(
    client,
    STAGE2_SYSTEM,
    buildStage2UserPrompt(timeline),
  );
  return result.questions ?? [];
}

async function runStage3(
  client: GoogleGenAI,
  timeline: TimelineEntry[],
  questions: AuditQuestion[],
): Promise<AuditFinding[]> {
  const result = await runJsonStage<{ findings: AuditFinding[] }>(
    client,
    STAGE3_SYSTEM,
    buildStage3UserPrompt(timeline, questions),
  );
  return result.findings ?? [];
}

async function runStage4(
  client: GoogleGenAI,
  questions: AuditQuestion[],
  findings: AuditFinding[],
): Promise<string> {
  const result = await runJsonStage<{ summary: string }>(
    client,
    STAGE4_SYSTEM,
    buildStage4UserPrompt(questions, findings),
  );
  return result.summary ?? "";
}

export async function analyzeVideoWalkthrough(
  request: VideoAuditRequest,
): Promise<NormalizedAuditResult> {
  const client = getClient();
  const file = await uploadAndAwaitActive(client, request.videoPath);

  const input: InteractionInput = [
    { type: "video", uri: file.uri!, mime_type: file.mimeType! },
    { type: "text", text: buildStage1GeminiUserPrompt() },
  ];
  const stage1 = await runJsonStage<{ timeline: TimelineEntry[] }>(
    client,
    STAGE1_GEMINI_SYSTEM,
    input,
  );
  const timeline = stage1.timeline ?? [];

  const questions = await runStage2(client, timeline);
  const findings = await runStage3(client, timeline, questions);
  const summary = await runStage4(client, questions, findings);

  return {
    auditId: request.auditId,
    siteName: request.siteName,
    sourceType: "video",
    timeline,
    questions,
    findings,
    summary,
    videoPath: request.videoPath,
  };
}

export async function analyzePhotoWalkthrough(
  request: PhotoAuditRequest,
): Promise<NormalizedAuditResult> {
  const client = getClient();
  const images = encodeImages(request.photoPaths);

  const input: InteractionInput = [];
  for (const image of images) {
    input.push({ type: "text", text: `${image.label}:` });
    input.push({ type: "image", data: image.base64, mime_type: image.mimeType });
  }
  input.push({ type: "text", text: buildStage1PhotoUserPrompt(images.length) });

  const stage1 = await runJsonStage<{ timeline: TimelineEntry[] }>(
    client,
    STAGE1_PHOTO_SYSTEM,
    input,
  );
  const timeline = stage1.timeline ?? [];

  const questions = await runStage2(client, timeline);
  const findings = await runStage3(client, timeline, questions);
  const summary = await runStage4(client, questions, findings);

  return {
    auditId: request.auditId,
    siteName: request.siteName,
    sourceType: "photo",
    timeline,
    questions,
    findings,
    summary,
    photoPaths: request.photoPaths,
  };
}
