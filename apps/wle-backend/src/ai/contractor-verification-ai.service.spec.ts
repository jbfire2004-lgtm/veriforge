import { Test } from '@nestjs/testing';
import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import { ContractorVerificationAiService } from './contractor-verification-ai.service';

describe('ContractorVerificationAiService', () => {
  let service: ContractorVerificationAiService;
  const prisma = {} as never;
  const complianceEngine = new ContractorComplianceEngineService(prisma);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ContractorVerificationAiService,
        {
          provide: ContractorComplianceEngineService,
          useValue: complianceEngine,
        },
      ],
    }).compile();

    service = module.get(ContractorVerificationAiService);
  });

  it('returns structured verification JSON for complete contractor package', async () => {
    const result = await service.verify({
      engineInput: {
        contractor_profile: { name: 'Acme Industrial' },
        safety_stats: { TRIF: 0.8, LTIF: 0.2, year: 2026 },
        submitted_documents: [
          { type: 'policy', name: 'Safety policy', status: 'current' },
          {
            type: 'insurance',
            name: 'COI 2026',
            status: 'current',
            expires_at: '2027-01-01',
          },
          {
            type: 'wcb',
            name: 'WCB clearance',
            status: 'current',
            expires_at: '2026-12-01',
          },
          { type: 'training', name: 'Training records', status: 'current' },
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
        ],
        certifications_and_programs: ['COR', 'ISO 45001'],
        incident_history: [],
        work_scope: { tasks: ['General maintenance'], risk_profile: 'low' },
      },
    });

    expect(result.authenticity_score).toBeGreaterThanOrEqual(0);
    expect(result.authenticity_score).toBeLessThanOrEqual(100);
    expect(result.compliance_score).toBeGreaterThanOrEqual(0);
    expect(result.compliance_score).toBeLessThanOrEqual(100);
    expect(result.final_status).toBe('Approved');
    expect(Array.isArray(result.risk_flags)).toBe(true);
    expect(Array.isArray(result.missing_items)).toBe(true);
    expect(Array.isArray(result.recommended_actions)).toBe(true);
    expect(result.pm_summary).toContain('Acme Industrial');
  });

  it('flags rejection when critical gaps exist', async () => {
    const result = await service.verify({
      engineInput: {
        contractor_profile: { name: 'Risky Sub' },
        safety_stats: { TRIF: 5.2, LTIF: 2.1 },
        submitted_documents: [
          {
            type: 'insurance',
            name: 'COI',
            status: 'expired',
            expires_at: '2024-01-01',
          },
        ],
        incident_history: [
          { date: '2026-01-01', severity: 'critical', summary: 'Fall' },
          { date: '2026-02-01', severity: 'high', summary: 'Struck by' },
        ],
        work_scope: {
          tasks: ['Roof work at height', 'Crane lifting'],
          risk_profile: 'critical',
        },
      },
    });

    expect(result.final_status).toBe('Rejected');
    expect(result.expired_items.length).toBeGreaterThan(0);
    expect(result.risk_flags.length).toBeGreaterThan(0);
  });
});
