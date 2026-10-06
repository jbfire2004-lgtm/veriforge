import { Injectable } from '@nestjs/common';
import {
  emptySafetyProgramExtract,
  parseSafetyProgramExtract,
  type SafetyProgramExtract,
} from './schema/safety-program-extract.schema';

const SAFETY_SIGNAL =
  /\b(safety|hazard|ppe|osha|csa|whmis|fall protection|lockout|loto|confined space|sds|incident|near miss|toolbox|jha|flha|harness|lanyard|respirator|evacuation|muster)\b/i;

const DOC_TYPE_RULES: Array<{ type: string; re: RegExp }> = [
  { type: 'SDS', re: /\b(sds|safety data sheet|whmis|ghs)\b/i },
  { type: 'toolbox_talk', re: /\b(toolbox talk|tailgate|safety talk)\b/i },
  { type: 'training', re: /\b(training|competency|course outline|curriculum)\b/i },
  { type: 'inspection_form', re: /\b(inspection form|checklist|pre-use inspection)\b/i },
  { type: 'incident_report', re: /\b(incident report|near miss|first report of injury)\b/i },
  { type: 'procedure', re: /\b(procedure|sop|standard operating)\b/i },
  { type: 'policy', re: /\b(policy|code of conduct)\b/i },
  {
    type: 'equipment_manual',
    re: /\b(operator manual|instruction for use|ifu|equipment manual|manufacturer)\b/i,
  },
];

/**
 * Conservative extractor: only surfaces text that is explicitly present.
 * Does not invent severity, likelihood, company names, or missing controls.
 */
