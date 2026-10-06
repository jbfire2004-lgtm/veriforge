import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';
import { IncidentSifEngineService } from './incident-sif-engine.service';

describe('IncidentSifEngineService', () => {
  const engine = new IncidentSifEngineService(
    new EventClassificationEngine(),
    new SeverityRiskEngine(),
    new RcaEngine(),
  );

  it('returns classification, root_cause_analysis, capa_list, learning_summary, and client_report_summary', () => {
    const out = engine.generate({
      incident_type: 'near_miss',
      severity: 'potential',
      SIF_potential: 'unknown',
      date_time: '2026-06-01T14:30:00Z',
      location: 'Unit 12 scaffold',
      people_involved: [{ name: 'J. Smith', role: 'ironworker' }],
      description_free_text:
        'Worker nearly fell from scaffold at height when guardrail section was missing. Immediate stop-work called.',
      immediate_actions_taken: ['Stop work', 'Barricade area'],
      procedures_or_rules_relevant: [
        'Fall protection JHA',
        'Scaffold inspection checklist',
      ],
    });

    expect(out.classification.narrative).toContain('scaffold');
    expect(out.classification.event_types.length).toBeGreaterThan(0);
    expect(['yes', 'no', 'unknown']).toContain(
      out.classification.sif_potential,
    );
    expect(out.root_cause_analysis.five_whys.length).toBeGreaterThanOrEqual(4);
    expect(out.root_cause_analysis.fishbone.People).toBeDefined();
    expect(out.capa_list.length).toBeGreaterThan(0);
    expect(out.capa_list.some((c) => c.type === 'containment')).toBe(true);
    expect(out.learning_summary.length).toBeGreaterThanOrEqual(3);
    expect(out.learning_summary.length).toBeLessThanOrEqual(5);
    expect(out.client_report_summary).toContain('investigation');
  });

  it('maps stored events to engine input', () => {
    const input = engine.inputFromEvent({
      companyId: 1,
      projectId: 2,
      eventType: 'incident_injury',
      severity: 'high',
      title: 'Laceration',
      description: 'Cut on rebar during formwork',
      occurredAt: new Date('2026-05-20T10:00:00Z'),
      locationNote: 'Pour deck',
      injuries: [{ workerId: 5 }],
      investigation: { immediateActions: 'First aid applied; area secured' },
    });

    expect(input.incident_type).toBe('injury');
    expect(input.description_free_text).toContain('rebar');
    expect(input.immediate_actions_taken?.length).toBeGreaterThan(0);
  });
});
