import { ContractorComplianceEngineService } from './contractor-compliance-engine.service';

describe('ContractorComplianceEngineService', () => {
  const prisma = {} as never;
  const engine = new ContractorComplianceEngineService(prisma);

  it('returns risk_profile, compliance_gaps, performance_assessment, approval, and summaries', () => {
    const out = engine.generate({
      contractor_profile: {
        name: 'ABC Industrial',
        industry: 'construction',
        size: 'medium',
        work_types: ['mechanical', 'scaffolding'],
      },
      safety_stats: { TRIF: 2.1, LTIF: 0.8, DART: 1.2, year: 2025 },
      certifications_and_programs: ['COR Level 2'],
      submitted_documents: [
        { type: 'policy', name: 'Safety policy 2025', status: 'current' },
        {
          type: 'insurance',
          name: 'Certificate of insurance',
          status: 'current',
        },
        { type: 'training', name: 'Training records', status: 'partial' },
      ],
      audit_results: [
        { date: '2026-01-15', score: 72, findings: ['Housekeeping gap'] },
      ],
      incident_history: [
        {
          date: '2025-11-01',
          severity: 'medium',
          summary: 'Near miss — dropped tool',
        },
        { date: '2026-02-10', severity: 'high', summary: 'Laceration' },
      ],
      client_specific_requirements: [
        'Site-specific orientation within 24 hours',
      ],
      work_scope: {
        tasks: ['Scaffold erection', 'Mechanical tie-ins at height'],
        risk_profile: 'high',
        duration: '6 weeks',
        location: 'Unit 12',
      },
    });

    expect(out.risk_profile.inherent_risk_level).toMatch(
      /medium|high|critical/,
    );
    expect(out.risk_profile.sif_exposure).toBe(true);
    expect(out.compliance_gaps.length).toBeGreaterThan(0);
    expect(out.performance_assessment.incident_trend).toBeDefined();
    expect(['approve', 'conditional', 'reject']).toContain(out.approval_status);
    expect(out.conditions.length).toBeGreaterThan(0);
    expect(out.contractor_feedback.length).toBeGreaterThan(20);
    expect(out.internal_summary).toContain('ABC Industrial');
  });

  it('approves low-risk contractors with complete documentation', () => {
    const out = engine.generate({
      contractor_profile: { name: 'Low Risk Co', size: 'small' },
      safety_stats: { TRIF: 0.5, LTIF: 0.2 },
      certifications_and_programs: ['ISO 45001', 'COR'],
      submitted_documents: [
        { type: 'policy', name: 'Corporate safety policy', status: 'current' },
        {
          type: 'insurance',
          name: 'Commercial liability insurance COI',
          status: 'current',
        },
        {
          type: 'training',
          name: 'Worker training and competency records',
          status: 'current',
        },
        {
          type: 'procedure',
          name: 'Incident reporting procedure',
          status: 'current',
        },
        {
          type: 'procedure',
          name: 'Emergency response plan',
          status: 'current',
        },
        { type: 'wcb', name: 'WCB clearance letter', status: 'current' },
      ],
      work_scope: {
        tasks: ['Office fit-up'],
        risk_profile: 'low',
        duration: '2 weeks',
      },
    });

    expect(out.approval_status).toBe('approve');
    expect(
      out.compliance_gaps.filter(
        (g) => g.status === 'missing' && g.priority === 'high',
      ).length,
    ).toBe(0);
  });
});
