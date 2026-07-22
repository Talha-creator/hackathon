import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, RotateCcw, Video as VideoIcon } from "lucide-react";
import { VideoUploader } from "../components/VideoUploader";
import { PhotoUploader } from "../components/PhotoUploader";
import { PhotoGallery } from "../components/PhotoGallery";
import { ProcessingStatus } from "../components/ProcessingStatus";
import { VideoPlayerSync } from "../components/VideoPlayerSync";
import { FindingsTable } from "../components/FindingsTable";
import { QuestionnaireView } from "../components/QuestionnaireView";
import { SummaryReport } from "../components/SummaryReport";
import {
  getAuditResult,
  getAuditStatus,
  getAuditVideoUrl,
  uploadPhotos,
  uploadVideo,
} from "../services/api";
import type { AuditRecord, AuditStatus } from "../types/audit.types";
import { timestampToSeconds } from "../utils/timestamp";

type Phase = "upload" | "processing" | "completed" | "failed";
type Tab = "findings" | "questionnaire" | "summary";
type UploadMode = "video" | "photo";

const POLL_INTERVAL_MS = 2500;

function SecurityAudit() {
  const [uploadMode, setUploadMode] = useState<UploadMode>("video");
  const [phase, setPhase] = useState<Phase>("upload");
  const [auditId, setAuditId] = useState<string | null>(null);
  const [status, setStatus] = useState<AuditStatus>("uploaded");
  const [progress, setProgress] = useState(0);
  const [record, setRecord] = useState<AuditRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("findings");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (phase !== "processing" || !auditId) return;

    const interval = setInterval(async () => {
      try {
        const statusInfo = await getAuditStatus(auditId);
        setStatus(statusInfo.status);
        setProgress(statusInfo.progress);

        if (statusInfo.status === "completed") {
          const fullRecord = await getAuditResult(auditId);
          setRecord(fullRecord);
          if (fullRecord.sourceType === "photo") setSelectedPhotoIndex(0);
          setPhase("completed");
        } else if (statusInfo.status === "failed") {
          setErrorMessage(statusInfo.error ?? "Analysis failed.");
          setPhase("failed");
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setPhase("failed");
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [phase, auditId]);

  async function handleVideoSubmit(file: File, siteName: string) {
    setErrorMessage(null);
    try {
      const upload = await uploadVideo(file, siteName);
      setAuditId(upload.auditId);
      setStatus("uploaded");
      setProgress(0);
      setPhase("processing");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setPhase("failed");
    }
  }

  async function handlePhotoSubmit(files: File[], siteName: string) {
    setErrorMessage(null);
    try {
      const upload = await uploadPhotos(files, siteName);
      setAuditId(upload.auditId);
      setStatus("uploaded");
      setProgress(0);
      setPhase("processing");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setPhase("failed");
    }
  }

  function handleEvidenceClick(evidence: string) {
    if (record?.sourceType === "photo") {
      const match = /photo\s*(\d+)/i.exec(evidence);
      if (match) setSelectedPhotoIndex(Number(match[1]) - 1);
      return;
    }
    const video = videoRef.current;
    if (!video || !evidence) return;
    video.currentTime = timestampToSeconds(evidence);
    void video.play();
  }

  function handleReset() {
    setPhase("upload");
    setAuditId(null);
    setRecord(null);
    setErrorMessage(null);
    setActiveTab("findings");
    setSelectedPhotoIndex(null);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Security Audit
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a walkthrough video or site photos and run an AI safety analysis
          </p>
        </div>
        {phase === "completed" && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-500"
          >
            <RotateCcw className="h-4 w-4" />
            New Audit
          </button>
        )}
      </header>

      {phase === "upload" && (
        <div className="flex flex-col gap-6">
          <div className="mx-auto flex w-full max-w-xl gap-2">
            {(
              [
                ["video", "Video", VideoIcon],
                ["photo", "Photos", Camera],
              ] as [UploadMode, string, typeof VideoIcon][]
            ).map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setUploadMode(mode)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  uploadMode === mode
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-gray-300 text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {uploadMode === "video" ? (
            <VideoUploader onSubmit={handleVideoSubmit} />
          ) : (
            <PhotoUploader onSubmit={handlePhotoSubmit} />
          )}
        </div>
      )}

      {phase === "processing" && <ProcessingStatus status={status} progress={progress} />}

      {phase === "failed" && (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="font-medium text-gray-900 dark:text-gray-100">Something went wrong</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{errorMessage}</p>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      )}

      {phase === "completed" && record?.result && auditId && (
        <div className="flex flex-col gap-6">
          {record.sourceType === "photo" ? (
            <PhotoGallery
              auditId={auditId}
              count={record.result.photoPaths?.length ?? 0}
              selectedIndex={selectedPhotoIndex}
              onSelect={setSelectedPhotoIndex}
            />
          ) : (
            <VideoPlayerSync ref={videoRef} src={getAuditVideoUrl(auditId)} />
          )}

          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
            {(
              [
                ["findings", `Findings (${record.result.findings.length})`],
                ["questionnaire", `Questionnaire (${record.result.questions.length})`],
                ["summary", "Executive Summary"],
              ] as [Tab, string][]
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "findings" && (
            <FindingsTable
              findings={record.result.findings}
              timeline={record.result.timeline}
              questions={record.result.questions}
              onEvidenceClick={handleEvidenceClick}
              auditId={auditId}
            />
          )}
          {activeTab === "questionnaire" && (
            <QuestionnaireView
              questions={record.result.questions}
              onEvidenceClick={handleEvidenceClick}
            />
          )}
          {activeTab === "summary" && <SummaryReport summary={record.result.summary} />}
        </div>
      )}
    </div>
  );
}

export default SecurityAudit;
