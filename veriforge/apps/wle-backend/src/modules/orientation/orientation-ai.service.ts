import { Injectable } from '@nestjs/common';
import {
  DEFAULT_ORIENTATION_SECTIONS_EN,
  ORIENTATION_LOCALES,
  type OrientationLocale,
} from './orientation.constants';

export type AiGenerateInput = {
  industry: string;
  businessType: string;
  workEnvironment: string;
  hazards: string[];
  ppeRequirements: string[];
  safetyPrograms: string[];
  regulatoryRegion: string;
  companyRules?: string;
  siteRules?: string;
};

@Injectable()
export class OrientationAiService {
  generate(input: AiGenerateInput): {
    sections: Record<string, unknown[]>;
    quiz: Record<string, unknown[]>;
    aiMetadata: Record<string, unknown>;
  } {
    const base = [
      ...DEFAULT_ORIENTATION_SECTIONS_EN,
      {
        id: 'industry',
        type: 'text',
        title: 'Industry context',
        body: `Industry: ${input.industry}. Business type: ${input.businessType}. Environment: ${input.workEnvironment}.`,
      },
      {
        id: 'hazards-site',
        type: 'list',
        title: 'Hazards present',
        body: input.hazards.join('\n'),
      },
      {
        id: 'ppe-site',
        type: 'list',
        title: 'PPE requirements',
        body: input.ppeRequirements.join('\n'),
      },
      {
        id: 'programs',
        type: 'list',
        title: 'Safety programs',
        body: input.safetyPrograms.join('\n'),
      },
      {
        id: 'whmis',
        type: 'text',
        title: 'WHMIS / SDS',
        body: 'Know how to access SDS, label requirements, and spill response for chemicals on site.',
      },
      {
        id: 'regulatory',
        type: 'text',
        title: 'Regulatory region',
        body: `This orientation aligns with requirements for ${input.regulatoryRegion}.`,
      },
    ];
    if (input.companyRules) {
      base.push({
        id: 'company-rules',
        type: 'text',
        title: 'Company rules',
        body: input.companyRules,
      });
    }
    if (input.siteRules) {
      base.push({
        id: 'site-rules',
        type: 'text',
        title: 'Site rules',
        body: input.siteRules,
      });
    }

    const sections: Record<string, unknown[]> = { en: base };
    for (const locale of ORIENTATION_LOCALES) {
      if (locale === 'en') continue;
      sections[locale] = base.map((s) => ({
        ...s,
        title: `[${locale.toUpperCase()}] ${s.title}`,
        body: s.body,
      }));
    }

    const quizEn = [
      {
        id: 'q1',
        prompt: 'Who must you notify before starting unfamiliar work?',
        choices: ['Supervisor', 'Nobody', 'Only HR'],
        answerIndex: 0,
      },
      {
        id: 'q2',
        prompt: 'When should you stop work?',
        choices: ['When unsafe', 'End of shift only', 'Never'],
        answerIndex: 0,
      },
    ];

    const quiz: Record<string, unknown[]> = { en: quizEn };
    for (const locale of ORIENTATION_LOCALES) {
      if (locale === 'en') continue;
      quiz[locale] = quizEn;
    }

    return {
      sections,
      quiz,
      aiMetadata: { ...input, generator: 'vera-orientation-v1' },
    };
  }
}
