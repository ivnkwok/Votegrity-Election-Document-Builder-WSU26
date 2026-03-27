import ballotTemplate from "@/data/templates/ballotTemplate.json";
import noticeTemplate from "@/data/templates/noticeTemplate.json";
import candidateStatementTemplate from "@/data/templates/candidateStatementTemplate.json";
import blankTemplate from "@/data/templates/blankTemplate.json";
import { loadDocumentLayoutFromJson, type LoadedDocument } from "@/services/layoutService";

export type TemplateId =
  | "blank-template"
  | "ballot-template"
  | "notice-template"
  | "candidate-statement-template";

export const TEMPLATE_OPTIONS: Array<{ value: TemplateId; label: string }> = [
  { value: "blank-template", label: "Blank Layout" },
  { value: "ballot-template", label: "Ballot Template" },
  { value: "notice-template", label: "Notice Template" },
  { value: "candidate-statement-template", label: "Candidate Statement Template" },
];

const TEMPLATE_LAYOUTS: Record<TemplateId, unknown> = {
  "blank-template": blankTemplate,
  "ballot-template": ballotTemplate,
  "notice-template": noticeTemplate,
  "candidate-statement-template": candidateStatementTemplate,
};

export function loadTemplateLayout(templateId: TemplateId): LoadedDocument {
  const template = TEMPLATE_LAYOUTS[templateId];
  if (!template) {
    throw new Error(`Unknown template "${templateId}".`);
  }

  return loadDocumentLayoutFromJson(template);
}
