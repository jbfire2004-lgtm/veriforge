import { Injectable } from '@nestjs/common';
import type { SafetyProgramExtract } from './schema/safety-program-extract.schema';
import { normalizeHazardCategory } from './safety-program-normalize.service';

export type SitePlanInput = {
  documents: SafetyProgramExtract[];
  worksiteDescription: string;
  plannedActivities: string;
};

@Injectable()
export class SafetyProgramSitePlanService {
  /**
   * Build a Markdown site plan from ingested extracts + worksite context.
   * Does not invent regulations — only uses refs present in JSON.
   */
  buildMarkdown(input: SitePlanInput): string {
    const docs = input.documents.filter((d) => d.meta.is_safety_document);
    const conflicts: string[] = [];
    const assumptions: string[] = [];

    if (!input.worksiteDescription?.trim() && !input.plannedActivities?.trim()) {
      assumptions.push(
        'Worksite description and planned activities were not provided or were empty.',
      );
    }
    if (!docs.length) {
      assumptions.push(
        'No safety documents with is_safety_document=true were provided.',
      );
      return renderEmptyPlan(input, assumptions);
    }

    const activityTokens = tokenize(
      `${input.worksiteDescription}\n${input.plannedActivities}`,
    );

    const hazards = selectRelevant(
      docs.flatMap((d) => d.hazards),
      (h) => `${h.description} ${h.category ?? ''} ${h.related_activities.join(' ')}`,
      activityTokens,
    );
    const controls = selectRelevant(
      docs.flatMap((d) => d.controls),
      (c) => `${c.description} ${c.type ?? ''} ${c.steps.join(' ')}`,
      activityTokens,
    );
    const ppe = selectRelevant(
      docs.flatMap((d) => d.ppe),
      (p) => `${p.item} ${p.conditions.join(' ')}`,
      activityTokens,
      true,
    );
    const training = selectRelevant(
      docs.flatMap((d) => d.training_requirements),
      (t) => `${t.name} ${t.description}`,
      activityTokens,
      true,
    );
    const roles = dedupeRoles(docs.flatMap((d) => d.roles_and_responsibilities));
    const procedures = selectRelevant(
      docs.flatMap((d) => d.procedures),
      (p) => `${p.name} ${p.scope ?? ''} ${p.step_by_step.join(' ')}`,
      activityTokens,
    );
    const inspections = selectRelevant(
      docs.flatMap((d) => d.inspection_and_monitoring),
      (i) => `${i.type} ${i.subject}`,
      activityTokens,
      true,
    );
    const incidents = selectRelevant(
      docs.flatMap((d) => d.incident_and_corrective_actions),
      (i) => `${i.type} ${i.description}`,
      activityTokens,
      true,
    );

    // Prefer stricter: required=true over null/false; more frequent inspections
    const strictControls = preferStricterControls(controls);
    const strictInspections = preferStricterInspections(inspections, conflicts);

    const regs = unique(
      docs.flatMap((d) => [
        ...d.meta.regulatory_frameworks,
        ...d.hazards.flatMap((h) => h.regulatory_references),
        ...d.controls.flatMap((c) => c.regulatory_references),
      ]),
    );

    for (const d of docs) {
      conflicts.push(...d.conflicts_and_gaps.internal_conflicts);
    }

    const lines: string[] = [];
    lines.push('# Site-Specific Safety Plan');
    lines.push('');
    lines.push('## Scope and work description');
    lines.push('');
    lines.push(input.worksiteDescription?.trim() || '_Not provided._');
    lines.push('');
    lines.push('**Planned activities**');
    lines.push('');
    lines.push(input.plannedActivities?.trim() || '_Not provided._');
    lines.push('');
    lines.push('## Applicable regulations and standards');
    lines.push('');
    if (!regs.length) {
      lines.push(
        'None stated in the ingested documents (regulations are not invented).',
      );
    } else {
      for (const r of regs) lines.push(`- ${r}`);
    }
    lines.push('');
    lines.push('## Hazard assessment');
    lines.push('');
    if (!hazards.length) {
      lines.push('No matching hazards selected from ingested data for this scope.');
    } else {
      for (const h of hazards) {
        const cat =
          h.category_normalized ??
          normalizeHazardCategory(h.category, h.description);
        lines.push(`### ${h.id} — ${h.description}`);
        lines.push('');
        lines.push(`- Category: ${cat}`);
        if (h.severity) lines.push(`- Severity (as stated): ${h.severity}`);
        if (h.likelihood) lines.push(`- Likelihood (as stated): ${h.likelihood}`);
        if (h.regulatory_references.length) {
          lines.push(
            `- References: ${h.regulatory_references.join(', ')}`,
          );
        }
        lines.push('');
      }
    }

    lines.push('## Controls and procedures');
    lines.push('');
    if (!strictControls.length && !procedures.length) {
      lines.push('No matching controls or procedures selected.');
    } else {
      for (const c of strictControls) {
        lines.push(`### Control ${c.id}`);
        lines.push('');
        lines.push(c.description);
        lines.push('');
        lines.push(
          `- Type: ${c.type_normalized ?? c.type ?? 'unspecified'}`,
        );
        lines.push(
          `- Hierarchy: ${c.hierarchy_level_normalized ?? c.hierarchy_level ?? 'unspecified'}`,
        );
        if (c.required === true) lines.push('- Required: yes');
        if (c.steps.length) {
          lines.push('- Steps:');
          for (const s of c.steps) lines.push(`  - ${s}`);
        }
        lines.push('');
      }
      for (const p of procedures) {
        lines.push(`### Procedure — ${p.name}`);
        lines.push('');
        if (p.scope) lines.push(`Scope: ${p.scope}`);
        if (p.pre_job_requirements.length) {
          lines.push('Pre-job:');
          for (const s of p.pre_job_requirements) lines.push(`- ${s}`);
        }
        if (p.step_by_step.length) {
          lines.push('Steps:');
          for (const s of p.step_by_step) lines.push(`- ${s}`);
        }
        if (p.post_job_requirements.length) {
          lines.push('Post-job:');
          for (const s of p.post_job_requirements) lines.push(`- ${s}`);
        }
        lines.push('');
      }
    }

    lines.push('## PPE requirements');
    lines.push('');
    if (!ppe.length) {
      lines.push('No matching PPE selected from ingested data.');
    } else {
      for (const p of ppe) {
        lines.push(
          `- **${p.item}**${p.mandatory === true ? ' (mandatory as stated)' : ''}${
            p.conditions.length ? ` — when: ${p.conditions.join('; ')}` : ''
          }${p.standards.length ? ` — standards: ${p.standards.join(', ')}` : ''}`,
        );
      }
    }
    lines.push('');

    lines.push('## Training requirements');
    lines.push('');
    if (!training.length) {
      lines.push('No matching training requirements selected.');
    } else {
      for (const t of training) {
        lines.push(`- **${t.name}**${t.frequency ? ` — ${t.frequency}` : ''}`);
        if (t.description && t.description !== t.name) {
          lines.push(`  - ${t.description}`);
        }
      }
    }
    lines.push('');

    lines.push('## Roles and responsibilities');
    lines.push('');
    if (!roles.length) {
      lines.push('No roles selected from ingested data.');
    } else {
      for (const r of roles) {
        lines.push(`### ${r.role_normalized ?? r.role}`);
        lines.push('');
        for (const resp of r.responsibilities) lines.push(`- ${resp}`);
        lines.push('');
      }
    }

    lines.push('## Inspection and monitoring');
    lines.push('');
    if (!strictInspections.length) {
      lines.push('No matching inspection requirements selected.');
    } else {
      for (const i of strictInspections) {
        lines.push(
          `- **${i.type}** — ${i.subject}${i.frequency ? ` (${i.frequency})` : ''}`,
        );
        for (const c of i.criteria) lines.push(`  - Criterion: ${c}`);
      }
    }
    lines.push('');

    lines.push('## Incident response and corrective actions');
    lines.push('');
    if (!incidents.length) {
      lines.push('No matching incident/corrective-action items selected.');
    } else {
      for (const i of incidents) {
        lines.push(`### ${i.type}`);
        lines.push('');
        lines.push(i.description);
        if (i.corrective_actions.length) {
          lines.push('Corrective actions:');
          for (const a of i.corrective_actions) lines.push(`- ${a}`);
        }
        if (i.preventive_actions.length) {
          lines.push('Preventive actions:');
          for (const a of i.preventive_actions) lines.push(`- ${a}`);
        }
        lines.push('');
      }
    }

    lines.push('## Conflicts and assumptions');
    lines.push('');
    lines.push('### Conflicts');
    lines.push('');
    const uniqConflicts = unique(conflicts);
    if (!uniqConflicts.length) {
      lines.push('- None flagged from ingested data for this selection.');
    } else {
      for (const c of uniqConflicts) lines.push(`- ${c}`);
    }
    lines.push('');
    lines.push('### Assumptions');
    lines.push('');
    assumptions.push(
      'Only hazards/controls with lexical overlap to the worksite/activities text were prioritized; review completeness before authorizing work.',
    );
    assumptions.push(
      'This plan does not invent regulations; only references present in ingested JSON are listed.',
    );
    for (const a of unique(assumptions)) lines.push(`- ${a}`);
    lines.push('');

    return lines.join('\n');
  }
}

