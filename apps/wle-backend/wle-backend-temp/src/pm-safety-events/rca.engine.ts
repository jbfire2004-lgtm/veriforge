import { Injectable } from '@nestjs/common';
import { PmRcaMethod, PmSafetyEventType } from '@prisma/client';

/** TapRooT-style causal pathway categories */
export const TAPROOT_PATHWAYS = [
  'human_factors',
  'equipment_failure',
  'procedures',
  'training_gaps',
  'management_systems',
  'environmental_conditions',
] as const;

export type TaprootPathway = (typeof TAPROOT_PATHWAYS)[number];

export type CausalTreeNode = {
  id: string;
  label: string;
  type: 'event' | 'contributing' | 'root' | 'pathway';
  pathway?: TaprootPathway;
  children?: CausalTreeNode[];
};

export type GuidedQuestion = {
  id: string;
  prompt: string;
  pathway?: TaprootPathway;
  required?: boolean;
};

const QUESTIONS_BY_TYPE: Partial<Record<PmSafetyEventType, GuidedQuestion[]>> =
  {
    incident_injury: [
      {
        id: 'injury_mechanism',
        prompt: 'Describe the injury mechanism and body part affected.',
        required: true,
      },
      {
        id: 'ppe_worn',
        prompt: 'Was required PPE worn and in good condition?',
        pathway: 'human_factors',
      },
      {
        id: 'task_training',
        prompt: 'Was the worker trained and authorized for this task?',
        pathway: 'training_gaps',
      },
      {
        id: 'equipment_involved',
        prompt: 'Did equipment failure or defect contribute?',
        pathway: 'equipment_failure',
      },
      {
        id: 'procedure_followed',
        prompt: 'Were procedures/JHA followed?',
        pathway: 'procedures',
      },
      {
        id: 'supervision',
        prompt: 'Was adequate supervision and oversight present?',
        pathway: 'management_systems',
      },
      {
        id: 'environment',
        prompt: 'Did weather, lighting, or site conditions contribute?',
        pathway: 'environmental_conditions',
      },
    ],
    near_miss: [
      { id: 'what_almost', prompt: 'What almost happened?', required: true },
      {
        id: 'barrier_failed',
        prompt: 'Which barrier or control failed?',
        pathway: 'procedures',
      },
      {
        id: 'human_factor',
        prompt: 'Describe any human performance factors.',
        pathway: 'human_factors',
      },
      {
        id: 'equipment',
        prompt: 'Was equipment involved or defective?',
        pathway: 'equipment_failure',
      },
    ],
    incident_property: [
      {
        id: 'damage_desc',
        prompt: 'Describe property/equipment damage.',
        required: true,
      },
      {
        id: 'equipment_condition',
        prompt: 'Equipment maintenance and inspection status?',
        pathway: 'equipment_failure',
      },
      {
        id: 'procedure',
        prompt: 'Operating procedures followed?',
        pathway: 'procedures',
      },
    ],
    incident_environmental: [
      {
        id: 'release_desc',
        prompt: 'Describe the environmental release or impact.',
        required: true,
      },
      {
        id: 'controls',
        prompt: 'Were environmental controls in place?',
        pathway: 'procedures',
      },
      {
        id: 'conditions',
        prompt: 'Environmental/site conditions at time of event?',
        pathway: 'environmental_conditions',
      },
    ],
    equipment_failure: [
      {
        id: 'equip_desc',
        prompt: 'Describe the equipment involved and failure mode.',
        required: true,
      },
      {
        id: 'maintenance',
        prompt:
          'Was the equipment on a current maintenance and inspection schedule?',
        pathway: 'equipment_failure',
      },
      {
        id: 'operator_training',
        prompt: 'Was the operator trained and authorized?',
        pathway: 'training_gaps',
      },
    ],
  };

