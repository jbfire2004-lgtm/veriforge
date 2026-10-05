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
exports.PmSafetyMeetingsTopicLibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_meetings_constants_1 = require("./pm-safety-meetings.constants");
const topic_suggest_engine_1 = require("./topic-suggest.engine");
let PmSafetyMeetingsTopicLibraryService = class PmSafetyMeetingsTopicLibraryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.suggestEngine = new topic_suggest_engine_1.TopicSuggestEngine();
    }
    async ensureCategories(companyId, projectId) {
        for (const c of pm_safety_meetings_constants_1.DEFAULT_TOPIC_CATEGORIES) {
            const existing = await this.prisma.topicLibraryCategory.findFirst({
                where: {
                    companyId,
                    projectId: projectId !== null && projectId !== void 0 ? projectId : null,
                    code: c.code,
                },
            });
            if (!existing) {
                await this.prisma.topicLibraryCategory.create({
                    data: {
                        companyId,
                        projectId,
                        code: c.code,
                        name: c.name,
                        sortOrder: c.sortOrder,
                    },
                });
            }
        }
    }
    async listTopics(companyId, projectId, categoryCode) {
        await this.ensureCategories(companyId, projectId);
        return this.prisma.topicLibraryEntry.findMany({
            where: Object.assign({ active: true, deletedAt: null, companyId, OR: [{ projectId: null }, { projectId: projectId !== null && projectId !== void 0 ? projectId : -1 }] }, (categoryCode
                ? { category: { code: categoryCode } }
                : {})),
            include: { category: true },
            orderBy: [{ usageCount: 'desc' }, { title: 'asc' }],
            take: 200,
        });
    }
    async createTopic(data) {
        var _a, _b, _c;
        return this.prisma.topicLibraryEntry.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                categoryId: data.categoryId,
                scope: data.projectId ? 'project' : 'company',
                title: data.title,
                summary: data.summary,
                discussionPoints: ((_a = data.discussionPoints) !== null && _a !== void 0 ? _a : []),
                requiredControls: ((_b = data.requiredControls) !== null && _b !== void 0 ? _b : []),
                isHighRisk: (_c = data.isHighRisk) !== null && _c !== void 0 ? _c : false,
            },
        });
    }
    async suggestTopics(projectId, companyId) {
        const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const [incidents, deficiencies, jhas, equipment, sifEvents] = await Promise.all([
            this.prisma.pmSafetyEvent.findMany({
                where: { projectId, createdAt: { gte: since } },
                select: { id: true, title: true, severity: true },
                take: 10,
            }),
            this.prisma.pmInspectionDeficiency.findMany({
                where: {
                    inspection: { projectId },
                    status: { in: ['open', 'assigned'] },
                },
                select: { id: true, title: true, severity: true },
                take: 10,
            }),
            this.prisma.jhaFlha.findMany({
                where: { projectId, sifScore: { gte: 60 } },
                select: { id: true, taskDescription: true, sifScore: true },
                take: 10,
            }),
            this.prisma.equipmentLockout.findMany({
                where: { unlockedAt: null },
                include: { equipment: { select: { name: true } } },
                take: 5,
            }),
            this.prisma.sifHecaEvent.findMany({
                where: { projectId, createdAt: { gte: since } },
                select: {
                    title: true,
                    hecaScore: { select: { hecaCategoryCode: true } },
                },
                take: 20,
            }),
        ]);
        const sifTags = [
            ...new Set(sifEvents
                .map((e) => { var _a, _b; return (_b = (_a = e.hecaScore) === null || _a === void 0 ? void 0 : _a.hecaCategoryCode) !== null && _b !== void 0 ? _b : e.title; })
                .filter(Boolean)),
        ];
        return this.suggestEngine.suggest({
            recentIncidents: incidents.map((i) => {
                var _a;
                return ({
                    id: i.id,
                    title: i.title,
                    severity: (_a = i.severity) !== null && _a !== void 0 ? _a : undefined,
                });
            }),
            recentDeficiencies: deficiencies.map((d) => ({
                id: d.id,
                title: d.title,
                score: d.severity === 'critical' ? 100 : d.severity === 'high' ? 75 : 50,
            })),
            highRiskJhas: jhas.map((j) => {
                var _a;
                return ({
                    id: j.id,
                    title: j.taskDescription.slice(0, 120),
                    sifScore: (_a = j.sifScore) !== null && _a !== void 0 ? _a : undefined,
                });
            }),
            equipmentFailures: equipment.map((e) => {
                var _a, _b;
                return ({
                    id: String(e.id),
                    title: (_b = (_a = e.equipment) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Equipment lockout',
                });
            }),
            sifTrendTags: sifTags,
            projectRiskScore: await this.projectRiskScore(projectId),
        });
    }
    async projectRiskScore(projectId) {
        const [openCapa, openSif, openDef] = await Promise.all([
            this.prisma.pmCorrectiveAction.count({
                where: {
                    projectId,
                    status: {
                        in: ['open', 'assigned', 'in_progress', 'verification_pending'],
                    },
                },
            }),
            this.prisma.sifHecaEvent.count({
                where: {
                    projectId,
                    createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
                },
            }),
            this.prisma.pmInspectionDeficiency.count({
                where: {
                    inspection: { projectId },
                    status: 'open',
                },
            }),
        ]);
        return Math.min(100, openCapa * 8 + openSif * 12 + openDef * 5);
    }
};
exports.PmSafetyMeetingsTopicLibraryService = PmSafetyMeetingsTopicLibraryService;
exports.PmSafetyMeetingsTopicLibraryService = PmSafetyMeetingsTopicLibraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmSafetyMeetingsTopicLibraryService);
//# sourceMappingURL=pm-safety-meetings-topic-library.service.js.map