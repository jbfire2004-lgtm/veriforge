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
exports.PmInspectionSubcontractorResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PmInspectionSubcontractorResolverService = class PmInspectionSubcontractorResolverService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listSubcontractorIds(projectId) {
        const [config, profile] = await Promise.all([
            this.prisma.pmProjectConfig.findUnique({
                where: { projectId },
                select: { subcontractorIds: true },
            }),
            this.prisma.pmProjectSafetyProfile.findFirst({
                where: { projectId, publishedAt: { not: null } },
                orderBy: { publishedAt: 'desc' },
                select: { subcontractorIds: true },
            }),
        ]);
        const fromProfile = parseSubcontractorIds(profile === null || profile === void 0 ? void 0 : profile.subcontractorIds);
        if (fromProfile.length)
            return fromProfile;
        return parseSubcontractorIds(config === null || config === void 0 ? void 0 : config.subcontractorIds);
    }
    async resolveForFinding(projectId, category, overrideId) {
        if (overrideId)
            return overrideId;
        const ids = await this.listSubcontractorIds(projectId);
        if (!ids.length)
            return undefined;
        return pickSubcontractorForCategory(ids, category);
    }
    async listWithNames(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { companyId: true },
        });
        if (!project)
            return [];
        const ids = new Set(await this.listSubcontractorIds(projectId));
        ids.add(project.companyId);
        const assignmentCompanies = await this.prisma.projectAssignment.findMany({
            where: { projectId, status: 'ACTIVE' },
            select: { companyId: true },
            distinct: ['companyId'],
        });
        for (const row of assignmentCompanies)
            ids.add(row.companyId);
        const portalMembers = await this.prisma.pmContractorPortalMembership.findMany({
            where: { projectId, active: true },
            select: { contractorCompanyId: true },
            distinct: ['contractorCompanyId'],
        });
        for (const row of portalMembers)
            ids.add(row.contractorCompanyId);
        if (!ids.size)
            return [];
        return this.prisma.company.findMany({
            where: { id: { in: [...ids] } },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
};
exports.PmInspectionSubcontractorResolverService = PmInspectionSubcontractorResolverService;
exports.PmInspectionSubcontractorResolverService = PmInspectionSubcontractorResolverService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmInspectionSubcontractorResolverService);
function parseSubcontractorIds(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw
        .map((v) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
        .filter((n) => Number.isFinite(n) && n > 0);
}
function pickSubcontractorForCategory(ids, category) {
    var _a;
    if (ids.length === 1)
        return ids[0];
    switch (category) {
        case 'equipment_defect':
            return ids[0];
        case 'housekeeping':
            return (_a = ids[1]) !== null && _a !== void 0 ? _a : ids[0];
        case 'unsafe_condition':
            return ids[0];
        default:
            return ids[0];
    }
}
//# sourceMappingURL=pm-inspection-subcontractor-resolver.service.js.map