const DEFAULT_QUESTIONS: GuidedQuestion[] = [
  { id: 'event_summary', prompt: 'Summarize what happened.', required: true },
  {
    id: 'immediate_causes',
    prompt: 'What were the immediate causes?',
    pathway: 'human_factors',
  },
  {
    id: 'equipment_role',
    prompt: 'Did equipment play a role?',
    pathway: 'equipment_failure',
  },
  {
    id: 'procedure_gaps',
    prompt: 'Were procedures adequate and followed?',
    pathway: 'procedures',
  },
  {
    id: 'training',
    prompt: 'Were training/competency requirements met?',
    pathway: 'training_gaps',
  },
  {
    id: 'management',
    prompt: 'Were management systems (planning, oversight) adequate?',
    pathway: 'management_systems',
  },
  {
    id: 'environment',
    prompt: 'Did environmental conditions contribute?',
    pathway: 'environmental_conditions',
  },
];

@Injectable()
export class RcaEngine {
  taprootPathways() {
    return TAPROOT_PATHWAYS.map((key) => ({
      key,
      label: pathwayLabel(key),
      description: pathwayDescription(key),
    }));
  }

  guidedQuestions(eventType: PmSafetyEventType | string): GuidedQuestion[] {
    const typed = eventType as PmSafetyEventType;
    return QUESTIONS_BY_TYPE[typed] ?? DEFAULT_QUESTIONS;
  }

