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
exports.PmEmergencyResponseService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const pm_capa_auto_generate_service_1 = require("../pm-corrective-actions/pm-capa-auto-generate.service");
const emergency_workflow_engine_1 = require("./emergency-workflow.engine");
const muster_geofence_engine_1 = require("./muster-geofence.engine");
const pm_emergency_cail_intelligence_service_1 = require("./pm-emergency-cail-intelligence.service");
let PmEmergencyResponseService = class PmEmergencyResponseService {
    constructor(prisma, cail, notifications, capaAuto) {
        this.prisma = prisma;
        this.cail = cail;
        this.notifications = notifications;
        this.capaAuto = capaAuto;
        this.workflow = new emergency_workflow_engine_1.EmergencyWorkflowEngine();
        this.geofence = new muster_geofence_engine_1.MusterGeofenceEngine();
    }
    async audit(entityType, entityId, eventType, actorId, payload) {
        await this.prisma.pmEmergencyAuditLog.create({
            data: {
                entityType,
                entityId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    listPlans(filters) {
        return this.prisma.emergencyPlan.findMany({
            where: {
                companyId: filters.companyId,
                siteId: filters.siteId,
                projectId: filters.projectId,
                planType: filters.planType,
                deletedAt: null,
                active: true,
            },
            orderBy: { title: 'asc' },
        });
    }
    async createPlan(data, actorId) {
        var _a, _b, _c, _d, _e;
        const plan = await this.prisma.emergencyPlan.create({
            data: {
                companyId: data.companyId,
                siteId: data.siteId,
                projectId: data.projectId,
                title: data.title,
                planType: (_a = data.planType) !== null && _a !== void 0 ? _a : 'evacuation',
                status: 'draft',
                contentJson: ((_b = data.contentJson) !== null && _b !== void 0 ? _b : {}),
                rolesJson: ((_c = data.rolesJson) !== null && _c !== void 0 ? _c : []),
                musterPointsJson: ((_d = data.musterPointsJson) !== null && _d !== void 0 ? _d : []),
                responseStepsJson: ((_e = data.responseStepsJson) !== null && _e !== void 0 ? _e : []),
                clientSyncId: data.clientSyncId,
            },
        });
        await this.audit('plan', plan.id, 'created', actorId);
        return plan;
    }
    async publishPlan(id, actorId) {
        const plan = await this.prisma.emergencyPlan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        if (plan.status !== 'published') {
            if (plan.status === 'draft') {
                this.workflow.assertPlanTransition('draft', 'review');
                this.workflow.assertPlanTransition('review', 'approved');
                this.workflow.assertPlanTransition('approved', 'published');
            }
            else {
                this.workflow.assertPlanTransition(plan.status, 'published');
            }
        }
        await this.prisma.pmEmergencyPlanVersion.create({
            data: {
                planId: id,
                version: plan.versionNum,
                snapshot: plan,
                authorId: actorId,
            },
        });
        const updated = await this.prisma.emergencyPlan.update({
            where: { id },
            data: { status: 'published', publishedAt: new Date() },
        });
        await this.audit('plan', id, 'published', actorId);
        return updated;
    }
    async acknowledgePlan(data) {
        return this.prisma.pmEmergencyPlanAcknowledgment.upsert({
            where: {
                planId_workerId: { planId: data.planId, workerId: data.workerId },
            },
            create: data,
            update: {
                acknowledgedAt: new Date(),
                signatureData: data.signatureData,
            },
        });
    }
    async declareEmergency(data, actorId) {
        var _a, _b;
        if (data.requirePublishedPlan !== false) {
            const plan = await this.prisma.emergencyPlan.findFirst({
                where: {
                    companyId: data.companyId,
                    siteId: data.siteId,
                    status: 'published',
                    deletedAt: null,
                    active: true,
                    OR: [
                        ...(data.projectId ? [{ projectId: data.projectId }] : []),
                        { projectId: null },
                    ],
                },
            });
            if (!plan) {
                throw new common_1.BadRequestException('Published emergency plan required before declaring an emergency');
            }
        }
        const event = await this.prisma.pmEmergencyEvent.create({
            data: {
                companyId: data.companyId,
                siteId: data.siteId,
                projectId: data.projectId,
                eventType: data.eventType,
                title: data.title,
                description: data.description,
                declaredByUserId: (_a = data.declaredByUserId) !== null && _a !== void 0 ? _a : actorId,
                status: 'declared',
                timelineJson: [
                    {
                        at: new Date().toISOString(),
                        action: 'declared',
                        actorId,
                    },
                ],
            },
        });
        if (data.lockSiteAccess !== false && data.projectId) {
            await this.prisma.pmSiteEmergencyLock.create({
                data: {
                    projectId: data.projectId,
                    emergencyEventId: event.id,
                    active: true,
                },
            });
        }
        await this.dispatchNotifications({
            companyId: data.companyId,
            emergencyEventId: event.id,
            triggerType: 'emergency_declared',
            title: `EMERGENCY: ${data.title}`,
            body: (_b = data.description) !== null && _b !== void 0 ? _b : data.title,
            channels: ['in_app', 'push', 'email', 'sms'],
        });
        if (data.autoMuster !== false) {
            await this.startMuster({
                companyId: data.companyId,
                siteId: data.siteId,
                projectId: data.projectId,
                emergencyEventId: event.id,
                triggeredByUser: actorId,
                notes: `Auto-muster for ${data.title}`,
            }, actorId);
            await this.prisma.pmEmergencyEvent.update({
                where: { id: event.id },
                data: { status: 'muster_in_progress' },
            });
        }
        await this.audit('event', event.id, 'declared', actorId);
        return event;
    }
    async transitionEvent(id, to, actorId) {
        const event = await this.prisma.pmEmergencyEvent.findUnique({
            where: { id },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        this.workflow.assertEventTransition(event.status, to);
        const update = { status: to };
        if (to === 'all_clear')
            update.allClearAt = new Date();
        if (to === 'closed')
            update.closedAt = new Date();
        const updated = await this.prisma.pmEmergencyEvent.update({
            where: { id },
            data: update,
        });
        if (to === 'all_clear' && event.projectId) {
            await this.prisma.pmSiteEmergencyLock.updateMany({
                where: { emergencyEventId: id, active: true },
                data: { active: false, unlockedAt: new Date() },
            });
            await this.dispatchNotifications({
                companyId: event.companyId,
                emergencyEventId: id,
                triggerType: 'all_clear',
                title: 'All clear',
                body: `Emergency "${event.title}" — all clear issued`,
                channels: ['in_app', 'push'],
            });
        }
        await this.audit('event', id, `status_${to}`, actorId);
        return updated;
    }
    async addEventAttachment(emergencyEventId, data) {
        return this.prisma.pmEmergencyEventAttachment.create({
            data: Object.assign({ emergencyEventId }, data),
        });
    }
    async startMuster(data, actorId) {
        var _a, _b, _c;
        const active = await this.prisma.musterEvent.findFirst({
            where: {
                siteId: data.siteId,
                status: { in: ['activated', 'accounting'] },
            },
        });
        if (active) {
            throw new common_1.BadRequestException('Muster already active for this site');
        }
        const expected = (_a = data.expectedWorkerIds) !== null && _a !== void 0 ? _a : (await this.resolveExpectedWorkers(data.projectId, data.siteId));
        const muster = await this.prisma.musterEvent.create({
            data: {
                companyId: data.companyId,
                siteId: data.siteId,
                projectId: data.projectId,
                emergencyEventId: data.emergencyEventId,
                triggeredByUser: (_b = data.triggeredByUser) !== null && _b !== void 0 ? _b : actorId,
                notes: data.notes,
                status: client_1.MusterEventStatus.activated,
                expectedWorkerIds: expected,
                missingWorkerIds: expected,
                clientSyncId: data.clientSyncId,
            },
        });
        await this.dispatchNotifications({
            companyId: data.companyId,
            musterEventId: muster.id,
            emergencyEventId: data.emergencyEventId,
            triggerType: 'muster_started',
            title: 'MUSTER — Report to muster point',
            body: (_c = data.notes) !== null && _c !== void 0 ? _c : 'Site muster activated',
            channels: ['in_app', 'push', 'sms', 'safety_station'],
        });
        await this.audit('muster', muster.id, 'started', actorId);
        return muster;
    }
    async resolveExpectedWorkers(projectId, siteId) {
        if (projectId) {
            const assignments = await this.prisma.projectAssignment.findMany({
                where: { projectId, endedAt: null },
                select: { workerId: true },
            });
            return assignments.map((a) => a.workerId);
        }
        if (siteId) {
            const onSite = await this.prisma.workerAssignment.findMany({
                where: { siteId, endedAt: null },
                select: { workerId: true },
            });
            return onSite.map((a) => a.workerId);
        }
        return [];
    }
    async getActiveMuster(siteId) {
        const muster = await this.prisma.musterEvent.findFirst({
            where: {
                siteId,
                status: { in: ['activated', 'accounting'] },
            },
            include: {
                checkins: {
                    include: {
                        worker: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
                emergencyEvent: true,
            },
            orderBy: { triggeredAt: 'desc' },
        });
        if (!muster)
            return null;
        await this.refreshMissingWorkers(muster.id);
        return this.prisma.musterEvent.findUnique({
            where: { id: muster.id },
            include: {
                checkins: {
                    include: {
                        worker: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                    },
                },
            },
        });
    }
    async refreshMissingWorkers(musterEventId) {
        const muster = await this.prisma.musterEvent.findUnique({
            where: { id: musterEventId },
            include: { checkins: true },
        });
        if (!muster)
            return;
        const expected = Array.isArray(muster.expectedWorkerIds)
            ? muster.expectedWorkerIds
            : [];
        const checked = new Set(muster.checkins.map((c) => c.workerId));
        const missing = expected.filter((id) => !checked.has(id));
        const prevMissing = Array.isArray(muster.missingWorkerIds)
            ? muster.missingWorkerIds
            : [];
        await this.prisma.musterEvent.update({
            where: { id: musterEventId },
            data: { missingWorkerIds: missing },
        });
        const newMissing = missing.filter((id) => !prevMissing.includes(id));
        if (newMissing.length > 0) {
            await this.dispatchNotifications({
                companyId: muster.companyId,
                musterEventId,
                triggerType: 'missing_worker',
                title: 'Missing worker(s) at muster',
                body: `Workers not checked in: ${newMissing.join(', ')}`,
                channels: ['in_app', 'push', 'sms'],
                escalationLevel: 1,
            });
        }
    }
    async musterCheckIn(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const event = await this.prisma.musterEvent.findUnique({
            where: { id: data.musterEventId },
            include: { site: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Muster not found');
        if (event.status === 'all_clear' || event.status === 'cancelled') {
            throw new common_1.BadRequestException('Muster is closed');
        }
        let identityVerified = !!data.supervisorOverride;
        if (data.lat != null &&
            data.lng != null &&
            ((_a = event.site) === null || _a === void 0 ? void 0 : _a.latitude) != null &&
            ((_b = event.site) === null || _b === void 0 ? void 0 : _b.longitude) != null) {
            const plans = await this.prisma.emergencyPlan.findMany({
                where: { siteId: event.siteId, status: 'published', deletedAt: null },
                take: 1,
            });
            const points = (_d = (_c = plans[0]) === null || _c === void 0 ? void 0 : _c.musterPointsJson) !== null && _d !== void 0 ? _d : [
                {
                    code: 'default',
                    label: 'Site muster',
                    lat: event.site.latitude,
                    lng: event.site.longitude,
                    radiusMeters: 100,
                },
            ];
            const nearest = this.geofence.nearestMusterPoint({ lat: data.lat, lng: data.lng }, points);
            if (nearest &&
                nearest.distanceMeters <= ((_e = nearest.point.radiusMeters) !== null && _e !== void 0 ? _e : 75)) {
                identityVerified = true;
                data.musterPointCode = nearest.point.code;
            }
        }
        await this.prisma.musterEvent.update({
            where: { id: data.musterEventId },
            data: { status: client_1.MusterEventStatus.accounting },
        });
        const checkin = await this.prisma.musterCheckin.upsert({
            where: {
                musterEventId_workerId: {
                    musterEventId: data.musterEventId,
                    workerId: data.workerId,
                },
            },
            create: {
                musterEventId: data.musterEventId,
                workerId: data.workerId,
                method: (_f = data.method) !== null && _f !== void 0 ? _f : 'manual',
                musterPointCode: data.musterPointCode,
                identityVerified,
                supervisorOverride: (_g = data.supervisorOverride) !== null && _g !== void 0 ? _g : false,
                geoJson: data.lat != null
                    ? { lat: data.lat, lng: data.lng }
                    : undefined,
                clientSyncId: data.clientSyncId,
            },
            update: {
                checkedInAt: new Date(),
                method: (_h = data.method) !== null && _h !== void 0 ? _h : 'manual',
                musterPointCode: data.musterPointCode,
                identityVerified,
                supervisorOverride: (_j = data.supervisorOverride) !== null && _j !== void 0 ? _j : false,
            },
        });
        await this.refreshMissingWorkers(data.musterEventId);
        return checkin;
    }
    mapWorkflowPhase(status) {
        if (status === 'closed' || status === 'cancelled')
            return 'closed';
        if (status === 'all_clear')
            return 'all_clear';
        if (status === 'muster_in_progress' ||
            status === 'evacuation_in_progress' ||
            status === 'supervisor_review') {
            return 'muster_active';
        }
        if (status === 'declared' || status === 'active')
            return 'emergency_declared';
        return 'normal';
    }
    async getEventStatus(emergencyEventId) {
        var _a, _b, _c;
        const event = await this.prisma.pmEmergencyEvent.findUnique({
            where: { id: emergencyEventId },
            include: {
                musterSessions: {
                    include: {
                        checkins: {
                            include: {
                                worker: {
                                    select: { id: true, firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                    orderBy: { triggeredAt: 'desc' },
                },
                notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
            },
        });
        if (!event)
            throw new common_1.NotFoundException('Emergency event not found');
        const muster = (_a = event.musterSessions[0]) !== null && _a !== void 0 ? _a : null;
        const expected = muster && Array.isArray(muster.expectedWorkerIds)
            ? muster.expectedWorkerIds.length
            : 0;
        const checkedIn = (_c = (_b = muster === null || muster === void 0 ? void 0 : muster.checkins) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
        const missing = muster && Array.isArray(muster.missingWorkerIds)
            ? muster.missingWorkerIds.length
            : 0;
        const musterCompliance = this.cail.musterComplianceScore(checkedIn, expected);
        const siteLocked = event.projectId
            ? !!(await this.isSiteLocked(event.projectId))
            : false;
        return {
            emergency: event,
            workflowPhase: this.mapWorkflowPhase(event.status),
            muster,
            musterComplianceScore: musterCompliance,
            missingWorkerCount: missing,
            checkedInCount: checkedIn,
            expectedWorkerCount: expected,
            siteAccessLocked: siteLocked,
            canAllClear: missing === 0 || event.status === 'supervisor_review',
            canClose: event.status === 'all_clear',
            notificationsSent: event.notifications.filter((n) => n.status === 'sent')
                .length,
        };
    }
    async startMusterForEvent(emergencyEventId, body, actorId) {
        var _a, _b;
        const event = await this.prisma.pmEmergencyEvent.findUnique({
            where: { id: emergencyEventId },
        });
        if (!event)
            throw new common_1.NotFoundException('Emergency event not found');
        const muster = await this.startMuster({
            companyId: event.companyId,
            siteId: event.siteId,
            projectId: (_a = event.projectId) !== null && _a !== void 0 ? _a : undefined,
            emergencyEventId: event.id,
            notes: (_b = body.notes) !== null && _b !== void 0 ? _b : `Muster for ${event.title}`,
            expectedWorkerIds: body.expectedWorkerIds,
        }, actorId);
        await this.transitionEvent(emergencyEventId, 'muster_in_progress', actorId);
        return muster;
    }
    async musterCheckInForEvent(emergencyEventId, data) {
        const muster = await this.prisma.musterEvent.findFirst({
            where: {
                emergencyEventId,
                status: { in: ['activated', 'accounting'] },
            },
            orderBy: { triggeredAt: 'desc' },
        });
        if (!muster)
            throw new common_1.NotFoundException('No active muster for this emergency');
        return this.musterCheckIn(Object.assign({ musterEventId: muster.id }, data));
    }
    async allClearEmergency(emergencyEventId, actorId, force = false) {
        const muster = await this.prisma.musterEvent.findFirst({
            where: {
                emergencyEventId,
                status: { in: ['activated', 'accounting'] },
            },
        });
        if (muster) {
            const missing = Array.isArray(muster.missingWorkerIds)
                ? muster.missingWorkerIds.length
                : 0;
            if (missing > 0 && !force) {
                throw new common_1.BadRequestException('Cannot issue all clear until all workers are accounted for (or use force: true)');
            }
            await this.musterAllClear(muster.id, actorId);
        }
        else {
            await this.transitionEvent(emergencyEventId, 'all_clear', actorId);
        }
        return this.getEventStatus(emergencyEventId);
    }
    async closeEmergency(emergencyEventId, actorId, force = false) {
        const status = await this.getEventStatus(emergencyEventId);
        if (status.missingWorkerCount > 0 && !force) {
            throw new common_1.BadRequestException('Cannot close emergency until all workers accounted for');
        }
        if (status.emergency.status !== 'all_clear' && !force) {
            throw new common_1.BadRequestException('Emergency must be all clear before close');
        }
        await this.transitionEvent(emergencyEventId, 'closed', actorId);
        return this.getEventStatus(emergencyEventId);
    }
    async musterAllClear(musterEventId, actorId) {
        const muster = await this.prisma.musterEvent.update({
            where: { id: musterEventId },
            data: {
                status: client_1.MusterEventStatus.all_clear,
                allClearAt: new Date(),
                supervisorConfirmedAt: new Date(),
            },
        });
        if (muster.emergencyEventId) {
            await this.transitionEvent(muster.emergencyEventId, 'all_clear', actorId);
        }
        if (muster.projectId) {
            await this.prisma.pmSiteEmergencyLock.updateMany({
                where: { projectId: muster.projectId, active: true },
                data: { active: false, unlockedAt: new Date() },
            });
        }
        await this.audit('muster', musterEventId, 'all_clear', actorId);
        return muster;
    }
    createEmergencyEquipment(data) {
        return this.prisma.pmEmergencyEquipment.create({ data });
    }
    listEmergencyEquipment(companyId, siteId) {
        return this.prisma.pmEmergencyEquipment.findMany({
            where: { companyId, siteId, active: true },
            include: {
                inspections: { orderBy: { inspectedAt: 'desc' }, take: 3 },
            },
        });
    }
    async recordEquipmentInspection(emergencyEquipmentId, data, actorId) {
        var _a;
        const eq = await this.prisma.pmEmergencyEquipment.findUnique({
            where: { id: emergencyEquipmentId },
        });
        if (!eq)
            throw new common_1.NotFoundException('Emergency equipment not found');
        const insp = await this.prisma.pmEmergencyEquipmentInspection.create({
            data: {
                emergencyEquipmentId,
                passed: data.passed,
                notes: data.notes,
                inspectedByUserId: (_a = data.inspectedByUserId) !== null && _a !== void 0 ? _a : actorId,
            },
        });
        const readiness = data.passed ? 100 : 30;
        await this.prisma.pmEmergencyEquipment.update({
            where: { id: emergencyEquipmentId },
            data: {
                readinessScore: readiness,
                lastInspectionAt: new Date(),
            },
        });
        if (!data.passed && this.capaAuto && eq.companyId) {
            await this.capaAuto.fromDocumentDeficiency({
                companyId: eq.companyId,
                sourceModule: 'emergency_equipment',
                sourceId: emergencyEquipmentId,
                title: `Failed emergency equipment inspection: ${eq.name}`,
                description: data.notes,
                severity: 'high',
                actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
            });
        }
        return insp;
    }
    async scanEmergencyEquipment(companyId, actorId) {
        const now = new Date();
        const items = await this.prisma.pmEmergencyEquipment.findMany({
            where: { companyId, active: true },
        });
        let capas = 0;
        for (const item of items) {
            if (item.expiresAt && item.expiresAt < now && this.capaAuto) {
                await this.capaAuto.fromDocumentDeficiency({
                    companyId,
                    sourceModule: 'emergency_equipment',
                    sourceId: item.id,
                    title: `Expired emergency equipment: ${item.name}`,
                    severity: 'medium',
                    actorId: actorId !== null && actorId !== void 0 ? actorId : 1,
                });
                capas++;
                await this.prisma.pmEmergencyEquipment.update({
                    where: { id: item.id },
                    data: { readinessScore: 0 },
                });
            }
        }
        return { scanned: items.length, capasCreated: capas };
    }
    async dispatchNotifications(input) {
        var _a;
        const supervisors = await this.prisma.user.findMany({
            where: {
                companyId: input.companyId,
                role: {
                    in: [
                        'SUPERVISOR',
                        'PROJECT_MANAGER',
                        'COMPANY_ADMIN',
                        'ADMIN',
                        'SUPER_ADMIN',
                    ],
                },
            },
            take: 50,
        });
        for (const channel of input.channels) {
            for (const user of supervisors) {
                const row = await this.prisma.pmEmergencyNotification.create({
                    data: {
                        companyId: input.companyId,
                        emergencyEventId: input.emergencyEventId,
                        musterEventId: input.musterEventId,
                        channel,
                        triggerType: input.triggerType,
                        recipientUserId: user.id,
                        title: input.title,
                        body: input.body,
                        escalationLevel: (_a = input.escalationLevel) !== null && _a !== void 0 ? _a : 0,
                        status: 'pending',
                    },
                });
                if (this.notifications && channel !== 'safety_station') {
                    try {
                        const mapChannel = channel === 'sms'
                            ? 'SMS'
                            : channel === 'email'
                                ? 'EMAIL'
                                : channel === 'push'
                                    ? 'PUSH'
                                    : 'IN_APP';
                        await this.notifications.notifyUsers({
                            userIds: [user.id],
                            type: 'emergency',
                            title: input.title,
                            body: input.body,
                            channels: [mapChannel],
                            companyId: input.companyId,
                            dedupeKey: `emergency:${row.id}`,
                        });
                        await this.prisma.pmEmergencyNotification.update({
                            where: { id: row.id },
                            data: { status: 'sent', sentAt: new Date() },
                        });
                    }
                    catch (_b) {
                        await this.prisma.pmEmergencyNotification.update({
                            where: { id: row.id },
                            data: { status: 'failed' },
                        });
                    }
                }
                else if (channel === 'safety_station') {
                    await this.prisma.pmEmergencyNotification.update({
                        where: { id: row.id },
                        data: { status: 'sent', sentAt: new Date() },
                    });
                }
            }
        }
    }
    async workerAccessCheck(workerId, projectId) {
        const lock = await this.prisma.pmSiteEmergencyLock.findFirst({
            where: { projectId, active: true },
            include: { emergencyEvent: true },
        });
        if (lock) {
            return {
                allowed: false,
                reason: `Site locked: ${lock.emergencyEvent.title}`,
                emergencyActive: true,
            };
        }
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        const requiredPlans = await this.prisma.emergencyPlan.findMany({
            where: {
                requiresAckForAccess: true,
                status: 'published',
                deletedAt: null,
                companyId: project === null || project === void 0 ? void 0 : project.companyId,
                OR: [{ projectId }, { projectId: null }],
            },
            select: { id: true },
        });
        for (const p of requiredPlans) {
            const ack = await this.prisma.pmEmergencyPlanAcknowledgment.findUnique({
                where: { planId_workerId: { planId: p.id, workerId } },
            });
            if (!ack) {
                return {
                    allowed: false,
                    reason: 'Emergency plan acknowledgment required',
                    emergencyActive: false,
                };
            }
        }
        const activeMuster = await this.prisma.musterEvent.findFirst({
            where: { projectId, status: { in: ['activated', 'accounting'] } },
        });
        if (activeMuster) {
            const missing = Array.isArray(activeMuster.missingWorkerIds)
                ? activeMuster.missingWorkerIds
                : [];
            if (missing.includes(workerId)) {
                return {
                    allowed: false,
                    reason: 'Worker listed as missing at active muster',
                    emergencyActive: true,
                };
            }
        }
        return { allowed: true, emergencyActive: false };
    }
    isSiteLocked(projectId) {
        return this.prisma.pmSiteEmergencyLock.findFirst({
            where: { projectId, active: true },
        });
    }
    async analytics(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const musters = await this.prisma.musterEvent.findMany({
            where: { projectId },
            include: {
                _count: { select: { checkins: true } },
                emergencyEvent: { select: { declaredAt: true } },
            },
            orderBy: { triggeredAt: 'desc' },
            take: 10,
        });
        let avgMusterCompliance = 100;
        if (musters.length) {
            const scores = musters.map((m) => {
                const expected = Array.isArray(m.expectedWorkerIds)
                    ? m.expectedWorkerIds.length
                    : 0;
                return this.cail.musterComplianceScore(m._count.checkins, expected);
            });
            avgMusterCompliance = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }
        const equipment = await this.prisma.pmEmergencyEquipment.findMany({
            where: { companyId: project.companyId, active: true },
        });
        const readinessAvg = equipment.length > 0
            ? equipment.reduce((s, e) => s + e.readinessScore, 0) / equipment.length
            : 100;
        const openEvents = await this.prisma.pmEmergencyEvent.count({
            where: {
                projectId,
                status: { notIn: ['closed', 'cancelled', 'all_clear'] },
            },
        });
        const responseTimes = musters
            .filter((m) => { var _a; return (_a = m.emergencyEvent) === null || _a === void 0 ? void 0 : _a.declaredAt; })
            .map((m) => Math.round((m.triggeredAt.getTime() - m.emergencyEvent.declaredAt.getTime()) /
            60000));
        const avgResponseTimeMinutes = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : null;
        const missingPatterns = musters.reduce((sum, m) => {
            const missing = Array.isArray(m.missingWorkerIds)
                ? m.missingWorkerIds.length
                : 0;
            return sum + missing;
        }, 0);
        const insights = await this.cail.projectInsights(projectId);
        return {
            avgMusterCompliance,
            equipmentReadinessAvg: Math.round(readinessAvg),
            openEmergencyEvents: openEvents,
            recentMusterCount: musters.length,
            projectEmergencyScore: Math.round((avgMusterCompliance + readinessAvg) / 2),
            trends: {
                avgResponseTimeMinutes,
                totalMissingWorkerEvents: missingPatterns,
                musterComplianceTrend: avgMusterCompliance,
            },
            leadingIndicators: {
                musterGapRate: 1 - avgMusterCompliance / 100,
                lowReadinessEquipment: equipment.filter((e) => e.readinessScore < 70)
                    .length,
                equipmentReadinessPct: Math.round(readinessAvg),
            },
            cailInsights: insights,
        };
    }
    async syncBundle(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { site: true },
        });
        if (!(project === null || project === void 0 ? void 0 : project.siteId))
            throw new common_1.NotFoundException('Project/site not found');
        const [plans, workers, equipment, emergencyEquipment] = await Promise.all([
            this.listPlans({
                companyId: project.companyId,
                siteId: project.siteId,
                projectId,
            }),
            this.prisma.projectAssignment.findMany({
                where: { projectId, endedAt: null },
                include: {
                    worker: {
                        select: { id: true, firstName: true, lastName: true, phone: true },
                    },
                },
            }),
            project.siteId
                ? this.prisma.equipment.findMany({
                    where: { companyId: project.companyId },
                    take: 100,
                    select: { id: true, name: true, operationalStatus: true },
                })
                : [],
            this.listEmergencyEquipment(project.companyId, project.siteId),
        ]);
        return {
            syncedAt: new Date().toISOString(),
            projectId,
            plans,
            roster: workers,
            equipment,
            emergencyEquipment,
        };
    }
    async applyOfflineSync(projectId, payload, actorId) {
        var _a;
        const counts = { checkins: 0, events: 0 };
        for (const c of (_a = payload.checkins) !== null && _a !== void 0 ? _a : []) {
            if (c.clientSyncId) {
                const exists = await this.prisma.musterCheckin.findUnique({
                    where: { clientSyncId: c.clientSyncId },
                });
                if (exists)
                    continue;
            }
            await this.musterCheckIn({
                musterEventId: c.musterEventId,
                workerId: c.workerId,
                clientSyncId: c.clientSyncId,
                lat: c.lat,
                lng: c.lng,
                method: 'offline',
            });
            counts.checkins++;
        }
        return counts;
    }
    async stationPayload(companyId, siteId) {
        const activeMuster = await this.getActiveMuster(siteId);
        const activeEvents = await this.prisma.pmEmergencyEvent.findMany({
            where: { companyId, siteId, status: { notIn: ['closed', 'cancelled'] } },
            take: 5,
        });
        return {
            generatedAt: new Date().toISOString(),
            activeMuster,
            activeEvents,
        };
    }
};
exports.PmEmergencyResponseService = PmEmergencyResponseService;
exports.PmEmergencyResponseService = PmEmergencyResponseService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_emergency_cail_intelligence_service_1.PmEmergencyCailIntelligenceService,
        notifications_service_1.NotificationsService,
        pm_capa_auto_generate_service_1.PmCapaAutoGenerateService])
], PmEmergencyResponseService);
//# sourceMappingURL=pm-emergency-response.service.js.map