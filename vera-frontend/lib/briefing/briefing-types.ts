import type { BriefingFormValues } from "./briefing-schema";

export type BriefingSection = {
  id: string;
  heading: string;
  body: string;
};

export type GeneratedBriefing = {
  title: string;
  generatedAt: string;
  source: "openai" | "template";
  sections: BriefingSection[];
  markdown: string;
  plainText: string;
};

export type BriefingGenerateInput = BriefingFormValues & {
  jobTypeLabel?: string;
};