  suggestRootCauses(input: {
    description: string;
    eventType: string;
    contributingFactors: string[];
    guidedAnswers?: Record<string, string>;
    library: Array<{ code: string; label: string; category?: string | null }>;
    historicalCodes?: string[];
  }) {
    const text = [
      input.description,
      ...input.contributingFactors,
      ...Object.values(input.guidedAnswers ?? {}),
    ]
      .join(' ')
      .toLowerCase();

    const suggestions = [];
    for (const entry of input.library) {
      let score = 0;
      const label = entry.label.toLowerCase();
      if (text.includes(label.split(' ')[0] ?? '')) score += 2;
      if (
        input.contributingFactors.some((f) =>
          f.toLowerCase().includes(entry.category ?? ''),
        )
      ) {
        score += 1;
      }
      if (input.historicalCodes?.includes(entry.code)) score += 2;
      if (score > 0) {
        suggestions.push({
          code: entry.code,
          label: entry.label,
          category: entry.category,
          pathway: mapCategoryToPathway(entry.category),
          score,
          method: 'taproot' as PmRcaMethod,
        });
      }
    }

    for (const pathway of TAPROOT_PATHWAYS) {
      const hints = pathwayKeywords(pathway);
      if (hints.some((h) => text.includes(h))) {
        suggestions.push({
          code: `pathway_${pathway}`,
          label: pathwayLabel(pathway),
          category: pathway,
          pathway,
          score: 3,
          method: 'taproot' as PmRcaMethod,
        });
      }
    }

    const seen = new Set<string>();
    return suggestions
      .filter((s) => {
        const k = `${s.pathway}:${s.label}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  suggestContributingFactors(input: {
    eventType: string;
    description: string;
    guidedAnswers?: Record<string, string>;
  }): Array<{ label: string; pathway: TaprootPathway; confidence: number }> {
    const text = [
      input.description,
      ...Object.values(input.guidedAnswers ?? {}),
    ]
      .join(' ')
      .toLowerCase();

    const factors: Array<{
      label: string;
      pathway: TaprootPathway;
      confidence: number;
    }> = [];
    for (const pathway of TAPROOT_PATHWAYS) {
      const hits = pathwayKeywords(pathway).filter((k) => text.includes(k));
      if (hits.length) {
        factors.push({
          label: `${pathwayLabel(pathway)}: ${hits.slice(0, 2).join(', ')}`,
          pathway,
          confidence: Math.min(0.95, 0.4 + hits.length * 0.15),
        });
      }
    }
    return factors.sort((a, b) => b.confidence - a.confidence);
  }

  buildTaprootPathway(input: {
    pathway: TaprootPathway;
    description: string;
    contributingFactors?: string[];
  }) {
    return {
      pathway: input.pathway,
      label: pathwayLabel(input.pathway),
      causalFactors: input.contributingFactors ?? [],
      rootCauseStatement: input.description,
      snapCharT: {
        sequenceOfEvents: [],
        changeAnalysis: input.contributingFactors ?? [],
        correctiveActions: [],
      },
    };
  }

  buildFiveWhyChain(problemStatement: string, rootCause: string): string[] {
    return [
      `Problem: ${problemStatement}`,
      'Why 1: Event occurred',
      'Why 2: Control or barrier failed',
      'Why 3: Underlying process gap',
      `Why 4/5 (root): ${rootCause}`,
    ];
  }

  fishboneCategories() {
    return TAPROOT_PATHWAYS.map((p) => ({
      key: p,
      label: pathwayLabel(p),
    }));
  }

  buildCausalTree(input: {
    eventTitle: string;
    rootCauses: Array<{
      id: string;
      description: string;
      category?: string | null;
      pathway?: string;
    }>;
    contributingFactors: Array<{ label: string; category?: string | null }>;
  }): CausalTreeNode {
    const pathways = new Map<TaprootPathway, CausalTreeNode>();

    for (const p of TAPROOT_PATHWAYS) {
      pathways.set(p, {
        id: `pathway_${p}`,
        label: pathwayLabel(p),
        type: 'pathway',
        pathway: p,
        children: [],
      });
    }

    for (const f of input.contributingFactors) {
      const pathway = mapCategoryToPathway(f.category) ?? 'human_factors';
      pathways.get(pathway)?.children?.push({
        id: `factor_${f.label.slice(0, 12)}`,
        label: f.label,
        type: 'contributing',
        pathway,
      });
    }

    for (const rc of input.rootCauses) {
      const pathway =
        (rc.pathway as TaprootPathway) ??
        mapCategoryToPathway(rc.category) ??
        'human_factors';
      pathways.get(pathway)?.children?.push({
        id: rc.id,
        label: rc.description,
        type: 'root',
        pathway,
      });
    }

    return {
      id: 'event_root',
      label: input.eventTitle,
      type: 'event',
      children: [...pathways.values()].filter(
        (n) => (n.children?.length ?? 0) > 0,
      ),
    };
  }
}

function pathwayLabel(key: TaprootPathway): string {
  const labels: Record<TaprootPathway, string> = {
    human_factors: 'Human factors',
    equipment_failure: 'Equipment failure',
    procedures: 'Procedures',
    training_gaps: 'Training gaps',
    management_systems: 'Management systems',
    environmental_conditions: 'Environmental conditions',
  };
  return labels[key];
}

function pathwayDescription(key: TaprootPathway): string {
  const d: Record<TaprootPathway, string> = {
    human_factors: 'Performance, fatigue, communication, PPE, ergonomics',
    equipment_failure: 'Defects, maintenance, design, inspection gaps',
    procedures: 'JHA, permits, SWP, work planning',
    training_gaps: 'Competency, authorization, orientation',
    management_systems: 'Oversight, planning, culture, resources',
    environmental_conditions: 'Weather, lighting, housekeeping, site layout',
  };
  return d[key];
}

function pathwayKeywords(pathway: TaprootPathway): string[] {
  const map: Record<TaprootPathway, string[]> = {
    human_factors: [
      'ppe',
      'fatigue',
      'human',
      'behavior',
      'distraction',
      'harness',
    ],
    equipment_failure: [
      'equipment',
      'defect',
      'broken',
      'maintenance',
      'crane',
      'tool',
    ],
    procedures: [
      'procedure',
      'permit',
      'jha',
      'plan',
      'work instruction',
      'bypass',
    ],
    training_gaps: [
      'training',
      'untrained',
      'competency',
      'orientation',
      'certification',
    ],
    management_systems: [
      'supervision',
      'management',
      'oversight',
      'culture',
      'resource',
    ],
    environmental_conditions: [
      'weather',
      'lighting',
      'housekeeping',
      'slip',
      'wind',
      'heat',
    ],
  };
  return map[pathway];
}

function mapCategoryToPathway(
  category?: string | null,
): TaprootPathway | undefined {
  if (!category) return undefined;
  const c = category.toLowerCase();
  if (TAPROOT_PATHWAYS.includes(c as TaprootPathway))
    return c as TaprootPathway;
  if (/human|ppe|behavior/.test(c)) return 'human_factors';
  if (/equip|machine/.test(c)) return 'equipment_failure';
  if (/proc|process|plan/.test(c)) return 'procedures';
  if (/train|compet/.test(c)) return 'training_gaps';
  if (/manage|super/.test(c)) return 'management_systems';
  if (/env|weather|house/.test(c)) return 'environmental_conditions';
  return undefined;
}
