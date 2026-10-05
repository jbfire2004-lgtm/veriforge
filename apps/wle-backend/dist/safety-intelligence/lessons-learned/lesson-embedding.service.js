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
var LessonEmbeddingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonEmbeddingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const veri_agent_service_1 = require("../../veri-agent/veri-agent.service");
const STOP = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'were',
    'was',
    'are',
    'has',
    'have',
    'been',
    'into',
    'after',
    'before',
]);
let LessonEmbeddingService = LessonEmbeddingService_1 = class LessonEmbeddingService {
    constructor(prisma, veriAgent) {
        this.prisma = prisma;
        this.veriAgent = veriAgent;
        this.logger = new common_1.Logger(LessonEmbeddingService_1.name);
    }
    tokenize(text) {
        var _a;
        return ((_a = text.toLowerCase().match(/\b[a-z][a-z0-9]{2,}\b/g)) !== null && _a !== void 0 ? _a : []).filter((w) => !STOP.has(w));
    }
    vectorize(text) {
        var _a;
        const tokens = this.tokenize(text);
        const map = new Map();
        for (const t of tokens) {
            map.set(t, ((_a = map.get(t)) !== null && _a !== void 0 ? _a : 0) + 1);
        }
        return map;
    }
    cosine(a, b) {
        let dot = 0;
        let na = 0;
        let nb = 0;
        for (const v of a.values())
            na += v * v;
        for (const v of b.values())
            nb += v * v;
        for (const [k, va] of a) {
            const vb = b.get(k);
            if (vb)
                dot += va * vb;
        }
        if (!na || !nb)
            return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
    async embedLesson(lessonId) {
        var _a;
        const lesson = await this.prisma.lessonsLearnedEntry.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return null;
        const text = [
            lesson.title,
            lesson.summary,
            lesson.rootCause,
            lesson.correctiveAction,
        ]
            .filter(Boolean)
            .join(' ');
        const vector = this.vectorize(text);
        const sparse = Object.fromEntries(vector);
        let apiVector = null;
        if (this.veriAgent.isEmbeddingConfigured() &&
            lesson.companyId != null &&
            lesson.companyId > 0) {
            const result = await this.veriAgent.embed({
                purpose: 'lesson_embedding',
                tenant: {
                    companyId: lesson.companyId,
                    projectId: (_a = lesson.projectId) !== null && _a !== void 0 ? _a : undefined,
                },
                text,
            });
            if (result.ok === true) {
                apiVector = result.embedding;
            }
            else {
                this.logger.warn(`VeriAgent embed declined for lesson ${lessonId}: ${result.reason}`);
            }
        }
        await this.prisma.lessonsLearnedEntry.update({
            where: { id: lessonId },
            data: {
                embedding: (apiVector !== null && apiVector !== void 0 ? apiVector : sparse),
                embeddingModel: apiVector ? 'openai' : 'tfidf-sparse',
            },
        });
        return { lessonId, model: apiVector ? 'openai' : 'tfidf-sparse' };
    }
    async reclusterProject(projectId, threshold = 0.32) {
        const lessons = await this.prisma.lessonsLearnedEntry.findMany({
            where: { projectId },
            select: {
                id: true,
                title: true,
                summary: true,
                rootCause: true,
                correctiveAction: true,
                embedding: true,
                aiInsights: true,
            },
        });
        const vectors = lessons.map((l) => {
            const text = [l.title, l.summary, l.rootCause, l.correctiveAction]
                .filter(Boolean)
                .join(' ');
            if (l.embedding && Array.isArray(l.embedding)) {
                return {
                    lesson: l,
                    vec: null,
                    dense: l.embedding,
                };
            }
            if (l.embedding &&
                typeof l.embedding === 'object' &&
                !Array.isArray(l.embedding)) {
                return {
                    lesson: l,
                    vec: new Map(Object.entries(l.embedding)),
                    dense: null,
                };
            }
            return { lesson: l, vec: this.vectorize(text), dense: null };
        });
        const assigned = new Set();
        const clusters = [];
        let clusterIndex = 0;
        for (const item of vectors) {
            if (assigned.has(item.lesson.id))
                continue;
            const members = [item];
            assigned.add(item.lesson.id);
            for (const other of vectors) {
                if (assigned.has(other.lesson.id))
                    continue;
                const sim = this.similarity(item, other);
                if (sim >= threshold) {
                    members.push(other);
                    assigned.add(other.lesson.id);
                }
            }
            const clusterId = `emb_${projectId}_${clusterIndex++}`;
            const label = members[0].lesson.title.slice(0, 48) || `Cluster ${clusterIndex}`;
            for (const m of members) {
                await this.prisma.lessonsLearnedEntry.update({
                    where: { id: m.lesson.id },
                    data: { aiClusterId: clusterId },
                });
            }
            const takeaways = members.flatMap((m) => {
                var _a;
                const insights = m.lesson.aiInsights;
                return (_a = insights === null || insights === void 0 ? void 0 : insights.keyTakeaways) !== null && _a !== void 0 ? _a : [];
            });
            clusters.push({
                clusterId,
                label,
                count: members.length,
                similarity: threshold,
                lessonIds: members.map((m) => m.lesson.id),
                meetingTopics: [...new Set(takeaways)].slice(0, 4),
            });
        }
        return { projectId, clusters, lessonCount: lessons.length };
    }
    similarity(a, b) {
        if (a.dense && b.dense && a.dense.length === b.dense.length) {
            let dot = 0;
            let na = 0;
            let nb = 0;
            for (let i = 0; i < a.dense.length; i++) {
                dot += a.dense[i] * b.dense[i];
                na += a.dense[i] ** 2;
                nb += b.dense[i] ** 2;
            }
            return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
        }
        if (a.vec && b.vec)
            return this.cosine(a.vec, b.vec);
        return 0;
    }
};
exports.LessonEmbeddingService = LessonEmbeddingService;
exports.LessonEmbeddingService = LessonEmbeddingService = LessonEmbeddingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        veri_agent_service_1.VeriAgentService])
], LessonEmbeddingService);
//# sourceMappingURL=lesson-embedding.service.js.map