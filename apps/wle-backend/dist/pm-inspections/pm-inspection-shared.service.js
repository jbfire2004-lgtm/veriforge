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
exports.PmInspectionSharedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspection_access_service_1 = require("./pm-inspection-access.service");
const pm_inspection_sharing_types_1 = require("./pm-inspection-sharing.types");
const pm_inspection_kind_util_1 = require("./pm-inspection-kind.util");
let PmInspectionSharedService = class PmInspectionSharedService {
    constructor(prisma, access) {
        this.prisma = prisma;
        this.access = access;
    }
    async listSharedReports(actor, projectId) {
        var _a;
        const inspections = await this.prisma.pmInspection.findMany({
            where: Object.assign({ deletedAt: null, status: { notIn: ['draft', 'in_progress'] } }, (projectId ? { projectId } : {})),
            include: {
                template: { select: { name: true, scoringRules: true } },
                project: { select: { id: true, name: true } },
                inspector: { select: { id: true, username: true } },
            },
            orderBy: { submittedAt: 'desc' },
            take: 200,
        });
        const visible = [];
        for (const row of inspections) {
            if (await this.access.canViewInspectionReport(actor, row.id)) {
                const sharing = (0, pm_inspection_sharing_types_1.parseInspectionSharing)(row.sharingJson);
                const isOwner = actor.companyId === row.companyId ||
                    (await this.access.isProjectOwnerRole(actor.role));
                visible.push({
                    id: row.id,
                    title: (_a = row.title) !== null && _a !== void 0 ? _a : row.template.name,
                    status: row.status,
                    submittedAt: row.submittedAt,
                    project: row.project,
                    inspector: row.inspector,
                    templateName: row.template.name,
                    inspectionKind: (0, pm_inspection_kind_util_1.inspectionKind)(row.template),
                    sharing,
                    accessReason: isOwner
                        ? 'project_owner'
                        : sharing.shareReportWithContractors
                            ? 'shared_contractors'
                            : sharing.shareReportWithWorkers
                                ? 'shared_workers'
                                : actor.id === row.inspectorUserId
                                    ? 'organizer'
                                    : 'assigned',
                });
            }
        }
        return {
            total: visible.length,
            items: visible,
        };
    }
};
exports.PmInspectionSharedService = PmInspectionSharedService;
exports.PmInspectionSharedService = PmInspectionSharedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_inspection_access_service_1.PmInspectionAccessService])
], PmInspectionSharedService);
//# sourceMappingURL=pm-inspection-shared.service.js.map