import { Loader2 } from "lucide-react";
import type { AuditStatus } from "../types/audit.types";

interface ProcessingStatusProps {
  status: AuditStatus;
  progress: number;
}

const STATUS_LABELS: Record<AuditStatus, string> = {
  uploaded: "Upload received",
  uploading_gemini: "Uploading video to Gemini...",
  analyzing: "Running AI safety analysis...",
  completed: "Analysis complete",
  failed: "Analysis failed",
};

export function ProcessingStatus({ status, progress }: ProcessingStatusProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="font-medium text-gray-900 dark:text-gray-100">{STATUS_LABELS[status]}</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-400">{progress}%</p>
    </div>
  );
}
