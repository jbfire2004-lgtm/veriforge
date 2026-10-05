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
exports.PmSafetyMeetingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_corrective_actions_service_1 = require("../pm-corrective-actions/pm-corrective-actions.service");
const meeting_workflow_engine_1 = require("./meeting-workflow.engine");
const pm_safety_meetings_cail_service_1 = require("./pm-safety-meetings-cail.service");
const pm_safety_meetings_templates_service_1 = require("./pm-safety-meetings-templates.service");
const pm_safety_meetings_constants_1 = require("./pm-safety-meetings.constants");
const meetingInclude = {
    topics: { orderBy: { sortOrder: 'asc' } },
    attendees: {
        include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
        },
    },
    signatures: true,
    attachments: true,
    correctiveLinks: {
        include: {
            correctiveAction: { select: { id: true, title: true, status: true } },
        },
    },
    template: true,
    facilitator: { select: { id: true, firstName: true, lastName: true } },
};
let PmSafetyMeetingsService = class PmSafetyMeetingsService {
    constructor(prisma, cail, capa, templates) {
        this.prisma = prisma;
        this.cail = cail;
        this.capa = capa;
        this.templates = templates;
        this.workflow = new meeting_workflow_engine_1.MeetingWorkflowEngine();
    }
    async audit(meetingId, eventType, actorId, payload) {
        await this.prisma.safetyMeetingAuditLog.create({
            data: {
                meetingId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async list(filters) {
        return this.prisma.safetyMeeting.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign({ deletedAt: null }, (filters.projectId ? { projectId: filters.projectId } : {})), (filters.companyId ? { companyId: filters.companyId } : {})), (filters.status ? { status: filters.status } : {})), (filters.meetingType
                ? { meetingType: filters.meetingType }
                : {})),
            include: meetingInclude,
            orderBy: { scheduledAt: 'desc' },
            take: 100,
        });
    }
    async get(id) {
        const row = await this.prisma.safetyMeeting.findFirst({
            where: { id, deletedAt: null },
            include: meetingInclude,
        });
        if (!row)
            throw new common_1.NotFoundException('Meeting not found');
        return row;
    }
    async createFromInspection(inspectionId, createdByUserId) {
        var _a, _b, _c, _d;
        const existing = await this.prisma.safetyMeeting.findFirst({
            where: { pmInspectionId: inspectionId, deletedAt: null },
            include: meetingInclude,
        });
        if (existing) {
            return { meeting: existing, existing: true };
        }
        const inspection = await this.prisma.pmInspection.findFirst({
            where: { id: inspectionId, deletedAt: null },
            include: {
                template: true,
                deficiencies: true,
            },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        const reviewTemplate = await this.templates.ensureInspectionFailureReviewTemplate(inspection.companyId, inspection.projectId);
        const agendaItems = Array.isArray(reviewTemplate.agendaJson)
            ? reviewTemplate.agendaJson
            : [];
        const templateTopics = agendaItems
            .filter((row) => { var _a; return (_a = row === null || row === void 0 ? void 0 : row.title) === null || _a === void 0 ? void 0 : _a.trim(); })
            .map((row) => ({
            title: row.title.trim(),
            isHighRisk: Boolean(row.isHighRisk),
            sourceModule: 'inspection_template',
            sourceId: reviewTemplate.id,
        }));
        const deficiencyTopics = inspection.deficiencies.map((d) => ({
            title: d.title,
            isHighRisk: d.severity === 'critical' || d.severity === 'high',
            sourceModule: 'inspection',
            sourceId: inspection.id,
        }));
        const inlineTopics = templateTopics.length + deficiencyTopics.length > 0
            ? [...templateTopics, ...deficiencyTopics]
            : [
                {
                    title: `Review findings: ${(_a = inspection.title) !== null && _a !== void 0 ? _a : inspection.template.name}`,
                    isHighRisk: inspection.passed === false,
                    sourceModule: 'inspection',
                    sourceId: inspection.id,
                },
            ];
        const meeting = await this.create({
            companyId: inspection.companyId,
            projectId: inspection.projectId,
            siteId: (_b = inspection.siteId) !== null && _b !== void 0 ? _b : undefined,
            templateId: reviewTemplate.id,
            meetingType: reviewTemplate.meetingType,
            title: `${pm_safety_meetings_constants_1.INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME}: ${(_c = inspection.title) !== null && _c !== void 0 ? _c : inspection.template.name}`,
            locationNote: (_d = inspection.locationNote) !== null && _d !== void 0 ? _d : undefined,
            createdByUserId,
            pmInspectionId: inspectionId,
            inlineTopics,
        });
        return { meeting, existing: false };
    }
    async create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const project = await this.prisma.project.findUnique({
            where: { id: input.projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project ${input.projectId} was not found. Open Safety Meetings from a project context or pass a valid projectId.`);
        }
        const meeting = await this.prisma.safetyMeeting.create({
            data: {
                companyId: input.companyId || project.companyId,
                projectId: input.projectId,
                siteId: (_b = (_a = input.siteId) !== null && _a !== void 0 ? _a : project.siteId) !== null && _b !== void 0 ? _b : undefined,
                templateId: input.templateId,
                meetingType: input.meetingType,
                customMeetingTypeLabel: input.customMeetingTypeLabel,
                title: input.title,
                scheduledAt: input.scheduledAt
                    ? new Date(input.scheduledAt)
                    : undefined,
                locationNote: input.locationNote,
                supervisorUserId: input.supervisorUserId,
                facilitatorWorkerId: input.facilitatorWorkerId,
                createdByUserId: input.createdByUserId,
                pmInspectionId: input.pmInspectionId,
                status: 'draft',
            },
        });
        if ((_c = input.topicIds) === null || _c === void 0 ? void 0 : _c.length) {
            const topics = await this.prisma.topicLibraryEntry.findMany({
                where: { id: { in: input.topicIds } },
            });
            for (let i = 0; i < topics.length; i++) {
                const t = topics[i];
                await this.prisma.safetyMeetingTopic.create({
                    data: {
                        meetingId: meeting.id,
                        topicLibraryId: t.id,
                        sortOrder: i,
                        title: t.title,
                        discussionPoints: (_d = t.discussionPoints) !== null && _d !== void 0 ? _d : [],
                        requiredControls: (_e = t.requiredControls) !== null && _e !== void 0 ? _e : [],
                        isHighRisk: t.isHighRisk,
                    },
                });
                await this.prisma.topicLibraryEntry.update({
                    where: { id: t.id },
                    data: { usageCount: { increment: 1 } },
                });
            }
        }
        if ((_f = input.inlineTopics) === null || _f === void 0 ? void 0 : _f.length) {
            const base = (_h = (_g = input.topicIds) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0;
            for (let i = 0; i < input.inlineTopics.length; i++) {
                const t = input.inlineTopics[i];
                await this.prisma.safetyMeetingTopic.create({
                    data: {
                        meetingId: meeting.id,
                        sortOrder: base + i,
                        title: t.title,
                        isHighRisk: (_j = t.isHighRisk) !== null && _j !== void 0 ? _j : false,
                        sourceModule: t.sourceModule,
                        sourceId: t.sourceId,
                        discussionPoints: (_k = t.discussionPoints) !== null && _k !== void 0 ? _k : [],
                        requiredControls: (_l = t.requiredControls) !== null && _l !== void 0 ? _l : [],
                        notes: t.notes,
                    },
                });
            }
        }
        await this.audit(meeting.id, 'created', input.createdByUserId);
        return this.get(meeting.id);
    }
    async publish(meetingId, actorId) {
        return this.transition(meetingId, 'published', actorId);
    }
    async start(meetingId, actorId) {
        var _a;
        const m = await this.get(meetingId);
        const updated = await this.prisma.safetyMeeting.update({
            where: { id: meetingId },
            data: {
                status: 'in_progress',
                startedAt: (_a = m.startedAt) !== null && _a !== void 0 ? _a : new Date(),
            },
        });
        await this.audit(meetingId, 'started', actorId);
        return updated;
    }
    async transition(meetingId, targetStatus, actorId) {
        var _a;
        const meeting = await this.get(meetingId);
        const hasHighRisk = meeting.topics.some((t) => t.isHighRisk);
        const hasSif = meeting.topics.some((t) => String(t.title).toLowerCase().includes('sif'));
        const present = meeting.attendees.filter((a) => a.status === 'present');
        const signed = meeting.signatures.filter((s) => meeting.attendees.some((a) => a.status === 'present' &&
            (s.signerWorkerId === a.workerId || s.attendeeId === a.id)));
        const check = this.workflow.canTransition({
            currentStatus: meeting.status,
            targetStatus,
            meetingType: meeting.meetingType,
            hasHighRiskTopics: hasHighRisk,
            hasCorrectiveActions: meeting.correctiveLinks.length > 0,
            hasSifTopics: hasSif,
            attendeeCount: meeting.attendees.length,
            signedAttendeeCount: signed.length,
            reviewStatus: meeting.reviewStatus,
        });
        if (!check.allowed) {
            throw new common_1.BadRequestException(check.reason);
        }
        const requiresReview = this.workflow.requiresSupervisorReview({
            meetingType: meeting.meetingType,
            hasHighRiskTopics: hasHighRisk,
            hasCorrectiveActions: meeting.correctiveLinks.length > 0,
            hasSifTopics: hasSif,
        });
        const reviewStatus = this.workflow.deriveReviewStatus(requiresReview, meeting.reviewStatus);
        const data = {
            status: targetStatus,
            requiresSupervisorReview: requiresReview,
            reviewStatus,
        };
        if (targetStatus === 'published') {
            data.scheduledAt = (_a = meeting.scheduledAt) !== null && _a !== void 0 ? _a : new Date();
        }
        if (targetStatus === 'completed') {
            data.completedAt = new Date();
        }
        if (targetStatus === 'locked') {
            data.lockedAt = new Date();
        }
        await this.prisma.safetyMeeting.update({
            where: { id: meetingId },
            data,
        });
        if (targetStatus === 'completed' || targetStatus === 'reviewed') {
            await this.cail.ensureMeetingCail(meetingId, actorId);
        }
        await this.audit(meetingId, `status_${targetStatus}`, actorId);
        return this.get(meetingId);
    }
    async supervisorReview(meetingId, outcome, actorId, notes) {
        const meeting = await this.get(meetingId);
        if (!meeting.requiresSupervisorReview) {
            throw new common_1.BadRequestException('Supervisor review not required');
        }
        const statusMap = {
            approved: 'approved',
            rejected: 'rejected',
            changes_requested: 'changes_requested',
        };
        await this.prisma.safetyMeeting.update({
            where: { id: meetingId },
            data: Object.assign({ reviewStatus: statusMap[outcome], reviewNotes: notes, reviewedAt: new Date(), reviewedByUserId: actorId }, (outcome === 'approved' ? { status: 'reviewed' } : {})),
        });
        await this.audit(meetingId, `review_${outcome}`, actorId, { notes });
        return this.get(meetingId);
    }
    async addAttendee(meetingId, workerId, actorId) {
        const row = await this.prisma.safetyMeetingAttendee.upsert({
            where: { meetingId_workerId: { meetingId, workerId } },
            create: { meetingId, workerId, status: 'expected' },
            update: {},
            include: { worker: true },
        });
        await this.audit(meetingId, 'attendee_added', actorId, { workerId });
        return row;
    }
    async signOnWorker(input) {
        var _a, _b;
        const meeting = await this.get(input.meetingId);
        if (meeting.status === 'draft') {
            throw new common_1.BadRequestException('Publish or start the meeting before workers can sign on.');
        }
        if (['completed', 'reviewed', 'locked'].includes(meeting.status)) {
            throw new common_1.BadRequestException(`Cannot sign on — meeting is ${meeting.status}.`);
        }
        const worker = await this.prisma.worker.findUnique({
            where: { id: input.workerId },
            select: { id: true, firstName: true, lastName: true },
        });
        if (!worker)
            throw new common_1.NotFoundException(`Worker ${input.workerId} not found`);
        await this.addAttendee(input.meetingId, input.workerId, input.actorId);
        await this.checkInAttendee(input.meetingId, input.workerId, input.actorId);
        const attendee = await this.prisma.safetyMeetingAttendee.findUniqueOrThrow({
            where: {
                meetingId_workerId: {
                    meetingId: input.meetingId,
                    workerId: input.workerId,
                },
            },
        });
        const displayName = ((_a = input.signerName) === null || _a === void 0 ? void 0 : _a.trim()) ||
            `${worker.firstName} ${worker.lastName}`.trim();
        const signature = await this.addSignature({
            meetingId: input.meetingId,
            attendeeId: attendee.id,
            role: 'WORKER',
            signerWorkerId: input.workerId,
            signatureData: ((_b = input.signatureData) === null || _b === void 0 ? void 0 : _b.trim()) ||
                `digital_sign_on:${displayName}:${new Date().toISOString()}`,
            clientSyncId: `signon-${input.meetingId}-${input.workerId}-${Date.now()}`,
        });
        await this.audit(input.meetingId, 'worker_signed_on', input.actorId, {
            workerId: input.workerId,
            attendeeId: attendee.id,
            signatureId: signature.id,
            onProject: true,
        });
        return {
            meeting: await this.get(input.meetingId),
            attendee,
            signature,
            presence: {
                workerId: input.workerId,
                projectId: meeting.projectId,
                markedPresentAt: attendee.checkedInAt,
                source: 'safety_meeting_sign_on',
            },
        };
    }
    async checkInAttendee(meetingId, workerId, actorId) {
        await this.prisma.safetyMeetingAttendee.upsert({
            where: { meetingId_workerId: { meetingId, workerId } },
            create: { meetingId, workerId, status: 'expected' },
            update: {},
        });
        const training = await this.validateWorkerTraining(workerId, meetingId);
        const equipment = await this.validateWorkerEquipment(workerId, meetingId);
        const row = await this.prisma.safetyMeetingAttendee.update({
            where: { meetingId_workerId: { meetingId, workerId } },
            data: {
                status: 'present',
                checkedInAt: new Date(),
                trainingValid: training.valid,
                equipmentAuthorized: equipment.valid,
                identityVerified: true,
                verificationMethod: 'digital_checkin',
            },
            include: { worker: true },
        });
        await this.audit(meetingId, 'attendee_checked_in', actorId, {
            workerId,
            training,
            equipment,
        });
        return row;
    }
    async addSignature(input) {
        if (input.clientSyncId) {
            const dup = await this.prisma.safetyMeetingSignature.findUnique({
                where: { clientSyncId: input.clientSyncId },
            });
            if (dup)
                return dup;
        }
        return this.prisma.safetyMeetingSignature.create({
            data: {
                meetingId: input.meetingId,
                attendeeId: input.attendeeId,
                role: input.role,
                signerUserId: input.signerUserId,
                signerWorkerId: input.signerWorkerId,
                signatureData: input.signatureData,
                clientSyncId: input.clientSyncId,
            },
        });
    }
    async createCapaFromMeeting(input) {
        var _a, _b, _c;
        const meeting = await this.get(input.meetingId);
        const action = await this.capa.create({
            companyId: meeting.companyId,
            projectId: meeting.projectId,
            siteId: (_a = meeting.siteId) !== null && _a !== void 0 ? _a : undefined,
            sourceModule: 'safety_meetings',
            sourceId: meeting.id,
            sourceItemId: (_b = input.topicId) !== null && _b !== void 0 ? _b : '',
            title: input.title,
            description: input.description,
            createdByUserId: input.createdByUserId,
        });
        await this.prisma.safetyMeetingCorrectiveAction.create({
            data: {
                meetingId: meeting.id,
                topicId: input.topicId,
                correctiveActionId: action.id,
                origin: (_c = input.origin) !== null && _c !== void 0 ? _c : 'discussion',
            },
        });
        await this.prisma.safetyMeeting.update({
            where: { id: meeting.id },
            data: {
                requiresSupervisorReview: true,
                reviewStatus: meeting.reviewStatus === 'not_required'
                    ? 'pending'
                    : meeting.reviewStatus,
            },
        });
        await this.audit(meeting.id, 'capa_created', input.createdByUserId, {
            actionId: action.id,
        });
        return action;
    }
    async workerMeetingAccess(workerId, projectId) {
        const requirements = await this.prisma.siteAccessMeetingRequirement.findMany({
            where: { projectId, active: true },
        });
        const denialReasons = [];
        const checks = {};
        for (const req of requirements) {
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
            const key = `meeting_${req.meetingType}_${req.zoneCode}`;
            checks[key] = !!attended;
            if (!attended) {
                denialReasons.push(`Required ${req.meetingType} meeting not attended in last ${req.windowHours}h`);
            }
        }
        return {
            granted: denialReasons.length === 0,
            denialReasons,
            checks,
        };
    }
    async syncOffline(body) {
        var _a, _b, _c, _d, _e;
        const clientSyncId = body.clientSyncId;
        if (clientSyncId) {
            const existing = await this.prisma.safetyMeeting.findUnique({
                where: { clientSyncId },
            });
            if (existing) {
                throw new common_1.ConflictException({
                    code: 'SYNC_DUPLICATE',
                    meetingId: existing.id,
                });
            }
        }
        const created = await this.create({
            companyId: body.companyId,
            projectId: body.projectId,
            siteId: body.siteId,
            meetingType: (_a = body.meetingType) !== null && _a !== void 0 ? _a : 'toolbox_talk',
            title: (_b = body.title) !== null && _b !== void 0 ? _b : 'Offline meeting',
            createdByUserId: (_c = body.createdByUserId) !== null && _c !== void 0 ? _c : 0,
            topicIds: body.topicIds,
            facilitatorWorkerId: body.facilitatorWorkerId,
        });
        if (clientSyncId) {
            await this.prisma.safetyMeeting.update({
                where: { id: created.id },
                data: { clientSyncId },
            });
        }
        const attendees = (_d = body.attendees) !== null && _d !== void 0 ? _d : [];
        for (const a of attendees) {
            await this.checkInAttendee(created.id, a.workerId, body.createdByUserId);
        }
        const signatures = (_e = body.signatures) !== null && _e !== void 0 ? _e : [];
        for (const s of signatures) {
            await this.addSignature({
                meetingId: created.id,
                role: 'attendee',
                signerWorkerId: s.signerWorkerId,
                signatureData: s.signatureData,
                clientSyncId: s.clientSyncId,
            });
        }
        if (body.complete === true) {
            await this.transition(created.id, 'completed', body.createdByUserId);
        }
        return this.get(created.id);
    }
    async validateWorkerTraining(workerId, meetingId) {
        const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
            where: { id: meetingId },
            select: { projectId: true },
        });
        const records = await this.prisma.trainingRecord.findMany({
            where: {
                workerId,
                OR: [{ projectId: meeting.projectId }, { projectId: null }],
            },
        });
        const now = new Date();
        const valid = records.some((r) => !r.expiresAt || r.expiresAt > now);
        return { valid, recordCount: records.length };
    }
    async validateWorkerEquipment(workerId, meetingId) {
        const meeting = await this.prisma.safetyMeeting.findUniqueOrThrow({
            where: { id: meetingId },
            select: { projectId: true },
        });
        const lockouts = await this.prisma.equipmentLockout.count({
            where: {
                unlockedAt: null,
                equipment: {
                    equipmentAssignments: {
                        some: { workerId },
                    },
                },
            },
        });
        return { valid: lockouts === 0, activeLockouts: lockouts };
    }
    async linkStation(meetingId, stationId) {
        return this.prisma.safetyMeeting.update({
            where: { id: meetingId },
            data: { safetyStationId: stationId },
        });
    }
};
exports.PmSafetyMeetingsService = PmSafetyMeetingsService;
exports.PmSafetyMeetingsService = PmSafetyMeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_safety_meetings_cail_service_1.PmSafetyMeetingsCailService,
        pm_corrective_actions_service_1.PmCorrectiveActionsService,
        pm_safety_meetings_templates_service_1.PmSafetyMeetingsTemplatesService])
], PmSafetyMeetingsService);
//# sourceMappingURL=pm-safety-meetings.service.js.map