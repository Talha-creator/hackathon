import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import type { AuditQuestion } from "../types/audit.types";
import { isConcern } from "../utils/severity";

interface SectionComplianceMetersProps {
  questions: AuditQuestion[];
}

export function SectionComplianceMeters({ questions }: SectionComplianceMetersProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const bySection = new Map<string, AuditQuestion[]>();
  for (const question of questions) {
    const list = bySection.get(question.section) ?? [];
    list.push(question);
    bySection.set(question.section, list);
  }

  return (
    <div className="flex flex-col">
      {Array.from(bySection.entries()).map(([section, sectionQuestions]) => {
        const concerns = sectionQuestions.filter((q) => isConcern(q.answer, q.concern));
        const hasConcerns = concerns.length > 0;
        const isOpen = expandedSection === section;

        return (
          <div key={section} className="border-b border-gray-100 py-3 last:border-0 dark:border-white/5">
            <button
              type="button"
              onClick={() => hasConcerns && setExpandedSection(isOpen ? null : section)}
              className={`flex w-full items-center justify-between gap-2 text-left ${
                hasConcerns ? "" : "cursor-default"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {hasConcerns ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                )}
                {section}
              </span>
              {hasConcerns && (
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {isOpen && hasConcerns && (
              <div className="mt-3 flex flex-col gap-3 border-l-2 border-red-100 pl-4 dark:border-red-900/40">
                {concerns.map((q) => (
                  <div key={q.id} className="flex flex-col gap-1">
                    <p className="text-xs text-gray-700 dark:text-gray-300">{q.question}</p>
                    {q.reason && (
                      <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                        Why this was flagged: {q.reason}
                      </p>
                    )}
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