function renderEmptyPlan(
  input: SitePlanInput,
  assumptions: string[],
): string {
  return [
    '# Site-Specific Safety Plan',
    '',
    '## Scope and work description',
    '',
    input.worksiteDescription?.trim() || '_Not provided._',
    '',
    '**Planned activities**',
    '',
    input.plannedActivities?.trim() || '_Not provided._',
    '',
    '## Applicable regulations and standards',
    '',
    'None. No regulatory references were present in the input (and none may be invented).',
    '',
    '## Hazard assessment',
    '',
    'No hazards selected — source documents missing or not safety-classified.',
    '',
    '## Controls and procedures',
    '',
    'No controls or procedures selected.',
    '',
    '## PPE requirements',
    '',
    'No PPE requirements selected.',
    '',
    '## Training requirements',
    '',
    'No training requirements selected.',
    '',
    '## Roles and responsibilities',
    '',
    'No roles selected.',
    '',
    '## Inspection and monitoring',
    '',
    'No inspection or monitoring requirements selected.',
    '',
    '## Incident response and corrective actions',
    '',
    'No incident-response or corrective-action items selected.',
    '',
    '## Conflicts and assumptions',
    '',
    '### Conflicts',
    '',
    '- None to resolve: there were no competing requirements across documents.',
    '',
    '### Assumptions',
    '',
    ...assumptions.map((a) => `- ${a}`),
    '',
  ].join('\n');
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2),
  );
}

