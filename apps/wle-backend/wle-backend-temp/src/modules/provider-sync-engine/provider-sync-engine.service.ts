import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { TrainingVerificationEngine } from '../../services/trainingVerification';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import {
  getProviderTemplate,
  mapProviderPayload,
  type ProviderCompletionRow,
} from './provider-api-templates';
import { providerSyncEvent } from '../vera-event-bus/publishers/vera-event-publishers';
import {
  providerSyncConfigDelegate,
  providerSyncRunDelegate,
} from './provider-sync.prisma';

export type ProviderWebhookPayload = {
  templateKey?: string;
  companyId: number;
  completions?: ProviderCompletionRow[];
  [key: string]: unknown;
};

@Injectable()
export class ProviderSyncEngineService {
  private readonly logger = new Logger(ProviderSyncEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly verificationEngine: TrainingVerificationEngine,
    private readonly events: EventBusService,
    private readonly notifications: NotificationsService,
  ) {}

  async upsertSyncConfig(
    providerId: number,
    input: {
      syncMode?: string;
      pollUrl?: string;
      pollIntervalMinutes?: number;
      apiKeyEnvVar?: string;
      webhookSecret?: string;
      enabled?: boolean;
      templateKey?: string;
    },
    actor?: { id: number; companyId?: number | null },
  ) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new NotFoundException('Training provider not found');

