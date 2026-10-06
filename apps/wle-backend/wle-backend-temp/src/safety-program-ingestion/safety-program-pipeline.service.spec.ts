import { emptySafetyProgramExtract } from './schema/safety-program-extract.schema';
import { SafetyProgramMergeService } from './safety-program-merge.service';
import { SafetyProgramNormalizeService } from './safety-program-normalize.service';
import { SafetyProgramSitePlanService } from './safety-program-site-plan.service';
import { SafetyProgramSummarizeService } from './safety-program-summarize.service';
import { splitText } from './safety-program-pipeline.service';

describe('SafetyProgramMergeService', () => {
  const merge = new SafetyProgramMergeService();

  it('merges chunks and records effective_date conflicts', () => {
    const a = emptySafetyProgramExtract(true);
    a.meta.effective_date = '2024-01-01';
    a.meta.regulatory_frameworks = ['OSHA', 'OSHA 1910.146'];
    a.hazards = [
      {
        id: 'h1',
        description: 'Fall from scaffold',
        category: null,
        severity: null,
        likelihood: null,
        consequences: [],
        related_activities: [],
        regulatory_references: [],
      },
    ];
    const b = emptySafetyProgramExtract(true);
    b.meta.effective_date = '2024-06-01';
    b.hazards = [
      {
        id: 'h2',
        description: 'Fall from scaffold',
        category: 'fall',
        severity: null,
        likelihood: null,
        consequences: [],
        related_activities: [],
        regulatory_references: [],
      },
    ];
    const out = merge.merge([a, b]);
    expect(out.hazards).toHaveLength(1);
    expect(out.meta.regulatory_frameworks).toEqual(['OSHA 1910.146']);
    expect(
      out.conflicts_and_gaps.internal_conflicts.some((c) =>
        /effective_date/i.test(c),
      ),
    ).toBe(true);
  });
});

describe('SafetyProgramNormalizeService', () => {
  const normalize = new SafetyProgramNormalizeService();

  it('adds normalized fields without removing originals', () => {
    const doc = emptySafetyProgramExtract(true);
    doc.hazards = [
      {
        id: 'h1',
        description: 'Electrical shock during LOTO',
        category: 'energy',
        severity: null,
        likelihood: null,
        consequences: [],
        related_activities: [],
        regulatory_references: [],
      },
    ];
    doc.roles_and_responsibilities = [
      {
        role: 'Site Supervisor',
        responsibilities: ['Stop work authority'],
        authority_limits: [],
        regulatory_references: [],
      },
    ];
    const out = normalize.normalize(doc);
    expect(out.hazards[0].category).toBe('energy');
    expect(out.hazards[0].category_normalized).toBe('electrical');
    expect(out.roles_and_responsibilities[0].role).toBe('Site Supervisor');
    expect(out.roles_and_responsibilities[0].role_normalized).toBe(
      'Supervisor',
    );
  });
});

describe('SafetyProgramSummarizeService', () => {
  it('returns empty summaries for non-safety docs', () => {
    const summarize = new SafetyProgramSummarizeService();
    const out = summarize.summarize(emptySafetyProgramExtract(false));
    expect(out.document_summary).toBe('');
    expect(out.hazard_summaries).toEqual([]);
  });
});

describe('SafetyProgramSitePlanService', () => {
  it('does not invent regulations when none are present', () => {
    const plan = new SafetyProgramSitePlanService();
    const md = plan.buildMarkdown({
      documents: [emptySafetyProgramExtract(true)],
      worksiteDescription: 'Rooftop HVAC work',
      plannedActivities: 'fall protection setup',
    });
    expect(md).toMatch(/Site-Specific Safety Plan/);
    expect(md).toMatch(/not invented|None stated/i);
  });
});

describe('splitText', () => {
  it('returns single chunk for short text', () => {
    expect(splitText('hello', 100)).toEqual(['hello']);
  });
});
