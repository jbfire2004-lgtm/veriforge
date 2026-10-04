/**
 * CSRA (Critical Safety Risk Assessment) methodology for HECA.
 *
 * Steps:
 * 1. Identify high-energy sources
 * 2. Evaluate exposure level and proximity
 * 3. Classify controls as Direct vs Alternative
 * 4. Assess SIF potential
 * 5. Recommend missing controls
 * 6. Produce HECA assessment document
 */

import { Injectable } from '@nestjs/common';
import {
  HIGH_ENERGY_TYPES,
  SIF_ENERGY_WHEEL,
  SIF_INDICATORS,
  categoryFromScore,
} from './sif-heca.constants';
import {
  inferControlClass,
  type ControlClass,
} from '../jha-flha/jha-control-class';

export type CsraProximity = 'contact' | 'near' | 'zone' | 'remote';
export type CsraExposureLevel = 1 | 2 | 3 | 4 | 5;

export type CsraControlInput = {
  description?: string;
  controlType: string;
  adequate?: boolean | null;
  effectivenessScore?: number | null;
  verified?: boolean;
  energyTypes?: string[];
};

export type CsraAssessmentInput = {
  title: string;
  description?: string;
  workScope?: string;
  locationNote?: string;
  environmentNote?: string;
  equipmentNote?: string;
  /** Explicit energy types when known; otherwise inferred from text */
  energyTypes?: string[];
  /** 1=rare/brief … 5=continuous/high magnitude */
  exposureLevel?: CsraExposureLevel;
  proximity?: CsraProximity;
  controls?: CsraControlInput[];
  /** Optional pre-scored SIF category from sibling engines */
  sifHint?: {
    score?: number;
    category?: string;
    indicators?: string[];
  };
};

export type CsraEnergySource = {
  type: string;
  label: string;
  highEnergy: boolean;
  /** Inferred magnitude 1–5 */
  magnitude: number;
  evidence: string[];
};

export type CsraClassifiedControl = {
  description: string;
  controlType: string;
  controlClass: ControlClass;
  adequate: boolean;
  verified: boolean;
  linkedEnergies: string[];
};

export type CsraRecommendation = {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  controlClass: ControlClass;
  controlType: string;
  description: string;
  energyType: string;
  reason: string;
};

export type HecaAssessmentDocumentSection = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};

export type HecaAssessmentDocument = {
  documentType: 'HECA_CSRA';
  title: string;
  generatedAt: string;
  methodology: 'CSRA';
  revision: string;
  summary: {
    highEnergy: boolean;
    sifApplies: boolean;
    sifCategory: string;
    sifScore: number;
    directControlCount: number;
    alternativeControlCount: number;
    missingDirectControls: number;
    supervisorReviewRequired: boolean;
    readyForWork: boolean;
  };
  sections: HecaAssessmentDocumentSection[];
};

export type CsraAssessmentOutput = {
  methodology: 'CSRA';
  highEnergySources: CsraEnergySource[];
  exposure: {
    level: CsraExposureLevel;
    proximity: CsraProximity;
    score: number;
    narrative: string;
  };
  controls: {
    classified: CsraClassifiedControl[];
    directCount: number;
    alternativeCount: number;
    hasDirectForHighEnergy: boolean;
    adequate: boolean;
    findings: string[];
  };
  sifPotential: {
    applies: boolean;
    category: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    indicators: string[];
    narrative: string;
    requiresSupervisorReview: boolean;
  };
  recommendations: CsraRecommendation[];
  document: HecaAssessmentDocument;
};

const PROXIMITY_SCORE: Record<CsraProximity, number> = {
  contact: 5,
  near: 4,
  zone: 3,
  remote: 1,
};

