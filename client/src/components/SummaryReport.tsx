interface SummaryReportProps {
  summary: string;
}

export function SummaryReport({ summary }: SummaryReportProps) {
  const paragraphs = summary.split("\n").filter((p) => p.trim().length > 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
