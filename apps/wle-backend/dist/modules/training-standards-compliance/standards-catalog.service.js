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
exports.StandardsCatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const standards_catalog_seed_1 = require("./data/standards-catalog.seed");
let StandardsCatalogService = class StandardsCatalogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedIfEmpty();
    }
    async seedIfEmpty() {
        const count = await this.prisma.trainingStandard.count();
        if (count > 0)
            return;
        const allStandards = [
            ...standards_catalog_seed_1.CSA_STANDARDS_SEED,
            ...standards_catalog_seed_1.FEDERAL_OHS_SEED,
            ...standards_catalog_seed_1.PROVINCIAL_OHS_SEED,
            ...standards_catalog_seed_1.INDUSTRY_COP_SEED,
        ];
        for (const s of allStandards) {
            await this.prisma.trainingStandard.upsert({
                where: { code: s.code },
                create: {
                    code: s.code,
                    title: s.title,
                    kind: s.kind,
                    jurisdictionCode: 'jurisdictionCode' in s ? s.jurisdictionCode : null,
                    keywords: s.keywords,
                    defaultValidityDays: s.defaultValidityDays,
                },
                update: {},
            });
        }
        for (const r of standards_catalog_seed_1.REJECTION_REASONS_SEED) {
            await this.prisma.trainingRejectionReason.upsert({
                where: { code: r.code },
                create: {
                    code: r.code,
                    title: r.title,
                    category: r.category,
                    severity: r.severity,
                },
                update: {},
            });
        }
        for (const j of standards_catalog_seed_1.JURISDICTION_REQUIREMENTS_SEED) {
            const existing = await this.prisma.jurisdictionRequirement.findFirst({
                where: {
                    jurisdictionCode: j.jurisdictionCode,
                    standardCode: j.standardCode,
                    tradeCode: null,
                },
            });
            if (!existing) {
                await this.prisma.jurisdictionRequirement.create({
                    data: {
                        jurisdictionCode: j.jurisdictionCode,
                        regionName: j.regionName,
                        standardCode: j.standardCode,
                        required: j.required,
                    },
                });
            }
        }
        const globalRule = await this.prisma.providerQualificationRule.findFirst({
            where: { trainingProviderId: null, ruleKey: 'GLOBAL_DEFAULT' },
        });
        if (!globalRule) {
            await this.prisma.providerQualificationRule.create({
                data: {
                    ruleKey: 'GLOBAL_DEFAULT',
                    description: 'Default provider must be approved',
                    requiredApprovalStatus: 'APPROVED',
                    requiredStandardCodes: ['CSA-Z1001'],
                },
            });
        }
        const globalInstructor = await this.prisma.instructorQualificationRule.findFirst({
            where: { trainingProviderId: null, ruleKey: 'GLOBAL_INSTRUCTOR' },
        });
        if (!globalInstructor) {
            await this.prisma.instructorQualificationRule.create({
                data: {
                    ruleKey: 'GLOBAL_INSTRUCTOR',
                    description: 'Instructors must hold a license when delivering equipment training',
                    requiresLicense: false,
                    requiredStandardCodes: [],
                },
            });
        }
    }
    listStandards() {
        return this.prisma.trainingStandard.findMany({
            where: { active: true },
            orderBy: [{ kind: 'asc' }, { code: 'asc' }],
        });
    }
    listRejectionReasons() {
        return this.prisma.trainingRejectionReason.findMany({
            where: { active: true },
            orderBy: { code: 'asc' },
        });
    }
};
exports.StandardsCatalogService = StandardsCatalogService;
exports.StandardsCatalogService = StandardsCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StandardsCatalogService);
//# sourceMappingURL=standards-catalog.service.js.map