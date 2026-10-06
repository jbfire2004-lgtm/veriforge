import { OrientationAiGenerateService } from '../orientation-ai-generate.service';

describe('OrientationAiGenerateService', () => {
  const ai = new OrientationAiGenerateService();

  it('generateFromText returns contentBlocks with policy ack', async () => {
    const result = await ai.generateFromText({
      companyId: 1,
      title: 'Site Rules',
      text: 'Wear PPE.\n\nReport hazards immediately.',
    });
    expect(result.title).toBe('Site Rules');
    expect(result.contentBlocks.length).toBeGreaterThanOrEqual(2);
    expect(result.contentBlocks.some((b) => b.type === 'policy_ack')).toBe(
      true,
    );
    expect(result.metadata.aiGenerated).toBe(true);
  });

  it('generateQuiz returns quiz blocks', async () => {
    const result = await ai.generateQuiz({
      companyId: 1,
      topic: 'fall protection',
      questionCount: 2,
    });
    expect(result.contentBlocks).toHaveLength(2);
    expect(result.contentBlocks[0].type).toBe('quiz');
    expect(result.contentBlocks[0].quiz?.answerIndex).toBe(0);
  });

  it('improveBlock annotates body', async () => {
    const result = await ai.improveBlock({
      companyId: 1,
      block: {
        id: 'b1',
        type: 'text',
        title: 'PPE',
        body: 'Wear hard hat',
        order: 0,
      },
      instruction: 'Make clearer',
    });
    expect(result.contentBlock.body).toContain('Wear hard hat');
    expect(result.contentBlock.meta?.aiImproved).toBe(true);
  });
});
