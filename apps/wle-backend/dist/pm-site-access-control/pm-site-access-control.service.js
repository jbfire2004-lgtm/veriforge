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
exports.PmSiteAccessControlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sif_heca_service_1 = require("../sif-heca/sif-heca.service");
const pm_inspections_service_1 = require("../pm-inspections/pm-inspections.service");
const pm_safety_events_service_1 = require("../pm-safety-events/pm-safety-events.service");
const pm_corrective_actions_service_1 = require("../pm-corrective-actions/pm-corrective-actions.service");
const pm_document_control_service_1 = require("../pm-document-control/pm-document-control.service");
const pm_equipment_safety_service_1 = require("../pm-equipment-safety/pm-equipment-safety.service");
const pm_emergency_response_service_1 = require("../pm-emergency-response/pm-emergency-response.service");
const pm_project_safety_context_service_1 = require("../pm-project-safety-context/pm-project-safety-context.service");
const pm_company_safety_context_service_1 = require("../pm-company-safety-context/pm-company-safety-context.service");
const access_decision_engine_1 = require("./access-decision.engine");
const zone_access_rules_engine_1 = require("./zone-access-rules.engine");
const pm_site_access_cail_intelligence_service_1 = require("./pm-site-access-cail-intelligence.service");
let PmSiteAccessControlService = class PmSiteAccessControlService {
    constructor(prisma, cail, sifHeca, pmInspections, pmSafetyEvents, pmCapa, pmDocuments, pmEquipment, pmEmergency, pmProjectContext, pmCompanyContext) {
        this.prisma = prisma;
        this.cail = cail;
        this.sifHeca = sifHeca;
        this.pmInspections = pmInspections;
        this.pmSafetyEvents = pmSafetyEvents;
        this.pmCapa = pmCapa;
        this.pmDocuments = pmDocuments;
        this.pmEquipment = pmEquipment;
        this.pmEmergency = pmEmergency;
        this.pmProjectContext = pmProjectContext;
        this.pmCompanyContext = pmCompanyContext;
        this.decisionEngine = new access_decision_engine_1.AccessDecisionEngine();
        this.zoneEngine = new zone_access_rules_engine_1.ZoneAccessRulesEngine();
    }
    async audit(entityType, entityId, eventType, actorId, payload) {
        await this.prisma.pmAccessAuditLog.create({
            data: {
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async validateAccess(input) {
        var _a, _b, _c, _d, _e, _f;
        const zoneCode = (_a = input.zoneCode) !== null && _a !== void 0 ? _a : 'SITE';
        const project = await this.prisma.project.findUnique({
            where: { id: input.projectId },
            include: { site: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const denialReasons = [];
        const checks = {};
        const override = await this.findActiveOverride({
            projectId: input.projectId,
            workerId: input.workerId,
            zoneCode,
            equipmentId: input.equipmentId,
        });
        const rule = await this.prisma.siteAccessRule.findUnique({
            where: {
                projectId_zoneCode: { projectId: input.projectId, zoneCode },
            },
        });
        const effectiveRule = rule !== null && rule !== void 0 ? rule : {
            requiresFlhaHours: 24,
            requiresOrientation: true,
            requiresTrainingCodes: [],
            requiresJha: false,
            requiresSdsAck: false,
            requiresPermitIds: [],
            highRisk: false,
            zoneType: 'general_work',
            timeWindowStart: null,
            timeWindowEnd: null,
        };
        if (rule) {
            const timeErr = this.zoneEngine.evaluateTimeWindow({
                timeWindowStart: rule.timeWindowStart,
                timeWindowEnd: rule.timeWindowEnd,
                requiresJha: rule.requiresJha,
                requiresSdsAck: rule.requiresSdsAck,
                requiresPermitIds: (_b = rule.requiresPermitIds) !== null && _b !== void 0 ? _b : [],
                requiredPpe: (_c = rule.requiredPpe) !== null && _c !== void 0 ? _c : [],
            });
            if (timeErr) {
                denialReasons.push(timeErr);
                checks.timeWindow = false;
            }
            else {
                checks.timeWindow = true;
            }
        }
        if (effectiveRule.requiresOrientation) {
            const orientation = await this.prisma.safetyForm.findFirst({
                where: {
                    workerId: input.workerId,
                    projectId: input.projectId,
                    definitionId: 'site-orientation',
                    status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CLOSED'] },
                },
            });
            checks.orientation = !!orientation;
            if (!orientation)
                denialReasons.push('Site orientation not completed');
        }
        const codes = Array.isArray(effectiveRule.requiresTrainingCodes)
            ? effectiveRule.requiresTrainingCodes
            : [];
        const now = new Date();
        for (const code of codes) {
            const records = await this.prisma.trainingRecord.findMany({
                where: {
                    workerId: input.workerId,
                    OR: [{ projectId: input.projectId }, { projectId: null }],
                },
                include: { certification: { select: { code: true, name: true } } },
            });
            const match = records.find((r) => (r.certification.code === code ||
                r.certification.name.toLowerCase() === code.toLowerCase()) &&
                (!r.expiresAt || r.expiresAt > now));
            checks[`training_${code}`] = !!match;
            if (!match)
                denialReasons.push(`Missing or expired training: ${code}`);
        }
        const hours = (_d = effectiveRule.requiresFlhaHours) !== null && _d !== void 0 ? _d : 24;
        const flhaSince = new Date(Date.now() - hours * 60 * 60 * 1000);
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
        checks.flha = !!flhaJha;
        if (!checks.flha) {
            denialReasons.push(`FLHA/JHA not completed within last ${hours} hours`);
        }
        if (effectiveRule.requiresJha) {
            const jha = await this.prisma.jhaFlha.findFirst({
                where: {
                    projectId: input.projectId,
                    status: { in: ['APPROVED', 'LOCKED'] },
                    workers: { some: { workerId: input.workerId } },
                },
                include: { signatures: true },
            });
            checks.jha = !!jha;
            if (!jha) {
                denialReasons.push('Approved JHA required for zone entry');
            }
            else {
                const supervisorSig = jha.signatures.some((s) => s.role === 'SUPERVISOR');
                checks.jhaSupervisorSig = supervisorSig;
                if (!supervisorSig) {
                    denialReasons.push('JHA missing supervisor approval signature');
                }
            }
        }
        if (effectiveRule.requiresSdsAck && this.pmDocuments) {
            const doc = await this.pmDocuments.workerAccessCheck(input.workerId, input.projectId);
            checks.sdsAck = doc.missingSdsAcks === 0;
            if (doc.missingSdsAcks > 0) {
                denialReasons.push('SDS acknowledgment required for chemical zone');
            }
        }
        await this.runModuleGates(input.workerId, input.projectId, denialReasons, checks);
        if (input.equipmentId && this.pmEquipment) {
            const eqVal = await this.pmEquipment.validateAssignment({
                workerId: input.workerId,
                equipmentId: input.equipmentId,
                projectId: input.projectId,
            });
            checks.equipment = eqVal.allowed;
            if (!eqVal.allowed) {
                denialReasons.push(...eqVal.failures);
            }
        }
        const workerBanned = await this.prisma.workerSiteAccess.findUnique({
            where: {
                workerId_siteId: {
                    workerId: input.workerId,
                    siteId: (_e = project.siteId) !== null && _e !== void 0 ? _e : 0,
                },
            },
        });
        if (project.siteId && (workerBanned === null || workerBanned === void 0 ? void 0 : workerBanned.status) === 'BANNED') {
            denialReasons.push('Worker banned from site');
            checks.siteBan = false;
        }
        if (this.pmProjectContext) {
            const profileGate = await this.pmProjectContext.enforcementGate(input.projectId, checks);
            checks.projectSafetyProfile = profileGate.allowed;
            if (!profileGate.allowed) {
                denialReasons.push(...profileGate.reasons);
            }
        }
        if (this.pmCompanyContext) {
            const companyGate = await this.pmCompanyContext.enforcementGate(input.workerId, checks);
            checks.companySafetyProfile = companyGate.allowed;
            if (!companyGate.allowed) {
                denialReasons.push(...companyGate.reasons);
            }
        }
        const decided = this.decisionEngine.decide({
            denialReasons,
            checks,
            zoneHighRisk: (_f = effectiveRule.highRisk) !== null && _f !== void 0 ? _f : false,
            hasActiveOverride: !!override,
        });
        let attemptId;
        if (input.recordAttempt !== false) {
            const attempt = await this.prisma.pmAccessAttempt.create({
                data: {
                    companyId: project.companyId,
                    projectId: input.projectId,
                    accessPointId: input.accessPointId,
                    workerId: input.workerId,
                    equipmentId: input.equipmentId,
                    zoneCode,
                    decision: decided.decision,
                    denialReasons: decided.denialReasons,
                    checksJson: decided.checks,
                    overrideId: override === null || override === void 0 ? void 0 : override.id,
                },
            });
            attemptId = attempt.id;
            for (const msg of decided.denialReasons) {
                await this.prisma.pmAccessDenial.create({
                    data: {
                        attemptId: attempt.id,
                        reasonCode: msg.slice(0, 40).replace(/\s+/g, '_'),
                        reasonMessage: msg,
                    },
                });
            }
        }
        return {
            decision: decided.decision,
            granted: decided.decision === 'granted',
            denialReasons: decided.denialReasons,
            checks: decided.checks,
            attemptId,
            overrideId: override === null || override === void 0 ? void 0 : override.id,
        };
    }
    async runModuleGates(workerId, projectId, denialReasons, checks) {
        var _a;
        if (this.pmEmergency) {
            const em = await this.pmEmergency.workerAccessCheck(workerId, projectId);
            checks.emergency = em.allowed;
            if (!em.allowed)
                denialReasons.push((_a = em.reason) !== null && _a !== void 0 ? _a : 'Emergency lock active');
        }
        if (this.sifHeca) {
            const sif = await this.sifHeca.workerAccessCheck(workerId, projectId);
            checks.sif = sif.allowed;
            if (!sif.allowed) {
                denialReasons.push(`SIF/HECA: ${sif.openCriticalEvents} events, ${sif.openCorrectiveActions} CAPA`);
            }
        }
        if (this.pmInspections) {
            const insp = await this.pmInspections.workerAccessCheck(workerId, projectId);
            checks.inspections = insp.allowed;
            if (!insp.allowed) {
                denialReasons.push(`Inspections: ${insp.openCriticalDeficiencies} critical, ${insp.overdueEquipmentCount} overdue equipment`);
            }
        }
        if (this.pmSafetyEvents) {
            const ev = await this.pmSafetyEvents.workerAccessCheck(workerId, projectId);
            checks.safetyEvents = ev.allowed;
            if (!ev.allowed) {
                denialReasons.push(`Safety events: ${ev.criticalEventsWithoutClearance} critical without clearance`);
            }
        }
        if (this.pmCapa) {
            const capa = await this.pmCapa.workerAccessCheck(workerId, projectId);
            checks.capa = capa.allowed;
            if (!capa.allowed) {
                denialReasons.push(`CAPA: ${capa.criticalOpen} critical open, ${capa.overdueCount} overdue`);
            }
        }
        if (this.pmDocuments) {
            const doc = await this.pmDocuments.workerAccessCheck(workerId, projectId);
            checks.documents = doc.allowed;
            if (!doc.allowed) {
                if (doc.missingPolicyAcks > 0) {
                    denialReasons.push(`Policy acks missing: ${doc.missingPolicyAcks}`);
                }
                if (doc.missingSdsAcks > 0) {
                    denialReasons.push(`SDS acks missing: ${doc.missingSdsAcks}`);
                }
            }
        }
        if (this.pmEquipment) {
            const eq = await this.pmEquipment.workerAccessCheck(workerId, projectId);
            checks.equipmentFleet = eq.allowed;
            if (!eq.allowed) {
                denialReasons.push(`Equipment: ${eq.blockedEquipmentCount} blocked — ${eq.reasons.join('; ')}`);
            }
        }
        const meetings = await this.prisma.siteAccessMeetingRequirement.findMany({
            where: { projectId, active: true },
        });
        for (const req of meetings) {
            const windowStart = new Date(Date.now() - req.windowHours * 60 * 60 * 1000);
            const attended = await this.prisma.safetyMeetingAttendee.findFirst({
                where: {
                    workerId,
                    status: 'present',
                    checkedInAt: { gte: windowStart },
                    meeting: {
                        projectId,
                        meetingType: req.meetingType,
                        status: { in: ['completed', 'reviewed', 'locked'] },
                    },
                },
            });
            checks[`meeting_${req.meetingType}`] = !!attended;
            if (!attended) {
                denialReasons.push(`Required ${req.meetingType} meeting not attended (${req.windowHours}h)`);
            }
        }
    }
    async findActiveOverride(input) {
        const now = new Date();
        return this.prisma.pmAccessOverride.findFirst({
            where: {
                projectId: input.projectId,
                active: true,
                revokedAt: null,
                expiresAt: { gt: now },
                OR: [
                    { workerId: input.workerId, zoneCode: null, equipmentId: null },
                    { workerId: input.workerId, zoneCode: input.zoneCode },
                    ...(input.equipmentId ? [{ equipmentId: input.equipmentId }] : []),
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    listAccessPoints(companyId, projectId) {
        return this.prisma.pmAccessPoint.findMany({
            where: { companyId, projectId, deletedAt: null, active: true },
            orderBy: { name: 'asc' },
        });
    }
    async createAccessPoint(data, actorId) {
        const point = await this.prisma.pmAccessPoint.create({
            data: Object.assign(Object.assign({}, data), { geoJson: data.geoJson }),
        });
        await this.audit('access_point', point.id, 'created', actorId);
        return point;
    }
    listZoneRules(projectId) {
        return this.prisma.siteAccessRule.findMany({
            where: { projectId, deletedAt: null },
            orderBy: { zoneCode: 'asc' },
        });
    }
    async upsertZoneRule(data, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const project = await this.prisma.project.findUnique({
            where: { id: data.projectId },
        });
        const zoneCode = (_a = data.zoneCode) !== null && _a !== void 0 ? _a : 'SITE';
        const rule = await this.prisma.siteAccessRule.upsert({
            where: {
                projectId_zoneCode: { projectId: data.projectId, zoneCode },
            },
            create: {
                companyId: project === null || project === void 0 ? void 0 : project.companyId,
                projectId: data.projectId,
                zoneCode,
                zoneType: (_b = data.zoneType) !== null && _b !== void 0 ? _b : 'general_work',
                requiresFlhaHours: (_c = data.requiresFlhaHours) !== null && _c !== void 0 ? _c : 24,
                requiresTrainingCodes: ((_d = data.requiresTrainingCodes) !== null && _d !== void 0 ? _d : []),
                requiresOrientation: (_e = data.requiresOrientation) !== null && _e !== void 0 ? _e : true,
                requiresJha: (_f = data.requiresJha) !== null && _f !== void 0 ? _f : false,
                requiresSdsAck: (_g = data.requiresSdsAck) !== null && _g !== void 0 ? _g : false,
                requiresPermitIds: ((_h = data.requiresPermitIds) !== null && _h !== void 0 ? _h : []),
                requiredPpe: ((_j = data.requiredPpe) !== null && _j !== void 0 ? _j : []),
                highRisk: (_k = data.highRisk) !== null && _k !== void 0 ? _k : false,
                timeWindowStart: data.timeWindowStart,
                timeWindowEnd: data.timeWindowEnd,
                accessPointId: data.accessPointId,
            },
            update: {
                zoneType: data.zoneType,
                requiresFlhaHours: data.requiresFlhaHours,
                requiresTrainingCodes: data.requiresTrainingCodes,
                requiresOrientation: data.requiresOrientation,
                requiresJha: data.requiresJha,
                requiresSdsAck: data.requiresSdsAck,
                requiresPermitIds: data.requiresPermitIds,
                requiredPpe: data.requiredPpe,
                highRisk: data.highRisk,
                timeWindowStart: data.timeWindowStart,
                timeWindowEnd: data.timeWindowEnd,
                accessPointId: data.accessPointId,
                active: true,
            },
        });
        await this.audit('zone_rule', rule.id, 'upserted', actorId);
        return rule;
    }
    async createOverride(data, actorId) {
        var _a, _b;
        if (!((_a = data.reason) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw new common_1.BadRequestException('Override reason is required');
        }
        const rule = await this.prisma.siteAccessRule.findFirst({
            where: { projectId: data.projectId, highRisk: true },
        });
        if (rule && !data.safetyUserId && !data.safetySignature) {
            throw new common_1.BadRequestException('Safety signature required for high-risk zone override');
        }
        const override = await this.prisma.pmAccessOverride.create({
            data: Object.assign(Object.assign({}, data), { supervisorUserId: (_b = data.supervisorUserId) !== null && _b !== void 0 ? _b : actorId, clientSyncId: data.clientSyncId }),
        });
        if (data.attemptId) {
            await this.prisma.pmAccessAttempt.update({
                where: { id: data.attemptId },
                data: { overrideId: override.id },
            });
        }
        await this.audit('override', override.id, 'created', actorId, {
            reason: data.reason,
            attemptId: data.attemptId,
        });
        return override;
    }
    listOverrides(projectId, activeOnly = true) {
        return this.prisma.pmAccessOverride.findMany({
            where: Object.assign({ projectId }, (activeOnly ? { active: true, revokedAt: null } : {})),
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async revokeOverride(id, actorId) {
        const updated = await this.prisma.pmAccessOverride.update({
            where: { id },
            data: { active: false, revokedAt: new Date() },
        });
        await this.audit('override', id, 'revoked', actorId);
        return updated;
    }
    async analytics(projectId) {
        const since = new Date(Date.now() - 30 * 86400000);
        const [attempts, denials, overrides, insights] = await Promise.all([
            this.prisma.pmAccessAttempt.count({
                where: { projectId, createdAt: { gte: since } },
            }),
            this.prisma.pmAccessAttempt.count({
                where: {
                    projectId,
                    decision: { in: ['denied', 'denied_with_reason'] },
                    createdAt: { gte: since },
                },
            }),
            this.prisma.pmAccessOverride.count({
                where: { projectId, createdAt: { gte: since } },
            }),
            this.cail.projectInsights(projectId),
        ]);
        const granted = attempts - denials;
        const compliancePct = attempts > 0 ? Math.round((granted / attempts) * 100) : 100;
        const zoneDenials = await this.prisma.pmAccessAttempt.groupBy({
            by: ['zoneCode'],
            where: {
                projectId,
                decision: { in: ['denied', 'denied_with_reason'] },
                createdAt: { gte: since },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        });
        const workerDenials = await this.prisma.pmAccessAttempt.groupBy({
            by: ['workerId'],
            where: {
                projectId,
                workerId: { not: null },
                decision: { in: ['denied', 'denied_with_reason'] },
                createdAt: { gte: since },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        });
        const equipmentDenials = await this.prisma.pmAccessAttempt.count({
            where: {
                projectId,
                equipmentId: { not: null },
                decision: { in: ['denied', 'denied_with_reason'] },
                createdAt: { gte: since },
            },
        });
        const zoneScores = await Promise.all(zoneDenials.map(async (z) => {
            const risk = await this.cail.predictZoneRisk(projectId, z.zoneCode);
            return Object.assign({ zoneCode: z.zoneCode, denials: z._count.id }, risk);
        }));
        return {
            attempts30d: attempts,
            denials30d: denials,
            overrides30d: overrides,
            compliancePct,
            denialRate: attempts > 0 ? denials / attempts : 0,
            overrideRate: attempts > 0 ? overrides / attempts : 0,
            projectAccessScore: compliancePct,
            trends: {
                denialByZone: zoneDenials.map((z) => ({
                    zoneCode: z.zoneCode,
                    count: z._count.id,
                })),
                topDeniedWorkers: workerDenials.map((w) => ({
                    workerId: w.workerId,
                    denials: w._count.id,
                })),
                equipmentDenials30d: equipmentDenials,
            },
            zoneComplianceScores: zoneScores,
            workerComplianceScores: workerDenials.map((w) => ({
                workerId: w.workerId,
                complianceScore: Math.max(0, 100 - w._count.id * 10),
            })),
            leadingIndicators: {
                overrideRate: attempts > 0 ? overrides / attempts : 0,
            },
            cailInsights: insights,
        };
    }
    async syncBundle(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const [points, rules, workers, overrides] = await Promise.all([
            this.listAccessPoints(project.companyId, projectId),
            this.listZoneRules(projectId),
            this.prisma.projectAssignment.findMany({
                where: { projectId, endedAt: null },
                include: {
                    worker: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            }),
            this.listOverrides(projectId, true),
        ]);
        return {
            syncedAt: new Date().toISOString(),
            projectId,
            accessPoints: points,
            zoneRules: rules,
            roster: workers,
            activeOverrides: overrides,
        };
    }
    async stationValidate(input) {
        return this.validateAccess(Object.assign(Object.assign({}, input), { recordAttempt: true }));
    }
    mapSpecResult(decision) {
        if (decision === 'granted')
            return 'granted';
        if (decision === 'requires_supervisor_override' ||
            decision === 'requires_safety_override') {
            return 'override_required';
        }
        return 'denied';
    }
    mapWorkflowState(decision, hasActiveOverride, overrideExpired) {
        if (overrideExpired)
            return 'override_expired';
        if (hasActiveOverride && decision === 'granted')
            return 'override_approved';
        if (decision === 'requires_supervisor_override' ||
            decision === 'requires_safety_override') {
            return 'override_required';
        }
        if (decision === 'granted')
            return 'access_granted';
        return 'access_denied';
    }
    async getWorkerAccessProfile(workerId, projectId) {
        const since = new Date(Date.now() - 30 * 86400000);
        const [worker, attempts, requirements, cail] = await Promise.all([
            this.prisma.worker.findUnique({
                where: { id: workerId },
                select: { id: true, firstName: true, lastName: true, companyId: true },
            }),
            this.prisma.pmAccessAttempt.findMany({
                where: { workerId, projectId, createdAt: { gte: since } },
                orderBy: { createdAt: 'desc' },
                take: 25,
                include: { denials: true },
            }),
            this.prisma.pmWorkerAccessRequirement.findMany({
                where: { workerId, OR: [{ projectId }, { projectId: null }] },
            }),
            this.cail.predictAccessDenial(workerId, projectId),
        ]);
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const denials = attempts.filter((a) => ['denied', 'denied_with_reason'].includes(a.decision)).length;
        const granted = attempts.length - denials;
        const complianceScore = attempts.length > 0 ? Math.round((granted / attempts.length) * 100) : 100;
        const activeOverride = await this.findActiveOverride({
            projectId,
            workerId,
            zoneCode: 'SITE',
        });
        return {
            workerId,
            projectId,
            worker,
            complianceScore,
            attempts30d: attempts.length,
            denials30d: denials,
            workflowState: activeOverride
                ? 'override_approved'
                : attempts[0]
                    ? this.mapWorkflowState(attempts[0].decision, false)
                    : 'access_granted',
            recentAttempts: attempts.map((a) => {
                var _a;
                return ({
                    id: a.id,
                    timestamp: a.createdAt,
                    result: this.mapSpecResult(a.decision),
                    reason: (_a = a.denialReasons[0]) !== null && _a !== void 0 ? _a : null,
                    zoneCode: a.zoneCode,
                });
            }),
            requirements,
            cail,
        };
    }
    async getEquipmentAccessProfile(equipmentId, projectId) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                pmEquipmentAccessRequirements: true,
                pmFailures: {
                    where: {
                        status: {
                            in: [
                                'reported',
                                'supervisor_review',
                                'owner_review',
                                'locked_out',
                                'capa_open',
                            ],
                        },
                    },
                    take: 5,
                },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const since = new Date(Date.now() - 30 * 86400000);
        const attempts = await this.prisma.pmAccessAttempt.findMany({
            where: { equipmentId, projectId, createdAt: { gte: since } },
            orderBy: { createdAt: 'desc' },
            take: 15,
        });
        const score = this.pmEquipment
            ? await this.pmEquipment.getEquipmentScore(equipmentId, projectId)
            : null;
        const cail = await this.cail.predictEquipmentRisk(equipmentId, projectId);
        const unsafe = equipment.operationalStatus === 'out_of_service' ||
            equipment.operationalStatus === 'locked_out' ||
            equipment.lockoutStatus === 'LOCKED_OUT' ||
            equipment.pmFailures.length > 0;
        const denialReasons = [];
        if (unsafe) {
            if (equipment.operationalStatus === 'out_of_service') {
                denialReasons.push('Equipment out of service');
            }
            if (equipment.lockoutStatus === 'LOCKED_OUT' ||
                equipment.operationalStatus === 'locked_out') {
                denialReasons.push('Equipment under lockout');
            }
            if (equipment.pmFailures.length > 0) {
                denialReasons.push(`${equipment.pmFailures.length} open failure(s)`);
            }
        }
        return {
            equipmentId,
            projectId,
            equipment: {
                id: equipment.id,
                name: equipment.name,
                operationalStatus: equipment.operationalStatus,
                lockoutStatus: equipment.lockoutStatus,
            },
            accessAllowed: !unsafe,
            equipmentScore: score,
            denialReasons,
            requirements: equipment.pmEquipmentAccessRequirements,
            recentAttempts: attempts.map((a) => ({
                id: a.id,
                timestamp: a.createdAt,
                result: this.mapSpecResult(a.decision),
                workerId: a.workerId,
            })),
            cail,
        };
    }
    async applyOfflineSync(projectId, payload, actorId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const counts = { attempts: 0, overrides: 0 };
        for (const row of (_a = payload.attempts) !== null && _a !== void 0 ? _a : []) {
            if (row.clientSyncId) {
                const exists = await this.prisma.pmAccessAttempt.findUnique({
                    where: { clientSyncId: row.clientSyncId },
                });
                if (exists)
                    continue;
            }
            const attempt = await this.prisma.pmAccessAttempt.create({
                data: {
                    companyId: project.companyId,
                    projectId,
                    workerId: row.workerId,
                    equipmentId: row.equipmentId,
                    accessPointId: row.accessPointId,
                    zoneCode: (_b = row.zoneCode) !== null && _b !== void 0 ? _b : 'SITE',
                    decision: row.decision,
                    denialReasons: ((_c = row.denialReasons) !== null && _c !== void 0 ? _c : []),
                    checksJson: ((_d = row.checksJson) !== null && _d !== void 0 ? _d : {}),
                    clientSyncId: row.clientSyncId,
                    createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
                },
            });
            for (const msg of (_e = row.denialReasons) !== null && _e !== void 0 ? _e : []) {
                await this.prisma.pmAccessDenial.create({
                    data: {
                        attemptId: attempt.id,
                        reasonCode: msg.slice(0, 40).replace(/\s+/g, '_'),
                        reasonMessage: msg,
                    },
                });
            }
            counts.attempts++;
        }
        for (const o of (_f = payload.overrides) !== null && _f !== void 0 ? _f : []) {
            const clientSyncId = o.clientSyncId;
            if (clientSyncId) {
                const exists = await this.prisma.pmAccessOverride.findUnique({
                    where: { clientSyncId },
                });
                if (exists)
                    continue;
            }
            await this.createOverride({
                companyId: project.companyId,
                projectId,
                workerId: o.workerId,
                equipmentId: o.equipmentId,
                zoneCode: o.zoneCode,
                overrideType: (_g = o.overrideType) !== null && _g !== void 0 ? _g : 'temporary',
                reason: (_h = o.reason) !== null && _h !== void 0 ? _h : 'Offline override',
                expiresAt: new Date((_j = o.expiresAt) !== null && _j !== void 0 ? _j : Date.now() + 86400000),
                clientSyncId,
            }, actorId);
            counts.overrides++;
        }
        await this.audit('offline_sync', String(projectId), 'applied', actorId, counts);
        return Object.assign(Object.assign({ projectId }, counts), { syncedAt: new Date().toISOString() });
    }
};
exports.PmSiteAccessControlService = PmSiteAccessControlService;
exports.PmSiteAccessControlService = PmSiteAccessControlService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __param(6, (0, common_1.Optional)()),
    __param(7, (0, common_1.Optional)()),
    __param(8, (0, common_1.Optional)()),
    __param(9, (0, common_1.Optional)()),
    __param(10, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_site_access_cail_intelligence_service_1.PmSiteAccessCailIntelligenceService,
        sif_heca_service_1.SifHecaService,
        pm_inspections_service_1.PmInspectionsService,
        pm_safety_events_service_1.PmSafetyEventsService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        pm_document_control_service_1.PmDocumentControlService,
        pm_equipment_safety_service_1.PmEquipmentSafetyService,
        pm_emergency_response_service_1.PmEmergencyResponseService,
        pm_project_safety_context_service_1.PmProjectSafetyContextService,
        pm_company_safety_context_service_1.PmCompanySafetyContextService])
], PmSiteAccessControlService);
//# sourceMappingURL=pm-site-access-control.service.js.map