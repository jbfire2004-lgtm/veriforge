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
exports.PmContractorPortalFindingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_contractor_portal_access_service_1 = require("./pm-contractor-portal-access.service");
let PmContractorPortalFindingsService = class PmContractorPortalFindingsService {
    constructor(prisma, access) {
        this.prisma = prisma;
        this.access = access;
    }
    async listFindings(actor, opts) {
        const contractorCompanyId = this.access.requireContractorCompany(actor);
        const deficiencies = await this.prisma.pmInspectionDeficiency.findMany({
            where: Object.assign({ subcontractorCompanyId: contractorCompanyId, status: { in: ['open', 'in_progress'] } }, ((opts === null || opts === void 0 ? void 0 : opts.projectId)
                ? { inspection: { projectId: opts.projectId } }
                : {})),
            include: {
                inspection: {
                    select: {
                        id: true,
                        projectId: true,
                        submittedAt: true,
                        createdAt: true,
                        project: { select: { id: true, name: true } },
                        inspector: { select: { id: true, username: true } },
                    },
                },
                contractorAcknowledgments: {
                    where: { contractorCompanyId },
                    take: 1,
                },
                photoFindings: {
                    take: 1,
                    include: {
                        attachment: { select: { id: true, dataUrl: true, fileName: true } },
                    },
                },
                attachments: { take: 3 },
            },
            orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
            take: 100,
        });
        const items = deficiencies
            .filter((d) => !(opts === null || opts === void 0 ? void 0 : opts.unacknowledgedOnly) || d.contractorAcknowledgments.length === 0)
            .map((d) => {
            var _a, _b, _c;
            return ({
                id: d.id,
                title: d.title,
                description: d.description,
                severity: d.severity,
                status: d.status,
                dueAt: d.dueAt,
                inspection: d.inspection,
                acknowledged: d.contractorAcknowledgments.length > 0,
                acknowledgment: (_a = d.contractorAcknowledgments[0]) !== null && _a !== void 0 ? _a : null,
                photo: (_c = (_b = d.photoFindings[0]) === null || _b === void 0 ? void 0 : _b.attachment) !== null && _c !== void 0 ? _c : null,
            });
        });
        return {
            summary: {
                total: items.length,
                unacknowledged: items.filter((i) => !i.acknowledged).length,
                critical: items.filter((i) => i.severity === 'critical' || i.severity === 'high').length,
            },
            items,
        };
    }
    async acknowledgeFinding(actor, deficiencyId, notes) {
        const contractorCompanyId = this.access.requireContractorCompany(actor);
        const deficiency = await this.prisma.pmInspectionDeficiency.findFirst({
            where: { id: deficiencyId, subcontractorCompanyId: contractorCompanyId },
        });
        if (!deficiency) {
            throw new common_1.NotFoundException('Finding not found');
        }
        return this.prisma.pmContractorFindingAcknowledgment.upsert({
            where: {
                deficiencyId_contractorCompanyId: {
                    deficiencyId,
                    contractorCompanyId,
                },
            },
            create: {
                deficiencyId,
                contractorCompanyId,
                acknowledgedByUserId: actor.userId,
                notes,
            },
            update: {
                notes,
                acknowledgedAt: new Date(),
                acknowledgedByUserId: actor.userId,
            },
            include: {
                acknowledgedBy: { select: { id: true, username: true } },
            },
        });
    }
};
exports.PmContractorPortalFindingsService = PmContractorPortalFindingsService;
exports.PmContractorPortalFindingsService = PmContractorPortalFindingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_contractor_portal_access_service_1.PmContractorPortalAccessService])
], PmContractorPortalFindingsService);
//# sourceMappingURL=pm-contractor-portal-findings.service.js.map