    const config = await providerSyncConfigDelegate(this.prisma).upsert({
      where: { providerId },
      create: {
        providerId,
        syncMode: input.syncMode ?? 'webhook',
        pollUrl: input.pollUrl,
        pollIntervalMinutes: input.pollIntervalMinutes ?? 60,
        apiKeyEnvVar: input.apiKeyEnvVar,
        webhookSecret: input.webhookSecret,
        enabled: input.enabled ?? true,
      },
      update: {
        syncMode: input.syncMode,
        pollUrl: input.pollUrl,
        pollIntervalMinutes: input.pollIntervalMinutes,
        apiKeyEnvVar: input.apiKeyEnvVar,
        webhookSecret: input.webhookSecret,
        enabled: input.enabled,
      },
    });
    await this.audit.logAudit(
      actor ? { id: actor.id, companyId: actor.companyId ?? undefined } : null,
      'provider_sync.config.update',
      { type: 'ProviderSyncConfig', id: providerId },
      {
        syncMode: config.syncMode,
        pollUrl: config.pollUrl ?? null,
        pollIntervalMinutes: config.pollIntervalMinutes ?? null,
        hasApiKeyEnvVar: Boolean(config.apiKeyEnvVar),
        hasWebhookSecret: Boolean(config.webhookSecret),
        enabled: config.enabled,
      },
    );
    return config;
  }

  async handleWebhook(
    providerId: number,
    body: ProviderWebhookPayload,
    signature?: string,
  ) {
    const config = await this.requireEnabledConfig(providerId);
    if (config.webhookSecret) {
      if (!signature) {
        throw new BadRequestException('Missing x-vera-signature header');
      }
      this.assertWebhookSignature(config.webhookSecret, body, signature);
    }

    const templateKey = body.templateKey ?? 'generic_rest';
    const template = getProviderTemplate(templateKey);
    if (!template) {
      throw new BadRequestException(
        `Unknown provider template: ${templateKey}`,
      );
    }

    const rows =
      body.completions ?? mapProviderPayload(template, body as unknown);

    return this.processCompletions(providerId, body.companyId, rows, 'webhook');
  }

  async pollProvider(providerId: number, companyId: number) {
    const config = await this.requireEnabledConfig(providerId);
    if (!config.pollUrl) {
      throw new BadRequestException('Provider poll URL is not configured');
    }

    const template = getProviderTemplate('generic_rest')!;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (config.apiKeyEnvVar) {
      const key = process.env[config.apiKeyEnvVar];
      if (key) headers.Authorization = `Bearer ${key}`;
    }

    const url = new URL(config.pollUrl);
    if (template.sinceQueryParam && config.lastPollAt) {
      url.searchParams.set(
        template.sinceQueryParam,
        config.lastPollAt.toISOString(),
      );
    }

    const run = await providerSyncRunDelegate(this.prisma).create({
      data: { providerId, status: 'PROCESSING' },
    });

    try {
      const res = await fetch(url.toString(), {
        method: template.pollMethod,
        headers,
      });
      if (!res.ok) {
        throw new Error(`Provider poll failed: HTTP ${res.status}`);
      }
      const json = (await res.json()) as unknown;
      const rows = mapProviderPayload(template, json);
      const result = await this.processCompletions(
        providerId,
        companyId,
        rows,
        'poll',
        run.id,
      );

      await providerSyncConfigDelegate(this.prisma).update({
        where: { providerId },
        data: { lastPollAt: new Date(), lastSyncAt: new Date() },
      });

      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await providerSyncRunDelegate(this.prisma).update({
        where: { id: run.id },
        data: { status: 'FAILED', errorMessage: msg, completedAt: new Date() },
      });
      this.events.emit({
        name: DomainEvent.PROVIDER_SYNC_FAILED,
        occurredAt: new Date().toISOString(),
        entityType: 'provider_sync_run',
        entityId: run.id,
        data: { providerId, error: msg },
      });
      throw e;
    }
  }

  async pollAllDue() {
    const configs = await providerSyncConfigDelegate(this.prisma).findMany({
      where: { enabled: true, syncMode: 'poll', pollUrl: { not: null } },
      include: { provider: { select: { id: true, name: true } } },
    });

    const results: Array<{ providerId: number; ok: boolean; error?: string }> =
      [];

    for (const config of configs) {
      const due =
        !config.lastPollAt ||
        Date.now() - config.lastPollAt.getTime() >=
          config.pollIntervalMinutes * 60_000;
      if (!due) continue;

      const companyId = await this.resolveDefaultCompanyId(config.providerId);
      if (!companyId) {
        results.push({
          providerId: config.providerId,
          ok: false,
          error: 'No company context for provider poll',
        });
        continue;
      }

      try {
        await this.pollProvider(config.providerId, companyId);
        results.push({ providerId: config.providerId, ok: true });
      } catch (e) {
        results.push({
          providerId: config.providerId,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return { polled: results.length, results };
  }

  private async processCompletions(
    providerId: number,
    companyId: number,
    rows: ProviderCompletionRow[],
    source: 'webhook' | 'poll',
    existingRunId?: number,
  ) {
    const runDelegate = providerSyncRunDelegate(this.prisma);
    const run =
      existingRunId != null
        ? await runDelegate.findUnique({
            where: { id: existingRunId },
          })
        : await runDelegate.create({
            data: { providerId, status: 'PROCESSING' },
          });

    if (!run) throw new NotFoundException('Sync run not found');

    let recordsVerified = 0;
    let recordsPushed = 0;
    const recordIds: number[] = [];
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const certificationId = await this.resolveCertificationId(row);
        if (!certificationId) {
          errors.push(
            `No certification match for ${
              row.certificationCode ?? row.certificationName
            }`,
          );
          continue;
        }

        this.events.emit({
          name: DomainEvent.PROVIDER_COMPLETION_RECEIVED,
          occurredAt: new Date().toISOString(),
          companyId: companyId || undefined,
          entityType: 'training_provider',
          entityId: providerId,
          data: { source, workerEmail: row.workerEmail },
        });

        const verified = await this.verificationEngine.ingestAndVerify({
          workerEmail: row.workerEmail,
          workerPhone: row.workerPhone,
          companyId: companyId || undefined,
          certificationId,
          trainingProviderId: providerId,
          certificateNumber: row.certificateNumber,
          issuedAt: row.issuedAt,
          expiresAt: row.expiresAt,
        });

        recordsVerified += 1;
        if (verified.overallStatus === 'VERIFIED') recordsPushed += 1;
        recordIds.push(verified.trainingRecordId);
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }

    const status =
      errors.length > 0 && recordsVerified === 0 ? 'FAILED' : 'COMPLETED';

    await providerSyncRunDelegate(this.prisma).update({
      where: { id: run.id },
      data: {
        status,
        recordsFetched: rows.length,
        recordsVerified,
        recordsPushed,
        errorMessage: errors.length ? errors.join('; ') : null,
        details: { recordIds, source },
        completedAt: new Date(),
      },
    });

    await providerSyncConfigDelegate(this.prisma).updateMany({
      where: { providerId },
      data: { lastSyncAt: new Date() },
    });

    const eventName =
      status === 'FAILED'
        ? DomainEvent.PROVIDER_SYNC_FAILED
        : DomainEvent.PROVIDER_SYNC_COMPLETED;

    this.events.emit({
      name: eventName,
      occurredAt: new Date().toISOString(),
      companyId: companyId || undefined,
      entityType: 'provider_sync_run',
      entityId: run.id,
      data: { providerId, recordsVerified, recordsPushed, source },
    });

    this.events.emit(
      providerSyncEvent({
        providerId,
        companyId: companyId || undefined,
        status,
        recordsPushed,
        runId: run.id,
      }),
    );

    if (companyId && recordsPushed > 0) {
      await this.notifications.notifyCompanySupervisors(companyId, {
        type: NOTIFICATION_TYPES.TRAINING_INGESTION_COMPLETED,
        title: 'Provider training synced to wallets',
        body: `${recordsPushed} verified training record(s) from provider #${providerId}.`,
        payload: { providerId, recordIds },
        dedupeKey: `provider-sync:${run.id}`,
        companyId,
      });
    }

    this.logger.log(
      JSON.stringify({
        type: 'provider_sync.complete',
        providerId,
        runId: run.id,
        recordsFetched: rows.length,
        recordsVerified,
        recordsPushed,
      }),
    );

    return {
      runId: run.id,
      status,
      recordsFetched: rows.length,
      recordsVerified,
      recordsPushed,
      recordIds,
      errors,
    };
  }

  private async resolveCertificationId(
    row: ProviderCompletionRow,
  ): Promise<number | null> {
    if (row.certificationCode) {
      const byCode = await this.prisma.certification.findFirst({
        where: { code: { equals: row.certificationCode, mode: 'insensitive' } },
        select: { id: true },
      });
      if (byCode) return byCode.id;
    }
    if (row.certificationName) {
      const byName = await this.prisma.certification.findFirst({
        where: { name: { equals: row.certificationName, mode: 'insensitive' } },
        select: { id: true },
      });
      if (byName) return byName.id;
    }
    return null;
  }

  private async resolveDefaultCompanyId(
    providerId: number,
  ): Promise<number | null> {
    const recent = await this.prisma.trainingRecord.findFirst({
      where: { trainingProviderId: providerId, companyId: { not: null } },
      orderBy: { issuedAt: 'desc' },
      select: { companyId: true },
    });
    return recent?.companyId ?? null;
  }

  private async requireEnabledConfig(providerId: number) {
    const config = await providerSyncConfigDelegate(this.prisma).findUnique({
      where: { providerId },
    });
    if (!config?.enabled) {
      throw new BadRequestException('Provider sync is not enabled');
    }
    return config;
  }

  private assertWebhookSignature(
    secret: string,
    body: unknown,
    signature: string,
  ) {
    const digest = createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    const a = Buffer.from(digest);
    const b = Buffer.from(signature.replace(/^sha256=/, ''));
    if (
      a.length !== b.length ||
      !timingSafeEqual(new Uint8Array(a), new Uint8Array(b))
    ) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
