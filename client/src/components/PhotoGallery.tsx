import { getAuditPhotoUrl } from "../services/api";

interface PhotoGalleryProps {
  auditId: string;
  count: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function PhotoGallery({ auditId, count, selectedIndex, onSelect }: PhotoGalleryProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
            selectedIndex === index
              ? "border-indigo-500 ring-2 ring-indigo-500/40"
              : "border-gray-200 hover:border-indigo-300 dark:border-gray-800"
          }`}
        >
          <img
            src={getAuditPhotoUrl(auditId, index)}
            alt={`Photo ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
