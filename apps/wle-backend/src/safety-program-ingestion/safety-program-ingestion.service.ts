import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SafetyProgramIngestChannel,
  SafetyProgramIngestStatus,
  type SafetyProgramIngestRun,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SafetyProgramExtractService } from './safety-program-extract.service';
import { SafetyProgramWritebackService } from './safety-program-writeback.service';
import { SafetyProgramPipelineService } from './safety-program-pipeline.service';
import { SafetyProgramMergeService } from './safety-program-merge.service';
import { SafetyProgramNormalizeService } from './safety-program-normalize.service';
import { SafetyProgramSummarizeService } from './safety-program-summarize.service';
import { SafetyProgramSitePlanService } from './safety-program-site-plan.service';
import {
  parseSafetyProgramExtract,
  type SafetyProgramExtract,
} from './schema/safety-program-extract.schema';

@Injectable()
export class SafetyProgramIngestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly extractor: SafetyProgramExtractService,
    private readonly writeback: SafetyProgramWritebackService,
    private readonly pipeline: SafetyProgramPipelineService,
    private readonly mergeService: SafetyProgramMergeService,
    private readonly normalizeService: SafetyProgramNormalizeService,
    private readonly summarizeService: SafetyProgramSummarizeService,
    private readonly sitePlanService: SafetyProgramSitePlanService,
  ) {}

  async extractText(input: {
    companyId: number;
    projectId?: number;
    channel?: SafetyProgramIngestChannel;
    text: string;
    sourceReference?: string;
    fileName?: string;
    coreFileId?: number;
    /** When true (default for long text), chunk → merge → normalize. */
    usePipeline?: boolean;
  }) {
    if (!input.companyId) {
      throw new BadRequestException('companyId is required');
    }
    if (!input.text?.trim()) {
      throw new BadRequestException('text is required');
    }

    const run = await this.prisma.safetyProgramIngestRun.create({
      data: {
        companyId: input.companyId,
        projectId: input.projectId ?? null,
        coreFileId: input.coreFileId ?? null,
        channel: input.channel ?? SafetyProgramIngestChannel.api,
        status: SafetyProgramIngestStatus.EXTRACTING,
        sourceFileName: input.fileName ?? input.sourceReference ?? null,
        rawText: input.text.trim().slice(0, 500_000),
      },
    });

    try {
      const usePipeline =
        input.usePipeline !== false && input.text.trim().length > 3500;
      const result = usePipeline
        ? this.pipeline.processDocumentText({
            text: input.text,
            sourceReference: input.sourceReference,
            fileName: input.fileName,
          })
        : (() => {
            const { extract, confidence } = this.extractor.extractFromText({
              text: input.text,
              sourceReference: input.sourceReference,
              fileName: input.fileName,
            });
            const normalized = this.normalizeService.normalize(extract);
            return { extract: normalized, confidence, chunkCount: 1 };
          })();

      const updated = await this.prisma.safetyProgramIngestRun.update({
        where: { id: run.id },
        data: {
          status: SafetyProgramIngestStatus.NEEDS_REVIEW,
          extractJson: result.extract as unknown as Prisma.InputJsonValue,
          confidence: result.confidence,
          error:
            result.chunkCount > 1
              ? `Processed via ${result.chunkCount} chunks (merged + normalized).`
              : null,
        },
      });
      return this.toDto(updated);
    } catch (e) {
      await this.prisma.safetyProgramIngestRun.update({
        where: { id: run.id },
        data: {
          status: SafetyProgramIngestStatus.FAILED,
          error: e instanceof Error ? e.message : 'Extract failed',
        },
      });
      throw e;
    }
  }

  async upload(input: {
    companyId: number;
    projectId?: number;
    channel?: SafetyProgramIngestChannel;
    coreFileId?: number;
    text?: string;
    fileName?: string;
    sourceReference?: string;
  }) {
    const text = input.text?.trim();
    if (!text && !input.coreFileId) {
      throw new BadRequestException('text or coreFileId is required');
    }

    let resolvedText = text ?? '';
    let fileName = input.fileName ?? null;

    if (input.coreFileId && !resolvedText) {
      const file = await this.prisma.coreFile.findUnique({
        where: { id: input.coreFileId },
      });
      if (!file) throw new NotFoundException('CoreFile not found');
      fileName = file.originalName ?? fileName;
      // OCR is optional in v1 — store placeholder for review if no text provided
      resolvedText =
        typeof (file as { extractedText?: string }).extractedText === 'string'
          ? ((file as { extractedText?: string }).extractedText as string)
          : '';
      if (!resolvedText.trim()) {
        const run = await this.prisma.safetyProgramIngestRun.create({
          data: {
            companyId: input.companyId,
            projectId: input.projectId ?? null,
            coreFileId: input.coreFileId,
            channel: input.channel ?? SafetyProgramIngestChannel.core,
            status: SafetyProgramIngestStatus.NEEDS_REVIEW,
            sourceFileName: fileName,
            rawText: null,
            extractJson: this.extractor.extractFromText({
              text: '',
              fileName,
              sourceReference: input.sourceReference,
            }).extract as unknown as Prisma.InputJsonValue,
            confidence: 0,
            error:
              'No OCR text available for CoreFile — paste text via extract-text or correct the extract manually.',
          },
        });
        return this.toDto(run);
      }
    }

    return this.extractText({
      companyId: input.companyId,
      projectId: input.projectId,
      channel: input.channel,
      text: resolvedText,
      sourceReference: input.sourceReference,
      fileName: fileName ?? undefined,
      coreFileId: input.coreFileId,
    });
  }

  async list(filters: {
    companyId: number;
    projectId?: number;
    status?: SafetyProgramIngestStatus;
  }) {
    const rows = await this.prisma.safetyProgramIngestRun.findMany({
      where: {
        companyId: filters.companyId,
        ...(filters.projectId != null ? { projectId: filters.projectId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map((r) => this.toDto(r));
  }

  async get(id: string) {
    const row = await this.prisma.safetyProgramIngestRun.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException(`Ingest run not found: ${id}`);
    return this.toDto(row);
  }

  async correct(id: string, extractJson: unknown) {
    const row = await this.prisma.safetyProgramIngestRun.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException(`Ingest run not found: ${id}`);
    if (
      row.status !== SafetyProgramIngestStatus.NEEDS_REVIEW &&
      row.status !== SafetyProgramIngestStatus.FAILED
    ) {
      throw new BadRequestException(
        'Only NEEDS_REVIEW or FAILED runs can be corrected',
      );
    }

    const extract = parseSafetyProgramExtract(extractJson);
    const updated = await this.prisma.safetyProgramIngestRun.update({
      where: { id },
      data: {
        extractJson: extract as unknown as Prisma.InputJsonValue,
        status: SafetyProgramIngestStatus.NEEDS_REVIEW,
        error: null,
      },
    });
    return this.toDto(updated);
  }

  async confirm(id: string, confirmedBy: string, actorId?: number) {
    if (!confirmedBy?.trim()) {
      throw new BadRequestException('confirmedBy is required');
    }
    const row = await this.prisma.safetyProgramIngestRun.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException(`Ingest run not found: ${id}`);
    if (row.status !== SafetyProgramIngestStatus.NEEDS_REVIEW) {
      throw new BadRequestException('Only NEEDS_REVIEW runs can be confirmed');
    }
    if (!row.extractJson) {
      throw new BadRequestException('extractJson is missing');
    }

    const extract = parseSafetyProgramExtract(row.extractJson);
    const writebackSummary = await this.writeback.writeback({
      companyId: row.companyId,
      projectId: row.projectId,
      extract,
      actorId,
    });

    const updated = await this.prisma.safetyProgramIngestRun.update({
      where: { id },
      data: {
        status: SafetyProgramIngestStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmedBy: confirmedBy.trim(),
        writebackSummary: writebackSummary as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toDto(updated);
  }

  async reject(id: string, reason?: string) {
    const row = await this.prisma.safetyProgramIngestRun.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException(`Ingest run not found: ${id}`);
    const updated = await this.prisma.safetyProgramIngestRun.update({
      where: { id },
      data: {
        status: SafetyProgramIngestStatus.REJECTED,
        error: reason?.trim() || 'Rejected by reviewer',
      },
    });
    return this.toDto(updated);
  }

  mergeChunks(chunks: unknown[]) {
    const parsed = chunks.map((c) => parseSafetyProgramExtract(c));
    return this.normalizeService.normalize(this.mergeService.merge(parsed));
  }

  normalizeDocument(doc: unknown) {
    return this.normalizeService.normalize(parseSafetyProgramExtract(doc));
  }

  normalizeDocuments(docs: unknown[]) {
    return this.normalizeService.normalizeMany(
      docs.map((d) => parseSafetyProgramExtract(d)),
    );
  }

  summarize(doc: unknown) {
    return this.summarizeService.summarize(parseSafetyProgramExtract(doc));
  }

  async summarizeRun(id: string) {
    const row = await this.get(id);
    if (!row.extract) {
      throw new BadRequestException('Run has no validated extract');
    }
    return this.summarizeService.summarize(row.extract);
  }

  buildSitePlan(input: {
    documents?: unknown[];
    runIds?: string[];
    companyId?: number;
    worksiteDescription: string;
    plannedActivities: string;
  }) {
    return this.resolveDocuments(input).then((documents) =>
      this.sitePlanService.buildMarkdown({
        documents,
        worksiteDescription: input.worksiteDescription ?? '',
        plannedActivities: input.plannedActivities ?? '',
      }),
    );
  }

  private async resolveDocuments(input: {
    documents?: unknown[];
    runIds?: string[];
    companyId?: number;
  }): Promise<SafetyProgramExtract[]> {
    if (input.documents?.length) {
      return input.documents.map((d) => parseSafetyProgramExtract(d));
    }
    if (input.runIds?.length) {
      const rows = await this.prisma.safetyProgramIngestRun.findMany({
        where: { id: { in: input.runIds } },
      });
      return rows
        .map((r) => {
          try {
            return r.extractJson
              ? parseSafetyProgramExtract(r.extractJson)
              : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as SafetyProgramExtract[];
    }
    if (input.companyId) {
      const rows = await this.prisma.safetyProgramIngestRun.findMany({
        where: {
          companyId: input.companyId,
          status: {
            in: [
              SafetyProgramIngestStatus.CONFIRMED,
              SafetyProgramIngestStatus.NEEDS_REVIEW,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      return rows
        .map((r) => {
          try {
            return r.extractJson
              ? parseSafetyProgramExtract(r.extractJson)
              : null;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as SafetyProgramExtract[];
    }
    return [];
  }

  private toDto(row: SafetyProgramIngestRun) {
    let extract: SafetyProgramExtract | null = null;
    if (row.extractJson) {
      try {
        extract = parseSafetyProgramExtract(row.extractJson);
      } catch {
        extract = null;
      }
    }
    return {
      id: row.id,
      companyId: row.companyId,
      projectId: row.projectId,
      coreFileId: row.coreFileId,
      channel: row.channel,
      status: row.status,
      sourceFileName: row.sourceFileName,
      rawText: row.rawText,
      extract,
      confidence: row.confidence,
      error: row.error,
      confirmedAt: row.confirmedAt?.toISOString() ?? null,
      confirmedBy: row.confirmedBy,
      writebackSummary: row.writebackSummary,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
