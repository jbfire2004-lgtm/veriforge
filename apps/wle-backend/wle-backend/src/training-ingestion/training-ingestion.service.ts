import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../notifications/notification-types';
import {
  TrainingValidationOutcome,
  TrainingValidationSubject,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TrainingIngestRowDto } from './dto/ingest-training-rows.dto';
import type { EmailIngestDto } from './dto/email-ingest.dto';
import { OcrExtractionService } from './ocr-extraction.service';
import type { OcrExtractedFields } from './ocr-field-extractor.service';
import type { ParsedIngestPayload } from './training-metadata-parser.service';
import { TrainingMetadataParserService } from './training-metadata-parser.service';
import { TRAINING_INGEST_ALLOWED_MIMES } from './training-ingestion-upload.config';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { TrainingWalletIntegrationService } from '../modules/vera-core/training-wallet-integration.service';
import { CoreUploadService } from '../modules/core-upload/core-upload.service';
import { IngestionConfidencePolicyService } from './ingestion-confidence-policy.service';
import { scoreBatch, scoreIngestRow } from './pipeline/confidence-scoring';
import { newIngestionCorrelationId } from './pipeline/correlation';
import type {
  IngestionChannel,
  IngestionConfidenceReport,
  IngestionPreviewResult,
  NormalizedIngestRow,
} from './pipeline/types';
import { ConfirmIngestBodySchema } from './pipeline/schemas';
import { TrainingStandardsComplianceService } from '../modules/training-standards-compliance/training-standards-compliance.service';
import { CredentialLedgerService } from '../modules/credential-ledger/credential-ledger.service';
import { CredentialLedgerActorType } from '@prisma/client';

function effectiveTrainingUploadMime(file: Express.Multer.File): string {
  const m = (file.mimetype || '').trim();
  if (m) return m;
  const n = (file.originalname || '').toLowerCase();
  if (n.endsWith('.json')) return 'application/json';
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.webp')) return 'image/webp';
  return '';
}

export type IngestRowError = { row: number; message: string };

export type IngestSummary = {
  created: number;
  errors: IngestRowError[];
  recordIds: number[];
  needsReview: number;
  /** Rows auto-approved via expiry + confidence policy */
  autoVerified?: number;
  correlationId?: string;
};

type IngestLookupContext = {
  companyId: number;
  workerExists: Map<number, boolean>;
  providerByName: Map<string, number | null>;
  certById: Map<number, number | null>;
  certByCode: Map<string, number | null>;
  certByName: Map<string, number | null>;
};

