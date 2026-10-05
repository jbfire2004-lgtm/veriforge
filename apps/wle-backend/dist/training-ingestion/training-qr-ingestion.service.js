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
var TrainingQrIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingQrIngestionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const training_provider_certificate_service_1 = require("../modules/training-provider-core/training-provider-certificate.service");
const qr_parse_util_1 = require("../qr/qr-parse.util");
const correlation_1 = require("./pipeline/correlation");
const phase1_monitoring_service_1 = require("../common/monitoring/phase1-monitoring.service");
let TrainingQrIngestionService = TrainingQrIngestionService_1 = class TrainingQrIngestionService {
    constructor(prisma, certificates, monitoring) {
        this.prisma = prisma;
        this.certificates = certificates;
        this.monitoring = monitoring;
        this.logger = new common_1.Logger(TrainingQrIngestionService_1.name);
    }
    async ingestFromQr(companyId, workerId, qrPayload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const correlationId = (0, correlation_1.newIngestionCorrelationId)();
        this.logStep(correlationId, 'qr.start', { companyId, workerId });
        const token = (0, qr_parse_util_1.parseCertificateToken)(qrPayload.trim());
        if (!token) {
            throw new common_1.BadRequestException({
                code: 'INVALID_QR',
                message: 'Unrecognized QR format. Scan a Vera training certificate QR code.',
                correlationId,
            });
        }
        const validation = await this.certificates.validateByToken(token);
        if (!validation.valid && validation.reason === 'NOT_FOUND') {
            throw new common_1.NotFoundException({
                code: 'UNKNOWN_PROVIDER',
                message: 'Certificate not found for this QR code.',
                correlationId,
            });
        }
        if (validation.expired) {
            throw new common_1.BadRequestException({
                code: 'EXPIRED_QR',
                message: 'This certificate has expired.',
                correlationId,
            });
        }
        const record = validation.record;
        if (!record) {
            throw new common_1.BadRequestException({
                code: 'INVALID_QR',
                message: 'Certificate data could not be resolved.',
                correlationId,
            });
        }
        const worker = await this.prisma.worker.findFirst({
            where: { id: workerId, companyId },
        });
        if (!worker) {
            throw new common_1.NotFoundException('Worker not found for this company');
        }
        const trainingRecord = await this.prisma.trainingRecord.findFirst({
            where: { certificateQrToken: token, companyId },
        });
        if (!trainingRecord) {
            throw new common_1.NotFoundException({
                code: 'UNKNOWN_PROVIDER',
                message: 'Training record not found for certificate token.',
                correlationId,
            });
        }
        if (trainingRecord.workerId === workerId) {
            this.logStep(correlationId, 'qr.linked', {
                trainingRecordId: trainingRecord.id,
            });
            return {
                correlationId,
                status: 'linked',
                trainingRecordId: trainingRecord.id,
                certificate: {
                    valid: true,
                    expired: false,
                    workerId: record.workerId,
                    workerName: record.workerName,
                    certification: record.certification,
                    issuedAt: (_c = (_b = (_a = record.issuedAt) === null || _a === void 0 ? void 0 : _a.toISOString) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : String(record.issuedAt),
                    expiresAt: (_f = (_e = (_d = record.expiresAt) === null || _d === void 0 ? void 0 : _d.toISOString) === null || _e === void 0 ? void 0 : _e.call(_d)) !== null && _f !== void 0 ? _f : null,
                },
                message: 'Certificate already linked to this worker.',
            };
        }
        const validationResult = await this.prisma.trainingValidationResult.create({
            data: {
                subjectType: client_1.TrainingValidationSubject.TRAINING_RECORD,
                outcome: client_1.TrainingValidationOutcome.NEEDS_REVIEW,
                trainingRecordId: trainingRecord.id,
                certificateQrToken: token,
                score: 50,
                details: {
                    source: 'qr_ingestion',
                    correlationId,
                    requestedWorkerId: workerId,
                    certificateWorkerId: trainingRecord.workerId,
                    scannedWorkerName: record.workerName,
                },
            },
        });
        this.monitoring.processing('training_ingestion', 'qr.needs_review', {
            correlationId,
            trainingRecordId: trainingRecord.id,
            validationResultId: validationResult.id,
        });
        return {
            correlationId,
            status: 'needs_review',
            trainingRecordId: trainingRecord.id,
            validationResultId: validationResult.id,
            certificate: {
                valid: true,
                expired: false,
                workerId: record.workerId,
                workerName: record.workerName,
                certification: record.certification,
                issuedAt: (_j = (_h = (_g = record.issuedAt) === null || _g === void 0 ? void 0 : _g.toISOString) === null || _h === void 0 ? void 0 : _h.call(_g)) !== null && _j !== void 0 ? _j : String(record.issuedAt),
                expiresAt: (_m = (_l = (_k = record.expiresAt) === null || _k === void 0 ? void 0 : _k.toISOString) === null || _l === void 0 ? void 0 : _l.call(_k)) !== null && _m !== void 0 ? _m : null,
            },
            message: 'Certificate belongs to another worker. Submitted for supervisor review.',
        };
    }
    logStep(correlationId, step, data) {
        this.logger.log(JSON.stringify(Object.assign({ type: `training_ingestion.${step}`, correlationId }, data)));
    }
};
exports.TrainingQrIngestionService = TrainingQrIngestionService;
exports.TrainingQrIngestionService = TrainingQrIngestionService = TrainingQrIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_provider_certificate_service_1.TrainingProviderCertificateService,
        phase1_monitoring_service_1.Phase1MonitoringService])
], TrainingQrIngestionService);
//# sourceMappingURL=training-qr-ingestion.service.js.map