const ENERGY_PATTERNS: Array<{
  type: string;
  patterns: RegExp;
  magnitudeBoost: number;
}> = [
  {
    type: 'gravity',
    patterns:
      /fall|height|ladder|scaffold|roof|edge|elevation|drop|overhead load/i,
    magnitudeBoost: 1,
  },
  {
    type: 'motion',
    patterns: /ergonomic|strain|lift(ing)?|awkward|repetitive|manual handl/i,
    magnitudeBoost: 0,
  },
  {
    type: 'mechanical',
    patterns: /rotat|pinch|caught|conveyor|gear|machine guard|moving part/i,
    magnitudeBoost: 1,
  },
  {
    type: 'electrical',
    patterns: /electrical|arc|energiz|voltage|shock|loto|lockout|panel/i,
    magnitudeBoost: 2,
  },
  {
    type: 'pressure',
    patterns: /pressure|pneumatic|hydraulic|stored energy|vessel|blowout/i,
    magnitudeBoost: 2,
  },
  {
    type: 'chemical',
    patterns: /chemical|corrosive|toxic|h2s|solvent|spill|fume/i,
    magnitudeBoost: 1,
  },
  {
    type: 'thermal',
    patterns: /thermal|heat|hot work|weld|burn|steam|cryogenic/i,
    magnitudeBoost: 1,
  },
  {
    type: 'radiation',
    patterns: /radiation|x-?ray|radiograph|nuclear|laser/i,
    magnitudeBoost: 2,
  },
];

const PROXIMITY_PATTERNS: Array<{ proximity: CsraProximity; patterns: RegExp }> =
  [
    {
      proximity: 'contact',
      patterns: /in contact|hands.?on|touching|body.?in|inside|enter(ing)?/i,
    },
    {
      proximity: 'near',
      patterns: /within arm|beside|adjacent|next to|close to|immediate/i,
    },
    {
      proximity: 'zone',
      patterns: /exclusion|zone|barricade|spotter|stand.?off|perimeter/i,
    },
    {
      proximity: 'remote',
      patterns: /remote|from cab|from ground|outside|away from/i,
    },
  ];

/** Canonical direct-control recommendations by energy type (CSRA). */
const DIRECT_CONTROL_LIBRARY: Record<
  string,
  Array<{ controlType: string; description: string }>
> = {
  gravity: [
    {
      controlType: 'engineering',
      description: 'Install guardrails / hole covers / fall-arrest anchorage',
    },
    {
      controlType: 'elimination',
      description: 'Eliminate work at height (prefab / ground-level assembly)',
    },
  ],
  mechanical: [
    {
      controlType: 'engineering',
      description: 'Machine guarding / interlocks on moving parts',
    },
    {
      controlType: 'engineering',
      description: 'LOTO / energy isolation before contact with machinery',
    },
  ],
  electrical: [
    {
      controlType: 'engineering',
      description: 'Verified LOTO / zero-energy state before panel work',
    },
    {
      controlType: 'engineering',
      description: 'Insulated barriers / arc-rated enclosure',
    },
  ],
  pressure: [
    {
      controlType: 'engineering',
      description: 'Depressurize / isolate and verify zero energy',
    },
    {
      controlType: 'engineering',
      description: 'Pressure relief / whip checks / rated fittings',
    },
  ],
  chemical: [
    {
      controlType: 'engineering',
      description: 'Local exhaust ventilation / closed transfer',
    },
    {
      controlType: 'substitution',
      description: 'Substitute lower-hazard chemical or process',
    },
  ],
  thermal: [
    {
      controlType: 'engineering',
      description: 'Heat shields / cool-down / isolation of hot surfaces',
    },
  ],
  radiation: [
    {
      controlType: 'engineering',
      description: 'Shielding / exclusion zone with dose monitoring',
    },
  ],
  motion: [
    {
      controlType: 'engineering',
      description: 'Mechanical lift assist / ergonomic fixture',
    },
  ],
};

const ALTERNATIVE_CONTROL_LIBRARY: Record<
  string,
  Array<{ controlType: string; description: string }>
> = {
  gravity: [
    {
      controlType: 'administrative',
      description: '100% tie-off procedure and competent person check',
    },
    { controlType: 'ppe', description: 'Full-body harness with SRL' },
  ],
  electrical: [
    {
      controlType: 'administrative',
      description: 'Energized work permit and two-person rule',
    },
    { controlType: 'ppe', description: 'Arc-rated PPE / insulated gloves' },
  ],
  pressure: [
    {
      controlType: 'administrative',
      description: 'Line-break permit and bleed-down checklist',
    },
  ],
  mechanical: [
    {
      controlType: 'administrative',
      description: 'Spotter / exclusion during equipment motion',
    },
  ],
  chemical: [
    { controlType: 'ppe', description: 'Chemical-resistant PPE / respirator' },
  ],
  thermal: [
    { controlType: 'ppe', description: 'Heat-resistant gloves / face shield' },
  ],
  radiation: [
    {
      controlType: 'administrative',
      description: 'Time-distance-shielding work plan',
    },
  ],
  motion: [
    {
      controlType: 'administrative',
      description: 'Job rotation and lift technique briefing',
    },
  ],
};

