"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TrainingIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingIngestionService = void 0;
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_types_1 = require("../notifications/notification-types");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const ocr_extraction_service_1 = require("./ocr-extraction.service");
const training_metadata_parser_service_1 = require("./training-metadata-parser.service");
const training_ingestion_upload_config_1 = require("./training-ingestion-upload.config");
const phase1_monitoring_service_1 = require("../common/monitoring/phase1-monitoring.service");
const training_wallet_integration_service_1 = require("../modules/vera-core/training-wallet-integration.service");
const core_upload_service_1 = require("../modules/core-upload/core-upload.service");
const ingestion_confidence_policy_service_1 = require("./ingestion-confidence-policy.service");
const confidence_scoring_1 = require("./pipeline/confidence-scoring");
const correlation_1 = require("./pipeline/correlation");
const schemas_1 = require("./pipeline/schemas");
const training_standards_compliance_service_1 = require("../modules/training-standards-compliance/training-standards-compliance.service");
const credential_ledger_service_1 = require("../modules/credential-ledger/credential-ledger.service");
const client_2 = require("@prisma/client");
function effectiveTrainingUploadMime(file) {
    const m = (file.mimetype || '').trim();
    if (m)
        return m;
    const n = (file.originalname || '').toLowerCase();
    if (n.endsWith('.json'))
        return 'application/json';
    if (n.endsWith('.pdf'))
        return 'application/pdf';
    if (n.endsWith('.png'))
        return 'image/png';
    if (n.endsWith('.jpg') || n.endsWith('.jpeg'))
        return 'image/jpeg';
    if (n.endsWith('.webp'))
        return 'image/webp';
    return '';
}
function parseCsvLine(line) {
    const result = [];
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
function normalizeHeader(h) {
    return h.trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}
function cell(headers, cells, ...aliases) {
    var _a;
    const idx = headers.findIndex((h) => aliases.includes(h));
    if (idx === -1 || idx >= cells.length)
        return undefined;
    const v = (_a = cells[idx]) === null || _a === void 0 ? void 0 : _a.trim();
    return v === '' ? undefined : v;
}
function parseIngestDate(value) {
    const s = value.trim();
    const iso = new Date(s);
    if (!Number.isNaN(iso.getTime()))
        return iso;
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (us) {
        const mm = parseInt(us[1], 10);
        const dd = parseInt(us[2], 10);
        const yyyy = parseInt(us[3], 10);
        const d = new Date(Date.UTC(yyyy, mm - 1, dd));
        if (!Number.isNaN(d.getTime()))
            return d;
    }
    return new Date(NaN);
}
let TrainingIngestionService = TrainingIngestionService_1 = class TrainingIngestionService {
    constructor(prisma, ocr, parser, monitoring, walletIntegration, coreUpload, confidencePolicy, standards, credentialLedger, events, notifications) {
        this.prisma = prisma;
        this.ocr = ocr;
        this.parser = parser;
        this.monitoring = monitoring;
        this.walletIntegration = walletIntegration;
        this.coreUpload = coreUpload;
        this.confidencePolicy = confidencePolicy;
        this.standards = standards;
        this.credentialLedger = credentialLedger;
        this.events = events;
        this.notifications = notifications;
        this.logger = new common_1.Logger(TrainingIngestionService_1.name);
    }
    newLookupContext(companyId) {
        return {
            companyId,
            workerExists: new Map(),
            providerByName: new Map(),
            certById: new Map(),
            certByCode: new Map(),
            certByName: new Map(),
        };
    }
    async ingestCsv(companyId, csvText) {
        const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
            throw new common_1.BadRequestException('CSV must include a header row and at least one data row');
        }
        const headers = parseCsvLine(lines[0]).map(normalizeHeader);
        const rows = [];
        const parseErrors = [];
        for (let i = 1; i < lines.length; i++) {
            const fileLine = i + 1;
            const cells = parseCsvLine(lines[i]);
            const workerRaw = cell(headers, cells, 'worker_id', 'workerid');
            const certIdRaw = cell(headers, cells, 'certification_id', 'cert_id');
            const certCode = cell(headers, cells, 'certification_code', 'cert_code', 'code');
            const certName = cell(headers, cells, 'certification_name', 'cert_name', 'course');
            const issuedRaw = cell(headers, cells, 'issued_at', 'issued', 'date_issued');
            const expiresRaw = cell(headers, cells, 'expires_at', 'expires', 'expiry', 'expiration');
            const providerName = cell(headers, cells, 'provider', 'provider_name', 'training_provider');
            const certificateNumber = cell(headers, cells, 'certificate_number', 'cert_number', 'certificate_no');
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
            let certificationId;
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
        return {
            created: batch.created,
            errors: [...parseErrors, ...batch.errors],
            recordIds: batch.recordIds,
            needsReview: batch.needsReview,
        };
    }
    async ingestRows(companyId, rows, options) {
        const started = Date.now();
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const lookup = this.newLookupContext(companyId);
        const errors = [];
        const recordIds = [];
        let created = 0;
        let rowNum = 0;
        for (const row of rows) {
            rowNum++;
            try {
                const id = await this.ingestOneRow(companyId, row, options, lookup);
                recordIds.push(id);
                created++;
            }
            catch (e) {
                errors.push({
                    row: rowNum,
                    message: e instanceof Error ? e.message : String(e),
                });
            }
        }
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.rows.duration',
            companyId,
            rowCount: rows.length,
            created,
            errors: errors.length,
            durationMs: Date.now() - started,
        }));
        return { created, errors, recordIds, needsReview: 0 };
    }
    async ingestRowsWithConfidence(companyId, rows, options) {
        var _a, _b;
        const started = Date.now();
        const correlationId = (_a = options === null || options === void 0 ? void 0 : options.correlationId) !== null && _a !== void 0 ? _a : (0, correlation_1.newIngestionCorrelationId)();
        const batchConfidence = (0, confidence_scoring_1.scoreBatch)(rows, options === null || options === void 0 ? void 0 : options.ocrExtracted);
        if (batchConfidence.blocked) {
            throw new common_1.BadRequestException({
                message: 'Extraction confidence too low to create credentials. Provide metadata or correct fields manually.',
                correlationId,
                confidence: batchConfidence,
            });
        }
        const errors = [];
        const recordIds = [];
        let created = 0;
        let needsReview = 0;
        let autoVerified = 0;
        let rowNum = 0;
        const lookup = this.newLookupContext(companyId);
        for (const row of rows) {
            rowNum++;
            try {
                const rowConfidence = (0, confidence_scoring_1.scoreIngestRow)(row, options === null || options === void 0 ? void 0 : options.ocrExtracted);
                if (rowConfidence.blocked) {
                    errors.push({
                        row: rowNum,
                        message: 'Row blocked: insufficient confidence or missing required fields',
                    });
                    continue;
                }
                const id = await this.ingestOneRow(companyId, row, {
                    ingestionRunId: options === null || options === void 0 ? void 0 : options.ingestionRunId,
                    deferValidation: (options === null || options === void 0 ? void 0 : options.ingestionRunId) != null,
                }, lookup);
                recordIds.push(id);
                created++;
                if ((options === null || options === void 0 ? void 0 : options.ingestionRunId) != null) {
                    const issuedAt = parseIngestDate(row.issuedAt);
                    const expiresAt = parseIngestDate(row.expiresAt);
                    const outcome = this.confidencePolicy.resolveValidationOutcome({
                        confidence: rowConfidence,
                        issuedAt,
                        expiresAt,
                    });
                    await this.createIngestionValidation(id, outcome, {
                        correlationId,
                        channel: options === null || options === void 0 ? void 0 : options.channel,
                        confidence: rowConfidence,
                        providerId: options === null || options === void 0 ? void 0 : options.providerId,
                        expiryAutoVerified: outcome === client_1.TrainingValidationOutcome.APPROVED,
                    });
                    if (outcome === client_1.TrainingValidationOutcome.NEEDS_REVIEW) {
                        needsReview++;
                    }
                    if (outcome === client_1.TrainingValidationOutcome.APPROVED) {
                        autoVerified++;
                        await this.prisma.trainingRecord.update({
                            where: { id },
                            data: {
                                lastVerificationStatus: 'VERIFIED',
                                verifiedAt: new Date(),
                                lastVerificationChecks: {
                                    source: 'ingestion_auto_expiry',
                                    outcome: client_1.TrainingValidationOutcome.APPROVED,
                                },
                            },
                        });
                        (_b = this.events) === null || _b === void 0 ? void 0 : _b.emit({
                            name: domain_events_1.DomainEvent.TRAINING_VALIDATED,
                            occurredAt: new Date().toISOString(),
                            entityType: 'training',
                            entityId: id,
                            data: {
                                outcome: client_1.TrainingValidationOutcome.APPROVED,
                                source: 'ingestion_auto_expiry',
                            },
                        });
                    }
                }
            }
            catch (e) {
                errors.push({
                    row: rowNum,
                    message: e instanceof Error ? e.message : String(e),
                });
            }
        }
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.rows.complete',
            correlationId,
            created,
            needsReview,
            autoVerified,
            errors: errors.length,
            durationMs: Date.now() - started,
        }));
        return {
            created,
            errors,
            recordIds,
            needsReview,
            autoVerified,
            correlationId,
        };
    }
    async ingestOneRow(companyId, row, options, lookup) {
        var _a, _b, _c;
        if (!Number.isFinite(row.workerId)) {
            throw new Error('Invalid or missing worker id');
        }
        let workerExists = lookup === null || lookup === void 0 ? void 0 : lookup.workerExists.get(row.workerId);
        if (workerExists == null) {
            const worker = await this.prisma.worker.findFirst({
                where: { id: row.workerId, companyId },
                select: { id: true },
            });
            workerExists = Boolean(worker);
            lookup === null || lookup === void 0 ? void 0 : lookup.workerExists.set(row.workerId, workerExists);
        }
        if (!workerExists) {
            throw new Error(`Worker ${row.workerId} not found for this company`);
        }
        const certificationId = await this.resolveCertificationId(row, lookup);
        if (!certificationId) {
            throw new Error('Could not resolve certification (provide certificationId, certificationCode, or certificationName)');
        }
        const issuedAt = parseIngestDate(row.issuedAt);
        const expiresAt = parseIngestDate(row.expiresAt);
        if (Number.isNaN(issuedAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
            throw new Error('Invalid issuedAt or expiresAt date');
        }
        if (issuedAt.getTime() > expiresAt.getTime()) {
            throw new Error('issuedAt must be on or before expiresAt');
        }
        let providerId;
        if ((_a = row.providerName) === null || _a === void 0 ? void 0 : _a.trim()) {
            const providerName = row.providerName.trim();
            const cachedProvider = lookup === null || lookup === void 0 ? void 0 : lookup.providerByName.get(providerName);
            if (cachedProvider !== undefined) {
                providerId = cachedProvider !== null && cachedProvider !== void 0 ? cachedProvider : undefined;
            }
            else {
                const p = await this.prisma.provider.findUnique({
                    where: { name: providerName },
                    select: { id: true },
                });
                providerId = p === null || p === void 0 ? void 0 : p.id;
                lookup === null || lookup === void 0 ? void 0 : lookup.providerByName.set(providerName, providerId !== null && providerId !== void 0 ? providerId : null);
            }
        }
        const certNum = (_b = row.certificateNumber) === null || _b === void 0 ? void 0 : _b.trim();
        const rec = await this.prisma.trainingRecord.create({
            data: Object.assign(Object.assign({ workerId: row.workerId, certificationId,
                companyId, providerId: providerId !== null && providerId !== void 0 ? providerId : null, issuedAt,
                expiresAt }, (certNum ? { certificateNumber: certNum } : {})), ((options === null || options === void 0 ? void 0 : options.ingestionRunId) != null
                ? { ingestionRunId: options.ingestionRunId }
                : {})),
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
                ingestionRunId: (_c = options === null || options === void 0 ? void 0 : options.ingestionRunId) !== null && _c !== void 0 ? _c : null,
                certificateNumber: certNum !== null && certNum !== void 0 ? certNum : null,
            },
        };
        if ((options === null || options === void 0 ? void 0 : options.ingestionRunId) != null) {
            await this.credentialLedger.recordCredentialImported(ledgerCtx);
        }
        else {
            await this.credentialLedger.recordCredentialCreated(ledgerCtx);
        }
        if ((options === null || options === void 0 ? void 0 : options.ingestionRunId) != null && !options.deferValidation) {
            await this.createIngestionValidation(rec.id, client_1.TrainingValidationOutcome.PENDING, {
                source: 'training_ingestion',
            });
        }
        return rec.id;
    }
    async createIngestionValidation(trainingRecordId, outcome, details) {
        var _a;
        const existing = await this.prisma.trainingValidationResult.findFirst({
            where: {
                trainingRecordId,
                outcome: {
                    in: [
                        client_1.TrainingValidationOutcome.PENDING,
                        client_1.TrainingValidationOutcome.NEEDS_REVIEW,
                    ],
                },
            },
        });
        if (existing)
            return existing.id;
        const row = await this.prisma.trainingValidationResult.create({
            data: {
                subjectType: client_1.TrainingValidationSubject.TRAINING_RECORD,
                outcome,
                trainingRecordId,
                score: typeof details.confidence === 'object' &&
                    details.confidence != null &&
                    'overall' in details.confidence
                    ? Math.round(((_a = details.confidence.overall) !== null && _a !== void 0 ? _a : 0) *
                        100)
                    : undefined,
                details: Object.assign({ source: 'training_ingestion' }, details),
            },
        });
        return row.id;
    }
    async createPendingValidation(trainingRecordId) {
        return this.createIngestionValidation(trainingRecordId, client_1.TrainingValidationOutcome.PENDING, { source: 'training_ingestion' });
    }
    async createPendingValidations(recordIds) {
        for (const id of recordIds) {
            await this.createPendingValidation(id);
        }
    }
    async resolveCertificationId(row, lookup) {
        var _a, _b, _c, _d, _e;
        if (row.certificationId != null && Number.isFinite(row.certificationId)) {
            const cached = lookup === null || lookup === void 0 ? void 0 : lookup.certById.get(row.certificationId);
            if (cached !== undefined)
                return cached;
            const c = await this.prisma.certification.findUnique({
                where: { id: row.certificationId },
                select: { id: true },
            });
            const resolved = (_a = c === null || c === void 0 ? void 0 : c.id) !== null && _a !== void 0 ? _a : null;
            lookup === null || lookup === void 0 ? void 0 : lookup.certById.set(row.certificationId, resolved);
            return resolved;
        }
        if ((_b = row.certificationCode) === null || _b === void 0 ? void 0 : _b.trim()) {
            const code = row.certificationCode.trim();
            const cached = lookup === null || lookup === void 0 ? void 0 : lookup.certByCode.get(code);
            if (cached !== undefined)
                return cached;
            const byCode = await this.prisma.certification.findFirst({
                where: {
                    code: { equals: code, mode: 'insensitive' },
                },
                select: { id: true },
            });
            const resolved = (_c = byCode === null || byCode === void 0 ? void 0 : byCode.id) !== null && _c !== void 0 ? _c : null;
            lookup === null || lookup === void 0 ? void 0 : lookup.certByCode.set(code, resolved);
            if (resolved != null)
                return resolved;
        }
        if ((_d = row.certificationName) === null || _d === void 0 ? void 0 : _d.trim()) {
            const name = row.certificationName.trim();
            const cached = lookup === null || lookup === void 0 ? void 0 : lookup.certByName.get(name);
            if (cached !== undefined)
                return cached;
            const byName = await this.prisma.certification.findFirst({
                where: {
                    name: { equals: name, mode: 'insensitive' },
                },
                select: { id: true },
            });
            const resolved = (_e = byName === null || byName === void 0 ? void 0 : byName.id) !== null && _e !== void 0 ? _e : null;
            lookup === null || lookup === void 0 ? void 0 : lookup.certByName.set(name, resolved);
            if (resolved != null)
                return resolved;
        }
        return null;
    }
    async getRun(runId) {
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
            throw new common_1.NotFoundException('Training ingestion run not found');
        }
        return run;
    }
    async listRuns(params) {
        var _a;
        const started = Date.now();
        const rows = await this.prisma.trainingIngestionRun.findMany({
            where: Object.assign(Object.assign({ companyId: params.companyId }, (params.status ? { status: params.status } : {})), (params.sourceChannel
                ? { sourceChannel: params.sourceChannel }
                : {})),
            orderBy: { createdAt: 'desc' },
            take: (_a = params.limit) !== null && _a !== void 0 ? _a : 50,
            include: {
                createdRecords: {
                    select: { id: true, workerId: true },
                },
                coreFile: {
                    select: { id: true, publicUrl: true, originalName: true },
                },
            },
        });
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.runs.query',
            companyId: params.companyId,
            rows: rows.length,
            durationMs: Date.now() - started,
        }));
        return rows;
    }
    async verificationQueue(companyId, limit = 50) {
        const started = Date.now();
        const rows = await this.prisma.trainingValidationResult.findMany({
            where: {
                outcome: client_1.TrainingValidationOutcome.PENDING,
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
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.queue.pending.query',
            companyId,
            rows: rows.length,
            durationMs: Date.now() - started,
        }));
        return rows;
    }
    async needsReviewQueue(companyId, limit = 50) {
        const started = Date.now();
        const rows = await this.prisma.trainingValidationResult.findMany({
            where: {
                outcome: client_1.TrainingValidationOutcome.NEEDS_REVIEW,
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
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.queue.review.query',
            companyId,
            rows: rows.length,
            durationMs: Date.now() - started,
        }));
        return rows;
    }
    async approveReview(validationResultId, validatedBy, notes) {
        var _a;
        const result = await this.standards.approveValidation(validationResultId, validatedBy, notes);
        const recordId = result.trainingRecordId;
        if (recordId) {
            (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit({
                name: domain_events_1.DomainEvent.TRAINING_VALIDATED,
                occurredAt: new Date().toISOString(),
                entityType: 'training',
                entityId: recordId,
                data: {
                    validationResultId,
                    outcome: client_1.TrainingValidationOutcome.APPROVED,
                    source: 'ingestion_review',
                },
            });
        }
        return result;
    }
    async correctReview(validationResultId, validatedBy, corrections) {
        const validation = await this.prisma.trainingValidationResult.findUnique({
            where: { id: validationResultId },
            include: { trainingRecord: true },
        });
        if (!(validation === null || validation === void 0 ? void 0 : validation.trainingRecord)) {
            throw new common_1.NotFoundException('Validation or training record not found');
        }
        const rec = validation.trainingRecord;
        const data = {};
        if (corrections.workerId != null) {
            const worker = await this.prisma.worker.findFirst({
                where: {
                    id: Number(corrections.workerId),
                    companyId: rec.companyId,
                },
            });
            if (!worker)
                throw new common_1.BadRequestException('Worker not found for company');
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
                actorType: client_2.CredentialLedgerActorType.SUPERVISOR,
                payload: { corrections: data },
            });
            await this.prisma.trainingRecord.update({
                where: { id: rec.id },
                data: data,
            });
        }
        return this.approveReview(validationResultId, validatedBy, corrections.notes);
    }
    async previewFileUpload(companyId, file, metadataJson) {
        const correlationId = (0, correlation_1.newIngestionCorrelationId)();
        const parsed = await this.parseUploadToRows(companyId, file, metadataJson, correlationId);
        const validationErrors = await this.parser.validateRows(parsed.rows);
        const confidence = (0, confidence_scoring_1.scoreBatch)(parsed.rows, parsed.ocrExtracted);
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
    async confirmIngest(companyId, body, sourceChannel = 'upload') {
        var _a;
        const parsed = schemas_1.ConfirmIngestBodySchema.safeParse(body);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.flatten());
        }
        const correlationId = (_a = parsed.data.correlationId) !== null && _a !== void 0 ? _a : (0, correlation_1.newIngestionCorrelationId)();
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
            const summary = await this.ingestRowsWithConfidence(companyId, parsed.data.rows, { ingestionRunId: run.id, correlationId, channel: sourceChannel });
            await this.prisma.trainingIngestionRun.update({
                where: { id: run.id },
                data: {
                    status: summary.created > 0 ? 'COMPLETED' : 'FAILED',
                    metadataSnapshot: parsed.data.rows,
                    resultSummary: summary,
                    completedAt: new Date(),
                },
            });
            return Object.assign({ runId: run.id }, summary);
        }
        catch (e) {
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
    async processEmailIngest(dto, webhookSecret) {
        const expected = process.env.TRAINING_EMAIL_WEBHOOK_SECRET;
        if (!expected && process.env.NODE_ENV === 'production') {
            throw new common_1.UnauthorizedException('Email ingestion webhook is not configured');
        }
        if (expected && webhookSecret !== expected) {
            throw new common_1.UnauthorizedException('Invalid email webhook secret');
        }
        const attachment = dto.attachments.find((a) => training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has(a.mimeType));
        if (!attachment) {
            throw new common_1.BadRequestException('No supported attachment (PDF, PNG, JPG, WEBP, JSON)');
        }
        const buffer = Buffer.from(attachment.contentBase64, 'base64');
        const file = {
            fieldname: 'file',
            originalname: attachment.filename,
            encoding: '7bit',
            mimetype: attachment.mimeType,
            size: buffer.length,
            buffer,
            destination: '',
            filename: attachment.filename,
            path: '',
            stream: null,
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
    async processFileUpload(companyId, file, metadataJson, sourceChannel = 'upload') {
        const effectiveMime = effectiveTrainingUploadMime(file);
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.upload.start',
            companyId,
            originalFilename: file.originalname,
            mimeTypeRaw: file.mimetype,
            mimeType: effectiveMime,
            sizeBytes: file.size,
        }));
        if (!training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has(effectiveMime)) {
            throw new common_1.BadRequestException(`Unsupported type ${file.mimetype || '(empty)'} (resolved: ${effectiveMime || 'unknown'}). Allowed: ${[...training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES].join(', ')}`);
        }
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        let coreFileId;
        try {
            const stored = await this.coreUpload.handleMultipartUpload(file, 'training_ingestion', { companyId });
            coreFileId = stored.id;
        }
        catch (e) {
            this.logger.warn(`S3/local store skipped for ingestion: ${e instanceof Error ? e.message : String(e)}`);
        }
        const run = await this.prisma.trainingIngestionRun.create({
            data: {
                companyId,
                status: 'PROCESSING',
                sourceChannel,
                sourceMime: effectiveMime,
                originalFilename: file.originalname,
                sizeBytes: file.size,
                coreFileId: coreFileId !== null && coreFileId !== void 0 ? coreFileId : null,
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
        const correlationId = (0, correlation_1.newIngestionCorrelationId)();
        let ocrText = null;
        let ocrExtracted = null;
        let ocrConfidence = null;
        try {
            const parsed = await this.parseUploadToRows(companyId, file, metadataJson, correlationId, effectiveMime);
            ocrText = parsed.ocrText;
            ocrExtracted = parsed.ocrExtracted;
            ocrConfidence = parsed.ocrConfidence;
            const rows = parsed.rows;
            if (rows.length === 0) {
                throw new common_1.BadRequestException('No training rows found. Provide a JSON upload, embed JSON in extracted text (OCR/plain), or pass a multipart `metadata` JSON field (one row, `rows` array, or top-level array) with workerId, issuedAt, expiresAt, and certificationId or certificationCode or certificationName.');
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
            const finalStatus = summary.created === 0 && summary.errors.length > 0
                ? 'FAILED'
                : 'COMPLETED';
            this.monitoring.processing('training_ingestion', 'upload.ingest_summary', {
                runId: run.id,
                companyId,
                finalStatus,
                created: summary.created,
                errorCount: summary.errors.length,
            });
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
                    validationErrors: summary.errors.length > 0
                        ? JSON.parse(JSON.stringify(summary.errors))
                        : undefined,
                    resultSummary: JSON.parse(JSON.stringify({
                        created: summary.created,
                        errors: summary.errors,
                        recordIds: summary.recordIds,
                        needsReview: summary.needsReview,
                        correlationId: summary.correlationId,
                        ocrExtracted,
                        partialSuccess: summary.created > 0 && summary.errors.length > 0,
                    })),
                    errorMessage: summary.created === 0 && summary.errors.length > 0
                        ? summary.errors
                            .map((e) => `Row ${e.row}: ${e.message}`)
                            .join('; ')
                        : null,
                    completedAt: new Date(),
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: finalStatus === 'COMPLETED'
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
            this.logger.log(JSON.stringify({
                type: 'training_ingestion.upload.finish',
                runId: run.id,
                finalStatus,
                created: summary.created,
                errors: summary.errors.length,
            }));
            void this.emitIngestionTerminalEvent(run.id, companyId, finalStatus, summary);
            return this.getRun(run.id);
        }
        catch (e) {
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
            this.logger.error(JSON.stringify({
                type: 'training_ingestion.upload.error',
                runId: run.id,
                companyId,
                message: msg,
            }));
            throw e;
        }
    }
    async parseUploadToRows(companyId, file, metadataJson, correlationId, effectiveMime) {
        var _a;
        const mime = effectiveMime !== null && effectiveMime !== void 0 ? effectiveMime : effectiveTrainingUploadMime(file);
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.parse.start',
            correlationId,
            companyId,
            mimeType: mime,
        }));
        let filePayload = null;
        let ocrText = null;
        let ocrExtracted = null;
        let ocrConfidence = null;
        const isJsonMime = mime === 'application/json' || /\.json$/i.test(file.originalname);
        if (isJsonMime) {
            const text = file.buffer.toString('utf8');
            filePayload = this.parser.parseJsonFileContent(text);
        }
        else {
            const ocr = await this.ocr.extractWithRetry(file.buffer, mime);
            ocrText = ocr.text;
            ocrExtracted = ocr.fields;
            ocrConfidence = ocr.confidence;
            filePayload = (_a = this.parser.tryParseEmbeddedJsonFromText(ocrText)) !== null && _a !== void 0 ? _a : {
                rows: [],
            };
        }
        const formPayload = this.parser.parseFormMetadataString(metadataJson);
        let rows = this.parser.mergePayloads(filePayload, formPayload);
        if (rows.length === 0 && ocrExtracted) {
            rows = await this.buildRowsFromOcr(companyId, ocrExtracted);
            for (const row of rows) {
                row.confidence = ocrExtracted.confidence;
                row.fieldConfidence = ocrExtracted.fieldConfidence;
            }
        }
        this.monitoring.processing('training_ingestion', 'parse.complete', {
            correlationId,
            rowCount: rows.length,
            ocrConfidence,
        });
        return { rows, ocrText, ocrExtracted, ocrConfidence };
    }
    async buildRowsFromOcr(companyId, fields) {
        var _a, _b;
        const workerId = await this.resolveWorkerIdFromName(companyId, fields.workerName);
        if (!workerId)
            return [];
        const issuedAt = (_a = fields.issuedAt) !== null && _a !== void 0 ? _a : new Date().toISOString().slice(0, 10);
        const expiresAt = (_b = fields.expiresAt) !== null && _b !== void 0 ? _b : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
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
    async resolveWorkerIdFromName(companyId, name) {
        var _a;
        if (!(name === null || name === void 0 ? void 0 : name.trim()))
            return null;
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
        return (_a = worker === null || worker === void 0 ? void 0 : worker.id) !== null && _a !== void 0 ? _a : null;
    }
    async emitIngestionTerminalEvent(runId, companyId, status, summary) {
        var _a;
        const occurredAt = new Date().toISOString();
        const failed = status === 'FAILED' || summary.created === 0;
        const eventName = failed
            ? domain_events_1.DomainEvent.TRAINING_INGESTION_FAILED
            : domain_events_1.DomainEvent.TRAINING_INGESTION_COMPLETED;
        (_a = this.events) === null || _a === void 0 ? void 0 : _a.emit({
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
        if (!this.notifications)
            return;
        const type = failed
            ? notification_types_1.NOTIFICATION_TYPES.TRAINING_INGESTION_FAILED
            : notification_types_1.NOTIFICATION_TYPES.TRAINING_INGESTION_COMPLETED;
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
};
exports.TrainingIngestionService = TrainingIngestionService;
exports.TrainingIngestionService = TrainingIngestionService = TrainingIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(9, (0, common_1.Optional)()),
    __param(10, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ocr_extraction_service_1.OcrExtractionService,
        training_metadata_parser_service_1.TrainingMetadataParserService,
        phase1_monitoring_service_1.Phase1MonitoringService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService,
        core_upload_service_1.CoreUploadService,
        ingestion_confidence_policy_service_1.IngestionConfidencePolicyService,
        training_standards_compliance_service_1.TrainingStandardsComplianceService,
        credential_ledger_service_1.CredentialLedgerService,
        event_bus_service_1.EventBusService,
        notifications_service_1.NotificationsService])
], TrainingIngestionService);
//# sourceMappingURL=training-ingestion.service.js.map