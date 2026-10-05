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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingIngestionV1Controller = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const public_decorator_1 = require("../auth/public.decorator");
const routes_1 = require("../config/routes");
const training_ingest_upload_fields_dto_1 = require("./dto/training-ingest-upload-fields.dto");
const email_ingest_dto_1 = require("./dto/email-ingest.dto");
const bulk_verify_dto_1 = require("./dto/bulk-verify.dto");
const training_ingestion_service_1 = require("./training-ingestion.service");
const training_qr_ingestion_service_1 = require("./training-qr-ingestion.service");
const training_provider_ingestion_service_1 = require("./training-provider-ingestion.service");
const training_standards_compliance_service_1 = require("../modules/training-standards-compliance/training-standards-compliance.service");
const schemas_1 = require("./pipeline/schemas");
const training_ingestion_upload_config_1 = require("./training-ingestion-upload.config");
let TrainingIngestionV1Controller = class TrainingIngestionV1Controller {
    constructor(ingestion, qrIngestion, providerIngestion, standards) {
        this.ingestion = ingestion;
        this.qrIngestion = qrIngestion;
        this.providerIngestion = providerIngestion;
        this.standards = standards;
    }
    needsReviewQueue(companyId, limit) {
        return this.ingestion.needsReviewQueue(companyId, limit ? Number(limit) : undefined);
    }
    listRuns(companyId, status, sourceChannel, limit) {
        return this.ingestion.listRuns({
            companyId,
            status,
            sourceChannel,
            limit: limit ? Number(limit) : undefined,
        });
    }
    verificationQueue(companyId, limit) {
        return this.ingestion.verificationQueue(companyId, limit ? Number(limit) : undefined);
    }
    getRun(id) {
        return this.ingestion.getRun(id);
    }
    emailIngest(body, secret) {
        return this.ingestion.processEmailIngest(body, secret);
    }
    preview(file, body) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        return this.ingestion.previewFileUpload(body.companyId, file, body.metadata);
    }
    confirm(body) {
        const parsed = schemas_1.ConfirmIngestBodySchema.safeParse(body);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.flatten());
        }
        return this.ingestion.confirmIngest(parsed.data.companyId, parsed.data);
    }
    qrIngest(body) {
        const parsed = schemas_1.QrIngestBodySchema.safeParse(body);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.flatten());
        }
        return this.qrIngestion.ingestFromQr(parsed.data.companyId, parsed.data.workerId, parsed.data.qr);
    }
    providerIngest(providerId, body, signature, req) {
        var _a, _b;
        const rawBody = (_b = (_a = req === null || req === void 0 ? void 0 : req.rawBody) === null || _a === void 0 ? void 0 : _a.toString('utf8')) !== null && _b !== void 0 ? _b : JSON.stringify(body);
        return this.providerIngestion.ingestFromProvider(providerId, body, {
            signature,
            rawBody,
        });
    }
    approveReview(id, body, req) {
        return this.ingestion.approveReview(id, req.user.id, body.notes);
    }
    correctReview(id, body, req) {
        const parsed = schemas_1.ReviewCorrectBodySchema.safeParse(body);
        if (!parsed.success) {
            throw new common_1.BadRequestException(parsed.error.flatten());
        }
        return this.ingestion.correctReview(id, req.user.id, parsed.data);
    }
    upload(file, body) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        return this.ingestion.processFileUpload(body.companyId, file, body.metadata, 'upload');
    }
    async bulkUpload(files, body) {
        if (!(files === null || files === void 0 ? void 0 : files.length))
            throw new common_1.BadRequestException('files are required');
        const results = [];
        for (const file of files) {
            results.push(await this.ingestion.processFileUpload(body.companyId, file, body.metadata, 'bulk'));
        }
        return { count: results.length, runs: results };
    }
    async bulkVerify(body, req) {
        const outcomes = [];
        for (const id of body.validationResultIds) {
            outcomes.push(await this.standards.approveValidation(id, req.user.id, body.notes));
        }
        return { approved: outcomes.length, results: outcomes };
    }
};
exports.TrainingIngestionV1Controller = TrainingIngestionV1Controller;
__decorate([
    (0, common_1.Get)('needs-review'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "needsReviewQueue", null);
__decorate([
    (0, common_1.Get)('runs'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('sourceChannel')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "listRuns", null);
__decorate([
    (0, common_1.Get)('verification-queue'),
    __param(0, (0, common_1.Query)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "verificationQueue", null);
__decorate([
    (0, common_1.Get)('runs/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "getRun", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)(30, 60),
    (0, common_1.Post)('email'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-training-email-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_ingest_dto_1.EmailIngestDto, String]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "emailIngest", null);
__decorate([
    (0, throttler_1.Throttle)(20, 60),
    (0, common_1.Post)('preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: training_ingestion_upload_config_1.TRAINING_INGEST_UPLOAD_MAX_BYTES },
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, training_ingest_upload_fields_dto_1.TrainingIngestUploadFieldsDto]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('confirm'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)('qr'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "qrIngest", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)(60, 60),
    (0, common_1.Post)('provider/:providerId'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-vera-signature')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, Object]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "providerIngest", null);
__decorate([
    (0, common_1.Post)('review/:id/approve'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.COMPANY_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "approveReview", null);
__decorate([
    (0, common_1.Patch)('review/:id/correct'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.COMPANY_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "correctReview", null);
__decorate([
    (0, throttler_1.Throttle)(20, 60),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: training_ingestion_upload_config_1.TRAINING_INGEST_UPLOAD_MAX_BYTES },
        fileFilter: (_req, file, cb) => {
            const mime = (file.mimetype || '').trim();
            if (mime && training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has(mime)) {
                return cb(null, true);
            }
            const name = (file.originalname || '').toLowerCase();
            if (name.endsWith('.json')) {
                return cb(null, true);
            }
            if ((name.endsWith('.jpg') || name.endsWith('.jpeg')) &&
                training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has('image/jpeg')) {
                return cb(null, true);
            }
            if (name.endsWith('.png') &&
                training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has('image/png')) {
                return cb(null, true);
            }
            if (name.endsWith('.pdf') &&
                training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has('application/pdf')) {
                return cb(null, true);
            }
            if (name.endsWith('.webp') &&
                training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES.has('image/webp')) {
                return cb(null, true);
            }
            return cb(new common_1.BadRequestException(`Unsupported type ${mime || '(empty)'}. Allowed: ${[
                ...training_ingestion_upload_config_1.TRAINING_INGEST_ALLOWED_MIMES,
            ].join(', ')}`), false);
        },
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, training_ingest_upload_fields_dto_1.TrainingIngestUploadFieldsDto]),
    __metadata("design:returntype", void 0)
], TrainingIngestionV1Controller.prototype, "upload", null);
__decorate([
    (0, throttler_1.Throttle)(5, 60),
    (0, common_1.Post)('bulk-upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: multer.memoryStorage(),
        limits: { fileSize: training_ingestion_upload_config_1.TRAINING_INGEST_UPLOAD_MAX_BYTES },
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, training_ingest_upload_fields_dto_1.TrainingIngestUploadFieldsDto]),
    __metadata("design:returntype", Promise)
], TrainingIngestionV1Controller.prototype, "bulkUpload", null);
__decorate([
    (0, common_1.Post)('bulk-verify'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_verify_dto_1.BulkVerifyDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingIngestionV1Controller.prototype, "bulkVerify", null);
exports.TrainingIngestionV1Controller = TrainingIngestionV1Controller = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/training-ingestion`),
    __metadata("design:paramtypes", [training_ingestion_service_1.TrainingIngestionService,
        training_qr_ingestion_service_1.TrainingQrIngestionService,
        training_provider_ingestion_service_1.TrainingProviderIngestionService,
        training_standards_compliance_service_1.TrainingStandardsComplianceService])
], TrainingIngestionV1Controller);
//# sourceMappingURL=training-ingestion-v1.controller.js.map