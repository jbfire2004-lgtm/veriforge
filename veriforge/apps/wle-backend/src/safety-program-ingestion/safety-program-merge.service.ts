import { Injectable } from '@nestjs/common';
import {
  emptySafetyProgramExtract,
  parseSafetyProgramExtract,
  type SafetyProgramExtract,
} from './schema/safety-program-extract.schema';

function normKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function moreSpecific(a: string, b: string): string {
  if (a.includes(b) && a.length >= b.length) return a;
  if (b.includes(a) && b.length > a.length) return b;
  return a.length >= b.length ? a : b;
}

function preferSpecific(values: Array<string | null | undefined>): string | null {
  const cleaned = values.map((v) => v?.trim()).filter(Boolean) as string[];
  if (!cleaned.length) return null;
  return cleaned.reduce((best, cur) => moreSpecific(best, cur));
}

function uniqStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const k = normKey(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item.trim());
  }
  return out;
}

function dedupeByDesc<T extends { description?: string; name?: string; item?: string; role?: string; subject?: string; type?: string }>(
  rows: T[],
  keyFn: (r: T) => string,
): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    const k = normKey(keyFn(row));
    if (!k) continue;
    if (!map.has(k)) map.set(k, row);
  }
  return [...map.values()];
}

/**
 * Merge chunk extracts from the same document into one schema object.
 * Prefer more specific meta values; record date conflicts.
 */
