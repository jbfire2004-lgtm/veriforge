import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { OrientationContentBlock } from './orientation.types';

/**
 * Stubbed AI layer for VeriForge orientation generation.
 * Returns contentBlocks JSON ready for OrientationDefinition.
 * Replace internals with real VeriAgent / LLM calls in production.
 */
@Injectable()
export class OrientationAiGenerateService {
  async generateFromText(input: {
    companyId: number;
    title?: string;
    text: string;
    type?: string;
  }): Promise<{
    title: string;
    contentBlocks: OrientationContentBlock[];
    metadata: Record<string, unknown>;
  }> {
    const title = input.title?.trim() || this.inferTitle(input.text);
    const paragraphs = input.text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 12);

    const contentBlocks: OrientationContentBlock[] = paragraphs.map((body, i) => ({
      id: randomUUID(),
      type: i === 0 ? 'slide' : 'text',
      title: i === 0 ? title : `Section ${i}`,
      body: body.slice(0, 4000),
      order: i,
      meta: { source: 'generate-from-text' },
    }));

    if (!contentBlocks.length) {
      contentBlocks.push({
        id: randomUUID(),
        type: 'text',
        title,
        body: input.text.slice(0, 4000) || 'Orientation content',
        order: 0,
      });
    }

    contentBlocks.push({
      id: randomUUID(),
      type: 'policy_ack',
      title: 'Acknowledgement',
      body: 'I acknowledge that I have reviewed this orientation.',
      order: contentBlocks.length,
    });

    return {
      title,
      contentBlocks,
      metadata: {
        aiGenerated: true,
        source: 'text',
        companyId: input.companyId,
        type: input.type ?? 'company',
        stub: true,
      },
    };
  }

  async generateFromFile(input: {
    companyId: number;
    title?: string;
    fileName: string;
    mimeType?: string;
    textExtract?: string;
  }) {
    const text =
      input.textExtract?.trim() ||
      `Orientation derived from uploaded file: ${input.fileName}`;
    const generated = await this.generateFromText({
      companyId: input.companyId,
      title: input.title ?? input.fileName.replace(/\.[^.]+$/, ''),
      text,
    });
    return {
      ...generated,
      metadata: {
        ...generated.metadata,
        source: 'file',
        fileName: input.fileName,
        mimeType: input.mimeType,
      },
    };
  }

  async generateQuiz(input: {
    companyId: number;
    topic: string;
    contentBlocks?: OrientationContentBlock[];
    questionCount?: number;
  }): Promise<{ contentBlocks: OrientationContentBlock[] }> {
    const count = Math.min(Math.max(input.questionCount ?? 3, 1), 10);
    const topic = input.topic || 'site safety';
    const contentBlocks: OrientationContentBlock[] = Array.from(
      { length: count },
      (_, i) => ({
        id: randomUUID(),
        type: 'quiz' as const,
        title: `Quiz ${i + 1}`,
        order: i,
        quiz: {
          prompt: `Regarding ${topic}: what is the correct first action if you identify a hazard?`,
          choices: [
            'Stop work and notify your supervisor',
            'Ignore it if minor',
            'Continue and report later',
            'Ask a coworker to handle it silently',
          ],
          answerIndex: 0,
        },
        meta: { stub: true, companyId: input.companyId },
      }),
    );
    return { contentBlocks };
  }

  async improveBlock(input: {
    companyId: number;
    block: OrientationContentBlock;
    instruction?: string;
  }): Promise<{ contentBlock: OrientationContentBlock }> {
    const instruction = input.instruction?.trim() || 'Improve clarity';
    const improved: OrientationContentBlock = {
      ...input.block,
      id: input.block.id || randomUUID(),
      body: [
        input.block.body?.trim() || '',
        '',
        `[AI improve: ${instruction}]`,
        'Keep language clear for field workers. Emphasize stop-work authority and reporting paths.',
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, 8000),
      meta: {
        ...(input.block.meta ?? {}),
        aiImproved: true,
        instruction,
        stub: true,
        companyId: input.companyId,
      },
    };
    return { contentBlock: improved };
  }

  private inferTitle(text: string): string {
    const first = text.split(/\n/)[0]?.trim() ?? '';
    if (first.length >= 8 && first.length <= 80) return first;
    return 'AI Orientation';
  }
}
