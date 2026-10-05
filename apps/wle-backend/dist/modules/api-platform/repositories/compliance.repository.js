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
exports.ComplianceRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const base_repository_1 = require("./base.repository");
let ComplianceRepository = class ComplianceRepository extends base_repository_1.BaseRepository {
    constructor(prisma) {
        super(prisma);
    }
    async trainingExpiryCounts(companyId) {
        const now = new Date();
        const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const workerFilter = companyId ? { worker: { companyId } } : {};
        const [expired, expiring30] = await Promise.all([
            this.prisma.trainingRecord.count({
                where: Object.assign({ expiresAt: { lte: now } }, workerFilter),
            }),
            this.prisma.trainingRecord.count({
                where: Object.assign({ expiresAt: { gt: now, lte: d30 } }, workerFilter),
            }),
        ]);
        return { expired, expiring30 };
    }
};
exports.ComplianceRepository = ComplianceRepository;
exports.ComplianceRepository = ComplianceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplianceRepository);
//# sourceMappingURL=compliance.repository.js.map