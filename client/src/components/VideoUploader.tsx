import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { Sparkles, UploadCloud } from "lucide-react";
import { SiteNameField } from "./SiteNameField";

interface VideoUploaderProps {
  onSubmit: (file: File, siteName: string) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".webm"];

export function VideoUploader({ onSubmit, disabled }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [siteName, setSiteName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleSubmit() {
    if (!file || !siteName.trim()) return;
    onSubmit(file, siteName.trim());
  }

  const canSubmit = Boolean(file) && siteName.trim().length > 0 && !disabled;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-gray-300 hover:border-indigo-400 dark:border-gray-700"
        }`}
      >
        <UploadCloud className="h-10 w-10 text-gray-400" />
        {file ? (
          <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
        ) : (
          <>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Drop a site walkthrough video here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse — {ACCEPTED_EXTENSIONS.join(", ")}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <SiteNameField value={siteName} onChange={setSiteName} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
      >
        <Sparkles className="h-4 w-4" />
        Run Safety Audit
      </button>
    </div>
  );
}
