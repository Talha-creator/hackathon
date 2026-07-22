import type { FindingSeverity } from "../types/audit.types";

export const SEVERITY_ORDER: FindingSeverity[] = ["Critical", "High", "Medium", "Low"];

export const SEVERITY_STYLES: Record<FindingSeverity, string> = {
  Critical: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  High: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  Low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
};

export const ANSWER_STYLES: Record<string, string> = {
  Yes: "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  No: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  "Unable to determine":
    "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

/**
 * Whether a questionnaire answer represents a safety concern. Independent of
 * raw Yes/No polarity — some official questions are phrased inversely, so the
 * explicit `concern` flag (when present) always wins over the answer text.
 */
export function isConcern(answer: string, concern: boolean | undefined): boolean {
  return concern ?? answer === "No";
}
