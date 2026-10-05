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
exports.PmContractorPortalAccessService = exports.PRIME_PORTAL_ROLES = exports.CONTRACTOR_ROLES = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
exports.CONTRACTOR_ROLES = [
    client_1.UserRole.CONTRACTOR_ADMIN,
    client_1.UserRole.CONTRACTOR_USER,
];
exports.PRIME_PORTAL_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmContractorPortalAccessService = class PmContractorPortalAccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isContractorRole(role) {
        return exports.CONTRACTOR_ROLES.includes(role);
    }
    requireContractorCompany(actor) {
        if (!this.isContractorRole(actor.role)) {
            throw new common_1.ForbiddenException('Contractor portal access required');
        }
        if (!actor.companyId) {
            throw new common_1.ForbiddenException('User is not linked to a contractor company');
        }
        return actor.companyId;
    }
    async assertContractorAccess(actor, contractorCompanyId) {
        const expected = contractorCompanyId !== null && contractorCompanyId !== void 0 ? contractorCompanyId : this.requireContractorCompany(actor);
        if (this.isContractorRole(actor.role) && actor.companyId !== expected) {
            throw new common_1.ForbiddenException('Cannot access another contractor tenant');
        }
        return expected;
    }
    async assertMembership(primeCompanyId, contractorCompanyId, projectId) {
        const membership = await this.prisma.pmContractorPortalMembership.findFirst({
            where: Object.assign({ primeCompanyId,
                contractorCompanyId, active: true }, (projectId ? { OR: [{ projectId: null }, { projectId }] } : {})),
        });
        if (!membership) {
            throw new common_1.ForbiddenException('No active portal membership for this prime/contractor pair');
        }
        return membership;
    }
    async listMembershipsForContractor(contractorCompanyId) {
        return this.prisma.pmContractorPortalMembership.findMany({
            where: { contractorCompanyId, active: true },
            include: {
                primeCompany: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listMembershipsForPrime(primeCompanyId, projectId) {
        return this.prisma.pmContractorPortalMembership.findMany({
            where: Object.assign({ primeCompanyId, active: true }, (projectId ? { OR: [{ projectId: null }, { projectId }] } : {})),
            include: {
                contractorCompany: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async ensureMembership(primeCompanyId, contractorCompanyId, projectId) {
        const existing = await this.prisma.pmContractorPortalMembership.findFirst({
            where: {
                primeCompanyId,
                contractorCompanyId,
                projectId: projectId !== null && projectId !== void 0 ? projectId : null,
            },
        });
        let membership;
        if (existing) {
            if (!existing.active) {
                membership = await this.prisma.pmContractorPortalMembership.update({
                    where: { id: existing.id },
                    data: { active: true },
                });
            }
            else {
                membership = existing;
            }
        }
        else {
            membership = await this.prisma.pmContractorPortalMembership.create({
                data: { primeCompanyId, contractorCompanyId, projectId },
            });
        }
        if (projectId) {
            await this.syncSubcontractorOnProject(projectId, contractorCompanyId);
        }
        return membership;
    }
    async syncSubcontractorOnProject(projectId, contractorCompanyId) {
        const config = await this.prisma.pmProjectConfig.findUnique({
            where: { projectId },
            select: { subcontractorIds: true },
        });
        const configIds = parseSubcontractorIds(config === null || config === void 0 ? void 0 : config.subcontractorIds);
        if (!configIds.includes(contractorCompanyId)) {
            const next = [...configIds, contractorCompanyId];
            await this.prisma.pmProjectConfig.upsert({
                where: { projectId },
                create: {
                    id: (0, crypto_1.randomUUID)(),
                    projectId,
                    subcontractorIds: next,
                },
                update: { subcontractorIds: next },
            });
        }
        const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
            where: { projectId },
            orderBy: { publishedAt: 'desc' },
            select: { id: true, subcontractorIds: true },
        });
        if (profile) {
            const profileIds = parseSubcontractorIds(profile.subcontractorIds);
            if (!profileIds.includes(contractorCompanyId)) {
                await this.prisma.pmProjectSafetyProfile.update({
                    where: { id: profile.id },
                    data: {
                        subcontractorIds: [
                            ...profileIds,
                            contractorCompanyId,
                        ],
                    },
                });
            }
        }
    }
    async getContractorWorkerIds(contractorCompanyId) {
        const links = await this.prisma.companyLink.findMany({
            where: { companyId: contractorCompanyId, active: true },
            select: { workerId: true },
        });
        const direct = await this.prisma.worker.findMany({
            where: { companyId: contractorCompanyId, status: 'ACTIVE' },
            select: { id: true },
        });
        const ids = new Set([
            ...links.map((l) => l.workerId),
            ...direct.map((w) => w.id),
        ]);
        return [...ids];
    }
    async assertDispatchAccess(actor, dispatchId) {
        const dispatch = await this.prisma.pmInspectionContractorDispatch.findUnique({
            where: { id: dispatchId },
            include: {
                correctiveAction: {
                    select: {
                        id: true,
                        title: true,
                        subcontractorCompanyId: true,
                        projectId: true,
                        companyId: true,
                    },
                },
            },
        });
        if (!dispatch)
            throw new common_1.NotFoundException('Dispatch not found');
        await this.assertContractorAccess(actor, dispatch.subcontractorCompanyId);
        return dispatch;
    }
    async assertCorrectiveActionAccess(actor, actionId) {
        const action = await this.prisma.pmCorrectiveAction.findFirst({
            where: { id: actionId, deletedAt: null },
        });
        if (!action)
            throw new common_1.NotFoundException('Corrective action not found');
        if (!action.subcontractorCompanyId) {
            throw new common_1.ForbiddenException('Corrective action is not assigned to a contractor');
        }
        await this.assertContractorAccess(actor, action.subcontractorCompanyId);
        return action;
    }
};
exports.PmContractorPortalAccessService = PmContractorPortalAccessService;
exports.PmContractorPortalAccessService = PmContractorPortalAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmContractorPortalAccessService);
function parseSubcontractorIds(raw) {
    if (!Array.isArray(raw))
        return [];
    return raw
        .map((v) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
        .filter((n) => Number.isFinite(n) && n > 0);
}
//# sourceMappingURL=pm-contractor-portal-access.service.js.map