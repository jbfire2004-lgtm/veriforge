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
exports.JhaLibraryLearningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let JhaLibraryLearningService = class JhaLibraryLearningService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProjectLearnings(projectId, limit = 15) {
        var _a;
        const approved = await this.prisma.jhaFlha.findMany({
            where: { projectId, status: { in: ['APPROVED', 'LOCKED'] } },
            select: {
                hazards: { select: { description: true, category: true } },
                controls: { select: { description: true, controlType: true } },
            },
            take: 200,
            orderBy: { approvedAt: 'desc' },
        });
        const hazardCounts = new Map();
        const controlCounts = new Map();
        for (const form of approved) {
            for (const h of form.hazards) {
                const key = h.description.toLowerCase().trim();
                const existing = hazardCounts.get(key);
                if (existing) {
                    existing.count += 1;
                }
                else {
                    hazardCounts.set(key, {
                        description: h.description,
                        category: (_a = h.category) !== null && _a !== void 0 ? _a : undefined,
                        count: 1,
                        reason: 'Used on approved forms for this project',
                    });
                }
            }
            for (const c of form.controls) {
                const key = c.description.toLowerCase().trim();
                const existing = controlCounts.get(key);
                if (existing) {
                    existing.count += 1;
                }
                else {
                    controlCounts.set(key, {
                        description: c.description,
                        controlType: c.controlType,
                        count: 1,
                        reason: 'Used on approved forms for this project',
                    });
                }
            }
        }
        const sortByCount = (a, b) => b.count - a.count;
        return {
            approvedFormCount: approved.length,
            hazards: Array.from(hazardCounts.values())
                .sort(sortByCount)
                .slice(0, limit),
            controls: Array.from(controlCounts.values())
                .sort(sortByCount)
                .slice(0, limit),
        };
    }
    async promoteFromApprovedJha(jhaFlhaId) {
        var _a, _b;
        const row = await this.prisma.jhaFlha.findUnique({
            where: { id: jhaFlhaId },
            include: { hazards: true, controls: true },
        });
        if (!row)
            return { hazardsAdded: 0, controlsAdded: 0 };
        let hazardsAdded = 0;
        let controlsAdded = 0;
        for (const h of row.hazards) {
            if (h.libraryEntryId)
                continue;
            const exists = await this.prisma.hazardLibraryEntry.findFirst({
                where: {
                    companyId: row.companyId,
                    projectId: row.projectId,
                    description: h.description,
                },
            });
            if (!exists) {
                await this.prisma.hazardLibraryEntry.create({
                    data: {
                        companyId: row.companyId,
                        projectId: row.projectId,
                        category: (_a = h.category) !== null && _a !== void 0 ? _a : 'Field',
                        description: h.description,
                        defaultSeverity: h.severity,
                        defaultLikelihood: h.likelihood,
                        defaultEnergyTypes: ((_b = h.energyTypes) !== null && _b !== void 0 ? _b : []),
                    },
                });
                hazardsAdded += 1;
            }
        }
        for (const c of row.controls) {
            if (c.libraryEntryId)
                continue;
            const hazard = c.hazardId
                ? row.hazards.find((h) => h.id === c.hazardId)
                : undefined;
            const exists = await this.prisma.controlLibraryEntry.findFirst({
                where: {
                    companyId: row.companyId,
                    projectId: row.projectId,
                    description: c.description,
                },
            });
            if (!exists) {
                await this.prisma.controlLibraryEntry.create({
                    data: {
                        companyId: row.companyId,
                        projectId: row.projectId,
                        controlType: c.controlType,
                        description: c.description,
                        hazardCategories: ((hazard === null || hazard === void 0 ? void 0 : hazard.category)
                            ? [hazard.category]
                            : []),
                        ppeRequired: c.ppeRequired,
                    },
                });
                controlsAdded += 1;
            }
        }
        return { hazardsAdded, controlsAdded };
    }
};
exports.JhaLibraryLearningService = JhaLibraryLearningService;
exports.JhaLibraryLearningService = JhaLibraryLearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JhaLibraryLearningService);
//# sourceMappingURL=jha-library-learning.service.js.map