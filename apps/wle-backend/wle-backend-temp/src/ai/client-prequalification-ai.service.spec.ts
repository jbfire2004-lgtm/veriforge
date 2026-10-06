import { Test } from '@nestjs/testing';
import { AssessmentEnginesService } from '../modules/assessment-engines/assessment-engines.service';
import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClientPrequalificationAiService } from './client-prequalification-ai.service';

describe('ClientPrequalificationAiService', () => {
  let service: ClientPrequalificationAiService;
  const prisma = {} as never;
  const complianceEngine = new ContractorComplianceEngineService(prisma);

  const assessmentEngines = {
    buildSpceInput: jest.fn().mockResolvedValue({
      context: { dateNow: new Date().toISOString() },
      hiringClientProgramRequirements: [
        {
          id: 'SPCE-POL-1',
          category: 'Policy',
          type: 'Policy',
          description: 'Documented health and safety policy',
          weight: 25,
        },
      ],
      companySubmissions: [
        {
          id: 'SUB-1',
          companyId: '1',
          requirementId: 'SPCE-POL-1',
          documents: [
            {
              fileId: '1',
              fileName: 'policy.pdf',
              revisionDate: new Date().toISOString(),
              parsedSections: ['scope', 'responsibilities'],
            },
          ],
        },
      ],
    }),
  } as unknown as AssessmentEnginesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ClientPrequalificationAiService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ContractorComplianceEngineService,
          useValue: complianceEngine,
        },
        { provide: AssessmentEnginesService, useValue: assessmentEngines },
      ],
    }).compile();

    service = module.get(ClientPrequalificationAiService);
  });

  it('returns prequalification JSON with score, risks, and shareable report', async () => {
    const result = await service.evaluate({
      engineInput: {
        contractor_profile: { name: 'Northline Contracting' },
        contractorCompanyId: 42,
        safety_stats: { TRIF: 0.9, LTIF: 0.3, year: 2026 },
        submitted_documents: [
          { type: 'policy', name: 'Safety policy', status: 'current' },
          {
            type: 'insurance',
            name: 'COI 2026',
            status: 'current',
            expires_at: '2027-06-01',
          },
          {
            type: 'wcb',
            name: 'WCB clearance',
            status: 'current',
            expires_at: '2026-12-01',
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
        ],
        certifications_and_programs: ['COR', 'ISO 45001'],
        incident_history: [],
        work_scope: { tasks: ['Mechanical'], risk_profile: 'medium' },
      },
    });

    expect(result.company_score).toBeGreaterThanOrEqual(0);
    expect(result.company_score).toBeLessThanOrEqual(100);
    expect(['Approved', 'Conditional', 'Rejected']).toContain(
      result.final_status,
    );
    expect(Array.isArray(result.risk_flags)).toBe(true);
    expect(Array.isArray(result.missing_items)).toBe(true);
    expect(result.report.markdown).toContain('Northline Contracting');
    expect(result.report.share_path).toContain(result.report.report_id);
    expect(result.source).toBe('rule_engine');
    expect(result.dimension_scores.hse_metrics).toBeDefined();
  });

  it('rejects weak contractor packages', async () => {
    const result = await service.evaluate({
      engineInput: {
        contractor_profile: { name: 'Risky Sub' },
        contractorCompanyId: 99,
        safety_stats: { TRIF: 5.5, LTIF: 2.2 },
        submitted_documents: [
          {
            type: 'insurance',
            name: 'COI',
            status: 'expired',
            expires_at: '2023-01-01',
          },
        ],
        incident_history: [
          { date: '2026-01-01', severity: 'critical', summary: 'Fall' },
          { date: '2026-02-01', severity: 'high', summary: 'Struck by' },
        ],
        work_scope: {
          tasks: ['Roof work', 'Crane ops'],
          risk_profile: 'critical',
        },
      },
    });

    expect(result.final_status).toBe('Rejected');
    expect(result.company_score).toBeLessThan(60);
    expect(result.risk_flags.length).toBeGreaterThan(0);
    expect(result.missing_items.length).toBeGreaterThan(0);
  });
});