/** Split a CSV line respecting double-quoted fields */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && c === ',') {
      result.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  result.push(cur.trim());
  return result.map((s) => s.replace(/^"|"$/g, ''));
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

function cell(
  headers: string[],
  cells: string[],
  ...aliases: string[]
): string | undefined {
  const idx = headers.findIndex((h) => aliases.includes(h));
  if (idx === -1 || idx >= cells.length) return undefined;
  const v = cells[idx]?.trim();
  return v === '' ? undefined : v;
}

/** ISO-8601 first; then common US `M/D/YYYY` (UTC midnight). */
function parseIngestDate(value: string): Date {
  const s = value.trim();
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (us) {
    const mm = parseInt(us[1], 10);
    const dd = parseInt(us[2], 10);
    const yyyy = parseInt(us[3], 10);
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(NaN);
}

@Injectable()
export class TrainingIngestionService {
  private readonly logger = new Logger(TrainingIngestionService.name);
  constructor(
    private prisma: PrismaService,
    private readonly ocr: OcrExtractionService,
    private readonly parser: TrainingMetadataParserService,
    private readonly monitoring: Phase1MonitoringService,
    private readonly walletIntegration: TrainingWalletIntegrationService,
    private readonly coreUpload: CoreUploadService,
    private readonly confidencePolicy: IngestionConfidencePolicyService,
    private readonly standards: TrainingStandardsComplianceService,
    private readonly credentialLedger: CredentialLedgerService,
    @Optional() private readonly events?: EventBusService,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}

  private newLookupContext(companyId: number): IngestLookupContext {
    return {
      companyId,
      workerExists: new Map(),
      providerByName: new Map(),
      certById: new Map(),
      certByCode: new Map(),
      certByName: new Map(),
    };
  }

  async ingestCsv(companyId: number, csvText: string): Promise<IngestSummary> {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV must include a header row and at least one data row',
      );
    }
    const headers = parseCsvLine(lines[0]).map(normalizeHeader);
    const rows: TrainingIngestRowDto[] = [];
    const parseErrors: IngestRowError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const fileLine = i + 1;
      const cells = parseCsvLine(lines[i]);
      const workerRaw = cell(headers, cells, 'worker_id', 'workerid');
      const certIdRaw = cell(headers, cells, 'certification_id', 'cert_id');
      const certCode = cell(
        headers,
        cells,
        'certification_code',
        'cert_code',
        'code',
      );
      const certName = cell(
        headers,
        cells,
        'certification_name',
        'cert_name',
        'course',
      );
      const issuedRaw = cell(
        headers,
        cells,
        'issued_at',
        'issued',
        'date_issued',
      );
      const expiresRaw = cell(
        headers,
        cells,
        'expires_at',
        'expires',
        'expiry',
        'expiration',
      );
      const providerName = cell(
        headers,
        cells,
        'provider',
        'provider_name',
        'training_provider',
      );
      const certificateNumber = cell(
        headers,
        cells,
        'certificate_number',
        'cert_number',
        'certificate_no',
      );

      if (!workerRaw || !issuedRaw || !expiresRaw) {
        parseErrors.push({
          row: fileLine,
          message: 'Missing worker_id (or workerid), issued_at, or expires_at',
        });
        continue;
      }

      const workerId = parseInt(workerRaw, 10);
      if (!Number.isFinite(workerId)) {
        parseErrors.push({
          row: fileLine,
          message: 'worker_id must be a number',
        });
        continue;
      }

      let certificationId: number | undefined;
      if (certIdRaw !== undefined) {
        const n = parseInt(certIdRaw, 10);
        certificationId = Number.isFinite(n) ? n : undefined;
      }

      rows.push({
        workerId,
        certificationId,
        certificationCode: certCode,
        certificationName: certName,
        issuedAt: issuedRaw,
        expiresAt: expiresRaw,
        providerName,
        certificateNumber,
      });
    }

    const batch = await this.ingestRows(companyId, rows);
    // `ingestRows` already uses 1-based row indices aligned with `rows[]`.

    return {
      created: batch.created,
      errors: [...parseErrors, ...batch.errors],
      recordIds: batch.recordIds,
      needsReview: batch.needsReview,
    };
  }

  async ingestRows(
    companyId: number,
    rows: TrainingIngestRowDto[],
    options?: { ingestionRunId?: number },
  ): Promise<IngestSummary> {
    const started = Date.now();
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');
    const lookup = this.newLookupContext(companyId);

    const errors: IngestRowError[] = [];
    const recordIds: number[] = [];
    let created = 0;
    let rowNum = 0;

    for (const row of rows) {
      rowNum++;
      try {
        const id = await this.ingestOneRow(companyId, row, options, lookup);
        recordIds.push(id);
        created++;
      } catch (e) {
        errors.push({
          row: rowNum,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }
    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.rows.duration',
        companyId,
        rowCount: rows.length,
        created,
        errors: errors.length,
        durationMs: Date.now() - started,
      }),
    );
    return { created, errors, recordIds, needsReview: 0 };
  }

  /**
   * Ingest rows with per-row confidence scoring; routes low-confidence records to NEEDS_REVIEW.
   */
  async ingestRowsWithConfidence(
    companyId: number,
    rows: NormalizedIngestRow[],
    options?: {
      ingestionRunId?: number;
      correlationId?: string;
      channel?: IngestionChannel;
      providerId?: number;
      ocrExtracted?: OcrExtractedFields | null;
    },
  ): Promise<IngestSummary> {
    const started = Date.now();
    const correlationId = options?.correlationId ?? newIngestionCorrelationId();
    const batchConfidence = scoreBatch(rows, options?.ocrExtracted);
    if (batchConfidence.blocked) {
      throw new BadRequestException({
        message:
          'Extraction confidence too low to create credentials. Provide metadata or correct fields manually.',
        correlationId,
        confidence: batchConfidence,
      });
    }

    const errors: IngestRowError[] = [];
    const recordIds: number[] = [];
    let created = 0;
    let needsReview = 0;
    let autoVerified = 0;
    let rowNum = 0;
    const lookup = this.newLookupContext(companyId);

    for (const row of rows) {
      rowNum++;
      try {
        const rowConfidence = scoreIngestRow(row, options?.ocrExtracted);
        if (rowConfidence.blocked) {
          errors.push({
            row: rowNum,
            message:
              'Row blocked: insufficient confidence or missing required fields',
          });
          continue;
        }
        const id = await this.ingestOneRow(
          companyId,
          row,
          {
            ingestionRunId: options?.ingestionRunId,
            deferValidation: options?.ingestionRunId != null,
          },
          lookup,
        );
        recordIds.push(id);
        created++;
        if (options?.ingestionRunId != null) {
          const issuedAt = parseIngestDate(row.issuedAt);
          const expiresAt = parseIngestDate(row.expiresAt);
          const outcome = this.confidencePolicy.resolveValidationOutcome({
            confidence: rowConfidence,
            issuedAt,
            expiresAt,
          });
          await this.createIngestionValidation(id, outcome, {
            correlationId,
            channel: options?.channel,
            confidence: rowConfidence,
            providerId: options?.providerId,
            expiryAutoVerified:
              outcome === TrainingValidationOutcome.APPROVED,
          });
          if (outcome === TrainingValidationOutcome.NEEDS_REVIEW) {
            needsReview++;
          }
          if (outcome === TrainingValidationOutcome.APPROVED) {
            autoVerified++;
            await this.prisma.trainingRecord.update({
              where: { id },
              data: {
                lastVerificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                lastVerificationChecks: {
                  source: 'ingestion_auto_expiry',
                  outcome: TrainingValidationOutcome.APPROVED,
                },
              },
            });
            this.events?.emit({
              name: DomainEvent.TRAINING_VALIDATED,
              occurredAt: new Date().toISOString(),
              entityType: 'training',
              entityId: id,
              data: {
                outcome: TrainingValidationOutcome.APPROVED,
                source: 'ingestion_auto_expiry',
              },
            });
          }
        }
      } catch (e) {
        errors.push({
          row: rowNum,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }

    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.rows.complete',
        correlationId,
        created,
        needsReview,
        autoVerified,
        errors: errors.length,
        durationMs: Date.now() - started,
      }),
    );

    return {
      created,
      errors,
      recordIds,
      needsReview,
      autoVerified,
      correlationId,
    };
  }

  private async ingestOneRow(
    companyId: number,
    row: TrainingIngestRowDto,
    options?: { ingestionRunId?: number; deferValidation?: boolean },
    lookup?: IngestLookupContext,
  ): Promise<number> {
    if (!Number.isFinite(row.workerId)) {
      throw new Error('Invalid or missing worker id');
    }

    let workerExists = lookup?.workerExists.get(row.workerId);
    if (workerExists == null) {
      const worker = await this.prisma.worker.findFirst({
        where: { id: row.workerId, companyId },
        select: { id: true },
      });
      workerExists = Boolean(worker);
      lookup?.workerExists.set(row.workerId, workerExists);
    }
    if (!workerExists) {
      throw new Error(`Worker ${row.workerId} not found for this company`);
    }

    const certificationId = await this.resolveCertificationId(row, lookup);
    if (!certificationId) {
      throw new Error(
        'Could not resolve certification (provide certificationId, certificationCode, or certificationName)',
      );
    }

    const issuedAt = parseIngestDate(row.issuedAt);
    const expiresAt = parseIngestDate(row.expiresAt);
    if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
      throw new Error('Invalid issuedAt or expiresAt date');
    }

    if (issuedAt.getTime() > expiresAt.getTime()) {
      throw new Error('issuedAt must be on or before expiresAt');
    }

    let providerId: number | undefined;
    if (row.providerName?.trim()) {
      const providerName = row.providerName.trim();
      const cachedProvider = lookup?.providerByName.get(providerName);
      if (cachedProvider !== undefined) {
        providerId = cachedProvider ?? undefined;
      } else {
        const p = await this.prisma.provider.findUnique({
          where: { name: providerName },
          select: { id: true },
        });
        providerId = p?.id;
        lookup?.providerByName.set(providerName, providerId ?? null);
      }
    }

    const certNum = row.certificateNumber?.trim();
    const rec = await this.prisma.trainingRecord.create({
      data: {
        workerId: row.workerId,
        certificationId,
        companyId,
        providerId: providerId ?? null,
        issuedAt,
        expiresAt,
        ...(certNum ? { certificateNumber: certNum } : {}),
        ...(options?.ingestionRunId != null
          ? { ingestionRunId: options.ingestionRunId }
          : {}),
      },
    });
    await this.walletIntegration
      .syncAfterTrainingRecord(rec.id)
      .catch((err) => {
        this.logger.warn(`Wallet sync failed for training ${rec.id}: ${err}`);
      });
    const ledgerCtx = {
      credentialId: rec.id,
      workerId: rec.workerId,
      providerId: rec.providerId,
      companyId: rec.companyId,
      payload: {
        certificationId,
        ingestionRunId: options?.ingestionRunId ?? null,
        certificateNumber: certNum ?? null,
      },
    };
    if (options?.ingestionRunId != null) {
      await this.credentialLedger.recordCredentialImported(ledgerCtx);
    } else {
      await this.credentialLedger.recordCredentialCreated(ledgerCtx);
    }
    if (options?.ingestionRunId != null && !options.deferValidation) {
      await this.createIngestionValidation(
        rec.id,
        TrainingValidationOutcome.PENDING,
        {
          source: 'training_ingestion',
        },
      );
    }
    return rec.id;
  }

  private async createIngestionValidation(
    trainingRecordId: number,
    outcome: TrainingValidationOutcome,
    details: Record<string, unknown>,
  ) {
    const existing = await this.prisma.trainingValidationResult.findFirst({
      where: {
        trainingRecordId,
        outcome: {
          in: [
            TrainingValidationOutcome.PENDING,
            TrainingValidationOutcome.NEEDS_REVIEW,
          ],
        },
      },
    });
    if (existing) return existing.id;
    const row = await this.prisma.trainingValidationResult.create({
      data: {
        subjectType: TrainingValidationSubject.TRAINING_RECORD,
        outcome,
        trainingRecordId,
        score:
          typeof details.confidence === 'object' &&
          details.confidence != null &&
          'overall' in (details.confidence as object)
            ? Math.round(
                ((details.confidence as { overall: number }).overall ?? 0) *
                  100,
              )
            : undefined,
        details: { source: 'training_ingestion', ...details },
      },
    });
    return row.id;
  }

  /** @deprecated use createIngestionValidation */
  private async createPendingValidation(trainingRecordId: number) {
    return this.createIngestionValidation(
      trainingRecordId,
      TrainingValidationOutcome.PENDING,
      { source: 'training_ingestion' },
    );
  }

  private async createPendingValidations(recordIds: number[]) {
    for (const id of recordIds) {
      await this.createPendingValidation(id);
    }
  }

  private async resolveCertificationId(
    row: TrainingIngestRowDto,
    lookup?: IngestLookupContext,
  ): Promise<number | null> {
    if (row.certificationId != null && Number.isFinite(row.certificationId)) {
      const cached = lookup?.certById.get(row.certificationId);
      if (cached !== undefined) return cached;
      const c = await this.prisma.certification.findUnique({
        where: { id: row.certificationId },
        select: { id: true },
      });
      const resolved = c?.id ?? null;
      lookup?.certById.set(row.certificationId, resolved);
      return resolved;
    }

    if (row.certificationCode?.trim()) {
      const code = row.certificationCode.trim();
      const cached = lookup?.certByCode.get(code);
      if (cached !== undefined) return cached;
      const byCode = await this.prisma.certification.findFirst({
        where: {
          code: { equals: code, mode: 'insensitive' },
        },
        select: { id: true },
      });
      const resolved = byCode?.id ?? null;
      lookup?.certByCode.set(code, resolved);
      if (resolved != null) return resolved;
    }

    if (row.certificationName?.trim()) {
      const name = row.certificationName.trim();
      const cached = lookup?.certByName.get(name);
      if (cached !== undefined) return cached;
      const byName = await this.prisma.certification.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
        },
        select: { id: true },
      });
      const resolved = byName?.id ?? null;
      lookup?.certByName.set(name, resolved);
      if (resolved != null) return resolved;
    }

    return null;
  }

  async getRun(runId: number) {
    const run = await this.prisma.trainingIngestionRun.findUnique({
      where: { id: runId },
      include: {
        company: { select: { id: true, name: true } },
        coreFile: {
          select: {
            id: true,
            publicUrl: true,
            originalName: true,
            mimeType: true,
          },
        },
        createdRecords: {
          select: { id: true, workerId: true, ingestionRunId: true },
        },
      },
    });
    if (!run) {
      throw new NotFoundException('Training ingestion run not found');
    }
    return run;
  }

  async listRuns(params: {
    companyId: number;
    status?: string;
    sourceChannel?: string;
    limit?: number;
  }) {
    const started = Date.now();
    const rows = await this.prisma.trainingIngestionRun.findMany({
      where: {
        companyId: params.companyId,
        ...(params.status ? { status: params.status } : {}),
        ...(params.sourceChannel
          ? { sourceChannel: params.sourceChannel }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 50,
      include: {
        createdRecords: {
          select: { id: true, workerId: true },
        },
        coreFile: {
          select: { id: true, publicUrl: true, originalName: true },
        },
      },
    });
    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.runs.query',
        companyId: params.companyId,
        rows: rows.length,
        durationMs: Date.now() - started,
      }),
    );
    return rows;
  }

  async verificationQueue(companyId: number, limit = 50) {
    const started = Date.now();
    const rows = await this.prisma.trainingValidationResult.findMany({
      where: {
        outcome: TrainingValidationOutcome.PENDING,
        trainingRecord: { companyId },
      },
      orderBy: { validatedAt: 'desc' },
      take: limit,
      include: {
        trainingRecord: {
          select: {
            id: true,
            workerId: true,
            certificationId: true,
            issuedAt: true,
            expiresAt: true,
            worker: { select: { id: true, firstName: true, lastName: true } },
            certification: { select: { id: true, code: true, name: true } },
            ingestionRun: {
              select: {
                id: true,
                coreFile: {
                  select: { id: true, publicUrl: true, originalName: true },
                },
              },
            },
          },
        },
      },
    });
    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.queue.pending.query',
        companyId,
        rows: rows.length,
        durationMs: Date.now() - started,
      }),
    );
    return rows;
  }

  async needsReviewQueue(companyId: number, limit = 50) {
    const started = Date.now();
    const rows = await this.prisma.trainingValidationResult.findMany({
      where: {
        outcome: TrainingValidationOutcome.NEEDS_REVIEW,
        trainingRecord: { companyId },
      },
      orderBy: { validatedAt: 'desc' },
      take: limit,
      include: {
        trainingRecord: {
          select: {
            id: true,
            workerId: true,
            certificationId: true,
            issuedAt: true,
            expiresAt: true,
            worker: { select: { id: true, firstName: true, lastName: true } },
            certification: { select: { id: true, code: true, name: true } },
            ingestionRun: {
              select: {
                id: true,
                coreFile: {
                  select: { id: true, publicUrl: true, originalName: true },
                },
              },
            },
          },
        },
      },
    });
    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.queue.review.query',
        companyId,
        rows: rows.length,
        durationMs: Date.now() - started,
      }),
    );
    return rows;
  }

  async approveReview(
    validationResultId: number,
    validatedBy: number,
    notes?: string,
  ) {
    const result = await this.standards.approveValidation(
      validationResultId,
      validatedBy,
      notes,
    );
    const recordId = result.trainingRecordId;
    if (recordId) {
      this.events?.emit({
        name: DomainEvent.TRAINING_VALIDATED,
        occurredAt: new Date().toISOString(),
        entityType: 'training',
        entityId: recordId,
        data: {
          validationResultId,
          outcome: TrainingValidationOutcome.APPROVED,
          source: 'ingestion_review',
        },
      });
    }
    return result;
  }

  async correctReview(
    validationResultId: number,
    validatedBy: number,
    corrections: Record<string, unknown>,
  ) {
    const validation = await this.prisma.trainingValidationResult.findUnique({
      where: { id: validationResultId },
      include: { trainingRecord: true },
    });
    if (!validation?.trainingRecord) {
      throw new NotFoundException('Validation or training record not found');
    }
    const rec = validation.trainingRecord;
    const data: Record<string, unknown> = {};
    if (corrections.workerId != null) {
      const worker = await this.prisma.worker.findFirst({
        where: {
          id: Number(corrections.workerId),
          companyId: rec.companyId,
        },
      });
      if (!worker)
        throw new BadRequestException('Worker not found for company');
      data.workerId = worker.id;
    }
    if (corrections.certificationId != null) {
      data.certificationId = Number(corrections.certificationId);
    }
    if (corrections.issuedAt)
      data.issuedAt = parseIngestDate(String(corrections.issuedAt));
    if (corrections.expiresAt)
      data.expiresAt = parseIngestDate(String(corrections.expiresAt));
    if (corrections.certificateNumber) {
      data.certificateNumber = String(corrections.certificateNumber);
    }
    if (Object.keys(data).length > 0) {
      await this.credentialLedger.recordCredentialCorrected({
        credentialId: rec.id,
        workerId: rec.workerId,
        providerId: rec.providerId,
        companyId: rec.companyId,
        actorId: validatedBy,
        actorType: CredentialLedgerActorType.SUPERVISOR,
        payload: { corrections: data },
      });
      await this.prisma.trainingRecord.update({
        where: { id: rec.id },
        data: data as never,
      });
    }
    return this.approveReview(
      validationResultId,
      validatedBy,
      corrections.notes as string | undefined,
    );
  }

  /** Parse upload without persisting training records (preview step). */
  async previewFileUpload(
    companyId: number,
    file: Express.Multer.File,
    metadataJson?: string,
  ): Promise<IngestionPreviewResult> {
    const correlationId = newIngestionCorrelationId();
    const parsed = await this.parseUploadToRows(
      companyId,
      file,
      metadataJson,
      correlationId,
    );
    const validationErrors = await this.parser.validateRows(parsed.rows);
    const confidence = scoreBatch(parsed.rows, parsed.ocrExtracted);
    return {
      correlationId,
      rows: parsed.rows,
      confidence,
      ocrText: parsed.ocrText,
      ocrExtracted: parsed.ocrExtracted,
      validationErrors,
      canConfirm: validationErrors.length === 0 && !confidence.blocked,
    };
  }

  /** Confirm corrected rows after preview (structured JSON path). */
  async confirmIngest(
    companyId: number,
    body: unknown,
    sourceChannel: IngestionChannel = 'upload',
  ) {
    const parsed = ConfirmIngestBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const correlationId =
      parsed.data.correlationId ?? newIngestionCorrelationId();
    const run = await this.prisma.trainingIngestionRun.create({
      data: {
        companyId,
        status: 'PROCESSING',
        sourceChannel,
        sourceMime: 'application/json',
        originalFilename: 'confirm-ingest.json',
        sizeBytes: 0,
      },
    });
    try {
      const summary = await this.ingestRowsWithConfidence(
        companyId,
        parsed.data.rows,
        { ingestionRunId: run.id, correlationId, channel: sourceChannel },
      );
      await this.prisma.trainingIngestionRun.update({
        where: { id: run.id },
        data: {
          status: summary.created > 0 ? 'COMPLETED' : 'FAILED',
          metadataSnapshot: parsed.data.rows as never,
          resultSummary: summary as never,
          completedAt: new Date(),
        },
      });
      return { runId: run.id, ...summary };
    } catch (e) {
      await this.prisma.trainingIngestionRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          errorMessage: e instanceof Error ? e.message : String(e),
          completedAt: new Date(),
        },
      });
      throw e;
    }
  }

  async processEmailIngest(dto: EmailIngestDto, webhookSecret?: string) {
    const expected = process.env.TRAINING_EMAIL_WEBHOOK_SECRET;
    if (!expected && process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException(
        'Email ingestion webhook is not configured',
      );
    }
    if (expected && webhookSecret !== expected) {
      throw new UnauthorizedException('Invalid email webhook secret');
    }

    const attachment = dto.attachments.find((a) =>
      TRAINING_INGEST_ALLOWED_MIMES.has(a.mimeType),
    );
    if (!attachment) {
      throw new BadRequestException(
        'No supported attachment (PDF, PNG, JPG, WEBP, JSON)',
      );
    }

    const buffer = Buffer.from(attachment.contentBase64, 'base64');
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: attachment.filename,
      encoding: '7bit',
      mimetype: attachment.mimeType,
      size: buffer.length,
      buffer,
      destination: '',
      filename: attachment.filename,
      path: '',
      stream: null as never,
    };

    const metadata = JSON.stringify({
      rows: [
        {
          fromEmail: dto.fromEmail,
          subject: dto.subject,
        },
      ],
    });

    return this.processFileUpload(dto.companyId, file, metadata, 'email');
  }

  /**
   * Full Core pipeline: PDF/PNG/JPG → OCR + optional metadata JSON;
   * JSON file → row parsing; creates TrainingRecord rows and audit TrainingIngestionRun.
   */
  async processFileUpload(
    companyId: number,
    file: Express.Multer.File,
    metadataJson?: string,
    sourceChannel: 'upload' | 'email' | 'bulk' = 'upload',
  ) {
    const effectiveMime = effectiveTrainingUploadMime(file);
    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.upload.start',
        companyId,
        originalFilename: file.originalname,
        mimeTypeRaw: file.mimetype,
        mimeType: effectiveMime,
        sizeBytes: file.size,
      }),
    );
    if (!TRAINING_INGEST_ALLOWED_MIMES.has(effectiveMime)) {
      throw new BadRequestException(
        `Unsupported type ${file.mimetype || '(empty)'} (resolved: ${
          effectiveMime || 'unknown'
        }). Allowed: ${[...TRAINING_INGEST_ALLOWED_MIMES].join(', ')}`,
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    let coreFileId: number | undefined;
    try {
      const stored = await this.coreUpload.handleMultipartUpload(
        file,
        'training_ingestion',
        { companyId },
      );
      coreFileId = stored.id;
    } catch (e) {
      this.logger.warn(
        `S3/local store skipped for ingestion: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }

    const run = await this.prisma.trainingIngestionRun.create({
      data: {
        companyId,
        status: 'PROCESSING',
        sourceChannel,
        sourceMime: effectiveMime,
        originalFilename: file.originalname,
        sizeBytes: file.size,
        coreFileId: coreFileId ?? null,
      },
    });
    this.monitoring.processing('training_ingestion', 'upload.run_created', {
      runId: run.id,
      companyId,
      sizeBytes: file.size,
      sourceMime: effectiveMime,
    });
    await this.prisma.auditLog.create({
      data: {
        action: 'training_ingestion.started',
        entityType: 'TrainingIngestionRun',
        entityId: String(run.id),
        metadataJson: {
          companyId,
          sourceMime: effectiveMime,
          originalFilename: file.originalname,
          sizeBytes: file.size,
        },
      },
    });

    const correlationId = newIngestionCorrelationId();
    let ocrText: string | null = null;
    let ocrExtracted: OcrExtractedFields | null = null;
    let ocrConfidence: number | null = null;
    try {
      const parsed = await this.parseUploadToRows(
        companyId,
        file,
        metadataJson,
        correlationId,
        effectiveMime,
      );
      ocrText = parsed.ocrText;
      ocrExtracted = parsed.ocrExtracted;
      ocrConfidence = parsed.ocrConfidence;
      const rows = parsed.rows;

      if (rows.length === 0) {
        throw new BadRequestException(
          'No training rows found. Provide a JSON upload, embed JSON in extracted text (OCR/plain), or pass a multipart `metadata` JSON field (one row, `rows` array, or top-level array) with workerId, issuedAt, expiresAt, and certificationId or certificationCode or certificationName.',
        );
      }

      const validationErrors = await this.parser.validateRows(rows);
      if (validationErrors.length > 0) {
        await this.prisma.trainingIngestionRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            ocrText,
            ocrExtracted: ocrExtracted
              ? JSON.parse(JSON.stringify(ocrExtracted))
              : undefined,
            ocrConfidence,
            metadataSnapshot: JSON.parse(JSON.stringify(rows)),
            validationErrors: JSON.parse(JSON.stringify(validationErrors)),
            errorMessage: validationErrors.join('\n'),
            completedAt: new Date(),
          },
        });
        await this.prisma.auditLog.create({
          data: {
            action: 'training_ingestion.failed',
            entityType: 'TrainingIngestionRun',
            entityId: String(run.id),
            metadataJson: {
              companyId,
              validationErrors,
            },
          },
        });
        return this.getRun(run.id);
      }

      const summary = await this.ingestRowsWithConfidence(companyId, rows, {
        ingestionRunId: run.id,
        correlationId,
        channel: sourceChannel,
        ocrExtracted,
      });

      const finalStatus =
        summary.created === 0 && summary.errors.length > 0
          ? 'FAILED'
          : 'COMPLETED';

      this.monitoring.processing(
        'training_ingestion',
        'upload.ingest_summary',
        {
          runId: run.id,
          companyId,
          finalStatus,
          created: summary.created,
          errorCount: summary.errors.length,
        },
      );

      await this.prisma.trainingIngestionRun.update({
        where: { id: run.id },
        data: {
          status: finalStatus,
          ocrText,
          ocrExtracted: ocrExtracted
            ? JSON.parse(JSON.stringify(ocrExtracted))
            : undefined,
          ocrConfidence,
          metadataSnapshot: JSON.parse(JSON.stringify(rows)),
          validationErrors:
            summary.errors.length > 0
              ? JSON.parse(JSON.stringify(summary.errors))
              : undefined,
          resultSummary: JSON.parse(
            JSON.stringify({
              created: summary.created,
              errors: summary.errors,
              recordIds: summary.recordIds,
              needsReview: summary.needsReview,
              correlationId: summary.correlationId,
              ocrExtracted,
              partialSuccess: summary.created > 0 && summary.errors.length > 0,
            }),
          ),
          errorMessage:
            summary.created === 0 && summary.errors.length > 0
              ? summary.errors
                  .map((e) => `Row ${e.row}: ${e.message}`)
                  .join('; ')
              : null,
          completedAt: new Date(),
        },
      });
      await this.prisma.auditLog.create({
        data: {
          action:
            finalStatus === 'COMPLETED'
              ? 'training_ingestion.completed'
              : 'training_ingestion.failed',
          entityType: 'TrainingIngestionRun',
          entityId: String(run.id),
          metadataJson: {
            companyId,
            created: summary.created,
            errors: summary.errors.length,
            recordIds: summary.recordIds,
          },
        },
      });
      this.logger.log(
        JSON.stringify({
          type: 'training_ingestion.upload.finish',
          runId: run.id,
          finalStatus,
          created: summary.created,
          errors: summary.errors.length,
        }),
      );

      void this.emitIngestionTerminalEvent(
        run.id,
        companyId,
        finalStatus,
        summary,
      );

      return this.getRun(run.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await this.prisma.trainingIngestionRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          ocrText,
          errorMessage: msg,
          completedAt: new Date(),
        },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'training_ingestion.failed',
          entityType: 'TrainingIngestionRun',
          entityId: String(run.id),
          metadataJson: { companyId, message: msg },
        },
      });
      void this.emitIngestionTerminalEvent(run.id, companyId, 'FAILED', {
        created: 0,
        errors: [{ row: 0, message: msg }],
        recordIds: [],
        needsReview: 0,
      });

      this.logger.error(
        JSON.stringify({
          type: 'training_ingestion.upload.error',
          runId: run.id,
          companyId,
          message: msg,
        }),
      );
      throw e;
    }
  }

  private async parseUploadToRows(
    companyId: number,
    file: Express.Multer.File,
    metadataJson: string | undefined,
    correlationId: string,
    effectiveMime?: string,
  ): Promise<{
    rows: NormalizedIngestRow[];
    ocrText: string | null;
    ocrExtracted: OcrExtractedFields | null;
    ocrConfidence: number | null;
  }> {
    const mime = effectiveMime ?? effectiveTrainingUploadMime(file);
    this.logger.log(
      JSON.stringify({
        type: 'training_ingestion.parse.start',
        correlationId,
        companyId,
        mimeType: mime,
      }),
    );

    let filePayload: ParsedIngestPayload | null = null;
    let ocrText: string | null = null;
    let ocrExtracted: OcrExtractedFields | null = null;
    let ocrConfidence: number | null = null;

    const isJsonMime =
      mime === 'application/json' || /\.json$/i.test(file.originalname);

    if (isJsonMime) {
      const text = file.buffer.toString('utf8');
      filePayload = this.parser.parseJsonFileContent(text);
    } else {
      const ocr = await this.ocr.extractWithRetry(file.buffer, mime);
      ocrText = ocr.text;
      ocrExtracted = ocr.fields;
      ocrConfidence = ocr.confidence;
      filePayload = this.parser.tryParseEmbeddedJsonFromText(ocrText) ?? {
        rows: [],
      };
    }

    const formPayload = this.parser.parseFormMetadataString(metadataJson);
    let rows: NormalizedIngestRow[] = this.parser.mergePayloads(
      filePayload,
      formPayload,
    );
    if (rows.length === 0 && ocrExtracted) {
      rows = await this.buildRowsFromOcr(companyId, ocrExtracted);
      for (const row of rows) {
        row.confidence = ocrExtracted.confidence;
        row.fieldConfidence = ocrExtracted.fieldConfidence as never;
      }
    }

    this.monitoring.processing('training_ingestion', 'parse.complete', {
      correlationId,
      rowCount: rows.length,
      ocrConfidence,
    });

    return { rows, ocrText, ocrExtracted, ocrConfidence };
  }

  private async buildRowsFromOcr(
    companyId: number,
    fields: OcrExtractedFields,
  ): Promise<TrainingIngestRowDto[]> {
    const workerId = await this.resolveWorkerIdFromName(
      companyId,
      fields.workerName,
    );
    if (!workerId) return [];

    const issuedAt = fields.issuedAt ?? new Date().toISOString().slice(0, 10);
    const expiresAt =
      fields.expiresAt ??
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

    return [
      {
        workerId,
        issuedAt,
        expiresAt,
        certificationCode: fields.certificationCode,
        certificationName: fields.certificationName,
        certificateNumber: fields.certificateNumber,
      },
    ];
  }

  private async resolveWorkerIdFromName(
    companyId: number,
    name?: string,
  ): Promise<number | null> {
    if (!name?.trim()) return null;
    const parts = name.trim().split(/\s+/);
    const first = parts[0];
    const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const worker = await this.prisma.worker.findFirst({
      where: {
        companyId,
        firstName: { equals: first, mode: 'insensitive' },
        lastName: { equals: last, mode: 'insensitive' },
      },
    });
    return worker?.id ?? null;
  }

  private async emitIngestionTerminalEvent(
    runId: number,
    companyId: number,
    status: string,
    summary: IngestSummary,
  ): Promise<void> {
    const occurredAt = new Date().toISOString();
    const failed = status === 'FAILED' || summary.created === 0;
    const eventName = failed
      ? DomainEvent.TRAINING_INGESTION_FAILED
      : DomainEvent.TRAINING_INGESTION_COMPLETED;

    this.events?.emit({
      name: eventName,
      occurredAt,
      companyId,
      entityType: 'training_ingestion_run',
      entityId: runId,
      data: {
        status,
        created: summary.created,
        errorCount: summary.errors.length,
        recordIds: summary.recordIds,
      },
    });

    if (!this.notifications) return;

    const type = failed
      ? NOTIFICATION_TYPES.TRAINING_INGESTION_FAILED
      : NOTIFICATION_TYPES.TRAINING_INGESTION_COMPLETED;
    const title = failed
      ? 'Training ingestion failed'
      : 'Training ingestion completed';
    const body = failed
      ? `Ingestion run #${runId} failed or created no records.`
      : `Ingestion run #${runId} created ${summary.created} training record(s).`;

    await this.notifications.notifyCompanySupervisors(companyId, {
      type,
      title,
      body,
      payload: { runId, status, created: summary.created },
      dedupeKey: `training-ingestion:${runId}:${status}`,
      companyId,
    });
  }
}
