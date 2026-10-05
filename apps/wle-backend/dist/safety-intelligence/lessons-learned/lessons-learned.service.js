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
exports.LessonsLearnedService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const safety_intelligence_ai_service_1 = require("../ai/safety-intelligence-ai.service");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const lesson_embedding_service_1 = require("./lesson-embedding.service");
const vsi_event_service_1 = require("../events/vsi-event.service");
let LessonsLearnedService = class LessonsLearnedService {
    constructor(prisma, ai, scope, embeddings, vsiEvents) {
        this.prisma = prisma;
        this.ai = ai;
        this.scope = scope;
        this.embeddings = embeddings;
        this.vsiEvents = vsiEvents;
    }
    async materializeFromCail(cailId) {
        var _a, _b;
        const entry = await this.prisma.cailEntry.findUnique({
            where: { id: cailId },
            include: { attachments: true, lessonLearned: true },
        });
        if (!entry)
            throw new common_1.NotFoundException('CAIL entry not found');
        if (entry.lessonLearned)
            return entry.lessonLearned;
        if (entry.status !== client_1.CailStatus.verified)
            return null;
        const insights = await this.ai.buildLessonInsights({
            title: entry.title,
            description: entry.description,
            sourceType: entry.sourceType,
            rootCauseNotes: entry.rootCauseNotes,
            rootCauseCategory: entry.rootCauseCategory,
            severity: entry.severity,
            companyId: entry.ownerCompanyId,
            projectId: entry.projectId,
        });
        const clusterId = entry.riskCategory
            ? `cluster_${entry.projectId}_${entry.riskCategory}`
            : undefined;
        const summary = (_a = insights.summary) !== null && _a !== void 0 ? _a : ([
            entry.description,
            entry.rootCauseNotes ? `Root cause: ${entry.rootCauseNotes}` : null,
        ]
            .filter(Boolean)
            .join('\n\n') ||
            entry.title);
        const lesson = await this.prisma.lessonsLearnedEntry.create({
            data: {
                cailId: entry.id,
                projectId: entry.projectId,
                companyId: entry.ownerCompanyId,
                sourceType: entry.sourceType,
                title: entry.title,
                summary,
                rootCause: (_b = entry.rootCauseNotes) !== null && _b !== void 0 ? _b : insights.rootCause,
                correctiveAction: insights.correctiveAction,
                beforeEvidence: entry.evidenceBefore,
                afterEvidence: entry.evidenceAfter,
                severity: entry.severity,
                timeToCloseHours: entry.timeToResolveHours,
                tags: entry.tags,
                aiClusterId: clusterId,
                aiInsights: insights,
            },
        });
        await this.prisma.cailEntry.update({
            where: { id: cailId },
            data: { lessonsLearnedGenerated: true },
        });
        await this.prisma.cailActivityLog.create({
            data: {
                cailId,
                eventType: 'lesson_learned_created',
                payload: { lessonId: lesson.id },
            },
        });
        try {
            await this.embeddings.embedLesson(lesson.id);
        }
        catch (_c) {
        }
        this.vsiEvents.lessonPublished({
            id: lesson.id,
            projectId: lesson.projectId,
            companyId: lesson.companyId,
            cailId: lesson.cailId,
        });
        return lesson;
    }
    async recluster(projectId, actor) {
        if (!this.scope.isPrime(actor) && actor.companyId) {
        }
        return this.embeddings.reclusterProject(projectId);
    }
    async list(actor, filters) {
        const where = {};
        if (filters.projectId)
            where.projectId = filters.projectId;
        if (filters.companyId)
            where.companyId = filters.companyId;
        if (!this.scope.isPrime(actor) && actor.companyId) {
            where.companyId = actor.companyId;
        }
        return this.prisma.lessonsLearnedEntry.findMany({
            where,
            include: {
                project: { select: { id: true, name: true } },
                company: { select: { id: true, name: true } },
                cail: { select: { id: true, status: true, sourceType: true } },
            },
            orderBy: { publishedAt: 'desc' },
            take: 100,
        });
    }
    async getById(id, actor) {
        const row = await this.prisma.lessonsLearnedEntry.findUnique({
            where: { id },
            include: {
                project: { select: { id: true, name: true } },
                company: { select: { id: true, name: true } },
                cail: true,
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Lesson not found');
        if (!this.scope.isPrime(actor) && actor.companyId !== row.companyId) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        return row;
    }
    async clusters(projectId) {
        var _a, _b;
        const embeddingClusters = await this.prisma.lessonsLearnedEntry.groupBy({
            by: ['aiClusterId'],
            where: { projectId, aiClusterId: { startsWith: 'emb_' } },
            _count: true,
        });
        if (embeddingClusters.length > 0) {
            const lessons = await this.prisma.lessonsLearnedEntry.findMany({
                where: { projectId, aiClusterId: { startsWith: 'emb_' } },
                select: {
                    id: true,
                    title: true,
                    aiClusterId: true,
                    severity: true,
                    sourceType: true,
                    aiInsights: true,
                    embeddingModel: true,
                },
            });
            const map = new Map();
            for (const l of lessons) {
                const key = l.aiClusterId;
                const bucket = (_a = map.get(key)) !== null && _a !== void 0 ? _a : [];
                bucket.push(l);
                map.set(key, bucket);
            }
            return [...map.entries()].map(([clusterId, items]) => {
                var _a, _b, _c, _d;
                const takeaways = items.flatMap((l) => {
                    var _a;
                    const i = l.aiInsights;
                    return (_a = i === null || i === void 0 ? void 0 : i.keyTakeaways) !== null && _a !== void 0 ? _a : [];
                });
                return {
                    clusterId,
                    label: (_b = (_a = items[0]) === null || _a === void 0 ? void 0 : _a.title.slice(0, 48)) !== null && _b !== void 0 ? _b : clusterId,
                    count: items.length,
                    embedding: true,
                    embeddingModel: (_d = (_c = items[0]) === null || _c === void 0 ? void 0 : _c.embeddingModel) !== null && _d !== void 0 ? _d : 'tfidf-sparse',
                    lessons: items,
                    meetingTopics: [...new Set(takeaways)].slice(0, 4),
                };
            });
        }
        const lessons = await this.prisma.lessonsLearnedEntry.findMany({
            where: { projectId, aiClusterId: { not: null } },
            select: {
                aiClusterId: true,
                id: true,
                title: true,
                severity: true,
                sourceType: true,
            },
        });
        const map = new Map();
        for (const l of lessons) {
            const key = l.aiClusterId;
            const bucket = (_b = map.get(key)) !== null && _b !== void 0 ? _b : { clusterId: key, count: 0, lessons: [] };
            bucket.count += 1;
            bucket.lessons.push(l);
            map.set(key, bucket);
        }
        const clusters = [...map.values()].sort((a, b) => b.count - a.count);
        const fullLessons = await this.prisma.lessonsLearnedEntry.findMany({
            where: { projectId, aiClusterId: { not: null } },
            select: { aiClusterId: true, aiInsights: true, sourceType: true },
        });
        return clusters.map((c) => {
            const insights = fullLessons
                .filter((l) => l.aiClusterId === c.clusterId)
                .map((l) => l.aiInsights);
            const takeaways = [
                ...new Set(insights.flatMap((i) => { var _a; return (_a = i === null || i === void 0 ? void 0 : i.keyTakeaways) !== null && _a !== void 0 ? _a : []; }).slice(0, 3)),
            ];
            const label = c.clusterId.replace(/^cluster_\d+_/, '').replace(/_/g, ' ');
            return Object.assign(Object.assign({}, c), { label, meetingTopics: takeaways.length
                    ? takeaways
                    : [`Review ${label} trends with crews`] });
        });
    }
};
exports.LessonsLearnedService = LessonsLearnedService;
exports.LessonsLearnedService = LessonsLearnedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        safety_intelligence_ai_service_1.SafetyIntelligenceAiService,
        cail_scope_service_1.CailScopeService,
        lesson_embedding_service_1.LessonEmbeddingService,
        vsi_event_service_1.VsiEventService])
], LessonsLearnedService);
//# sourceMappingURL=lessons-learned.service.js.map