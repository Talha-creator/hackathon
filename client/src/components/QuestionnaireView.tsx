import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import type { AuditQuestion } from "../types/audit.types";
import { ANSWER_STYLES } from "../utils/severity";

function isConcern(question: AuditQuestion): boolean {
  return question.concern ?? question.answer === "No";
}

interface QuestionnaireViewProps {
  questions: AuditQuestion[];
  onEvidenceClick: (timestamp: string) => void;
}

export function QuestionnaireView({ questions, onEvidenceClick }: QuestionnaireViewProps) {
  const sections = useMemo(() => {
    const bySection = new Map<string, AuditQuestion[]>();
    for (const question of questions) {
      const list = bySection.get(question.section) ?? [];
      list.push(question);
      bySection.set(question.section, list);
    }
    return Array.from(bySection.entries());
  }, [questions]);

  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(sections.map(([section]) => section)),
  );

  function toggleSection(section: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map(([section, items]) => {
        const isOpen = openSections.has(section);
        const concernCount = items.filter(isConcern).length;

        return (
          <div
            key={section}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left dark:bg-gray-900"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">{section}</span>
              <div className="flex items-center gap-3">
                {concernCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
                    {concernCount} concern{concernCount > 1 ? "s" : ""}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((question) => (
                  <div key={question.id} className="flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {question.question}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        {isConcern(question) && (
                          <span className="flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                            <AlertTriangle className="h-3 w-3" />
                            Concern
                          </span>
                        )}
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            ANSWER_STYLES[question.answer] ?? ANSWER_STYLES["Unable to determine"]
                          }`}
                        >
                          {question.answer}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{question.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {question.evidenceTimestamp && (
                        <button
                          type="button"
                          onClick={() => onEvidenceClick(question.evidenceTimestamp)}
                          className="font-mono text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {question.evidenceTimestamp}
                        </button>
                      )}
                      <span>confidence {Math.round(question.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
