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
exports.PmInspectionCompletedEventService = void 0;
exports.buildFindings = buildFindings;
exports.buildSignatures = buildSignatures;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_bus_service_1 = require("../modules/api-platform/events/event-bus.service");
const domain_events_1 = require("../modules/api-platform/events/domain-events");
const pm_inspection_critical_findings_1 = require("./pm-inspection-critical-findings");
const pm_inspection_completed_event_types_1 = require("./pm-inspection-completed-event.types");
let PmInspectionCompletedEventService = class PmInspectionCompletedEventService {
    constructor(prisma, eventBus) {
        this.prisma = prisma;
        this.eventBus = eventBus;
    }
    async hasAlreadyEmitted(inspectionId) {
        const row = await this.prisma.pmInspectionAuditLog.findFirst({
            where: { inspectionId, eventType: pm_inspection_completed_event_types_1.INSPECTION_COMPLETED_AUDIT_EVENT },
            select: { id: true },
        });
        return Boolean(row);
    }
    buildCriticalFlags(checklistItems, failedItemIds) {
        const failedCriticalIds = new Set((0, pm_inspection_critical_findings_1.criticalMarkedFailedItemIds)(checklistItems, failedItemIds));
        return checklistItems
            .filter((item) => failedCriticalIds.has(item.id))
            .map((item) => ({
            itemId: item.id,
            label: item.label,
            failed: true,
        }));
    }
    buildFindingsSummary(findings, criticalFlags) {
        const deficiencies = findings.filter((row) => row.kind === 'deficiency');
        const photoFindings = findings.filter((row) => row.kind === 'photo_finding');
        return {
            deficiencyCount: deficiencies.length,
            photoFindingCount: photoFindings.length,
            criticalDeficiencyCount: deficiencies.filter((row) => row.severity === 'critical').length,
            criticalFailedItemCount: criticalFlags.length,
        };
    }
    buildEventData(input) {
        const findings = buildFindings(input.deficiencies, input.photoFindings);
        const signatures = buildSignatures(input.signatures);
        const criticalFlags = this.buildCriticalFlags(input.checklistItems, input.score.failedItemIds);
        const findingsSummary = this.buildFindingsSummary(findings, criticalFlags);
        return {
            inspectionId: input.inspectionId,
            score: {
                scorePercent: input.score.scorePercent,
                passed: input.score.passed,
                riskScore: input.score.riskScore,
                requiresSupervisorReview: input.score.requiresSupervisorReview,
                failedItemCount: input.score.failedItemIds.length,
            },
            findings,
            signatures,
            signaturesPresent: signatures.length > 0,
            findingsSummary,
            criticalFlags,
        };
    }
    async emitOnceOnSubmit(input) {
        if (await this.hasAlreadyEmitted(input.inspectionId)) {
            return { emitted: false };
        }
        const [deficiencies, photoFindings] = await Promise.all([
            this.prisma.pmInspectionDeficiency.findMany({
                where: { inspectionId: input.inspectionId },
                select: {
                    id: true,
                    itemId: true,
                    title: true,
                    severity: true,
                    category: true,
                },
            }),
            this.prisma.pmInspectionPhotoFinding.findMany({
                where: { inspectionId: input.inspectionId },
                select: {
                    id: true,
                    title: true,
                    severity: true,
                    category: true,
                },
            }),
        ]);
        const data = this.buildEventData({
            inspectionId: input.inspectionId,
            score: input.score,
            signatures: input.signatures,
            checklistItems: input.checklistItems,
            deficiencies,
            photoFindings,
        });
        if (this.eventBus) {
            this.eventBus.emit({
                name: domain_events_1.DomainEvent.INSPECTION_COMPLETED,
                occurredAt: new Date().toISOString(),
                actorId: input.actorId,
                companyId: input.companyId,
                projectId: input.projectId,
                entityType: 'pm_inspection',
                entityId: input.inspectionId,
                data: Object.assign(Object.assign({}, data), { source: 'checklist_submit', checklistSubmit: true, passed: data.score.passed, scorePercent: data.score.scorePercent, failedItemCount: data.score.failedItemCount, requiresSupervisorReview: data.score.requiresSupervisorReview }),
            });
        }
        await this.prisma.pmInspectionAuditLog.create({
            data: {
                inspectionId: input.inspectionId,
                eventType: pm_inspection_completed_event_types_1.INSPECTION_COMPLETED_AUDIT_EVENT,
                actorId: input.actorId,
                payload: {
                    source: 'checklist_submit',
                    scorePercent: data.score.scorePercent,
                    passed: data.score.passed,
                    findingCount: data.findings.length,
                    signatureCount: data.signatures.length,
                    signaturesPresent: data.signaturesPresent,
                    criticalFailedItemCount: data.findingsSummary.criticalFailedItemCount,
                    criticalFlags: data.criticalFlags,
                },
            },
        });
        return { emitted: true, data };
    }
};
exports.PmInspectionCompletedEventService = PmInspectionCompletedEventService;
exports.PmInspectionCompletedEventService = PmInspectionCompletedEventService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_bus_service_1.EventBusService])
], PmInspectionCompletedEventService);
function buildFindings(deficiencies, photoFindings) {
    const deficiencyRows = deficiencies.map((row) => {
        var _a;
        return ({
            kind: 'deficiency',
            id: row.id,
            title: row.title,
            severity: row.severity,
            itemId: row.itemId,
            category: (_a = row.category) !== null && _a !== void 0 ? _a : undefined,
        });
    });
    const photoRows = photoFindings.map((row) => ({
        kind: 'photo_finding',
        id: row.id,
        title: row.title,
        severity: row.severity,
        category: row.category,
    }));
    return [...deficiencyRows, ...photoRows];
}
function buildSignatures(signatures) {
    return signatures.map((row) => ({
        role: row.role,
        signerName: row.signerName,
        signedAt: row.signedAt.toISOString(),
        coreFileId: row.coreFileId,
    }));
}
//# sourceMappingURL=pm-inspection-completed-event.service.js.map