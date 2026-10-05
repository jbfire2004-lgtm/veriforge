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
exports.TrainingRecordsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
const credential_ledger_service_1 = require("../modules/credential-ledger/credential-ledger.service");
let TrainingRecordsService = class TrainingRecordsService {
    constructor(prisma, credentialLedger, events) {
        this.prisma = prisma;
        this.credentialLedger = credentialLedger;
        this.events = events;
    }
    async create(data) {
        const certNum = data.certificateNumber != null && data.certificateNumber.trim() !== ''
            ? data.certificateNumber.trim()
            : undefined;
        const rec = await this.prisma.trainingRecord.create({
            data: Object.assign(Object.assign({ worker: { connect: { id: data.workerId } }, certification: { connect: { id: data.certificationId } }, issuedAt: new Date(data.issuedAt), expiresAt: new Date(data.expiresAt) }, (certNum != null ? { certificateNumber: certNum } : {})), (data.providerId != null && Number.isFinite(data.providerId)
                ? { provider: { connect: { id: data.providerId } } }
                : {})),
            include: {
                worker: true,
                certification: true,
                provider: true,
            },
        });
        await this.credentialLedger.recordCredentialCreated({
            credentialId: rec.id,
            workerId: rec.workerId,
            providerId: rec.providerId,
            companyId: rec.companyId,
            actorType: client_1.CredentialLedgerActorType.ADMIN,
            payload: { source: 'training_records_api' },
        });
        return rec;
    }
    findAll() {
        return this.prisma.trainingRecord.findMany({
            include: {
                worker: true,
                certification: true,
                provider: true,
            },
        });
    }
    findByWorker(workerId) {
        return this.prisma.trainingRecord.findMany({
            where: { workerId },
            include: {
                worker: true,
                certification: true,
                provider: true,
            },
            orderBy: { expiresAt: 'asc' },
        });
    }
    async findOne(id) {
        var _a, _b;
        const now = new Date();
        const row = await this.prisma.trainingRecord.findUnique({
            where: { id },
            include: {
                worker: { include: { company: true } },
                certification: true,
                provider: true,
            },
        });
        if (!row)
            return null;
        return Object.assign(Object.assign({}, row), { company: (_b = (_a = row.worker) === null || _a === void 0 ? void 0 : _a.company) !== null && _b !== void 0 ? _b : null, isValid: row.expiresAt != null && row.expiresAt > now });
    }
    async update(id, data, actorId) {
        var _a, _b;
        let certificateNumber = undefined;
        if (data.certificateNumber !== undefined) {
            certificateNumber =
                data.certificateNumber.trim() === ''
                    ? null
                    : data.certificateNumber.trim();
        }
        let providerId = undefined;
        if (data.providerId !== undefined) {
            providerId =
                data.providerId === null || !Number.isFinite(data.providerId)
                    ? null
                    : data.providerId;
        }
        const updated = await this.prisma.trainingRecord.update({
            where: { id },
            data: Object.assign(Object.assign({ workerId: (_a = data.workerId) !== null && _a !== void 0 ? _a : undefined, certificationId: (_b = data.certificationId) !== null && _b !== void 0 ? _b : undefined, issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined }, (certificateNumber !== undefined ? { certificateNumber } : {})), (providerId !== undefined ? { providerId } : {})),
            include: {
                worker: true,
                certification: true,
                provider: true,
            },
        });
        await this.credentialLedger.recordCredentialUpdated({
            credentialId: updated.id,
            workerId: updated.workerId,
            providerId: updated.providerId,
            companyId: updated.companyId,
            actorId: actorId !== null && actorId !== void 0 ? actorId : null,
            actorType: client_1.CredentialLedgerActorType.ADMIN,
            payload: { fields: data },
        });
        return updated;
    }
    markComplete(id) {
        return this.prisma.trainingRecord
            .update({
            where: { id },
            data: {
                completedAt: new Date(),
            },
            include: {
                worker: true,
                certification: true,
                provider: true,
            },
        })
            .then(async (record) => {
            var _a, _b, _c, _d, _e, _f;
            await this.credentialLedger.recordCredentialVerified({
                credentialId: id,
                workerId: record.workerId,
                providerId: record.providerId,
                companyId: (_a = record.companyId) !== null && _a !== void 0 ? _a : record.worker.companyId,
                payload: {
                    source: 'mark_complete',
                    completedAt: (_b = record.completedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                },
            });
            (_c = this.events) === null || _c === void 0 ? void 0 : _c.emit({
                name: domain_events_1.DomainEvent.TRAINING_VALIDATED,
                occurredAt: new Date().toISOString(),
                entityType: 'training',
                entityId: id,
                companyId: (_e = (_d = record.companyId) !== null && _d !== void 0 ? _d : record.worker.companyId) !== null && _e !== void 0 ? _e : undefined,
                data: { completedAt: (_f = record.completedAt) === null || _f === void 0 ? void 0 : _f.toISOString() },
            });
            return record;
        });
    }
    remove(id) {
        return this.prisma.trainingRecord.delete({
            where: { id },
        });
    }
};
exports.TrainingRecordsService = TrainingRecordsService;
exports.TrainingRecordsService = TrainingRecordsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        credential_ledger_service_1.CredentialLedgerService,
        event_bus_service_1.EventBusService])
], TrainingRecordsService);
//# sourceMappingURL=training-records.service.js.map