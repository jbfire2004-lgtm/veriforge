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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerSafetyProfileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pm_worker_safety_profile_service_1 = require("../../pm-worker-safety-profile/pm-worker-safety-profile.service");
let WorkerSafetyProfileService = class WorkerSafetyProfileService {
    constructor(prisma, pmWorkerProfile) {
        this.prisma = prisma;
        this.pmWorkerProfile = pmWorkerProfile;
    }
    async getProfile(workerId, projectId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (this.pmWorkerProfile) {
            const full = await this.pmWorkerProfile.getFullProfile(workerId, projectId);
            const p = full.profile;
            return {
                workerId: full.identity.workerId,
                workerName: full.identity.name,
                trainingCompliance: ((_a = p === null || p === void 0 ? void 0 : p.trainingSnapshots) !== null && _a !== void 0 ? _a : []).map((t) => {
                    var _a;
                    return ({
                        courseCode: t.trainingCode,
                        courseName: t.courseName,
                        status: t.status,
                        expiresAt: (_a = t.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                    });
                }),
                openCailAssigned: 0,
                incidentInvolvement12mo: (_d = (_c = (_b = full.profile) === null || _b === void 0 ? void 0 : _b.incidentHistory) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0,
                bboAtRiskCount12mo: 0,
                riskScore: 100 - ((_e = p === null || p === void 0 ? void 0 : p.safetyScore) !== null && _e !== void 0 ? _e : 100),
                safetyScore: (_f = p === null || p === void 0 ? void 0 : p.safetyScore) !== null && _f !== void 0 ? _f : null,
                riskLevel: (_g = p === null || p === void 0 ? void 0 : p.riskLevel) !== null && _g !== void 0 ? _g : null,
                lastFlhaDate: null,
                siteAccessStatus: ((_h = full.accessEvaluation) === null || _h === void 0 ? void 0 : _h.granted)
                    ? 'granted'
                    : 'denied',
                denialReasons: (_k = (_j = full.accessEvaluation) === null || _j === void 0 ? void 0 : _j.denialReasons) !== null && _k !== void 0 ? _k : [],
                cailInsights: full.cailInsights,
            };
        }
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { id: true, firstName: true, lastName: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        return {
            workerId,
            workerName: `${worker.firstName} ${worker.lastName}`,
            trainingCompliance: [],
            openCailAssigned: 0,
            incidentInvolvement12mo: 0,
            bboAtRiskCount12mo: 0,
            riskScore: 0,
            lastFlhaDate: null,
            siteAccessStatus: 'conditional',
            denialReasons: [],
        };
    }
};
exports.WorkerSafetyProfileService = WorkerSafetyProfileService;
exports.WorkerSafetyProfileService = WorkerSafetyProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pm_worker_safety_profile_service_1.PmWorkerSafetyProfileService])
], WorkerSafetyProfileService);
//# sourceMappingURL=worker-safety-profile.service.js.map