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
var CredentialLedgerBackfillService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialLedgerBackfillService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const credential_ledger_service_1 = require("./credential-ledger.service");
let CredentialLedgerBackfillService = CredentialLedgerBackfillService_1 = class CredentialLedgerBackfillService {
    constructor(prisma, ledger) {
        this.prisma = prisma;
        this.ledger = ledger;
        this.logger = new common_1.Logger(CredentialLedgerBackfillService_1.name);
    }
    async backfill(options) {
        var _a, _b;
        const dryRun = (_a = options === null || options === void 0 ? void 0 : options.dryRun) !== null && _a !== void 0 ? _a : false;
        const limit = (_b = options === null || options === void 0 ? void 0 : options.limit) !== null && _b !== void 0 ? _b : 500;
        const result = {
            dryRun,
            scanned: 0,
            recordsBackfilled: 0,
            recordsSkipped: 0,
            eventsCreated: 0,
            errors: [],
        };
        const records = await this.prisma.trainingRecord.findMany({
            where: (options === null || options === void 0 ? void 0 : options.companyId) ? { companyId: options.companyId } : undefined,
            include: {
                ledgerEvents: { select: { eventType: true } },
                validationResults: { orderBy: { validatedAt: 'asc' } },
            },
            orderBy: { id: 'asc' },
            take: limit,
        });
        for (const record of records) {
            result.scanned++;
            const existing = new Set(record.ledgerEvents.map((e) => e.eventType));
            if (existing.has(client_1.CredentialLedgerEventType.CREATED) ||
                existing.has(client_1.CredentialLedgerEventType.IMPORTED)) {
                result.recordsSkipped++;
                continue;
            }
            const planned = this.planEventsForRecord(record, existing);
            if (planned.length === 0) {
                result.recordsSkipped++;
                continue;
            }
            if (dryRun) {
                result.recordsBackfilled++;
                result.eventsCreated += planned.length;
                continue;
            }
            try {
                for (const event of planned) {
                    await this.ledger.append(event);
                    result.eventsCreated++;
                }
                result.recordsBackfilled++;
            }
            catch (e) {
                result.errors.push({
                    credentialId: record.id,
                    message: e instanceof Error ? e.message : String(e),
                });
            }
        }
        this.logger.log(JSON.stringify(Object.assign({ type: 'credential_ledger.backfill' }, result)));
        return result;
    }
    planEventsForRecord(record, existing) {
        var _a;
        const base = {
            credentialId: record.id,
            workerId: record.workerId,
            providerId: (_a = record.providerId) !== null && _a !== void 0 ? _a : record.trainingProviderId,
            projectId: record.projectId,
            companyId: record.companyId,
        };
        const events = [];
        const originType = record.ingestionRunId
            ? client_1.CredentialLedgerEventType.IMPORTED
            : client_1.CredentialLedgerEventType.CREATED;
        events.push(Object.assign(Object.assign({}, base), { eventType: originType, actorType: record.ingestionRunId
                ? client_1.CredentialLedgerActorType.SYSTEM
                : client_1.CredentialLedgerActorType.ADMIN, occurredAt: record.issuedAt, payload: {
                source: 'backfill',
                ingestionRunId: record.ingestionRunId,
            } }));
        for (const v of record.validationResults) {
            if (v.outcome === client_1.TrainingValidationOutcome.APPROVED &&
                !existing.has(client_1.CredentialLedgerEventType.VERIFIED)) {
                events.push(Object.assign(Object.assign({}, base), { eventType: client_1.CredentialLedgerEventType.VERIFIED, actorId: v.validatedBy, actorType: client_1.CredentialLedgerActorType.SUPERVISOR, occurredAt: v.validatedAt, payload: {
                        source: 'backfill',
                        validationResultId: v.id,
                    } }));
            }
            if (v.outcome === client_1.TrainingValidationOutcome.REJECTED &&
                !existing.has(client_1.CredentialLedgerEventType.REVOKED)) {
                events.push(Object.assign(Object.assign({}, base), { eventType: client_1.CredentialLedgerEventType.REVOKED, actorId: v.validatedBy, actorType: client_1.CredentialLedgerActorType.SUPERVISOR, occurredAt: v.validatedAt, payload: {
                        source: 'backfill',
                        validationResultId: v.id,
                    } }));
            }
        }
        if (record.completedAt &&
            !existing.has(client_1.CredentialLedgerEventType.VERIFIED) &&
            !events.some((e) => e.eventType === client_1.CredentialLedgerEventType.VERIFIED)) {
            events.push(Object.assign(Object.assign({}, base), { eventType: client_1.CredentialLedgerEventType.VERIFIED, actorType: client_1.CredentialLedgerActorType.SYSTEM, occurredAt: record.completedAt, payload: { source: 'backfill', via: 'completedAt' } }));
        }
        if (record.expiresAt &&
            record.expiresAt.getTime() < Date.now() &&
            !existing.has(client_1.CredentialLedgerEventType.EXPIRED)) {
            events.push(Object.assign(Object.assign({}, base), { eventType: client_1.CredentialLedgerEventType.EXPIRED, actorType: client_1.CredentialLedgerActorType.SYSTEM, occurredAt: record.expiresAt, payload: { source: 'backfill' } }));
        }
        return events;
    }
};
exports.CredentialLedgerBackfillService = CredentialLedgerBackfillService;
exports.CredentialLedgerBackfillService = CredentialLedgerBackfillService = CredentialLedgerBackfillService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credential_ledger_service_1.CredentialLedgerService])
], CredentialLedgerBackfillService);
//# sourceMappingURL=credential-ledger-backfill.service.js.map