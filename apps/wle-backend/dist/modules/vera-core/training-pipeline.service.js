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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingPipelineService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const company_links_service_1 = require("./company-links.service");
const training_wallet_integration_service_1 = require("./training-wallet-integration.service");
const credential_ledger_service_1 = require("../credential-ledger/credential-ledger.service");
let TrainingPipelineService = class TrainingPipelineService {
    constructor(prisma, companyLinks, walletIntegration, credentialLedger) {
        this.prisma = prisma;
        this.companyLinks = companyLinks;
        this.walletIntegration = walletIntegration;
        this.credentialLedger = credentialLedger;
    }
    async ingest(input) {
        var _a, _b;
        const workerId = await this.resolveWorkerId(input);
        if (!workerId) {
            return { ok: false, error: 'WORKER_NOT_FOUND' };
        }
        if (input.companyId) {
            await this.companyLinks.linkWorker(workerId, input.companyId, {
                deactivateOtherCompanies: false,
            });
        }
        const record = await this.prisma.trainingRecord.create({
            data: {
                workerId,
                certificationId: input.certificationId,
                providerId: input.providerId,
                trainingProviderId: input.trainingProviderId,
                courseId: input.courseId,
                instructorId: input.instructorId,
                companyId: input.companyId,
                projectId: input.projectId,
                expiresAt: input.expiresAt,
                issuedAt: (_a = input.issuedAt) !== null && _a !== void 0 ? _a : new Date(),
                certificateNumber: input.certificateNumber,
                ingestionRunId: input.ingestionRunId,
                completedAt: new Date(),
            },
            include: { certification: true },
        });
        const walletTraining = await this.walletIntegration.syncAfterTrainingRecord(record.id, input.equipmentId);
        await this.credentialLedger.recordCredentialCreated({
            credentialId: record.id,
            workerId: record.workerId,
            providerId: record.providerId,
            trainingProviderId: record.trainingProviderId,
            projectId: record.projectId,
            companyId: record.companyId,
            actorType: input.trainingProviderId
                ? client_1.CredentialLedgerActorType.PROVIDER
                : client_1.CredentialLedgerActorType.SYSTEM,
            payload: {
                source: 'training_pipeline',
                ingestionRunId: (_b = input.ingestionRunId) !== null && _b !== void 0 ? _b : null,
            },
        });
        return {
            ok: true,
            workerId,
            trainingRecord: record,
            walletTraining,
        };
    }
    async resolveWorkerId(input) {
        if (input.workerId)
            return input.workerId;
        if (input.workerEmail) {
            const w = await this.prisma.worker.findFirst({
                where: { email: input.workerEmail.trim().toLowerCase() },
            });
            if (w)
                return w.id;
        }
        if (input.workerPhone) {
            const digits = input.workerPhone.replace(/\D/g, '');
            const w = await this.prisma.worker.findFirst({
                where: { phone: { contains: digits } },
            });
            if (w)
                return w.id;
        }
        return null;
    }
};
exports.TrainingPipelineService = TrainingPipelineService;
exports.TrainingPipelineService = TrainingPipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        company_links_service_1.CompanyLinksService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService,
        credential_ledger_service_1.CredentialLedgerService])
], TrainingPipelineService);
//# sourceMappingURL=training-pipeline.service.js.map