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
exports.PmInspectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_errors_1 = require("../common/prisma-errors");
const pm_inspection_templates_service_1 = require("./pm-inspection-templates.service");
const inspection_template_engine_1 = require("./inspection-template.engine");
const inspection_scoring_engine_1 = require("./inspection-scoring.engine");
const deficiency_scoring_engine_1 = require("./deficiency-scoring.engine");
const pm_inspections_cail_service_1 = require("./pm-inspections-cail.service");
const pm_inspections_equipment_service_1 = require("./pm-inspections-equipment.service");
const pm_inspections_ingestion_service_1 = require("./pm-inspections-ingestion.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const pm_inspection_incident_service_1 = require("./pm-inspection-incident.service");
const pm_inspection_meeting_service_1 = require("./pm-inspection-meeting.service");
const pm_inspection_completed_event_service_1 = require("./pm-inspection-completed-event.service");
const pm_inspection_signature_util_1 = require("./pm-inspection-signature.util");
const inspection_show_if_1 = require("./inspection-show-if");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
const pm_inspection_kind_util_1 = require("./pm-inspection-kind.util");
const pm_inspection_sharing_types_1 = require("./pm-inspection-sharing.types");
const inspectionInclude = {
    template: true,
    deficiencies: true,
    signatures: {
        orderBy: { signedAt: 'asc' },
        include: {
            coreFile: { select: { id: true, publicUrl: true, mimeType: true } },
        },
    },
    attachments: true,
    correctiveActions: true,
    inspector: { select: { id: true, username: true, email: true } },
    equipment: { select: { id: true, name: true, catalogTypeKey: true } },
    worker: { select: { id: true, firstName: true, lastName: true } },
    project: { select: { id: true, name: true } },
};
let PmInspectionsService = class PmInspectionsService {
    constructor(prisma, templates, templateEngine, scoring, deficiencyScoring, cail, equipment, ingestion, inspectionIncidents, inspectionMeetings, completedEvents, auditLog, capaAuto) {
        this.prisma = prisma;
        this.templates = templates;
        this.templateEngine = templateEngine;
        this.scoring = scoring;
        this.deficiencyScoring = deficiencyScoring;
        this.cail = cail;
        this.equipment = equipment;
        this.ingestion = ingestion;
        this.inspectionIncidents = inspectionIncidents;
        this.inspectionMeetings = inspectionMeetings;
        this.completedEvents = completedEvents;
        this.auditLog = auditLog;
        this.capaAuto = capaAuto;
    }
    async audit(inspectionId, eventType, actorId, payload) {
        await this.prisma.pmInspectionAuditLog.create({
            data: {
                inspectionId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async list(filters) {
        return this.prisma.pmInspection.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign({ deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), (filters.companyId ? { companyId: filters.companyId } : {})), (filters.status ? { status: filters.status } : {})), (filters.equipmentId ? { equipmentId: filters.equipmentId } : {})),
            include: inspectionInclude,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async get(id) {
        const row = await this.prisma.pmInspection.findFirst({
            where: { id, deletedAt: null },
            include: Object.assign(Object.assign({}, inspectionInclude), { auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 } }),
        });
        if (!row)
            throw new common_1.NotFoundException('Inspection not found');
        return row;
    }
    async createFromTemplate(input) {
        var _a;
        if (input.clientSyncId) {
            const existing = await this.prisma.pmInspection.findUnique({
                where: { clientSyncId: input.clientSyncId },
                include: inspectionInclude,
            });
            if (existing) {
                if (existing.companyId !== input.companyId) {
                    throw new common_1.ForbiddenException('Cross-tenant inspection sync denied');
                }
                return existing;
            }
        }
        const template = await this.templates.get(input.templateId);
        if (template.status !== 'published') {
            throw new common_1.BadRequestException('Template must be published');
        }
        let inspection;
        try {
            inspection = await this.prisma.pmInspection.create({
                data: {
                    templateId: template.id,
                    templateVersion: template.version,
                    companyId: input.companyId,
                    projectId: input.projectId,
                    siteId: input.siteId,
                    equipmentId: input.equipmentId,
                    workerId: input.workerId,
                    inspectorUserId: input.inspectorUserId,
                    title: (_a = input.title) !== null && _a !== void 0 ? _a : template.name,
                    locationNote: input.locationNote,
                    status: (0, pm_inspection_kind_util_1.isPhotoFirstTemplate)(template) ? 'in_progress' : 'draft',
                    clientSyncId: input.clientSyncId,
                },
                include: inspectionInclude,
            });
        }
        catch (err) {
            inspection = await (0, prisma_errors_1.replayOrConflict)(err, async () => {
                if (!input.clientSyncId)
                    return null;
                return this.prisma.pmInspection.findUnique({
                    where: { clientSyncId: input.clientSyncId },
                    include: inspectionInclude,
                });
            });
            return inspection;
        }
        await this.audit(inspection.id, 'created', input.inspectorUserId, {
            templateId: template.id,
        });
        await this.auditLog.logAudit({ id: input.inspectorUserId, companyId: input.companyId }, audit_actions_1.AuditAction.INSPECTION_CREATED, {
            type: audit_actions_1.AuditEntityType.PM_INSPECTION,
            id: inspection.id,
            tenantId: input.companyId,
        }, { templateId: template.id, projectId: input.projectId });
        return inspection;
    }
    async saveAnswers(id, answers, actorId) {
        const inspection = await this.get(id);
        if (!['draft', 'in_progress'].includes(inspection.status)) {
            throw new common_1.BadRequestException('Inspection is not editable');
        }
        const items = inspection.template.items;
        const pruned = (0, inspection_show_if_1.pruneHiddenChecklistAnswers)(items, answers);
        if (!(0, pm_inspection_kind_util_1.skipChecklistValidation)(inspection.template)) {
            const errors = this.templateEngine.validateRequired(items, pruned);
            if (errors.length) {
                throw new common_1.BadRequestException(errors.join('; '));
            }
        }
        return this.prisma.pmInspection.update({
            where: { id },
            data: {
                answers: pruned,
                status: 'in_progress',
            },
            include: inspectionInclude,
        });
    }
    async addSignature(inspectionId, data) {
        var _a;
        const inspection = await this.get(inspectionId);
        (0, pm_inspection_signature_util_1.assertEditableInspectionStatus)(inspection.status);
        const required = (0, pm_inspection_signature_util_1.parseRequiredSignatures)(inspection.template.requiredSignatures);
        const payload = (0, pm_inspection_signature_util_1.assertSignaturePayload)(data, required);
        const duplicate = await this.prisma.pmInspectionSignature.findFirst({
            where: { inspectionId, role: payload.role },
        });
        if (duplicate) {
            throw new common_1.BadRequestException(`Signature already recorded: ${payload.role}`);
        }
        if (payload.coreFileId) {
            const file = await this.prisma.coreFile.findUnique({
                where: { id: payload.coreFileId },
            });
            if (!file || file.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Signature upload file not found');
            }
        }
        const created = await this.prisma.pmInspectionSignature.create({
            data: {
                inspectionId,
                role: payload.role,
                signatureData: payload.signatureData,
                coreFileId: payload.coreFileId,
                signerName: data.signerName,
                signerUserId: data.signerUserId,
                clientSyncId: data.clientSyncId,
            },
            include: {
                coreFile: { select: { id: true, publicUrl: true, mimeType: true } },
            },
        });
        await this.audit(inspectionId, 'signature_added', data.signerUserId, {
            role: payload.role,
            coreFileId: (_a = payload.coreFileId) !== null && _a !== void 0 ? _a : null,
        });
        return created;
    }
    async addAttachment(inspectionId, data) {
        await this.get(inspectionId);
        return this.prisma.pmInspectionAttachment.create({
            data: Object.assign(Object.assign({ inspectionId }, data), { annotationJson: data.annotationJson }),
        });
    }
    async submit(id, actorId) {
        const inspection = await this.get(id);
        if (inspection.submittedAt ||
            !['draft', 'in_progress'].includes(inspection.status)) {
            throw new common_1.BadRequestException('Inspection already submitted');
        }
        const items = inspection.template.items;
        const answers = inspection.answers;
        const scoringRules = inspection.template.scoringRules;
        const reqSigs = (0, pm_inspection_signature_util_1.parseRequiredSignatures)(inspection.template.requiredSignatures);
        const sigs = await this.prisma.pmInspectionSignature.findMany({
            where: { inspectionId: id },
        });
        (0, pm_inspection_signature_util_1.assertAllRequiredSignaturesPresent)(reqSigs, sigs);
        const score = this.scoring.score(inspection.template.scoringMode, items, answers, scoringRules);
        if ((0, pm_inspection_kind_util_1.isPhotoFirstTemplate)(inspection.template)) {
            const attachments = await this.prisma.pmInspectionAttachment.findMany({
                where: { inspectionId: id },
                select: { annotationJson: true, mimeType: true, dataUrl: true },
            });
            const photos = attachments.filter((a) => { var _a; return a.dataUrl || ((_a = a.mimeType) === null || _a === void 0 ? void 0 : _a.startsWith('image/')); });
            const atRiskCount = photos.filter((a) => {
                const ann = a.annotationJson;
                return (ann === null || ann === void 0 ? void 0 : ann.safetyStatus) === 'at_risk';
            }).length;
            score.passed = atRiskCount === 0;
            score.riskScore = Math.min(100, atRiskCount * 20 + (100 - score.scorePercent));
            score.requiresSupervisorReview =
                atRiskCount > 0 || score.requiresSupervisorReview;
            if ((0, pm_inspection_kind_util_1.isSmartSiteTemplate)(inspection.template)) {
                score.scorePercent =
                    atRiskCount === 0 ? 100 : Math.max(0, 100 - atRiskCount * 15);
            }
        }
        const status = score.requiresSupervisorReview
            ? 'review_required'
            : 'submitted';
        const updated = await this.prisma.pmInspection.update({
            where: { id },
            data: {
                scorePercent: score.scorePercent,
                passed: score.passed,
                riskScore: score.riskScore,
                requiresSupervisorReview: score.requiresSupervisorReview,
                status,
                submittedAt: new Date(),
            },
            include: inspectionInclude,
        });
        await this.createDeficienciesFromFailedItems(updated, items, score.failedItemIds, actorId);
        if (updated.equipmentId) {
            await this.equipment.applyLockoutIfNeeded(id, actorId);
        }
        await this.audit(id, 'submitted', actorId, {
            score,
        });
        await this.auditLog.logAudit({ id: actorId, companyId: updated.companyId }, audit_actions_1.AuditAction.INSPECTION_SUBMITTED, {
            type: audit_actions_1.AuditEntityType.PM_INSPECTION,
            id,
            tenantId: updated.companyId,
        }, {
            scorePercent: score.scorePercent,
            passed: score.passed,
            status,
        });
        await this.completedEvents.emitOnceOnSubmit({
            inspectionId: id,
            companyId: updated.companyId,
            projectId: updated.projectId,
            actorId,
            score,
            signatures: sigs,
            checklistItems: items,
        });
        await this.processPostSubmitAutomations(id, actorId);
        return this.get(id);
    }
    async processPostSubmitAutomations(inspectionId, actorId) {
        var _a, _b;
        try {
            const incident = await this.inspectionIncidents.createDraftIfCriticalOnSubmit(inspectionId, actorId);
            if (incident && !incident.existing) {
                await this.audit(inspectionId, 'auto_escalated_to_incident', actorId, {
                    eventId: incident.eventId,
                });
                const insp = await this.prisma.pmInspection.findUnique({
                    where: { id: inspectionId },
                    select: { companyId: true },
                });
                await this.auditLog.logAudit({ id: actorId, companyId: (_a = insp === null || insp === void 0 ? void 0 : insp.companyId) !== null && _a !== void 0 ? _a : null }, audit_actions_1.AuditAction.INSPECTION_AUTO_INCIDENT, {
                    type: audit_actions_1.AuditEntityType.PM_INSPECTION,
                    id: inspectionId,
                    tenantId: insp === null || insp === void 0 ? void 0 : insp.companyId,
                }, { eventId: incident.eventId, auto: true });
            }
        }
        catch (_c) {
        }
        try {
            const meeting = await this.inspectionMeetings.createDraftIfFailedOnSubmit(inspectionId, actorId);
            if (meeting && !meeting.existing) {
                await this.audit(inspectionId, 'auto_safety_meeting', actorId, {
                    meetingId: meeting.meetingId,
                });
                const insp = await this.prisma.pmInspection.findUnique({
                    where: { id: inspectionId },
                    select: { companyId: true },
                });
                await this.auditLog.logAudit({ id: actorId, companyId: (_b = insp === null || insp === void 0 ? void 0 : insp.companyId) !== null && _b !== void 0 ? _b : null }, audit_actions_1.AuditAction.INSPECTION_AUTO_MEETING, {
                    type: audit_actions_1.AuditEntityType.PM_INSPECTION,
                    id: inspectionId,
                    tenantId: insp === null || insp === void 0 ? void 0 : insp.companyId,
                }, { meetingId: meeting.meetingId, auto: true });
            }
        }
        catch (_d) {
        }
    }
    async createDeficienciesFromFailedItems(inspection, items, failedItemIds, actorId) {
        var _a, _b, _c, _d, _e;
        for (const itemId of failedItemIds) {
            const item = items.find((i) => i.id === itemId);
            if (!item)
                continue;
            const severity = this.deficiencyScoring.severityForFailedItem(item, inspection.template.category);
            const dueAt = this.deficiencyScoring.dueDateFor(severity);
            const deficiency = await this.prisma.pmInspectionDeficiency.create({
                data: {
                    inspectionId: inspection.id,
                    itemId,
                    title: `Failed: ${item.label}`,
                    description: String((_a = inspection.answers[`${itemId}_notes`]) !== null && _a !== void 0 ? _a : '') || undefined,
                    severity,
                    category: inspection.template.category,
                    dueAt,
                    autoGenerated: true,
                },
            });
            if (this.capaAuto) {
                await this.capaAuto.fromInspectionDeficiency(deficiency.id, actorId);
            }
            else {
                const cailEntry = await this.cail.emitFromDeficiency({
                    projectId: inspection.projectId,
                    ownerCompanyId: inspection.companyId,
                    inspectionId: inspection.id,
                    deficiencyId: deficiency.id,
                    title: deficiency.title,
                    description: (_b = deficiency.description) !== null && _b !== void 0 ? _b : undefined,
                    severity,
                    createdByUserId: actorId,
                    siteId: (_c = inspection.siteId) !== null && _c !== void 0 ? _c : undefined,
                    equipmentId: (_d = inspection.equipmentId) !== null && _d !== void 0 ? _d : undefined,
                    workerId: (_e = inspection.workerId) !== null && _e !== void 0 ? _e : undefined,
                    dueDate: dueAt,
                });
                await this.prisma.pmInspectionDeficiency.update({
                    where: { id: deficiency.id },
                    data: { cailEntryId: cailEntry.id },
                });
            }
            if (pm_inspections_equipment_service_1.PmInspectionsEquipmentService.severityRequiresLockout(severity)) {
                await this.equipment.applyLockoutIfNeeded(inspection.id, actorId);
            }
            await this.ingestion.ingestDeficiencyToSif(deficiency.id, actorId);
        }
    }
    async review(id, action, actorId, notes) {
        const inspection = await this.get(id);
        if (inspection.status !== 'review_required' &&
            inspection.status !== 'submitted') {
            throw new common_1.BadRequestException('Inspection not in review state');
        }
        let status;
        if (action === 'approve')
            status = 'approved';
        else if (action === 'reject')
            status = 'rejected';
        else
            status = 'in_progress';
        await this.prisma.pmInspection.update({
            where: { id },
            data: Object.assign({ status, reviewNotes: notes, reviewedByUserId: actorId, reviewedAt: new Date() }, (action === 'approve' ? { closedAt: new Date() } : {})),
        });
        await this.audit(id, `review_${action}`, actorId, { notes });
        return this.get(id);
    }
    async createManualDeficiency(inspectionId, data, actorId) {
        var _a, _b, _c, _d;
        const inspection = await this.get(inspectionId);
        const severity = (_a = data.severity) !== null && _a !== void 0 ? _a : 'medium';
        const deficiency = await this.prisma.pmInspectionDeficiency.create({
            data: {
                inspectionId,
                itemId: data.itemId,
                title: data.title,
                description: data.description,
                severity,
                category: inspection.template.category,
                status: data.assignedUserId || data.assignedWorkerId ? 'assigned' : 'open',
                assignedUserId: data.assignedUserId,
                assignedWorkerId: data.assignedWorkerId,
                subcontractorCompanyId: data.subcontractorCompanyId,
                dueAt: this.deficiencyScoring.dueDateFor(severity),
                autoGenerated: false,
            },
        });
        const cailEntry = await this.cail.emitFromDeficiency({
            projectId: inspection.projectId,
            ownerCompanyId: inspection.companyId,
            inspectionId,
            deficiencyId: deficiency.id,
            title: data.title,
            description: data.description,
            severity,
            createdByUserId: actorId,
            siteId: (_b = inspection.siteId) !== null && _b !== void 0 ? _b : undefined,
            equipmentId: (_c = inspection.equipmentId) !== null && _c !== void 0 ? _c : undefined,
            assignedUserId: data.assignedUserId,
            dueDate: (_d = deficiency.dueAt) !== null && _d !== void 0 ? _d : undefined,
        });
        await this.prisma.pmInspectionDeficiency.update({
            where: { id: deficiency.id },
            data: { cailEntryId: cailEntry.id },
        });
        if (actorId) {
            await this.ingestion.ingestDeficiencyToSif(deficiency.id, actorId);
        }
        return deficiency;
    }
    async verifyDeficiency(deficiencyId, actorId) {
        const def = await this.prisma.pmInspectionDeficiency.findUnique({
            where: { id: deficiencyId },
        });
        if (!def)
            throw new common_1.NotFoundException('Deficiency not found');
        return this.prisma.pmInspectionDeficiency.update({
            where: { id: deficiencyId },
            data: {
                status: 'closed',
                verifiedAt: new Date(),
                closedAt: new Date(),
            },
        });
    }
    async analytics(projectId) {
        const since90 = new Date(Date.now() - 90 * 86400000);
        const [total, failed, openDef, byCategory, recent90, closed90] = await Promise.all([
            this.prisma.pmInspection.count({
                where: { projectId, deletedAt: null },
            }),
            this.prisma.pmInspection.count({
                where: { projectId, deletedAt: null, passed: false },
            }),
            this.prisma.pmInspectionDeficiency.count({
                where: {
                    inspection: { projectId, deletedAt: null },
                    status: { not: 'closed' },
                },
            }),
            this.prisma.pmInspectionDeficiency.groupBy({
                by: ['severity'],
                where: { inspection: { projectId, deletedAt: null } },
                _count: true,
            }),
            this.prisma.pmInspection.count({
                where: { projectId, deletedAt: null, createdAt: { gte: since90 } },
            }),
            this.prisma.pmInspectionDeficiency.count({
                where: {
                    inspection: { projectId, deletedAt: null },
                    closedAt: { gte: since90 },
                },
            }),
        ]);
        const templateDist = await this.prisma.pmInspection.groupBy({
            by: ['templateId'],
            where: { projectId, deletedAt: null },
            _count: true,
        });
        const inspectorDist = await this.prisma.pmInspection.groupBy({
            by: ['inspectorUserId'],
            where: { projectId, deletedAt: null },
            _count: true,
        });
        return {
            totalInspections: total,
            failedInspections: failed,
            openDeficiencies: openDef,
            deficiencyBySeverity: byCategory,
            inspectionsByTemplate: templateDist,
            passRate: total > 0 ? Math.round(((total - failed) / total) * 100) : 100,
            trends: {
                inspections90d: recent90,
                deficienciesClosed90d: closed90,
                deficiencyRate90d: recent90 > 0
                    ? Math.round((openDef / Math.max(1, openDef + closed90)) * 100)
                    : 0,
            },
            complianceScore: total > 0 ? Math.round(((total - failed) / total) * 100) : 100,
            inspectorCount: inspectorDist.length,
        };
    }
    async workerAccessCheck(workerId, projectId) {
        const critical = await this.prisma.pmInspectionDeficiency.count({
            where: {
                status: { not: 'closed' },
                severity: 'critical',
                inspection: { projectId, workerId },
            },
        });
        const assignedEquipment = await this.prisma.equipmentAssignment.findMany({
            where: { workerId, endedAt: null, equipmentId: { not: null } },
            select: { equipmentId: true },
        });
        const equipmentIds = assignedEquipment
            .map((a) => a.equipmentId)
            .filter((id) => id != null);
        const overdueEquipment = equipmentIds.length > 0
            ? await this.prisma.equipment.count({
                where: {
                    id: { in: equipmentIds },
                    nextInspectionAt: { lt: new Date() },
                },
            })
            : 0;
        const openCriticalOnEquipment = equipmentIds.length > 0
            ? await this.prisma.pmInspectionDeficiency.count({
                where: {
                    status: { not: 'closed' },
                    severity: 'critical',
                    inspection: { projectId, equipmentId: { in: equipmentIds } },
                },
            })
            : 0;
        const allowed = critical === 0 && openCriticalOnEquipment === 0 && overdueEquipment === 0;
        return {
            allowed,
            openCriticalDeficiencies: critical + openCriticalOnEquipment,
            overdueEquipmentCount: overdueEquipment,
        };
    }
    async syncOffline(payload) {
        const existing = await this.prisma.pmInspection.findUnique({
            where: { clientSyncId: payload.clientSyncId },
        });
        if (existing) {
            if (existing.companyId !== payload.companyId) {
                throw new common_1.ForbiddenException('Cross-tenant inspection sync denied');
            }
            if (payload.submitted && existing.status === 'draft') {
                await this.saveAnswers(existing.id, payload.answers, payload.inspectorUserId);
                return this.submit(existing.id, payload.inspectorUserId);
            }
            return this.get(existing.id);
        }
        const created = await this.createFromTemplate({
            templateId: payload.templateId,
            companyId: payload.companyId,
            projectId: payload.projectId,
            inspectorUserId: payload.inspectorUserId,
            siteId: payload.siteId,
            equipmentId: payload.equipmentId,
            workerId: payload.workerId,
            clientSyncId: payload.clientSyncId,
        });
        await this.saveAnswers(created.id, payload.answers, payload.inspectorUserId);
        if (payload.signatures) {
            for (const sig of payload.signatures) {
                await this.addSignature(created.id, sig);
            }
        }
        if (payload.submitted) {
            return this.submit(created.id, payload.inspectorUserId);
        }
        return this.get(created.id);
    }
    async escalateToIncident(inspectionId, actorId, body) {
        const inspection = await this.get(inspectionId);
        const result = await this.inspectionIncidents.createDraftIncidentFromInspection(inspection, actorId, {
            title: body === null || body === void 0 ? void 0 : body.title,
            description: body === null || body === void 0 ? void 0 : body.description,
            auto: false,
        });
        if (!result.existing) {
            await this.audit(inspectionId, 'escalated_to_incident', actorId, {
                eventId: result.eventId,
            });
            await this.auditLog.logAudit({ id: actorId, companyId: inspection.companyId }, audit_actions_1.AuditAction.INSPECTION_ESCALATED, {
                type: audit_actions_1.AuditEntityType.PM_INSPECTION,
                id: inspectionId,
                tenantId: inspection.companyId,
            }, { eventId: result.eventId, auto: false });
        }
        return {
            inspectionId,
            eventId: result.eventId,
            existing: result.existing,
            event: result.event,
        };
    }
    async updateSharing(id, sharing) {
        const inspection = await this.get(id);
        const current = (0, pm_inspection_sharing_types_1.parseInspectionSharing)(inspection.sharingJson);
        const next = Object.assign(Object.assign({}, current), sharing);
        return this.prisma.pmInspection.update({
            where: { id },
            data: { sharingJson: next },
            include: inspectionInclude,
        });
    }
};
exports.PmInspectionsService = PmInspectionsService;
exports.PmInspectionsService = PmInspectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(12, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_inspection_templates_service_1.PmInspectionTemplatesService,
        inspection_template_engine_1.InspectionTemplateEngine,
        inspection_scoring_engine_1.InspectionScoringEngine,
        deficiency_scoring_engine_1.DeficiencyScoringEngine,
        pm_inspections_cail_service_1.PmInspectionsCailService,
        pm_inspections_equipment_service_1.PmInspectionsEquipmentService,
        pm_inspections_ingestion_service_1.PmInspectionsIngestionService,
        pm_inspection_incident_service_1.PmInspectionIncidentService,
        pm_inspection_meeting_service_1.PmInspectionMeetingService,
        pm_inspection_completed_event_service_1.PmInspectionCompletedEventService,
        audit_log_service_1.AuditLogService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService])
], PmInspectionsService);
//# sourceMappingURL=pm-inspections.service.js.map