@Injectable()
export class CsraHecaEngine {
  assess(input: CsraAssessmentInput): CsraAssessmentOutput {
    const text = [
      input.title,
      input.description,
      input.workScope,
      input.locationNote,
      input.environmentNote,
      input.equipmentNote,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const highEnergySources = this.identifyHighEnergySources(
      text,
      input.energyTypes ?? [],
    );
    const exposure = this.evaluateExposure(text, input);
    const controls = this.classifyControls(
      input.controls ?? [],
      highEnergySources,
    );
    const sifPotential = this.assessSifPotential(
      text,
      highEnergySources,
      exposure,
      controls,
      input.sifHint,
    );
    const recommendations = this.recommendMissingControls(
      highEnergySources,
      controls,
      sifPotential,
    );

    const document = this.buildDocument(
      input,
      highEnergySources,
      exposure,
      controls,
      sifPotential,
      recommendations,
    );

    return {
      methodology: 'CSRA',
      highEnergySources,
      exposure,
      controls,
      sifPotential,
      recommendations,
      document,
    };
  }

  private identifyHighEnergySources(
    text: string,
    explicit: string[],
  ): CsraEnergySource[] {
    const byType = new Map<string, CsraEnergySource>();

    for (const seg of SIF_ENERGY_WHEEL) {
      byType.set(seg.type, {
        type: seg.type,
        label: seg.label,
        highEnergy: seg.highEnergy || HIGH_ENERGY_TYPES.has(seg.type),
        magnitude: 0,
        evidence: [],
      });
    }

    for (const et of explicit) {
      const key = et.toLowerCase();
      const existing = byType.get(key);
      if (existing) {
        existing.magnitude = Math.max(existing.magnitude, 3);
        existing.evidence.push('Declared on assessment input');
        if (HIGH_ENERGY_TYPES.has(key)) existing.highEnergy = true;
      } else {
        byType.set(key, {
          type: key,
          label: key,
          highEnergy: HIGH_ENERGY_TYPES.has(key),
          magnitude: 3,
          evidence: ['Declared on assessment input'],
        });
      }
    }

    for (const rule of ENERGY_PATTERNS) {
      if (rule.patterns.test(text)) {
        const existing = byType.get(rule.type) ?? {
          type: rule.type,
          label:
            SIF_ENERGY_WHEEL.find((s) => s.type === rule.type)?.label ??
            rule.type,
          highEnergy: HIGH_ENERGY_TYPES.has(rule.type),
          magnitude: 0,
          evidence: [] as string[],
        };
        existing.magnitude = Math.min(
          5,
          Math.max(existing.magnitude, 3 + rule.magnitudeBoost),
        );
        existing.evidence.push(`Text match: ${rule.patterns.source.slice(0, 48)}`);
        if (HIGH_ENERGY_TYPES.has(rule.type) || existing.magnitude >= 4) {
          existing.highEnergy = true;
        }
        byType.set(rule.type, existing);
      }
    }

    return Array.from(byType.values())
      .filter((s) => s.magnitude > 0 || explicit.includes(s.type))
      .sort((a, b) => b.magnitude - a.magnitude || Number(b.highEnergy) - Number(a.highEnergy));
  }

  private evaluateExposure(
    text: string,
    input: CsraAssessmentInput,
  ): CsraAssessmentOutput['exposure'] {
    let proximity: CsraProximity = input.proximity ?? 'zone';
    if (!input.proximity) {
      for (const rule of PROXIMITY_PATTERNS) {
        if (rule.patterns.test(text)) {
          proximity = rule.proximity;
          break;
        }
      }
      if (/height|scaffold|ladder|energiz|live|hot work/i.test(text)) {
        proximity = proximity === 'remote' ? 'near' : proximity;
      }
    }

    let level: CsraExposureLevel = input.exposureLevel ?? 3;
    if (!input.exposureLevel) {
      if (/continuous|all day|prolonged|repeated/i.test(text)) level = 5;
      else if (/frequent|multiple times|throughout/i.test(text)) level = 4;
      else if (/brief|momentary|spot check/i.test(text)) level = 2;
      else if (/unlikely|rare|one.?time/i.test(text)) level = 1;
    }

    const score = Math.min(25, level * 3 + PROXIMITY_SCORE[proximity] * 2);
    const narrative = `Exposure level ${level}/5 with ${proximity} proximity (CSRA exposure score ${score}).`;

    return { level, proximity, score, narrative };
  }

  private classifyControls(
    controls: CsraControlInput[],
    energies: CsraEnergySource[],
  ): CsraAssessmentOutput['controls'] {
    const energyKeys = energies.map((e) => e.type);
    const classified: CsraClassifiedControl[] = controls.map((c) => {
      const controlClass = inferControlClass(
        c.controlType,
        c.energyTypes?.length ? c.energyTypes : energyKeys,
      );
      return {
        description: c.description ?? `${c.controlType} control`,
        controlType: c.controlType,
        controlClass,
        adequate: c.adequate !== false && (c.effectivenessScore ?? 4) >= 3,
        verified: Boolean(c.verified),
        linkedEnergies: c.energyTypes?.length ? c.energyTypes : energyKeys,
      };
    });

    const directCount = classified.filter((c) => c.controlClass === 'direct')
      .length;
    const alternativeCount = classified.filter(
      (c) => c.controlClass === 'alternative',
    ).length;

    const highEnergy = energies.filter((e) => e.highEnergy);
    const hasDirectForHighEnergy =
      highEnergy.length === 0 ||
      highEnergy.every((he) =>
        classified.some(
          (c) =>
            c.controlClass === 'direct' &&
            (c.linkedEnergies.includes(he.type) || c.linkedEnergies.length === 0),
        ),
      ) ||
      (directCount > 0 && highEnergy.length > 0);

    const findings: string[] = [];
    if (highEnergy.length > 0 && directCount === 0) {
      findings.push(
        'CSRA: High-energy source(s) present without a Direct control — Direct control required before work',
      );
    }
    if (
      highEnergy.length > 0 &&
      directCount === 0 &&
      alternativeCount > 0
    ) {
      findings.push(
        'CSRA: Only Alternative controls (admin/PPE) applied to high-energy work — insufficient under CSRA',
      );
    }
    for (const c of classified) {
      if (!c.verified && c.controlClass === 'direct') {
        findings.push(`Unverified Direct control: ${c.description}`);
      }
      if (!c.adequate) {
        findings.push(`Inadequate control: ${c.description}`);
      }
    }

    const adequate =
      (highEnergy.length === 0 || directCount > 0) &&
      findings.filter((f) => f.includes('without a Direct')).length === 0;

    return {
      classified,
      directCount,
      alternativeCount,
      hasDirectForHighEnergy,
      adequate,
      findings,
    };
  }

  private assessSifPotential(
    text: string,
    energies: CsraEnergySource[],
    exposure: CsraAssessmentOutput['exposure'],
    controls: CsraAssessmentOutput['controls'],
    sifHint?: CsraAssessmentInput['sifHint'],
  ): CsraAssessmentOutput['sifPotential'] {
    const indicators: string[] = [];
    for (const ind of SIF_INDICATORS) {
      const hit =
        text.includes(ind.code.toLowerCase().replace(/_/g, ' ')) ||
        (ind.code === 'FALL_HEIGHT' && /fall|height|scaffold|ladder/i.test(text)) ||
        (ind.code === 'STRUCK_BY' && /struck|crane|overhead|swing/i.test(text)) ||
        (ind.code === 'CAUGHT_IN' && /caught|pinch|between/i.test(text)) ||
        (ind.code === 'ELECTRICAL_CONTACT' &&
          /electrical|arc|shock|energiz/i.test(text)) ||
        (ind.code === 'CONFINED_SPACE' && /confined|vessel|tank|manhole/i.test(text)) ||
        (ind.code === 'HEAVY_LIFT' && /critical lift|heavy lift|rigging/i.test(text)) ||
        (ind.code === 'VEHICLE_STRIKE' &&
          /vehicle|forklift|excavator|mobile equipment/i.test(text));
      if (hit) indicators.push(ind.label);
    }
    for (const hint of sifHint?.indicators ?? []) {
      if (!indicators.includes(hint)) indicators.push(hint);
    }

    const highEnergy = energies.some((e) => e.highEnergy);
    let score =
      (sifHint?.score ?? 0) ||
      exposure.score +
        (highEnergy ? 25 : 8) +
        indicators.length * 8 +
        (controls.directCount === 0 && highEnergy ? 20 : 0) +
        (controls.adequate ? 0 : 10);

    score = Math.min(100, Math.round(score));
    const category =
      (sifHint?.category as CsraAssessmentOutput['sifPotential']['category']) ||
      categoryFromScore(score);

    const applies =
      highEnergy ||
      indicators.length > 0 ||
      category === 'high' ||
      category === 'critical' ||
      exposure.level >= 4;

    const requiresSupervisorReview =
      applies &&
      (category === 'high' ||
        category === 'critical' ||
        !controls.hasDirectForHighEnergy ||
        highEnergy);

    const narrative = applies
      ? `SIF potential ${category} (score ${score}) — CSRA indicates elevated serious-injury risk from ${
          highEnergy
            ? energies
                .filter((e) => e.highEnergy)
                .map((e) => e.label)
                .join(', ')
            : 'exposure profile'
        }.`
      : `SIF potential ${category} (score ${score}) — CSRA does not indicate elevated SIF protocol from current energy/exposure/control profile.`;

    return {
      applies,
      category,
      score,
      indicators,
      narrative,
      requiresSupervisorReview,
    };
  }

  private recommendMissingControls(
    energies: CsraEnergySource[],
    controls: CsraAssessmentOutput['controls'],
    sif: CsraAssessmentOutput['sifPotential'],
  ): CsraRecommendation[] {
    const recs: CsraRecommendation[] = [];
    let n = 0;

    const presentDescriptions = new Set(
      controls.classified.map((c) => c.description.toLowerCase()),
    );

    for (const energy of energies.filter((e) => e.highEnergy || e.magnitude >= 3)) {
      const hasDirect = controls.classified.some(
        (c) =>
          c.controlClass === 'direct' &&
          (c.linkedEnergies.includes(energy.type) ||
            controls.directCount > 0),
      );

      if (!hasDirect || controls.directCount === 0) {
        for (const cand of DIRECT_CONTROL_LIBRARY[energy.type] ?? []) {
          if (presentDescriptions.has(cand.description.toLowerCase())) continue;
          n += 1;
          recs.push({
            id: `rec-d-${n}`,
            priority: sif.applies ? 'critical' : 'high',
            controlClass: 'direct',
            controlType: cand.controlType,
            description: cand.description,
            energyType: energy.type,
            reason: `CSRA: missing Direct control for ${energy.label} high-energy source`,
          });
        }
      }

      // Always suggest a complementary alternative if none present for that energy
      const hasAlt = controls.classified.some(
        (c) => c.controlClass === 'alternative',
      );
      if (!hasAlt || controls.alternativeCount === 0) {
        for (const cand of (ALTERNATIVE_CONTROL_LIBRARY[energy.type] ?? []).slice(
          0,
          1,
        )) {
          if (presentDescriptions.has(cand.description.toLowerCase())) continue;
          n += 1;
          recs.push({
            id: `rec-a-${n}`,
            priority: 'medium',
            controlClass: 'alternative',
            controlType: cand.controlType,
            description: cand.description,
            energyType: energy.type,
            reason: `CSRA: Alternative control to reinforce ${energy.label} defenses`,
          });
        }
      }
    }

    if (controls.classified.some((c) => c.controlClass === 'direct' && !c.verified)) {
      n += 1;
      recs.push({
        id: `rec-v-${n}`,
        priority: 'high',
        controlClass: 'direct',
        controlType: 'administrative',
        description: 'Field-verify Direct controls before task start (CSRA check)',
        energyType: energies[0]?.type ?? 'general',
        reason: 'Direct control present but not verified',
      });
    }

    const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 };
    return recs
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
      .slice(0, 12);
  }

