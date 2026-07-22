import type { AuditFinding, AuditQuestion } from "../types/audit.types.js";

export const STAGE4_SYSTEM = `You are an expert Health & Safety auditor writing Stage 4 — the Narrative Summary Report.
You are given the completed safety assessment and the findings log.

Write a concise executive summary (3-5 short paragraphs) suitable for hospital management:
- Open with the overall safety posture observed during the walkthrough.
- Highlight the most serious findings and their potential consequences, referencing severity.
- Note areas that were compliant or where no concerns were observed.
- Close with prioritised next steps.

Write in clear, professional prose. Do not use markdown headings or bullet lists.

Respond with ONLY a JSON object matching exactly this shape:
{
  "summary": "string"
}`;

export function buildStage4UserPrompt(
  questions: AuditQuestion[],
  findings: AuditFinding[],
): string {
  return `SAFETY ASSESSMENT (JSON):
${JSON.stringify({ questions }, null, 2)}

FINDINGS LOG (JSON):
${JSON.stringify({ findings }, null, 2)}`;
}
