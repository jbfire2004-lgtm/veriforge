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
exports.VsiPresentationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_scope_service_1 = require("../cail/cail-scope.service");
let VsiPresentationsService = class VsiPresentationsService {
    constructor(prisma, scope) {
        this.prisma = prisma;
        this.scope = scope;
    }
    async generateProjectBrief(projectId, actor) {
        const cailWhere = this.scope.buildListWhere(actor, { projectId });
        const [cailTotal, verified, lessons, bboTotal, bboSafe, bySource] = await Promise.all([
            this.prisma.cailEntry.count({ where: Object.assign(Object.assign({}, cailWhere), { projectId }) }),
            this.prisma.cailEntry.count({
                where: Object.assign(Object.assign({}, cailWhere), { projectId, status: client_1.CailStatus.verified }),
            }),
            this.prisma.lessonsLearnedEntry.findMany({
                where: { projectId },
                orderBy: { publishedAt: 'desc' },
                take: 5,
                select: {
                    title: true,
                    summary: true,
                    severity: true,
                    sourceType: true,
                },
            }),
            this.prisma.bboObservation.count({ where: { projectId } }),
            this.prisma.bboObservation.count({
                where: { projectId, polarity: 'safe' },
            }),
            this.prisma.cailEntry.groupBy({
                by: ['sourceType'],
                where: Object.assign(Object.assign({}, cailWhere), { projectId }),
                _count: true,
            }),
        ]);
        const positiveRatio = bboTotal > 0 ? bboSafe / bboTotal : 0;
        const sourceMix = Object.fromEntries(bySource.map((r) => [r.sourceType, r._count]));
        const slides = [
            {
                title: 'Safety intelligence overview',
                bullets: [
                    `${cailTotal} corrective actions tracked in CAIL`,
                    `${verified} verified closures`,
                    `${Math.round(positiveRatio * 100)}% positive BBO ratio (${bboSafe}/${bboTotal})`,
                ],
            },
            {
                title: 'Source mix',
                bullets: Object.entries(sourceMix).map(([k, v]) => `${k}: ${v} entries`),
            },
            {
                title: 'Recent lessons learned',
                bullets: lessons.length > 0
                    ? lessons.map((l) => l.title)
                    : ['No published lessons yet — verify CAIL entries to generate'],
            },
        ];
        const narrative = [
            `# Project ${projectId} — Safety Intelligence Brief`,
            ``,
            `This project has **${cailTotal}** CAIL entries with **${verified}** verified.`,
            `Behavior-based observations show a **${Math.round(positiveRatio * 100)}%** positive (safe) rate.`,
            ``,
            lessons.length
                ? `## Highlights\n${lessons
                    .map((l) => `- **${l.title}** (${l.sourceType})`)
                    .join('\n')}`
                : `## Highlights\n- Focus on closing open corrective actions and verifying resolutions to build the lessons library.`,
        ].join('\n');
        return {
            projectId,
            generatedAt: new Date().toISOString(),
            slides,
            narrative,
        };
    }
};
exports.VsiPresentationsService = VsiPresentationsService;
exports.VsiPresentationsService = VsiPresentationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_scope_service_1.CailScopeService])
], VsiPresentationsService);
//# sourceMappingURL=presentations.service.js.map