function selectRelevant<T>(
  items: T[],
  textFn: (item: T) => string,
  activityTokens: Set<string>,
  includeAllIfNoTokens = false,
): T[] {
  if (!items.length) return [];
  if (!activityTokens.size) {
    return includeAllIfNoTokens ? dedupeByText(items, textFn) : dedupeByText(items, textFn).slice(0, 25);
  }
  const scored = items.map((item) => {
    const tokens = tokenize(textFn(item));
    let score = 0;
    for (const t of tokens) if (activityTokens.has(t)) score += 1;
    return { item, score };
  });
  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  const selected = (matched.length ? matched : scored.slice(0, 10)).map(
    (s) => s.item,
  );
  return dedupeByText(selected, textFn);
}

function dedupeByText<T>(items: T[], textFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = textFn(item).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function preferStricterControls(
  controls: SafetyProgramExtract['controls'],
): SafetyProgramExtract['controls'] {
  const map = new Map<string, SafetyProgramExtract['controls'][number]>();
  for (const c of controls) {
    const k = c.description.toLowerCase().replace(/\s+/g, ' ').trim();
    const existing = map.get(k);
    if (!existing) {
      map.set(k, c);
      continue;
    }
    if (c.required === true && existing.required !== true) map.set(k, c);
  }
  return [...map.values()];
}

function preferStricterInspections(
  inspections: SafetyProgramExtract['inspection_and_monitoring'],
  conflicts: string[],
): SafetyProgramExtract['inspection_and_monitoring'] {
  const rank = (f: string | null) => {
    const x = (f ?? '').toLowerCase();
    if (x.includes('pre-use') || x.includes('before')) return 100;
    if (x.includes('daily') || x.includes('each shift')) return 90;
    if (x.includes('weekly')) return 70;
    if (x.includes('monthly')) return 50;
    if (x.includes('annual') || x.includes('yearly')) return 20;
    return 10;
  };
  const map = new Map<
    string,
    SafetyProgramExtract['inspection_and_monitoring'][number]
  >();
  for (const insp of inspections) {
    const k = `${insp.type}|${insp.subject}`.toLowerCase();
    const existing = map.get(k);
    if (!existing) {
      map.set(k, insp);
      continue;
    }
    if (
      existing.frequency &&
      insp.frequency &&
      existing.frequency !== insp.frequency
    ) {
      conflicts.push(
        `Conflicting inspection frequency for "${insp.subject}": ${existing.frequency} vs ${insp.frequency} — preferred stricter cadence.`,
      );
    }
    if (rank(insp.frequency) > rank(existing.frequency)) map.set(k, insp);
  }
  return [...map.values()];
}

function dedupeRoles(
  roles: SafetyProgramExtract['roles_and_responsibilities'],
): SafetyProgramExtract['roles_and_responsibilities'] {
  const map = new Map<
    string,
    SafetyProgramExtract['roles_and_responsibilities'][number]
  >();
  for (const r of roles) {
    const k = (r.role_normalized ?? r.role).toLowerCase();
    const existing = map.get(k);
    if (!existing) {
      map.set(k, { ...r });
    } else {
      existing.responsibilities = unique([
        ...existing.responsibilities,
        ...r.responsibilities,
      ]);
    }
  }
  return [...map.values()];
}

function unique(items: string[]): string[] {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}