@Injectable()
export class SafetyProgramExtractService {
  extractFromText(input: {
    text: string;
    sourceReference?: string | null;
    fileName?: string | null;
  }): { extract: SafetyProgramExtract; confidence: number } {
    const text = (input.text ?? '').trim();
    const source =
      input.sourceReference?.trim() ||
      input.fileName?.trim() ||
      null;

    if (!text) {
      const empty = emptySafetyProgramExtract(false);
      empty.meta.source_reference = source;
      return { extract: empty, confidence: 0 };
    }

    const isSafety = SAFETY_SIGNAL.test(text);
    const extract = emptySafetyProgramExtract(isSafety);
    extract.meta.source_reference = source;

    if (!isSafety) {
      return { extract: parseSafetyProgramExtract(extract), confidence: 0.9 };
    }

    extract.meta.document_title = firstLineTitle(text);
    extract.meta.document_type = detectDocType(text, input.fileName);
    extract.meta.version = matchOne(
      text,
      /\b(?:version|rev(?:ision)?)\s*[:#]?\s*([A-Za-z0-9._-]{1,32})/i,
    );
    extract.meta.effective_date = matchOne(
      text,
      /\b(?:effective(?:\s+date)?)\s*[:#]?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    );
    extract.meta.last_review_date = matchOne(
      text,
      /\b(?:last\s+review(?:ed)?(?:\s+date)?|review\s+date)\s*[:#]?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    );
    extract.meta.jurisdiction = matchOne(
      text,
      /\b(Canada|Saskatchewan|Alberta|British Columbia|Ontario|OSHA|CSA|ANSI)\b/,
    );
    extract.meta.regulatory_frameworks = unique(
      matchAll(
        text,
        /\b((?:OSHA\s*[\d.]+(?:\([a-z0-9]+\))?|CSA\s*Z[\d.]+(?:-[A-Z0-9]+)?|ANSI\s*Z[\d.]+|OHS\s+(?:Act|Reg(?:ulation)?s?)|WHMIS(?:\s*2015)?))\b/gi,
      ),
    );

    extract.work_context.work_activities = findKeywords(text, [
      'confined space entry',
      'welding',
      'roofing',
      'hot work',
      'excavation',
      'scaffolding',
      'work at height',
      'fall protection',
      'lockout',
      'loto',
      'crane lift',
      'electrical work',
    ]);
    extract.work_context.locations = findKeywords(text, [
      'shop',
      'field',
      'rooftop',
      'substation',
      'plant',
      'mine',
      'nacelle',
      'tower',
      'switchyard',
      'warehouse',
    ]);
    extract.work_context.equipment = findKeywords(text, [
      'harness',
      'lanyard',
      'srl',
      'scaffold',
      'forklift',
      'crane',
      'mewp',
      'respirator',
      'hard hat',
    ]);
    extract.work_context.materials = findKeywords(text, [
      'solvent',
      'diesel',
      'concrete',
      'silica',
      'asbestos',
      'welding fume',
    ]);
    extract.work_context.environmental_conditions = findKeywords(text, [
      'cold weather',
      'high wind',
      'noise',
      'heat stress',
      'lightning',
      'ice',
    ]);

    extract.hazards = extractBulletSection(text, /hazards?/i, 'hazard').map(
      (description, i) => ({
        id: `h${i + 1}`,
        description,
        category: inferCategory(description),
        severity: null,
        likelihood: null,
        consequences: [],
        related_activities: [],
        regulatory_references: [],
      }),
    );

    extract.controls = extractBulletSection(
      text,
      /controls?|mitigation|preventive measures/i,
      'control',
    ).map((description, i) => ({
      id: `c${i + 1}`,
      description,
      type: inferControlType(description),
      hierarchy_level: null,
      required: /\b(shall|must|required)\b/i.test(description) ? true : null,
      preconditions: [],
      steps: [],
      related_hazards: [],
      regulatory_references: [],
    }));

    extract.ppe = extractBulletSection(text, /\bppe\b|personal protective/i, 'ppe').map(
      (item) => ({
        item,
        mandatory: /\b(shall|must|required)\b/i.test(item) ? true : null,
        conditions: [],
        standards: unique(
          matchAll(item, /\b(CSA\s*Z[\d.]+|ANSI\s*Z[\d.]+)\b/gi),
        ),
      }),
    );

    extract.training_requirements = extractBulletSection(
      text,
      /training\s+requirements?|competency/i,
      'training',
    ).map((name) => ({
      name,
      description: name,
      frequency: matchOne(
        name,
        /\b(annual|before task|every\s+\d+\s+years?|biennial)\b/i,
      ),
      target_roles: [],
      prerequisites: [],
      regulatory_references: [],
    }));

    extract.roles_and_responsibilities = extractRoleBlocks(text);
    extract.procedures = extractNamedProcedures(text);
    extract.inspection_and_monitoring = extractBulletSection(
      text,
      /inspection|monitoring/i,
      'inspection',
    ).map((line) => ({
      type: /\bpre-use\b/i.test(line)
        ? 'pre-use inspection'
        : /\bmonthly\b/i.test(line)
          ? 'monthly inspection'
          : 'inspection',
      subject: line,
      criteria: [],
      frequency: matchOne(line, /\b(daily|weekly|monthly|annual|pre-use)\b/i),
      recordkeeping_requirements: [],
      regulatory_references: [],
    }));

    // Never invent conflicts; leave empty unless we detect obvious contradiction markers
    extract.conflicts_and_gaps.assumptions = [];
    if (!extract.hazards.length && !extract.controls.length) {
      extract.conflicts_and_gaps.known_gaps = [
        'Document classified as safety-related but no explicit hazard/control bullets were detected for structured extraction.',
      ];
    }

    const confidence = scoreConfidence(extract, text);
    return {
      extract: parseSafetyProgramExtract(extract),
      confidence,
    };
  }
}

function firstLineTitle(text: string): string | null {
  const line = text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 3);
  if (!line) return null;
  return line.slice(0, 200);
}

function detectDocType(text: string, fileName?: string | null): string | null {
  const corpus = `${fileName ?? ''}\n${text}`;
  for (const rule of DOC_TYPE_RULES) {
    if (rule.re.test(corpus)) return rule.type;
  }
  return 'policy';
}

function matchOne(text: string, re: RegExp): string | null {
  const m = re.exec(text);
  return m?.[1]?.trim() || null;
}

function matchAll(text: string, re: RegExp): string[] {
  const out: string[] = [];
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = r.exec(text))) {
    if (m[1] || m[0]) out.push((m[1] ?? m[0]).trim());
  }
  return out;
}

function unique(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}

function findKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k.toLowerCase()));
}

