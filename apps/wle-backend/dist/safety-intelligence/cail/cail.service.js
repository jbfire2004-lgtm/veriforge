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
exports.CailService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_types_1 = require("./cail.types");
const cail_scope_service_1 = require("./cail-scope.service");
const lessons_learned_service_1 = require("../lessons-learned/lessons-learned.service");
const safety_intelligence_ai_service_1 = require("../ai/safety-intelligence-ai.service");
const cail_copilot_enrichment_service_1 = require("./cail-copilot-enrichment.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_types_1 = require("../../notifications/notification-types");
const vsi_event_service_1 = require("../events/vsi-event.service");
const includeDetail = {
    project: { select: { id: true, name: true, code: true } },
    ownerCompany: { select: { id: true, name: true } },
    assignedUser: { select: { id: true, username: true } },
    createdBy: { select: { id: true, username: true } },
    verifiedBy: { select: { id: true, username: true } },
    attachments: { orderBy: { createdAt: 'asc' } },
    activityLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
};
let CailService = class CailService {
    constructor(prisma, scope, lessonsLearned, ai, copilotEnrich, notifications, vsiEvents) {
        this.prisma = prisma;
        this.scope = scope;
        this.lessonsLearned = lessonsLearned;
        this.ai = ai;
        this.copilotEnrich = copilotEnrich;
        this.notifications = notifications;
        this.vsiEvents = vsiEvents;
    }
    assertTransition(from, to) {
        var _a;
        const allowed = (_a = cail_types_1.CAIL_TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Cannot transition from ${from} to ${to}`);
        }
    }
    async log(cailId, eventType, actorId, payload) {
        await this.prisma.cailActivityLog.create({
            data: {
                cailId,
                eventType,
                actorId,
                payload: payload,
            },
        });
    }
    async list(actor, filters) {
        const where = this.scope.buildListWhere(actor, filters);
        return this.prisma.cailEntry.findMany({
            where: where,
            include: {
                project: { select: { id: true, name: true } },
                ownerCompany: { select: { id: true, name: true } },
                assignedUser: { select: { id: true, username: true } },
            },
            orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
            take: 200,
        });
    }
    async getById(id, actor) {
        const entry = await this.prisma.cailEntry.findUnique({
            where: { id },
            include: includeDetail,
        });
        if (!entry)
            throw new common_1.NotFoundException('CAIL entry not found');
        if (!this.scope.canAccessEntry(actor, entry)) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return entry;
    }
    async create(dto, actor) {
        var _a, _b, _c, _d;
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const sourceId = (_a = dto.sourceId) !== null && _a !== void 0 ? _a : (0, crypto_1.randomUUID)();
        const sourceItemId = (_b = dto.sourceItemId) !== null && _b !== void 0 ? _b : '';
        try {
            const entry = await this.prisma.cailEntry.create({
                data: {
                    projectId: dto.projectId,
                    ownerCompanyId: dto.ownerCompanyId,
                    assignedUserId: dto.assignedUserId,
                    sourceType: dto.sourceType,
                    sourceId,
                    sourceItemId,
                    title: dto.title,
                    description: dto.description,
                    severity: (_c = dto.severity) !== null && _c !== void 0 ? _c : 'medium',
                    riskCategory: dto.riskCategory,
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                    status: 'open',
                    siteId: dto.siteId,
                    locationNote: dto.locationNote,
                    equipmentId: dto.equipmentId,
                    workerId: dto.workerId,
                    tags: ((_d = dto.tags) !== null && _d !== void 0 ? _d : []),
                    createdByUserId: actor.id,
                },
                include: includeDetail,
            });
            await this.log(entry.id, 'created', actor.id);
            return entry;
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                const existing = await this.prisma.cailEntry.findFirst({
                    where: {
                        sourceType: dto.sourceType,
                        sourceId,
                        sourceItemId,
                    },
                    include: includeDetail,
                });
                if (existing)
                    return existing;
            }
            throw e;
        }
    }
    async update(id, dto, actor) {
        const entry = await this.getById(id, actor);
        const updated = await this.prisma.cailEntry.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                assignedUserId: dto.assignedUserId,
                severity: dto.severity,
                riskCategory: dto.riskCategory,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                status: dto.status,
                rootCauseCategory: dto.rootCauseCategory,
                rootCauseNotes: dto.rootCauseNotes,
                tags: dto.tags,
            },
            include: includeDetail,
        });
        await this.log(id, 'updated', actor.id, { fields: Object.keys(dto) });
        if (dto.status && dto.status !== entry.status) {
            await this.log(id, `transition:${entry.status}->${dto.status}`, actor.id);
        }
        return updated;
    }
    async assign(id, data, actor) {
        const prior = await this.getById(id, actor);
        const updated = await this.prisma.cailEntry.update({
            where: { id },
            data: {
                assignedUserId: data.assignedUserId,
                ownerCompanyId: data.ownerCompanyId,
                status: 'in_progress',
            },
            include: includeDetail,
        });
        await this.log(id, 'assigned', actor.id, data);
        if (data.assignedUserId && data.assignedUserId !== prior.assignedUserId) {
            this.vsiEvents.cailAssigned({
                id,
                projectId: prior.projectId,
                ownerCompanyId: updated.ownerCompanyId,
                assignedUserId: data.assignedUserId,
                actorId: actor.id,
            });
            await this.notifications.notifyUsers({
                userIds: [data.assignedUserId],
                type: notification_types_1.NOTIFICATION_TYPES.CAIL_ASSIGNED,
                title: 'CAIL assigned to you',
                body: `"${prior.title}" requires your attention.`,
                dedupeKey: `cail-assigned:${id}:u${data.assignedUserId}`,
                payload: { cailId: id, projectId: prior.projectId },
                companyId: updated.ownerCompanyId,
            });
        }
        return updated;
    }
    async analyzeWithAi(id, actor) {
        const entry = await this.getById(id, actor);
        const openCailCount = await this.prisma.cailEntry.count({
            where: {
                projectId: entry.projectId,
                status: { in: ['open', 'in_progress', 'overdue'] },
            },
        });
        const analysis = await this.ai.analyzeCailEntry({
            title: entry.title,
            description: entry.description,
            sourceType: entry.sourceType,
            severity: entry.severity,
            riskCategory: entry.riskCategory,
            rootCauseNotes: entry.rootCauseNotes,
            projectId: entry.projectId,
            companyId: entry.ownerCompanyId,
            openCailCount,
        });
        if (analysis.copilotRun) {
            await this.copilotEnrich.persistRun(id, analysis.copilotRun);
        }
        const updated = await this.prisma.cailEntry.findUniqueOrThrow({
            where: { id },
            include: includeDetail,
        });
        await this.log(id, 'ai_analyzed', actor.id, {
            engine: analysis.engine,
        });
        return { entry: updated, analysis };
    }
    async resolve(id, dto, actor) {
        var _a, _b;
        const entry = await this.getById(id, actor);
        this.assertTransition(entry.status, 'resolved');
        if ((_a = dto.attachments) === null || _a === void 0 ? void 0 : _a.length) {
            for (const a of dto.attachments) {
                await this.prisma.cailAttachment.create({
                    data: {
                        cailId: id,
                        phase: 'after',
                        fileName: a.fileName,
                        storageKey: a.storageKey,
                        mimeType: a.mimeType,
                        dataUrl: a.dataUrl,
                        uploadedById: actor.id,
                    },
                });
            }
        }
        const closedAt = new Date();
        const hours = (closedAt.getTime() - entry.createdAt.getTime()) / (1000 * 60 * 60);
        return this.prisma.cailEntry
            .update({
            where: { id },
            data: {
                status: 'resolved',
                closedAt,
                timeToResolveHours: hours,
                rootCauseNotes: (_b = dto.resolutionNotes) !== null && _b !== void 0 ? _b : entry.rootCauseNotes,
                evidenceAfter: dto.evidenceAfter,
            },
            include: includeDetail,
        })
            .then(async (row) => {
            await this.log(id, 'resolved', actor.id);
            this.vsiEvents.cailResolved({
                id,
                projectId: entry.projectId,
                ownerCompanyId: entry.ownerCompanyId,
                actorId: actor.id,
            });
            return row;
        });
    }
    async verify(id, actor, note) {
        const entry = await this.getById(id, actor);
        if (!this.scope.canVerify(actor, entry.projectId)) {
            throw new common_1.ForbiddenException('Only supervisors or PM can verify');
        }
        this.assertTransition(entry.status, 'verified');
        const updated = await this.prisma.cailEntry.update({
            where: { id },
            data: {
                status: 'verified',
                verifiedAt: new Date(),
                verifiedByUserId: actor.id,
            },
            include: includeDetail,
        });
        await this.log(id, 'verified', actor.id, note ? { note } : undefined);
        this.vsiEvents.cailVerified({
            id,
            projectId: entry.projectId,
            ownerCompanyId: entry.ownerCompanyId,
            actorId: actor.id,
        });
        try {
            await this.lessonsLearned.materializeFromCail(id);
        }
        catch (_a) {
        }
        return this.prisma.cailEntry.findUnique({
            where: { id },
            include: Object.assign(Object.assign({}, includeDetail), { lessonLearned: true }),
        });
    }
    async cancel(id, actor, reason) {
        const entry = await this.getById(id, actor);
        this.assertTransition(entry.status, 'cancelled');
        const updated = await this.prisma.cailEntry.update({
            where: { id },
            data: { status: 'cancelled' },
            include: includeDetail,
        });
        await this.log(id, 'cancelled', actor.id, reason ? { reason } : undefined);
        return updated;
    }
    getWorkflowDefinition() {
        return {
            statuses: Object.keys(cail_types_1.CAIL_TRANSITIONS),
            transitions: cail_types_1.CAIL_TRANSITIONS,
        };
    }
};
exports.CailService = CailService;
exports.CailService = CailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_scope_service_1.CailScopeService,
        lessons_learned_service_1.LessonsLearnedService,
        safety_intelligence_ai_service_1.SafetyIntelligenceAiService,
        cail_copilot_enrichment_service_1.CailCopilotEnrichmentService,
        notifications_service_1.NotificationsService,
        vsi_event_service_1.VsiEventService])
], CailService);
//# sourceMappingURL=cail.service.js.map