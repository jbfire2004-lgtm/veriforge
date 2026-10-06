import { Injectable } from '@nestjs/common';
import {
  parseSafetyProgramExtract,
  type SafetyProgramExtract,
} from './schema/safety-program-extract.schema';

export const HAZARD_CATEGORIES = [
  'fall',
  'electrical',
  'chemical',
  'confined_space',
  'struck_by',
  'caught_in_between',
  'ergonomic',
  'environmental',
  'biological',
  'fire_explosion',
  'vehicle_traffic',
  'other',
] as const;

export type HazardCategoryNormalized = (typeof HAZARD_CATEGORIES)[number];

export const CONTROL_TYPES = [
  'engineering',
  'administrative',
  'PPE',
  'procedural',
  'substitution',
  'elimination',
] as const;

export const HIERARCHY_LEVELS = [
  'elimination',
  'substitution',
  'engineering',
  'administrative',
  'PPE',
] as const;

/**
 * Additive normalization — original fields preserved; *_normalized added.
 */
@Injectable()
export class SafetyProgramNormalizeService {
  normalize(doc: SafetyProgramExtract): SafetyProgramExtract {
    const parsed = parseSafetyProgramExtract(doc);
    const out: SafetyProgramExtract = {
      ...parsed,
      hazards: parsed.hazards.map((h) => ({
        ...h,
        category_normalized: normalizeHazardCategory(
          h.category,
          h.description,
        ),
      })),
      controls: parsed.controls.map((c) => ({
        ...c,
        type_normalized: normalizeControlType(c.type, c.description),
        hierarchy_level_normalized: normalizeHierarchy(
          c.hierarchy_level,
          c.type,
          c.description,
        ),
      })),
      training_requirements: parsed.training_requirements.map((t) => ({
        ...t,
        target_roles_normalized: t.target_roles.map(normalizeRoleName),
      })),
      roles_and_responsibilities: parsed.roles_and_responsibilities.map(
        (r) => ({
          ...r,
          role_normalized: normalizeRoleName(r.role),
        }),
      ),
    };
    return parseSafetyProgramExtract(out);
  }

  normalizeMany(docs: SafetyProgramExtract[]): SafetyProgramExtract[] {
    return docs.map((d) => this.normalize(d));
  }
}

export function normalizeHazardCategory(
  category: string | null | undefined,
  description: string,
): HazardCategoryNormalized {
  const corpus = `${category ?? ''} ${description}`.toLowerCase();
  if (/fall|height|ladder|scaffold|roof|elevated/.test(corpus)) return 'fall';
  if (/electric|arc.?flash|shock|voltage|loto.?electr/.test(corpus))
    return 'electrical';
  if (/chemic|fume|vapou?r|toxic|sds|whmis|ghs|solvent/.test(corpus))
    return 'chemical';
  if (/confined\s*space|permit.?required\s*space/.test(corpus))
    return 'confined_space';
  if (/struck|falling object|impact/.test(corpus)) return 'struck_by';
  if (/caught|crush|pinch|entangl|nip point/.test(corpus))
    return 'caught_in_between';
  if (/ergonomic|manual handling|repetitive|lifting/.test(corpus))
    return 'ergonomic';
  if (/heat|cold|noise|weather|environment|dust(?!\s*explos)/.test(corpus))
    return 'environmental';
  if (/bio|bloodborne|pathogen|mold/.test(corpus)) return 'biological';
  if (/fire|explosion|flammable|combustible|hot work/.test(corpus))
    return 'fire_explosion';
  if (/vehicle|traffic|mobile equipment|haul truck/.test(corpus))
    return 'vehicle_traffic';
  if (category && HAZARD_CATEGORIES.includes(category as HazardCategoryNormalized)) {
    return category as HazardCategoryNormalized;
  }
  return 'other';
}

export function normalizeControlType(
  type: string | null | undefined,
  description: string,
): (typeof CONTROL_TYPES)[number] {
  const corpus = `${type ?? ''} ${description}`.toLowerCase();
  if (/eliminat/.test(corpus)) return 'elimination';
  if (/substitut/.test(corpus)) return 'substitution';
  if (/engineer|guard|interlock|ventilation|barrier/.test(corpus))
    return 'engineering';
  if (/\bppe\b|harness|helmet|glove|respirator|eye protection|hard hat/.test(corpus))
    return 'PPE';
  if (/procedur|sop|work instruction/.test(corpus)) return 'procedural';
  if (/admin|permit|training|signage|exclusion|policy/.test(corpus))
    return 'administrative';
  if (type) {
    const t = type.toLowerCase();
    if (t === 'ppe') return 'PPE';
    if (CONTROL_TYPES.map((x) => x.toLowerCase()).includes(t)) {
      return CONTROL_TYPES.find((x) => x.toLowerCase() === t)!;
    }
  }
  return 'administrative';
}

export function normalizeHierarchy(
  hierarchy: string | null | undefined,
  type: string | null | undefined,
  description: string,
): (typeof HIERARCHY_LEVELS)[number] {
  const corpus = `${hierarchy ?? ''} ${type ?? ''} ${description}`.toLowerCase();
  if (/eliminat/.test(corpus)) return 'elimination';
  if (/substitut/.test(corpus)) return 'substitution';
  if (/engineer|guard|interlock|ventilation/.test(corpus)) return 'engineering';
  if (/\bppe\b|harness|helmet|glove|respirator/.test(corpus)) return 'PPE';
  return 'administrative';
}

export function normalizeRoleName(role: string): string {
  const r = role.toLowerCase().trim();
  if (/foreman|site supervisor|supervisor|superintendent/.test(r))
    return 'Supervisor';
  if (/competent person/.test(r)) return 'Competent Person';
  if (/rescue/.test(r)) return 'Rescue Team';
  if (/safety (officer|advisor|coordinator|rep)/.test(r)) return 'Safety Officer';
  if (/employer|prime contractor|owner/.test(r)) return 'Employer';
  if (/contractor/.test(r)) return 'Contractor';
  if (/worker|employee|operator|craft|labourer|laborer/.test(r)) return 'Worker';
  return role.trim();
}
