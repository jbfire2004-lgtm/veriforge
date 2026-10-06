import { LessonEmbeddingService } from './lesson-embedding.service';
import type { VeriAgentService } from '../../veri-agent/veri-agent.service';
import type { PrismaService } from '../../prisma/prisma.service';

describe('LessonEmbeddingService VeriAgent routing', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('routes dense embeddings through VeriAgent.embed (no raw OpenAI fetch)', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const embed = jest.fn().mockResolvedValue({
      ok: true,
      embedding: [0.1, 0.2, 0.3],
      meta: {
        purpose: 'lesson_embedding',
        companyId: 12,
        redacted: true,
        model: 'text-embedding-3-small',
        dimensions: 3,
      },
    });
    const veriAgent = {
      isEmbeddingConfigured: () => true,
      embed,
    } as unknown as VeriAgentService;

    const prisma = {
      lessonsLearnedEntry: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'les_1',
          title: 'Scaffold fall',
          summary: 'Worker near edge',
          rootCause: 'Missing guardrail',
          correctiveAction: 'Install midrail',
          companyId: 12,
          projectId: 44,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaService;

    const svc = new LessonEmbeddingService(prisma, veriAgent);
    const out = await svc.embedLesson('les_1');

    expect(out).toEqual({ lessonId: 'les_1', model: 'openai' });
    expect(embed).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'lesson_embedding',
        tenant: { companyId: 12, projectId: 44 },
      }),
    );
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(prisma.lessonsLearnedEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          embedding: [0.1, 0.2, 0.3],
          embeddingModel: 'openai',
        }),
      }),
    );
  });

  it('falls back to tf-idf when VeriAgent embed declines', async () => {
    const veriAgent = {
      isEmbeddingConfigured: () => true,
      embed: jest.fn().mockResolvedValue({
        ok: false,
        reason: 'not_configured',
      }),
    } as unknown as VeriAgentService;

    const prisma = {
      lessonsLearnedEntry: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'les_2',
          title: 'Trip hazard',
          summary: null,
          rootCause: null,
          correctiveAction: null,
          companyId: 5,
          projectId: 1,
        }),
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaService;

    const svc = new LessonEmbeddingService(prisma, veriAgent);
    const out = await svc.embedLesson('les_2');
    expect(out?.model).toBe('tfidf-sparse');
  });
});
