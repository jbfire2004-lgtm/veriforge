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
exports.RegulatoryEquivalencyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const regulatory_equivalency_seed_1 = require("./regulatory-equivalency.seed");
let RegulatoryEquivalencyService = class RegulatoryEquivalencyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedIfEmpty();
    }
    async seedIfEmpty() {
        const count = await this.prisma.regulatoryEquivalency.count();
        if (count > 0)
            return;
        for (const row of regulatory_equivalency_seed_1.REGULATORY_EQUIVALENCY_SEED) {
            await this.prisma.regulatoryEquivalency.upsert({
                where: {
                    fromJurisdiction_toJurisdiction_standardCode: {
                        fromJurisdiction: row.fromJurisdiction,
                        toJurisdiction: row.toJurisdiction,
                        standardCode: row.standardCode,
                    },
                },
                create: {
                    fromJurisdiction: row.fromJurisdiction,
                    toJurisdiction: row.toJurisdiction,
                    standardCode: row.standardCode,
                    notes: row.notes,
                },
                update: { active: true, notes: row.notes },
            });
        }
    }
    async resolveJurisdictionCoverage(sourceJurisdiction, matchedStandardCodes) {
        const source = sourceJurisdiction.trim().toUpperCase();
        const codes = [...new Set(matchedStandardCodes.filter(Boolean))];
        const coverage = new Set([source, 'CA-FED']);
        if (codes.length === 0)
            return [...coverage];
        const rows = await this.prisma.regulatoryEquivalency.findMany({
            where: {
                active: true,
                fromJurisdiction: source,
                standardCode: { in: codes },
            },
            select: { toJurisdiction: true, standardCode: true },
        });
        for (const r of rows) {
            coverage.add(r.toJurisdiction);
        }
        const inbound = await this.prisma.regulatoryEquivalency.findMany({
            where: {
                active: true,
                toJurisdiction: source,
                standardCode: { in: codes },
            },
            select: { fromJurisdiction: true },
        });
        for (const r of inbound) {
            coverage.add(r.fromJurisdiction);
        }
        return [...coverage].sort();
    }
    async listActive() {
        return this.prisma.regulatoryEquivalency.findMany({
            where: { active: true },
            orderBy: [{ fromJurisdiction: 'asc' }, { toJurisdiction: 'asc' }],
        });
    }
};
exports.RegulatoryEquivalencyService = RegulatoryEquivalencyService;
exports.RegulatoryEquivalencyService = RegulatoryEquivalencyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegulatoryEquivalencyService);
//# sourceMappingURL=regulatory-equivalency.service.js.map