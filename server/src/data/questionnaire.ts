export interface QuestionnaireItem {
  id: string;
  section: string;
  question: string;
}

/**
 * Official Health & Safety audit question set — sourced verbatim from
 * questions.md (the Hackathon H&S Audit Question Set). Every audit MUST
 * evaluate all questions across all four sections. Question ids follow
 * "section.index" (e.g. "1.2"). Section 5 ("Findings & Actions") is not a
 * yes/no question — it is synthesized separately as the Findings Log.
 */
export const SAFETY_QUESTIONNAIRE: QuestionnaireItem[] = [
  // 1. Access, Egress & Fire Safety
  {
    id: "1.1",
    section: "Access, Egress & Fire Safety",
    question:
      "Are all fire exits, escape routes and fire-fighting equipment clear, visible and unobstructed?",
  },
  {
    id: "1.2",
    section: "Access, Egress & Fire Safety",
    question: "Is there any fire safety signage that's damaged, missing, or obscured?",
  },

  // 2. Housekeeping & Walkways
  {
    id: "2.1",
    section: "Housekeeping & Walkways",
    question:
      "Are floors, walkways and stairs free of trip, slip or obstruction hazards (trailing cables, loose items, spillages)?",
  },
  {
    id: "2.2",
    section: "Housekeeping & Walkways",
    question: "Is general housekeeping (storage, waste, clutter) at an acceptable standard?",
  },
  {
    id: "2.3",
    section: "Housekeeping & Walkways",
    question:
      "Are hazard warning signs (e.g. wet floor) present, legible, and correctly placed where needed?",
  },

  // 3. People, PPE & Behaviour
  {
    id: "3.1",
    section: "People, PPE & Behaviour",
    question: "Is anyone visible without the PPE appropriate to their task or area?",
  },
  {
    id: "3.2",
    section: "People, PPE & Behaviour",
    question:
      "Are people observed behaving safely (correct equipment use, no obvious unsafe shortcuts)?",
  },

  // 4. Environment & Equipment
  {
    id: "4.1",
    section: "Environment & Equipment",
    question: "Is lighting adequate for the tasks and areas seen in the walk?",
  },
  {
    id: "4.2",
    section: "Environment & Equipment",
    question:
      "Is any equipment, machinery or electrical item visibly damaged, unguarded, or unsafely used (e.g. overloaded sockets, unwound cable reels)?",
  },
];

export function formatQuestionnaireForPrompt(): string {
  return SAFETY_QUESTIONNAIRE.map(
    (item) => `- [${item.id}] (${item.section}) ${item.question}`,
  ).join("\n");
}
