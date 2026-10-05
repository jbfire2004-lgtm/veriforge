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
exports.CredentialLedgerChainService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const credential_ledger_service_1 = require("./credential-ledger.service");
let CredentialLedgerChainService = class CredentialLedgerChainService {
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
    }
    async resolveVerificationChain(credentialId) {
        var _a, _b, _c, _d, _e, _f;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: credentialId },
            include: {
                worker: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                provider: { select: { id: true, name: true } },
                trainingProvider: { select: { id: true, name: true } },
                certification: { select: { id: true, name: true, code: true } },
                validationResults: {
                    orderBy: { validatedAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!record) {
            throw new common_1.NotFoundException('Credential not found');
        }
        const events = await this.ledger.listByCredential(credentialId);
        const latestValidation = (_b = (_a = record.validationResults[0]) === null || _a === void 0 ? void 0 : _a.outcome) !== null && _b !== void 0 ? _b : null;
        const status = this.resolveStatus(record, events, latestValidation);
        return {
            credentialId: record.id,
            status,
            worker: record.worker,
            provider: record.provider,
            trainingProvider: record.trainingProvider,
            certification: record.certification,
            issuedAt: (_d = (_c = record.issuedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
            expiresAt: (_f = (_e = record.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
            certificateNumber: record.certificateNumber,
            latestValidationOutcome: latestValidation,
            events,
        };
    }
    resolveStatus(record, events, latestValidation) {
        const hasRevoked = events.some((e) => e.eventType === client_1.CredentialLedgerEventType.REVOKED);
        if (hasRevoked || latestValidation === client_1.TrainingValidationOutcome.REJECTED) {
            return 'revoked';
        }
        if (latestValidation === client_1.TrainingValidationOutcome.NEEDS_REVIEW) {
            return 'needs_review';
        }
        if (latestValidation === client_1.TrainingValidationOutcome.PENDING) {
            return 'pending';
        }
        const expiredByDate = record.expiresAt != null && record.expiresAt.getTime() < Date.now();
        const hasExpiredEvent = events.some((e) => e.eventType === client_1.CredentialLedgerEventType.EXPIRED);
        if (expiredByDate || hasExpiredEvent) {
            return 'expired';
        }
        if (record.lastVerificationStatus === 'INVALID') {
            return 'revoked';
        }
        return 'valid';
    }
};
exports.CredentialLedgerChainService = CredentialLedgerChainService;
exports.CredentialLedgerChainService = CredentialLedgerChainService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credential_ledger_service_1.CredentialLedgerService])
], CredentialLedgerChainService);
//# sourceMappingURL=credential-ledger-chain.service.js.map