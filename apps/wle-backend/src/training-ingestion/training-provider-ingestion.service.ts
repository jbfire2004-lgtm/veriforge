import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  getProviderTemplate,
  mapProviderPayload,
  type ProviderCompletionRow,
} from '../modules/provider-sync-engine/provider-api-templates';
import { newIngestionCorrelationId } from './pipeline/correlation';
import {
  ProviderIngestBodySchema,
  type ProviderIngestBody,
} from './pipeline/schemas';
import type { ProviderIngestResult } from './pipeline/types';
import { TrainingIngestionService } from './training-ingestion.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import type { TrainingIngestRowDto } from './dto/ingest-training-rows.dto';

@Injectable()
export class TrainingProviderIngestionService {
  private readonly logger = new Logger(TrainingProviderIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ingestion: TrainingIngestionService,
    private readonly monitoring: Phase1MonitoringService,
  ) {}

  assertHmacSignature(
    secret: string,
    rawBody: string,
    signatureHeader?: string,
  ): void {
    if (!signatureHeader?.trim()) {
      throw new UnauthorizedException('Missing x-vera-signature header');
    }
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const provided = signatureHeader.replace(/^sha256=/i, '').trim();
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(provided, 'utf8');
    if (
      a.length !== b.length ||
      !timingSafeEqual(Uint8Array.from(a), Uint8Array.from(b))
    ) {
      throw new UnauthorizedException('Invalid provider signature');
    }
  }

  async ingestFromProvider(
    providerId: number,
    body: unknown,
    options?: { signature?: string; rawBody?: string },
  ): Promise<ProviderIngestResult> {
    const correlationId = newIngestionCorrelationId();
    const parsed = ProviderIngestBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const dto = parsed.data;

    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      throw new NotFoundException('Training provider not found');
    }

    const syncConfig = await this.prisma.providerSyncConfig.findUnique({
      where: { providerId },
    });
    if (syncConfig?.webhookSecret) {
      if (!options?.signature) {
        throw new UnauthorizedException('Missing provider webhook signature');
      }
      if (!options?.rawBody) {
        throw new BadRequestException(
          'Missing raw body for signature verification',
        );
      }
      this.assertHmacSignature(
        syncConfig.webhookSecret,
        options.rawBody,
        options.signature,
      );
    }

    const templateKey = dto.templateKey ?? 'generic_rest';
    const template = getProviderTemplate(templateKey);
    if (!template) {
      throw new BadRequestException(
        `Unknown provider template: ${templateKey}`,
      );
    }

    const completions: ProviderCompletionRow[] =
      dto.completions ?? mapProviderPayload(template, body);

    if (completions.length === 0) {
      throw new BadRequestException('No completion rows in provider payload');
    }

    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.provider.start',
        correlationId,
        providerId,
        companyId: dto.companyId,
        rowCount: completions.length,
      }),
    );

    const rows = await this.mapCompletionsToRows(dto.companyId, completions);
    const summary = await this.ingestion.ingestRowsWithConfidence(
      dto.companyId,
      rows,
      {
        correlationId,
        channel: 'provider_api',
        providerId,
      },
    );

    this.monitoring.processing('training_ingestion', 'provider.complete', {
      correlationId,
      providerId,
      created: summary.created,
    });

    return {
      correlationId,
      created: summary.created,
      needsReview: summary.needsReview,
      errors: summary.errors,
      recordIds: summary.recordIds,
    };
  }

  private async mapCompletionsToRows(
    companyId: number,
    completions: ProviderCompletionRow[],
  ): Promise<TrainingIngestRowDto[]> {
    const rows: TrainingIngestRowDto[] = [];
    for (const c of completions) {
      const workerId = await this.resolveWorkerId(companyId, c);
      if (!workerId) {
        throw new BadRequestException(
          `Could not resolve worker for completion (${
            c.workerEmail ?? c.workerExternalId ?? 'unknown'
          })`,
        );
      }
      if (!c.issuedAt || !c.expiresAt) {
        throw new BadRequestException(
          'Provider completion missing issuedAt or expiresAt',
        );
      }
      if (!c.certificationCode && !c.certificationName) {
        throw new BadRequestException(
          'Provider completion missing certification',
        );
      }
      rows.push({
        workerId,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        certificationCode: c.certificationCode,
        certificationName: c.certificationName,
        certificateNumber: c.certificateNumber,
        providerName: undefined,
      });
    }
    return rows;
  }

  private async resolveWorkerId(
    companyId: number,
    row: ProviderCompletionRow,
  ): Promise<number | null> {
    if (row.workerExternalId) {
      const ext = row.workerExternalId.trim();
      const byUnion = await this.prisma.worker.findFirst({
        where: { companyId, unionNumber: ext },
      });
      if (byUnion) return byUnion.id;
      const byPhone = await this.prisma.worker.findFirst({
        where: { companyId, phone: ext },
      });
      if (byPhone) return byPhone.id;
    }
    if (row.workerPhone) {
      const byPhone = await this.prisma.worker.findFirst({
        where: { companyId, phone: row.workerPhone },
      });
      if (byPhone) return byPhone.id;
    }
    if (row.workerEmail) {
      const byEmail = await this.prisma.worker.findFirst({
        where: {
          companyId,
          email: { equals: row.workerEmail, mode: 'insensitive' },
        },
      });
      if (byEmail) return byEmail.id;
    }
    return null;
  }
}
