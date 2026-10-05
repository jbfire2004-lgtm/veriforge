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
exports.PmCapaAutoGenerateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
const pm_corrective_actions_service_1 = require("./pm-corrective-actions.service");
let PmCapaAutoGenerateService = class PmCapaAutoGenerateService {
    constructor(prisma, capa, auditLog) {
        this.prisma = prisma;
        this.capa = capa;
        this.auditLog = auditLog;
    }
    async fromJhaFlha(jhaFlhaId, actorId) {
        const jha = await this.prisma.jhaFlha.findUnique({
            where: { id: jhaFlhaId },
            include: { controls: true, hazards: true },
        });
        if (!jha)
            return [];
        const weakControls = jha.controls.filter((control) => {
            var _a;
            return control.adequate === false ||
                ((_a = control.effectivenessScore) !== null && _a !== void 0 ? _a : 100) < 50;
        });
        return Promise.all(weakControls.map((control) => {
            var _a;
            return this.capa.create({
                companyId: jha.companyId,
                projectId: jha.projectId,
                siteId: (_a = jha.siteId) !== null && _a !== void 0 ? _a : undefined,
                sourceModule: 'jha_flha',
                sourceId: jhaFlhaId,
                sourceItemId: control.id,
                title: `Strengthen control: ${control.description.slice(0, 80)}`,
                description: control.description,
                actionType: 'interim_control',
                severity: 'high',
                createdByUserId: actorId,
                assignUserId: actorId,
            });
        }));
    }
    async fromInspectionDeficiency(deficiencyId, actorId) {
        var _a, _b, _c;
        const def = await this.prisma.pmInspectionDeficiency.findUnique({
            where: { id: deficiencyId },
            include: { inspection: true },
        });
        if (!def)
            return null;
        if (def.cailEntryId) {
            const existing = await this.prisma.pmCorrectiveAction.findFirst({
                where: { cailEntryId: def.cailEntryId },
            });
            if (existing)
                return this.capa.get(existing.id);
        }
        const exists = await this.prisma.pmCorrectiveAction.findFirst({
            where: {
                sourceModule: 'inspection',
                sourceId: def.inspectionId,
                sourceItemId: def.id,
            },
        });
        if (exists)
            return exists;
        const action = await this.capa.create({
            companyId: def.inspection.companyId,
            projectId: def.inspection.projectId,
            siteId: (_a = def.inspection.siteId) !== null && _a !== void 0 ? _a : undefined,
            equipmentId: (_b = def.inspection.equipmentId) !== null && _b !== void 0 ? _b : undefined,
            sourceModule: 'inspection',
            sourceId: def.inspectionId,
            sourceItemId: def.id,
            deficiencyId: def.id,
            title: def.title,
            description: (_c = def.description) !== null && _c !== void 0 ? _c : undefined,
            actionType: 'permanent',
            severity: def.severity === 'critical'
                ? 'critical'
                : def.severity === 'high'
                    ? 'high'
                    : 'medium',
            createdByUserId: actorId,
        });
        await this.prisma.pmInspectionDeficiency.update({
            where: { id: deficiencyId },
            data: { cailEntryId: action.cailEntryId },
        });
        await this.auditLog.logAudit({ id: actorId, companyId: def.inspection.companyId }, audit_actions_1.AuditAction.INSPECTION_AUTO_CAPA, {
            type: audit_actions_1.AuditEntityType.PM_CORRECTIVE_ACTION,
            id: action.id,
            tenantId: def.inspection.companyId,
        }, {
            inspectionId: def.inspectionId,
            deficiencyId: def.id,
            auto: true,
        });
        return action;
    }
    async fromSafetyEvent(eventId, rootCauseId, actorId) {
        var _a;
        const rc = await this.prisma.pmSafetyEventRootCause.findUnique({
            where: { id: rootCauseId },
            include: { event: true },
        });
        if (!rc)
            return null;
        return this.capa.create({
            companyId: rc.event.companyId,
            projectId: rc.event.projectId,
            siteId: (_a = rc.event.siteId) !== null && _a !== void 0 ? _a : undefined,
            sourceModule: 'incident',
            sourceId: eventId,
            sourceItemId: rootCauseId,
            title: `RCA CAPA: ${rc.description.slice(0, 80)}`,
            description: rc.description,
            actionType: 'permanent',
            severity: rc.event.severity === 'critical' ? 'critical' : 'high',
            createdByUserId: actorId,
            sifLinked: !!rc.event.sifEventId,
        });
    }
    async fromSifHecaEvent(eventId, actorId) {
        var _a, _b, _c, _d, _e;
        const evt = await this.prisma.sifHecaEvent.findUnique({
            where: { id: eventId },
            include: { sifScore: true },
        });
        if (!evt)
            return null;
        return this.capa.create({
            companyId: evt.companyId,
            projectId: evt.projectId,
            siteId: (_a = evt.siteId) !== null && _a !== void 0 ? _a : undefined,
            equipmentId: (_b = evt.equipmentId) !== null && _b !== void 0 ? _b : undefined,
            workerId: (_c = evt.workerId) !== null && _c !== void 0 ? _c : undefined,
            sourceModule: 'sif_heca',
            sourceId: eventId,
            sourceItemId: '',
            title: `SIF/HECA: ${evt.title}`,
            description: (_d = evt.description) !== null && _d !== void 0 ? _d : undefined,
            actionType: 'immediate',
            severity: ((_e = evt.sifScore) === null || _e === void 0 ? void 0 : _e.sifCategory) === 'critical' ? 'critical' : 'high',
            createdByUserId: actorId,
            sifLinked: true,
            hecaLinked: true,
        });
    }
    async syncOpenFromModules(projectId, actorId) {
        const results = { jha: 0, inspection: 0, sif: 0 };
        const openDefs = await this.prisma.pmInspectionDeficiency.findMany({
            where: {
                status: { not: 'closed' },
                inspection: { projectId },
                cailEntryId: null,
            },
            take: 20,
        });
        const inspectionCreated = await Promise.all(openDefs.map((d) => this.fromInspectionDeficiency(d.id, actorId)));
        results.inspection = inspectionCreated.filter(Boolean).length;
        const sifEvents = await this.prisma.sifHecaEvent.findMany({
            where: {
                projectId,
                status: { in: ['scored', 'review_required'] },
            },
            take: 10,
        });
        const existingSif = await this.prisma.pmCorrectiveAction.findMany({
            where: {
                sourceModule: 'sif_heca',
                sourceId: { in: sifEvents.map((e) => e.id) },
            },
            select: { sourceId: true },
        });
        const existingSifIds = new Set(existingSif.map((r) => r.sourceId));
        const sifToCreate = sifEvents.filter((e) => !existingSifIds.has(e.id));
        const sifCreated = await Promise.all(sifToCreate.map((e) => this.fromSifHecaEvent(e.id, actorId)));
        results.sif = sifCreated.filter(Boolean).length;
        return results;
    }
    async fromDocumentDeficiency(input) {
        var _a, _b, _c;
        const exists = await this.prisma.pmCorrectiveAction.findFirst({
            where: {
                sourceModule: input.sourceModule,
                sourceId: input.sourceId,
                sourceItemId: (_a = input.sourceItemId) !== null && _a !== void 0 ? _a : '',
                status: { notIn: ['closed', 'verified'] },
            },
        });
        if (exists)
            return exists;
        return this.capa.create({
            companyId: input.companyId,
            projectId: input.projectId,
            siteId: input.siteId,
            sourceModule: input.sourceModule,
            sourceId: input.sourceId,
            sourceItemId: (_b = input.sourceItemId) !== null && _b !== void 0 ? _b : '',
            title: input.title,
            description: input.description,
            actionType: 'permanent',
            severity: (_c = input.severity) !== null && _c !== void 0 ? _c : 'medium',
            createdByUserId: input.actorId,
        });
    }
    async fromEquipmentFailure(failureId, actorId) {
        var _a, _b;
        const f = await this.prisma.pmEquipmentFailure.findUnique({
            where: { id: failureId },
        });
        if (!f)
            return null;
        if (f.correctiveActionId) {
            return this.capa.get(f.correctiveActionId);
        }
        let projectId = f.projectId;
        if (!projectId) {
            const epa = await this.prisma.equipmentProjectAssignment.findFirst({
                where: { equipmentId: f.equipmentId, status: 'ACTIVE' },
            });
            projectId = (_a = epa === null || epa === void 0 ? void 0 : epa.projectId) !== null && _a !== void 0 ? _a : null;
        }
        if (!projectId)
            return null;
        const action = await this.capa.create({
            companyId: f.companyId,
            projectId,
            sourceModule: 'equipment',
            sourceId: failureId,
            title: `Equipment failure: ${f.title}`,
            description: (_b = f.description) !== null && _b !== void 0 ? _b : undefined,
            actionType: 'equipment_repair',
            severity: f.failureType === 'safety_device' ? 'critical' : 'high',
            equipmentId: f.equipmentId,
            createdByUserId: actorId,
            publish: true,
        });
        await this.prisma.pmEquipmentFailure.update({
            where: { id: failureId },
            data: { correctiveActionId: action.id },
        });
        return action;
    }
    async fromEmergencyEvent(eventId, actorId) {
        var _a;
        const evt = await this.prisma.pmEmergencyEvent.findUnique({
            where: { id: eventId },
        });
        if (!evt)
            return null;
        const exists = await this.prisma.pmCorrectiveAction.findFirst({
            where: { sourceModule: 'emergency', sourceId: eventId },
        });
        if (exists)
            return exists;
        if (!evt.projectId)
            return null;
        return this.capa.create({
            companyId: evt.companyId,
            projectId: evt.projectId,
            siteId: evt.siteId,
            sourceModule: 'emergency',
            sourceId: eventId,
            title: `Post-emergency CAPA: ${evt.title}`,
            description: (_a = evt.description) !== null && _a !== void 0 ? _a : undefined,
            actionType: 'immediate',
            severity: 'high',
            createdByUserId: actorId,
            publish: true,
        });
    }
    async fromTrainingGap(workerId, projectId, trainingCode, actorId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            return null;
        return this.capa.create({
            companyId: worker.companyId,
            projectId,
            sourceModule: 'training',
            sourceId: String(workerId),
            sourceItemId: trainingCode,
            title: `Complete training: ${trainingCode}`,
            description: 'Expired or missing required training',
            actionType: 'training_requirement',
            severity: 'high',
            workerId,
            createdByUserId: actorId,
            publish: true,
        });
    }
    async fromSdsGap(companyId, projectId, chemicalName, actorId) {
        return this.capa.create({
            companyId,
            projectId,
            sourceModule: 'sds',
            sourceId: String(projectId),
            sourceItemId: chemicalName,
            title: `SDS compliance: ${chemicalName}`,
            description: 'Missing SDS acknowledgment or improper chemical storage',
            actionType: 'permanent',
            severity: 'high',
            createdByUserId: actorId,
            publish: true,
        });
    }
    async fromAccessDenial(workerId, projectId, reason, actorId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!(worker === null || worker === void 0 ? void 0 : worker.companyId))
            return null;
        return this.capa.create({
            companyId: worker.companyId,
            projectId,
            sourceModule: 'site_access',
            sourceId: String(workerId),
            title: `Resolve site access denial`,
            description: reason,
            actionType: 'permanent',
            severity: 'medium',
            workerId,
            createdByUserId: actorId,
        });
    }
    async fromPolicyNonCompliance(companyId, projectId, policyTitle, workerId, actorId) {
        return this.capa.create({
            companyId,
            projectId,
            sourceModule: 'policy',
            sourceId: policyTitle,
            title: `Policy acknowledgment: ${policyTitle}`,
            description: 'Required policy acknowledgment missing',
            actionType: 'policy_update',
            severity: 'medium',
            workerId,
            createdByUserId: actorId,
            publish: true,
        });
    }
};
exports.PmCapaAutoGenerateService = PmCapaAutoGenerateService;
exports.PmCapaAutoGenerateService = PmCapaAutoGenerateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        audit_log_service_1.AuditLogService])
], PmCapaAutoGenerateService);
//# sourceMappingURL=pm-capa-auto-generate.service.js.map