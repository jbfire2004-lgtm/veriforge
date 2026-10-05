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
exports.PpePreUseService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cail_scope_service_1 = require("../../safety-intelligence/cail/cail-scope.service");
const ppe_preuse_constants_1 = require("./ppe-preuse.constants");
let PpePreUseService = class PpePreUseService {
    constructor(prisma, scope) {
        this.prisma = prisma;
        this.scope = scope;
    }
    checklist() {
        return ppe_preuse_constants_1.PPE_PREUSE_CHECKLIST;
    }
    async create(dto, actor) {
        var _a, _b, _c, _d;
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const companyId = (_b = (_a = dto.companyId) !== null && _a !== void 0 ? _a : actor.companyId) !== null && _b !== void 0 ? _b : project.companyId;
        if (!companyId) {
            throw new common_1.BadRequestException('companyId is required');
        }
        const known = new Set(ppe_preuse_constants_1.PPE_PREUSE_CHECKLIST.map((i) => i.id));
        for (const item of dto.items) {
            if (!known.has(item.id)) {
                throw new common_1.BadRequestException(`Unknown checklist item: ${item.id}`);
            }
        }
        const overallResult = (0, ppe_preuse_constants_1.computePpePreUseOverall)(dto.items);
        if (overallResult === 'fail' && !dto.removedFromService) {
            throw new common_1.BadRequestException('Damaged or failed PPE must be removed from service before submit');
        }
        if (overallResult === 'pass' && !dto.acknowledgedSafeToWork) {
            throw new common_1.BadRequestException('Acknowledge kit is safe to work before submit');
        }
        return this.prisma.ppePreUseInspection.create({
            data: {
                projectId: dto.projectId,
                companyId,
                workerUserId: actor.id,
                workerId: dto.workerId,
                locationNote: dto.locationNote,
                taskType: dto.taskType,
                overallResult,
                items: dto.items,
                deficiencies: dto.deficiencies,
                removedFromService: (_c = dto.removedFromService) !== null && _c !== void 0 ? _c : false,
                acknowledgedSafeToWork: (_d = dto.acknowledgedSafeToWork) !== null && _d !== void 0 ? _d : false,
                inspectedAt: dto.inspectedAt ? new Date(dto.inspectedAt) : new Date(),
            },
            include: {
                project: { select: { id: true, name: true } },
                company: { select: { id: true, name: true } },
                workerUser: { select: { id: true, username: true, email: true } },
            },
        });
    }
    async list(actor, filters) {
        const where = {};
        if (filters.projectId)
            where.projectId = filters.projectId;
        if (filters.companyId)
            where.companyId = filters.companyId;
        if (!this.scope.isPrime(actor) && actor.companyId) {
            where.companyId = actor.companyId;
        }
        return this.prisma.ppePreUseInspection.findMany({
            where,
            include: {
                project: { select: { id: true, name: true } },
                company: { select: { id: true, name: true } },
                workerUser: { select: { id: true, username: true, email: true } },
            },
            orderBy: { inspectedAt: 'desc' },
            take: 200,
        });
    }
    async getById(id, actor) {
        const row = await this.prisma.ppePreUseInspection.findUnique({
            where: { id },
            include: {
                project: { select: { id: true, name: true, companyId: true } },
                company: { select: { id: true, name: true } },
                workerUser: { select: { id: true, username: true, email: true } },
                worker: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('PPE pre-use inspection not found');
        if (!this.scope.isPrime(actor) &&
            actor.companyId &&
            row.companyId !== actor.companyId) {
            throw new common_1.ForbiddenException('Not permitted to view this inspection');
        }
        return row;
    }
};
exports.PpePreUseService = PpePreUseService;
exports.PpePreUseService = PpePreUseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cail_scope_service_1.CailScopeService])
], PpePreUseService);
//# sourceMappingURL=ppe-preuse.service.js.map