@Injectable()
export class SafetyProgramMergeService {
  merge(chunks: SafetyProgramExtract[]): SafetyProgramExtract {
    if (!chunks.length) {
      const empty = emptySafetyProgramExtract(false);
      empty.conflicts_and_gaps.known_gaps = [
        'No chunk JSON array was provided to merge.',
      ];
      return empty;
    }

    const parsed = chunks.map((c) => parseSafetyProgramExtract(c));
    const anySafety = parsed.some((c) => c.meta.is_safety_document);
    const merged = emptySafetyProgramExtract(anySafety);
    const conflicts: string[] = [];

    merged.meta.document_title = preferSpecific(
      parsed.map((c) => c.meta.document_title),
    );
    merged.meta.document_type = preferSpecific(
      parsed.map((c) => c.meta.document_type),
    );
    merged.meta.source_reference = preferSpecific(
      parsed.map((c) => c.meta.source_reference),
    );
    merged.meta.version = preferSpecific(parsed.map((c) => c.meta.version));
    merged.meta.jurisdiction = preferSpecific(
      parsed.map((c) => c.meta.jurisdiction),
    );

    const effectiveDates = uniqStrings(
      parsed.map((c) => c.meta.effective_date).filter(Boolean) as string[],
    );
    if (effectiveDates.length > 1) {
      conflicts.push(
        `Conflicting effective_date values: ${effectiveDates.join(' | ')}`,
      );
      merged.meta.effective_date = effectiveDates[0] ?? null;
    } else {
      merged.meta.effective_date = effectiveDates[0] ?? null;
    }

    const reviewDates = uniqStrings(
      parsed.map((c) => c.meta.last_review_date).filter(Boolean) as string[],
    );
    if (reviewDates.length > 1) {
      conflicts.push(
        `Conflicting last_review_date values: ${reviewDates.join(' | ')}`,
      );
      merged.meta.last_review_date = reviewDates[0] ?? null;
    } else {
      merged.meta.last_review_date = reviewDates[0] ?? null;
    }

    // Prefer more specific regulatory refs (e.g. OSHA 1910.146 over OSHA)
    const regs = uniqStrings(
      parsed.flatMap((c) => c.meta.regulatory_frameworks),
    );
    const filteredRegs = regs.filter(
      (r) =>
        !regs.some(
          (other) =>
            other !== r &&
            other.toLowerCase().includes(r.toLowerCase()) &&
            other.length > r.length,
        ),
    );
    merged.meta.regulatory_frameworks = filteredRegs;

    merged.work_context.work_activities = uniqStrings(
      parsed.flatMap((c) => c.work_context.work_activities),
    );
    merged.work_context.locations = uniqStrings(
      parsed.flatMap((c) => c.work_context.locations),
    );
    merged.work_context.equipment = uniqStrings(
      parsed.flatMap((c) => c.work_context.equipment),
    );
    merged.work_context.materials = uniqStrings(
      parsed.flatMap((c) => c.work_context.materials),
    );
    merged.work_context.environmental_conditions = uniqStrings(
      parsed.flatMap((c) => c.work_context.environmental_conditions),
    );

    const hazards = dedupeByDesc(
      parsed.flatMap((c) => c.hazards),
      (h) => h.description,
    ).map((h, i) => ({ ...h, id: h.id || `h${i + 1}` }));
    merged.hazards = hazards;

    const controls = dedupeByDesc(
      parsed.flatMap((c) => c.controls),
      (c) => c.description,
    ).map((c, i) => ({ ...c, id: c.id || `c${i + 1}` }));
    merged.controls = controls;

    merged.ppe = dedupeByDesc(
      parsed.flatMap((c) => c.ppe),
      (p) => p.item,
    );

    merged.training_requirements = dedupeByDesc(
      parsed.flatMap((c) => c.training_requirements),
      (t) => t.name,
    );

    // Merge roles by normalized role name, union responsibilities
    const roleMap = new Map<
      string,
      SafetyProgramExtract['roles_and_responsibilities'][number]
    >();
    for (const role of parsed.flatMap((c) => c.roles_and_responsibilities)) {
      const k = normKey(role.role);
      const existing = roleMap.get(k);
      if (!existing) {
        roleMap.set(k, { ...role });
      } else {
        existing.responsibilities = uniqStrings([
          ...existing.responsibilities,
          ...role.responsibilities,
        ]);
        existing.authority_limits = uniqStrings([
          ...existing.authority_limits,
          ...role.authority_limits,
        ]);
        existing.regulatory_references = uniqStrings([
          ...existing.regulatory_references,
          ...role.regulatory_references,
        ]);
      }
    }
    merged.roles_and_responsibilities = [...roleMap.values()];

    merged.procedures = dedupeByDesc(
      parsed.flatMap((c) => c.procedures),
      (p) => p.name,
    );

    // Inspections: detect frequency conflicts for same subject
    const inspBySubject = new Map<
      string,
      SafetyProgramExtract['inspection_and_monitoring']
    >();
    for (const insp of parsed.flatMap((c) => c.inspection_and_monitoring)) {
      const k = normKey(`${insp.type}|${insp.subject}`);
      const list = inspBySubject.get(k) ?? [];
      list.push(insp);
      inspBySubject.set(k, list);
    }
    const inspections: SafetyProgramExtract['inspection_and_monitoring'] = [];
    for (const [, list] of inspBySubject) {
      const freqs = uniqStrings(
        list.map((i) => i.frequency).filter(Boolean) as string[],
      );
      if (freqs.length > 1) {
        conflicts.push(
          `Conflicting inspection frequency for "${list[0].subject}": ${freqs.join(' | ')}`,
        );
      }
      inspections.push({
        ...list[0],
        criteria: uniqStrings(list.flatMap((i) => i.criteria)),
        recordkeeping_requirements: uniqStrings(
          list.flatMap((i) => i.recordkeeping_requirements),
        ),
        regulatory_references: uniqStrings(
          list.flatMap((i) => i.regulatory_references),
        ),
        frequency: freqs[0] ?? list[0].frequency,
      });
    }
    merged.inspection_and_monitoring = inspections;

    merged.incident_and_corrective_actions = dedupeByDesc(
      parsed.flatMap((c) => c.incident_and_corrective_actions),
      (i) => `${i.type}|${i.description}`,
    );

    merged.conflicts_and_gaps.internal_conflicts = uniqStrings([
      ...conflicts,
      ...parsed.flatMap((c) => c.conflicts_and_gaps.internal_conflicts),
    ]);
    merged.conflicts_and_gaps.known_gaps = uniqStrings(
      parsed.flatMap((c) => c.conflicts_and_gaps.known_gaps),
    );
    merged.conflicts_and_gaps.assumptions = uniqStrings(
      parsed.flatMap((c) => c.conflicts_and_gaps.assumptions),
    );

    return parseSafetyProgramExtract(merged);
  }
}