  private buildDocument(
    input: CsraAssessmentInput,
    energies: CsraEnergySource[],
    exposure: CsraAssessmentOutput['exposure'],
    controls: CsraAssessmentOutput['controls'],
    sif: CsraAssessmentOutput['sifPotential'],
    recommendations: CsraRecommendation[],
  ): HecaAssessmentDocument {
    const missingDirect = recommendations.filter(
      (r) => r.controlClass === 'direct' && r.priority !== 'low',
    ).length;
    const highEnergy = energies.some((e) => e.highEnergy);
    const readyForWork =
      controls.adequate &&
      missingDirect === 0 &&
      (!sif.requiresSupervisorReview || controls.hasDirectForHighEnergy);

    const sections: HecaAssessmentDocumentSection[] = [
      {
        id: 'scope',
        title: '1. Work scope',
        body: [
          input.title,
          input.description,
          input.workScope,
          input.locationNote ? `Location: ${input.locationNote}` : null,
          input.equipmentNote ? `Equipment: ${input.equipmentNote}` : null,
          input.environmentNote
            ? `Environment: ${input.environmentNote}`
            : null,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      {
        id: 'high_energy',
        title: '2. High-energy sources (CSRA step 1)',
        body: highEnergy
          ? 'The following high-energy sources were identified for this activity.'
          : 'No high-energy sources identified above CSRA threshold; monitor for field changes.',
        bullets: energies.map(
          (e) =>
            `${e.label} — magnitude ${e.magnitude}/5${
              e.highEnergy ? ' · HIGH ENERGY' : ''
            }${e.evidence.length ? ` (${e.evidence[0]})` : ''}`,
        ),
      },
      {
        id: 'exposure',
        title: '3. Exposure & proximity (CSRA step 2)',
        body: exposure.narrative,
        bullets: [
          `Exposure level: ${exposure.level}/5`,
          `Proximity: ${exposure.proximity}`,
          `Exposure score: ${exposure.score}`,
        ],
      },
      {
        id: 'controls',
        title: '4. Direct vs Alternative controls (CSRA step 3)',
        body: controls.adequate
          ? 'Control set meets CSRA Direct-control expectations for identified energies.'
          : 'Control set does not yet meet CSRA Direct-control expectations.',
        bullets: [
          `Direct controls: ${controls.directCount}`,
          `Alternative controls: ${controls.alternativeCount}`,
          ...controls.classified.map(
            (c) =>
              `[${c.controlClass === 'direct' ? 'Direct' : 'Alternative'}] ${
                c.description
              } (${c.controlType}${c.verified ? ', verified' : ', unverified'})`,
          ),
          ...controls.findings,
        ],
      },
      {
        id: 'sif',
        title: '5. SIF potential (CSRA step 4)',
        body: sif.narrative,
        bullets: [
          `Applies: ${sif.applies ? 'Yes' : 'No'}`,
          `Category: ${sif.category}`,
          `Score: ${sif.score}`,
          `Supervisor review: ${
            sif.requiresSupervisorReview ? 'Required' : 'Not required'
          }`,
          ...(sif.indicators.length
            ? sif.indicators.map((i) => `Indicator: ${i}`)
            : ['No SIF indicator codes matched']),
        ],
      },
      {
        id: 'recommendations',
        title: '6. AI / CSRA recommendations for missing controls (step 5)',
        body:
          recommendations.length > 0
            ? 'Implement the following controls before authorizing work.'
            : 'No additional controls recommended under current CSRA profile.',
        bullets: recommendations.map(
          (r) =>
            `[${r.priority.toUpperCase()} · ${
              r.controlClass === 'direct' ? 'Direct' : 'Alternative'
            }] ${r.description} — ${r.reason}`,
        ),
      },
      {
        id: 'authorization',
        title: '7. Authorization',
        body: readyForWork
          ? 'CSRA assessment indicates controls are adequate to proceed pending standard field verification.'
          : 'CSRA assessment indicates work should not proceed until Direct controls are implemented/verified and supervisor review is complete where required.',
        bullets: [
          'Assessor signature: ________________________  Date: __________',
          'Supervisor signature: _____________________  Date: __________',
          sif.requiresSupervisorReview
            ? 'Supervisor review REQUIRED before work'
            : 'Supervisor review not required by CSRA',
        ],
      },
    ];

    return {
      documentType: 'HECA_CSRA',
      title: `HECA Assessment (CSRA) — ${input.title}`,
      generatedAt: new Date().toISOString(),
      methodology: 'CSRA',
      revision: `CSRA-${Date.now().toString(36).toUpperCase()}`,
      summary: {
        highEnergy,
        sifApplies: sif.applies,
        sifCategory: sif.category,
        sifScore: sif.score,
        directControlCount: controls.directCount,
        alternativeControlCount: controls.alternativeCount,
        missingDirectControls: missingDirect,
        supervisorReviewRequired: sif.requiresSupervisorReview,
        readyForWork,
      },
      sections,
    };
  }
}
