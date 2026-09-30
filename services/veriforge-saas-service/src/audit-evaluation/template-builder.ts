import type { AuditQuestionType } from '@prisma/client';

export type TemplateQuestionInput = {
  prompt: string;
  helpText?: string;
  questionType?: AuditQuestionType;
  weight?: number;
  maxScore?: number;
  required?: boolean;
  sortOrder?: number;
  documentCategoryHint?: string;
};

export type TemplateSectionInput = {
  title: string;
  description?: string;
  weight: number;
  sortOrder?: number;
  questions: TemplateQuestionInput[];
};

export type TemplateBuilderInput = {
  name: string;
  description?: string;
  category?: string;
  sections: TemplateSectionInput[];
};

/** Validate section weights > 0 and at least one scorable question. */
export function validateTemplateBuilder(input: TemplateBuilderInput): string[] {
  const errors: string[] = [];
  if (!input.name?.trim()) errors.push('name required');
  if (!input.sections?.length) errors.push('at least one section required');
  let scorable = 0;
  for (const [i, s] of (input.sections || []).entries()) {
    if (!s.title?.trim()) errors.push(`section[${i}].title required`);
    if (!(s.weight > 0)) errors.push(`section[${i}].weight must be > 0`);
    if (!s.questions?.length) errors.push(`section[${i}] needs questions`);
    for (const [j, q] of (s.questions || []).entries()) {
      if (!q.prompt?.trim()) errors.push(`section[${i}].questions[${j}].prompt required`);
      if ((q.weight ?? 1) < 0) errors.push(`section[${i}].questions[${j}].weight invalid`);
      if (q.questionType !== 'text' && q.questionType !== 'na') scorable += 1;
    }
  }
  if (input.sections?.length && scorable === 0) {
    errors.push('template needs at least one scorable question');
  }
  return errors;
}

/** Default platform safety prequalification template. */
export function defaultSafetyTemplate(): TemplateBuilderInput {
  return {
    name: 'Safety prequalification',
    description:
      'Standard VeriForge safety audit — insurance, programs, training, and site readiness.',
    category: 'safety',
    sections: [
      {
        title: 'Insurance & certificates',
        weight: 25,
        sortOrder: 0,
        questions: [
          {
            prompt: 'Current liability insurance certificate on file?',
            questionType: 'score',
            weight: 2,
            maxScore: 100,
            documentCategoryHint: 'insurance',
          },
          {
            prompt: 'Workers compensation / WCB coverage adequate?',
            questionType: 'yes_no',
            weight: 1,
            maxScore: 100,
            documentCategoryHint: 'insurance',
          },
        ],
      },
      {
        title: 'Safety programs',
        weight: 35,
        sortOrder: 1,
        questions: [
          {
            prompt: 'Written HSE / safety program currency and completeness',
            questionType: 'score',
            weight: 2,
            maxScore: 100,
            documentCategoryHint: 'safety_program',
          },
          {
            prompt: 'Incident reporting process documented?',
            questionType: 'yes_no',
            weight: 1,
            maxScore: 100,
            documentCategoryHint: 'safety_program',
          },
        ],
      },
      {
        title: 'Licenses & training',
        weight: 25,
        sortOrder: 2,
        questions: [
          {
            prompt: 'Trade / business licenses current',
            questionType: 'score',
            weight: 1,
            maxScore: 100,
            documentCategoryHint: 'license',
          },
          {
            prompt: 'Required training certificates current',
            questionType: 'score',
            weight: 2,
            maxScore: 100,
            documentCategoryHint: 'training',
          },
        ],
      },
      {
        title: 'Site readiness',
        weight: 15,
        sortOrder: 3,
        questions: [
          {
            prompt: 'Supervisor competency and orientation process',
            questionType: 'score',
            weight: 1,
            maxScore: 100,
          },
          {
            prompt: 'Reviewer notes',
            questionType: 'text',
            weight: 0,
            required: false,
          },
        ],
      },
    ],
  };
}
