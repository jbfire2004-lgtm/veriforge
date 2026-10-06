import { Test } from '@nestjs/testing';
import { OcrExtractionService } from '../training-ingestion/ocr-extraction.service';
import { OcrFieldExtractorService } from '../training-ingestion/ocr-field-extractor.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentIntelligenceAiService } from './document-intelligence-ai.service';

describe('DocumentIntelligenceAiService', () => {
  let service: DocumentIntelligenceAiService;

  const prisma = {
    document: { findUnique: jest.fn() },
    worker: { findFirst: jest.fn(), findUnique: jest.fn() },
    company: { findFirst: jest.fn(), findUnique: jest.fn() },
    trainingRecord: { findFirst: jest.fn() },
    project: { findUnique: jest.fn() },
    jhaFlha: { findMany: jest.fn().mockResolvedValue([]) },
    sdsDocument: { findFirst: jest.fn() },
    certification: { findFirst: jest.fn() },
  } as unknown as PrismaService;

  const ocr = {
    extractWithRetry: jest.fn(),
  } as unknown as OcrExtractionService;

  const fieldExtractor = new OcrFieldExtractorService();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        DocumentIntelligenceAiService,
        { provide: PrismaService, useValue: prisma },
        { provide: OcrExtractionService, useValue: ocr },
        { provide: OcrFieldExtractorService, useValue: fieldExtractor },
      ],
    }).compile();

    service = module.get(DocumentIntelligenceAiService);
  });

  it('classifies training certificate and extracts metadata', async () => {
    const text = `
      Certificate of Completion
      Trainee: Jane Smith
      Course: Fall Arrest Training
      Issued: 2025-06-01
      Expiry: 2027-06-01
      Certificate No: FA-2025-8831
      Provider: SafeSkills Academy
      Company: Acme Construction
    `;

    (prisma.worker.findFirst as jest.Mock).mockResolvedValue({
      id: 7,
      firstName: 'Jane',
      lastName: 'Smith',
    });
    (prisma.company.findFirst as jest.Mock).mockResolvedValue({
      id: 2,
      name: 'Acme Construction',
    });
    (prisma.certification.findFirst as jest.Mock).mockResolvedValue({
      id: 11,
      name: 'Fall Arrest',
      code: 'FALL-ARREST',
    });

    const result = await service.analyze({
      ocrText: text,
      fileName: 'jane-smith-fall-arrest-cert.pdf',
      companyId: 2,
      projectId: 5,
    });

    expect(result.document_type).toBe('training_certificate');
    expect(result.metadata.worker_name).toBe('Jane Smith');
    expect(result.metadata.training_type).toMatch(/fall arrest/i);
    expect(result.metadata.provider).toMatch(/SafeSkills/i);
    expect(result.authenticity_score).toBeGreaterThanOrEqual(0);
    expect(result.authenticity_score).toBeLessThanOrEqual(100);
    expect(result.confidence_score).toBeGreaterThan(40);
    expect(result.auto_links.some((l) => l.entity_type === 'worker')).toBe(
      true,
    );
    expect(result.recommended_actions.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule_engine');
  });

  it('flags expired documents and low authenticity', async () => {
    const result = await service.analyze({
      ocrText: 'Insurance COI\nExpires: 01/01/2020',
      fileName: 'expired-coi.pdf',
    });

    expect(['insurance', 'other']).toContain(result.document_type);
    expect(result.authenticity_score).toBeLessThan(70);
    expect(
      result.authenticity_indicators.some((i) => i.impact === 'negative'),
    ).toBe(true);
  });

  it('rejects empty input', async () => {
    await expect(service.analyze({})).rejects.toThrow(/required/i);
  });
});