function extractBulletSection(
  text: string,
  heading: RegExp,
  _kind: string,
): string[] {
  const lines = text.split(/\r?\n/);
  const items: string[] = [];
  let inSection = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inSection && items.length) break;
      continue;
    }
    if (heading.test(line) && line.length < 80) {
      inSection = true;
      continue;
    }
    if (inSection) {
      if (/^[A-Z][A-Za-z0-9 ./-]{2,40}:?\s*$/.test(line) && !/^[-*•\d]/.test(line)) {
        break;
      }
      const bullet = line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');
      if (bullet.length >= 4 && bullet.length <= 400) {
        items.push(bullet);
      }
      if (items.length >= 25) break;
    }
  }
  // Fallback: scan any bullets that mention the heading keyword context nearby
  if (!items.length) {
    for (const raw of lines) {
      const line = raw.trim();
      if (!/^[-*•]|\d+[.)]/.test(line)) continue;
      const bullet = line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '');
      if (heading.test(bullet) || heading.test(line)) {
        items.push(bullet);
      }
      if (items.length >= 15) break;
    }
  }
  return unique(items);
}

function extractRoleBlocks(text: string): SafetyProgramExtract['roles_and_responsibilities'] {
  const roles: SafetyProgramExtract['roles_and_responsibilities'] = [];
  const re =
    /\b((?:supervisor|worker|competent person|employer|contractor|safety officer|rescue team)[s]?)\s*[:\-]\s*([^\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    roles.push({
      role: m[1].trim(),
      responsibilities: [m[2].trim()],
      authority_limits: [],
      regulatory_references: [],
    });
    if (roles.length >= 20) break;
  }
  return roles;
}

function extractNamedProcedures(
  text: string,
): SafetyProgramExtract['procedures'] {
  const procs: SafetyProgramExtract['procedures'] = [];
  const re =
    /\b((?:procedure|process)\s+[A-Za-z0-9 ./-]{3,60})\s*[:\-]\s*([^\n]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    procs.push({
      name: m[1].trim(),
      scope: null,
      pre_job_requirements: [],
      step_by_step: [m[2].trim()],
      post_job_requirements: [],
      related_hazards: [],
      related_controls: [],
      regulatory_references: [],
    });
    if (procs.length >= 15) break;
  }
  return procs;
}

function inferCategory(description: string): string | null {
  const d = description.toLowerCase();
  if (/fall|height|ladder|scaffold/.test(d)) return 'fall';
  if (/electric|arc|shock|voltage/.test(d)) return 'electrical';
  if (/chemic|fume|vapou?r|toxic|sds/.test(d)) return 'chemical';
  if (/confined/.test(d)) return 'confined_space';
  if (/struck|crush|pinch/.test(d)) return 'struck_by';
  return null;
}

function inferControlType(description: string): string | null {
  const d = description.toLowerCase();
  if (/ppe|harness|helmet|gloves|respirator|eye protection/.test(d)) return 'PPE';
  if (/guard|interlock|ventilation|barrier/.test(d)) return 'engineering';
  if (/permit|procedure|training|signage|exclusion/.test(d)) return 'administrative';
  return null;
}

function scoreConfidence(extract: SafetyProgramExtract, text: string): number {
  if (!extract.meta.is_safety_document) return 0.85;
  let score = 0.35;
  if (extract.meta.document_title) score += 0.1;
  if (extract.meta.regulatory_frameworks.length) score += 0.1;
  if (extract.hazards.length) score += 0.15;
  if (extract.controls.length) score += 0.15;
  if (extract.ppe.length) score += 0.1;
  if (text.length > 400) score += 0.05;
  return Math.min(0.95, Math.round(score * 100) / 100);
}
