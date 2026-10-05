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
var TrainingProviderIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingProviderIngestionService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const provider_api_templates_1 = require("../modules/provider-sync-engine/provider-api-templates");
const correlation_1 = require("./pipeline/correlation");
const schemas_1 = require("./pipeline/schemas");
const training_ingestion_service_1 = require("./training-ingestion.service");
const phase1_monitoring_service_1 = require("../common/monitoring/phase1-monitoring.service");
let TrainingProviderIngestionService = TrainingProviderIngestionService_1 = class TrainingProviderIngestionService {
    constructor(prisma, ingestion, monitoring) {
        this.prisma = prisma;
        this.ingestion = ingestion;
        this.monitoring = monitoring;
        this.logger = new common_1.Logger(TrainingProviderIngestionService_1.name);
    }
    assertHmacSignature(secret, rawBody, signatureHeader) {
        if (!(signatureHeader === null || signatureHeader === void 0 ? void 0 : signatureHeader.trim())) {
            throw new common_1.UnauthorizedException('Missing x-vera-signature header');
        }
        const expected = (0, crypto_1.createHmac)('sha256', secret).update(rawBody).digest('hex');
        const provided = signatureHeader.replace(/^sha256=/i, '').trim();
        const a = Buffer.from(expected, 'utf8');
        const b = Buffer.from(provided, 'utf8');
        if (a.length !== b.length ||
            !(0, crypto_1.timingSafeEqual)(Uint8Array.from(a), Uint8Array.from(b))) {
            throw new common_1.UnauthorizedException('Invalid provider signature');
        }
    }
    async ingestFromProvider(providerId, body, options) {
        var _a, _b;
        const correlationId = (0, correlation_1.newIngestionCorrelationId)();
        const parsed = schemas_1.ProviderIngestBodySchema.safeParse(body);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.flatten());
        }
        const dto = parsed.data;
        const provider = await this.prisma.trainingProvider.findUnique({
            where: { id: providerId },
        });
        if (!provider) {
            throw new common_1.NotFoundException('Training provider not found');
        }
        const syncConfig = await this.prisma.providerSyncConfig.findUnique({
            where: { providerId },
        });
        if (syncConfig === null || syncConfig === void 0 ? void 0 : syncConfig.webhookSecret) {
            if (!(options === null || options === void 0 ? void 0 : options.signature)) {
                throw new common_1.UnauthorizedException('Missing provider webhook signature');
            }
            if (!(options === null || options === void 0 ? void 0 : options.rawBody)) {
                throw new common_1.BadRequestException('Missing raw body for signature verification');
            }
            this.assertHmacSignature(syncConfig.webhookSecret, options.rawBody, options.signature);
        }
        const templateKey = (_a = dto.templateKey) !== null && _a !== void 0 ? _a : 'generic_rest';
        const template = (0, provider_api_templates_1.getProviderTemplate)(templateKey);
        if (!template) {
            throw new common_1.BadRequestException(`Unknown provider template: ${templateKey}`);
        }
        const completions = (_b = dto.completions) !== null && _b !== void 0 ? _b : (0, provider_api_templates_1.mapProviderPayload)(template, body);
        if (completions.length === 0) {
            throw new common_1.BadRequestException('No completion rows in provider payload');
        }
        this.logger.log(JSON.stringify({
            type: 'training_ingestion.provider.start',
            correlationId,
            providerId,
            companyId: dto.companyId,
            rowCount: completions.length,
        }));
        const rows = await this.mapCompletionsToRows(dto.companyId, completions);
        const summary = await this.ingestion.ingestRowsWithConfidence(dto.companyId, rows, {
            correlationId,
            channel: 'provider_api',
            providerId,
        });
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
    async mapCompletionsToRows(companyId, completions) {
        var _a, _b;
        const rows = [];
        for (const c of completions) {
            const workerId = await this.resolveWorkerId(companyId, c);
            if (!workerId) {
                throw new common_1.BadRequestException(`Could not resolve worker for completion (${(_b = (_a = c.workerEmail) !== null && _a !== void 0 ? _a : c.workerExternalId) !== null && _b !== void 0 ? _b : 'unknown'})`);
            }
            if (!c.issuedAt || !c.expiresAt) {
                throw new common_1.BadRequestException('Provider completion missing issuedAt or expiresAt');
            }
            if (!c.certificationCode && !c.certificationName) {
                throw new common_1.BadRequestException('Provider completion missing certification');
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
    async resolveWorkerId(companyId, row) {
        if (row.workerExternalId) {
            const ext = row.workerExternalId.trim();
            const byUnion = await this.prisma.worker.findFirst({
                where: { companyId, unionNumber: ext },
            });
            if (byUnion)
                return byUnion.id;
            const byPhone = await this.prisma.worker.findFirst({
                where: { companyId, phone: ext },
            });
            if (byPhone)
                return byPhone.id;
        }
        if (row.workerPhone) {
            const byPhone = await this.prisma.worker.findFirst({
                where: { companyId, phone: row.workerPhone },
            });
            if (byPhone)
                return byPhone.id;
        }
        if (row.workerEmail) {
            const byEmail = await this.prisma.worker.findFirst({
                where: {
                    companyId,
                    email: { equals: row.workerEmail, mode: 'insensitive' },
                },
            });
            if (byEmail)
                return byEmail.id;
        }
        return null;
    }
};
exports.TrainingProviderIngestionService = TrainingProviderIngestionService;
exports.TrainingProviderIngestionService = TrainingProviderIngestionService = TrainingProviderIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_ingestion_service_1.TrainingIngestionService,
        phase1_monitoring_service_1.Phase1MonitoringService])
], TrainingProviderIngestionService);
//# sourceMappingURL=training-provider-ingestion.service.js.map