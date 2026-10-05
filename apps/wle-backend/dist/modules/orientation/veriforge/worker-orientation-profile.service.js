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
exports.WorkerOrientationProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const orientation_requirement_service_1 = require("./orientation-requirement.service");
const orientation_completion_service_1 = require("./orientation-completion.service");
const orientation_validation_1 = require("./orientation-validation");
let WorkerOrientationProfileService = class WorkerOrientationProfileService {
    constructor(prisma, requirements, completions) {
        this.prisma = prisma;
        this.requirements = requirements;
        this.completions = completions;
    }
    async getProfile(workerId, opts) {
        var _a, _b, _c, _d, _e, _f;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                projectAssignments: {
                    where: { status: 'ACTIVE' },
                    take: 10,
                    orderBy: { assignedAt: 'desc' },
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const companyId = (_a = opts === null || opts === void 0 ? void 0 : opts.companyId) !== null && _a !== void 0 ? _a : worker.companyId;
        if (!companyId) {
            return {
                workerId,
                requiredOrientations: [],
                completedOrientations: [],
                missingOrientations: [],
                gatingStatus: 'warning',
                reason: 'Worker has no company context',
            };
        }
        const projectId = (_b = opts === null || opts === void 0 ? void 0 : opts.projectId) !== null && _b !== void 0 ? _b : (_c = worker.projectAssignments[0]) === null || _c === void 0 ? void 0 : _c.projectId;
        const tradeId = (_f = (_d = opts === null || opts === void 0 ? void 0 : opts.tradeId) !== null && _d !== void 0 ? _d : (_e = worker.projectAssignments[0]) === null || _e === void 0 ? void 0 : _e.role) !== null && _f !== void 0 ? _f : undefined;
        const required = await this.requirements.resolveForWorker({
            workerId,
            companyId,
            projectId,
            siteId: opts === null || opts === void 0 ? void 0 : opts.siteId,
            tradeId,
            unionDispatchType: opts === null || opts === void 0 ? void 0 : opts.unionDispatchType,
        });
        const completionRows = await this.completions.list({ workerId });
        const now = Date.now();
        const activeCompletions = completionRows.filter((c) => {
            if (c.status === 'completed' &&
                c.expiresOn &&
                c.expiresOn.getTime() < now) {
                return false;
            }
            return c.status === 'completed';
        });
        const completedIds = new Set(activeCompletions.map((c) => c.orientationId));
        const missing = required.filter((r) => !completedIds.has(r.orientationId));
        const expiredRequired = required.filter((r) => {
            const row = completionRows.find((c) => c.orientationId === r.orientationId &&
                (c.status === 'expired' ||
                    (c.status === 'completed' &&
                        c.expiresOn != null &&
                        c.expiresOn.getTime() < now)));
            return Boolean(row) && !completedIds.has(r.orientationId);
        });
        const arrivalBlocked = missing.some((m) => m.mustCompleteBefore === 'arrival');
        const dispatchBlocked = missing.some((m) => m.mustCompleteBefore === 'dispatch');
        const assignmentMissing = missing.some((m) => m.mustCompleteBefore === 'assignment');
        let gatingStatus = 'allowed';
        if (arrivalBlocked ||
            dispatchBlocked ||
            expiredRequired.some((r) => ['arrival', 'dispatch'].includes(r.mustCompleteBefore))) {
            gatingStatus = 'blocked';
        }
        else if (assignmentMissing || missing.length > 0) {
            gatingStatus = 'warning';
        }
        else if (activeCompletions.some((c) => (0, orientation_validation_1.isNearExpiry)(c.expiresOn, new Date(now)))) {
            gatingStatus = 'warning';
        }
        return {
            workerId,
            companyId,
            projectId: projectId !== null && projectId !== void 0 ? projectId : null,
            requiredOrientations: required.map((r) => ({
                requirementId: r.id,
                orientationId: r.orientationId,
                title: r.orientation.title,
                type: r.orientation.type,
                mustCompleteBefore: r.mustCompleteBefore,
                version: r.orientation.version,
            })),
            completedOrientations: activeCompletions.map((c) => {
                var _a;
                return ({
                    completionId: c.id,
                    orientationId: c.orientationId,
                    title: (_a = c.orientation) === null || _a === void 0 ? void 0 : _a.title,
                    completedOn: c.completedOn,
                    expiresOn: c.expiresOn,
                    score: c.score,
                    status: c.status,
                });
            }),
            missingOrientations: missing.map((m) => ({
                requirementId: m.id,
                orientationId: m.orientationId,
                title: m.orientation.title,
                mustCompleteBefore: m.mustCompleteBefore,
            })),
            gatingStatus,
        };
    }
};
exports.WorkerOrientationProfileService = WorkerOrientationProfileService;
exports.WorkerOrientationProfileService = WorkerOrientationProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orientation_requirement_service_1.OrientationRequirementService,
        orientation_completion_service_1.OrientationCompletionService])
], WorkerOrientationProfileService);
//# sourceMappingURL=worker-orientation-profile.service.js.map