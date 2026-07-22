import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { Sparkles, UploadCloud, X } from "lucide-react";
import { SiteNameField } from "./SiteNameField";

interface PhotoUploaderProps {
  onSubmit: (files: File[], siteName: string) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic"];
const MAX_PHOTOS = 20;

export function PhotoUploader({ onSubmit, disabled }: PhotoUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [siteName, setSiteName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function addFiles(newFiles: FileList | File[]) {
    setFiles((prev) => [...prev, ...Array.from(newFiles)].slice(0, MAX_PHOTOS));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (files.length === 0 || !siteName.trim()) return;
    onSubmit(files, siteName.trim());
  }

  const canSubmit = files.length > 0 && siteName.trim().length > 0 && !disabled;

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
        {files.length > 0 ? (
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {files.length} photo{files.length > 1 ? "s" : ""} selected
          </p>
        ) : (
          <>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Drop site walkthrough photos here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse — up to {MAX_PHOTOS} images ({ACCEPTED_EXTENSIONS.join(", ")})
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <img src={previews[index]} alt={file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

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
