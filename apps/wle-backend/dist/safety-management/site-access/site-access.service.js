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
exports.SiteAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const sif_heca_service_1 = require("../../sif-heca/sif-heca.service");
const pm_inspections_service_1 = require("../../pm-inspections/pm-inspections.service");
const pm_safety_events_service_1 = require("../../pm-safety-events/pm-safety-events.service");
const pm_corrective_actions_service_1 = require("../../pm-corrective-actions/pm-corrective-actions.service");
const pm_document_control_service_1 = require("../../pm-document-control/pm-document-control.service");
const pm_equipment_safety_service_1 = require("../../pm-equipment-safety/pm-equipment-safety.service");
const pm_emergency_response_service_1 = require("../../pm-emergency-response/pm-emergency-response.service");
const pm_site_access_control_service_1 = require("../../pm-site-access-control/pm-site-access-control.service");
let SiteAccessService = class SiteAccessService {
    constructor(prisma, sifHeca, pmInspections, pmSafetyEvents, pmCapa, pmDocuments, pmEquipment, pmEmergency, pmSiteAccess) {
        this.prisma = prisma;
        this.sifHeca = sifHeca;
        this.pmInspections = pmInspections;
        this.pmSafetyEvents = pmSafetyEvents;
        this.pmCapa = pmCapa;
        this.pmDocuments = pmDocuments;
        this.pmEquipment = pmEquipment;
        this.pmEmergency = pmEmergency;
        this.pmSiteAccess = pmSiteAccess;
    }
    async listRules(projectId) {
        return this.prisma.siteAccessRule.findMany({
            where: { projectId, active: true },
            orderBy: { zoneCode: 'asc' },
        });
    }
    async upsertRule(data) {
        var _a, _b, _c, _d;
        const zoneCode = (_a = data.zoneCode) !== null && _a !== void 0 ? _a : 'SITE';
        return this.prisma.siteAccessRule.upsert({
            where: {
                projectId_zoneCode: { projectId: data.projectId, zoneCode },
            },
            create: {
                projectId: data.projectId,
                zoneCode,
                requiresFlhaHours: (_b = data.requiresFlhaHours) !== null && _b !== void 0 ? _b : 24,
                requiresTrainingCodes: ((_c = data.requiresTrainingCodes) !== null && _c !== void 0 ? _c : []),
                requiresOrientation: (_d = data.requiresOrientation) !== null && _d !== void 0 ? _d : true,
            },
            update: {
                requiresFlhaHours: data.requiresFlhaHours,
                requiresTrainingCodes: data.requiresTrainingCodes,
                requiresOrientation: data.requiresOrientation,
                active: true,
            },
        });
    }
    async evaluateAccess(input) {
        var _a, _b, _c;
        if (this.pmSiteAccess) {
            const result = await this.pmSiteAccess.validateAccess({
                workerId: input.workerId,
                projectId: input.projectId,
                zoneCode: input.zoneCode,
                equipmentId: input.equipmentId,
                accessPointId: input.accessPointId,
                recordAttempt: true,
            });
            return {
                granted: result.granted,
                denialReasons: result.denialReasons,
                checks: result.checks,
            };
        }
        const zoneCode = (_a = input.zoneCode) !== null && _a !== void 0 ? _a : 'SITE';
        const rule = await this.prisma.siteAccessRule.findUnique({
            where: {
                projectId_zoneCode: {
                    projectId: input.projectId,
                    zoneCode,
                },
            },
        });
        const effectiveRule = rule !== null && rule !== void 0 ? rule : {
            requiresFlhaHours: 24,
            requiresOrientation: true,
            requiresTrainingCodes: [],
        };
        const denialReasons = [];
        const checks = {};
        if (effectiveRule.requiresOrientation) {
            const orientation = await this.prisma.safetyForm.findFirst({
                where: {
                    workerId: input.workerId,
                    projectId: input.projectId,
                    definitionId: 'site-orientation',
                    status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
                },
                orderBy: { submittedAt: 'desc' },
            });
            checks.orientation = !!orientation;
            if (!orientation) {
                denialReasons.push('Site orientation not completed');
            }
        }
        else {
            checks.orientation = true;
        }
        const codes = Array.isArray(effectiveRule.requiresTrainingCodes)
            ? effectiveRule.requiresTrainingCodes
            : [];
        if (codes.length > 0) {
            const records = await this.prisma.trainingRecord.findMany({
                where: {
                    workerId: input.workerId,
                    OR: [{ projectId: input.projectId }, { projectId: null }],
                },
                include: { certification: { select: { code: true, name: true } } },
            });
            const now = new Date();
            for (const code of codes) {
                const match = records.find((r) => (r.certification.code === code ||
                    r.certification.name.toLowerCase() === code.toLowerCase()) &&
                    (!r.expiresAt || r.expiresAt > now));
                checks[`training_${code}`] = !!match;
                if (!match) {
                    denialReasons.push(`Missing or expired training: ${code}`);
                }
            }
        }
        const hours = (_b = effectiveRule.requiresFlhaHours) !== null && _b !== void 0 ? _b : 24;
        const flhaSince = new Date(Date.now() - hours * 60 * 60 * 1000);
        const flhaForm = await this.prisma.safetyForm.findFirst({
            where: {
                workerId: input.workerId,
                projectId: input.projectId,
                definitionId: 'daily-flha',
                status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
                submittedAt: { gte: flhaSince },
            },
        });
        const flhaJha = await this.prisma.jhaFlha.findFirst({
            where: {
                projectId: input.projectId,
                kind: 'FLHA',
                status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED', 'UNDER_REVIEW'] },
                workers: { some: { workerId: input.workerId } },
                OR: [
                    { approvedAt: { gte: flhaSince } },
                    { submittedAt: { gte: flhaSince } },
                ],
            },
        });
        checks.flha = !!(flhaForm || flhaJha);
        if (!checks.flha) {
            denialReasons.push(`FLHA not completed within last ${hours} hours`);
        }
        if (this.sifHeca) {
            const sifAccess = await this.sifHeca.workerAccessCheck(input.workerId, input.projectId);
            checks.sifEngine = sifAccess.allowed;
            if (!sifAccess.allowed) {
                denialReasons.push(`Open SIF/HECA items: ${sifAccess.openCriticalEvents} events, ${sifAccess.openCorrectiveActions} CAPA`);
            }
        }
        if (this.pmInspections) {
            const inspAccess = await this.pmInspections.workerAccessCheck(input.workerId, input.projectId);
            checks.pmInspections = inspAccess.allowed;
            if (!inspAccess.allowed) {
                denialReasons.push(`Inspection gate: ${inspAccess.openCriticalDeficiencies} critical deficiencies, ${inspAccess.overdueEquipmentCount} overdue equipment inspections`);
            }
        }
        if (this.pmSafetyEvents) {
            const eventAccess = await this.pmSafetyEvents.workerAccessCheck(input.workerId, input.projectId);
            checks.pmSafetyEvents = eventAccess.allowed;
            if (!eventAccess.allowed) {
                denialReasons.push(`Safety event gate: ${eventAccess.criticalEventsWithoutClearance} critical events, ${eventAccess.openCorrectiveActions} open CAPA`);
            }
        }
        if (this.pmCapa) {
            const capaAccess = await this.pmCapa.workerAccessCheck(input.workerId, input.projectId);
            checks.pmCorrectiveActions = capaAccess.allowed;
            if (!capaAccess.allowed) {
                denialReasons.push(`CAPA gate: ${capaAccess.criticalOpen} critical open, ${capaAccess.overdueCount} overdue`);
            }
        }
        if (this.pmDocuments) {
            const docAccess = await this.pmDocuments.workerAccessCheck(input.workerId, input.projectId);
            checks.pmDocumentControl = docAccess.allowed;
            if (!docAccess.allowed) {
                if (docAccess.missingPolicyAcks > 0) {
                    denialReasons.push(`Required policy acknowledgments missing: ${docAccess.missingPolicyAcks}`);
                }
                if (docAccess.missingSdsAcks > 0) {
                    denialReasons.push(`Required SDS review acknowledgments missing: ${docAccess.missingSdsAcks}`);
                }
            }
        }
        if (this.pmEquipment) {
            const eqAccess = await this.pmEquipment.workerAccessCheck(input.workerId, input.projectId);
            checks.pmEquipmentSafety = eqAccess.allowed;
            if (!eqAccess.allowed) {
                denialReasons.push(`Equipment safety gate: ${eqAccess.blockedEquipmentCount} assigned asset(s) blocked — ${eqAccess.reasons.join('; ')}`);
            }
        }
        if (this.pmEmergency) {
            const emAccess = await this.pmEmergency.workerAccessCheck(input.workerId, input.projectId);
            checks.pmEmergencyResponse = emAccess.allowed;
            if (!emAccess.allowed) {
                denialReasons.push((_c = emAccess.reason) !== null && _c !== void 0 ? _c : 'Emergency response gate failed');
            }
        }
        const meetingRequirements = await this.prisma.siteAccessMeetingRequirement.findMany({
            where: { projectId: input.projectId, active: true, zoneCode },
        });
        for (const req of meetingRequirements) {
            const windowStart = new Date(Date.now() - req.windowHours * 60 * 60 * 1000);
            const attended = await this.prisma.safetyMeetingAttendee.findFirst({
                where: {
                    workerId: input.workerId,
                    status: 'present',
                    checkedInAt: { gte: windowStart },
                    meeting: {
                        projectId: input.projectId,
                        meetingType: req.meetingType,
                        status: { in: ['completed', 'reviewed', 'locked'] },
                    },
                },
            });
            const key = `meeting_${req.meetingType}`;
            checks[key] = !!attended;
            if (!attended) {
                denialReasons.push(`Required ${req.meetingType} meeting not attended in last ${req.windowHours}h`);
            }
        }
        const openSif = await this.prisma.cailEntry.count({
            where: {
                projectId: input.projectId,
                workerId: input.workerId,
                status: { in: ['open', 'in_progress', 'overdue'] },
                OR: [{ severity: 'critical' }, { sourceType: 'sif' }],
            },
        });
        checks.noOpenSif = openSif === 0;
        if (openSif > 0) {
            denialReasons.push('Open SIF-priority corrective action on record');
        }
        const granted = denialReasons.length === 0;
        return { granted, denialReasons, checks };
    }
    async grantAccess(input) {
        var _a, _b;
        const evaluation = (_a = input.evaluation) !== null && _a !== void 0 ? _a : (await this.evaluateAccess({
            workerId: input.workerId,
            projectId: input.projectId,
            zoneCode: input.zoneCode,
        }));
        const expiresAt = input.expiresInHours
            ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
        return this.prisma.siteAccessGrant.create({
            data: {
                workerId: input.workerId,
                projectId: input.projectId,
                zoneCode: (_b = input.zoneCode) !== null && _b !== void 0 ? _b : 'SITE',
                grantedByUserId: input.grantedByUserId,
                sourceFormId: input.sourceFormId,
                expiresAt,
                evaluationJson: evaluation,
            },
        });
    }
    async revokeGrant(grantId) {
        return this.prisma.siteAccessGrant.update({
            where: { id: grantId },
            data: { revokedAt: new Date() },
        });
    }
    async listGrants(projectId, workerId) {
        return this.prisma.siteAccessGrant.findMany({
            where: {
                projectId,
                workerId,
                revokedAt: null,
            },
            include: {
                worker: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { grantedAt: 'desc' },
            take: 200,
        });
    }
    async processWorkerSiteAccessForm(input) {
        const evaluation = await this.evaluateAccess({
            workerId: input.workerId,
            projectId: input.projectId,
        });
        const formSaysGrant = input.formData.accessGranted === true;
        const orientationOk = input.formData.orientationVerified === true;
        const trainingOk = input.formData.trainingVerified === true;
        if (!orientationOk)
            evaluation.denialReasons.push('Orientation not verified on form');
        if (!trainingOk)
            evaluation.denialReasons.push('Training not verified on form');
        evaluation.granted = formSaysGrant && evaluation.denialReasons.length === 0;
        let grant = null;
        if (evaluation.granted) {
            grant = await this.grantAccess({
                workerId: input.workerId,
                projectId: input.projectId,
                grantedByUserId: input.actorUserId,
                sourceFormId: input.formId,
                evaluation,
            });
        }
        return { evaluation, grant };
    }
    async ensureDefaultRule(projectId) {
        const existing = await this.prisma.siteAccessRule.findFirst({
            where: { projectId },
        });
        if (existing)
            return existing;
        return this.upsertRule({ projectId });
    }
};
exports.SiteAccessService = SiteAccessService;
exports.SiteAccessService = SiteAccessService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __param(7, (0, common_1.Optional)()),
    __param(8, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sif_heca_service_1.SifHecaService,
        pm_inspections_service_1.PmInspectionsService,
        pm_safety_events_service_1.PmSafetyEventsService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        pm_document_control_service_1.PmDocumentControlService,
        pm_equipment_safety_service_1.PmEquipmentSafetyService,
        pm_emergency_response_service_1.PmEmergencyResponseService,
        pm_site_access_control_service_1.PmSiteAccessControlService])
], SiteAccessService);
//# sourceMappingURL=site-access.service.js.map