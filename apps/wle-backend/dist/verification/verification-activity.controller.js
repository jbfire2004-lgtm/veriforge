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
exports.VerificationActivityController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
function resultFromChecklist(checklist) {
    if (checklist == null || typeof checklist !== 'object')
        return 'UNSAFE';
    const values = Object.values(checklist);
    if (values.length === 0)
        return 'UNSAFE';
    return values.every((v) => v === true) ? 'SAFE' : 'UNSAFE';
}
let VerificationActivityController = class VerificationActivityController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recentLogs() {
        const rows = await this.prisma.digitalSignoff.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                worker: true,
                equipment: true,
            },
        });
        return rows.map((r) => ({
            id: r.id,
            result: resultFromChecklist(r.checklist),
            worker: r.worker,
            equipment: r.equipment,
            createdAt: r.createdAt,
        }));
    }
    async logsForWorker(workerId) {
        const rows = await this.prisma.digitalSignoff.findMany({
            where: { workerId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                worker: true,
                equipment: true,
            },
        });
        return rows.map((r) => ({
            id: r.id,
            result: resultFromChecklist(r.checklist),
            worker: r.worker,
            equipment: r.equipment,
            createdAt: r.createdAt,
        }));
    }
    async logsForEquipment(equipmentId) {
        const rows = await this.prisma.digitalSignoff.findMany({
            where: { equipmentId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                worker: true,
                equipment: true,
            },
        });
        return rows.map((r) => ({
            id: r.id,
            result: resultFromChecklist(r.checklist),
            worker: r.worker,
            equipment: r.equipment,
            createdAt: r.createdAt,
        }));
    }
};
exports.VerificationActivityController = VerificationActivityController;
__decorate([
    (0, common_1.Get)('logs/recent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerificationActivityController.prototype, "recentLogs", null);
__decorate([
    (0, common_1.Get)('logs/worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VerificationActivityController.prototype, "logsForWorker", null);
__decorate([
    (0, common_1.Get)('logs/equipment/:equipmentId'),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VerificationActivityController.prototype, "logsForEquipment", null);
exports.VerificationActivityController = VerificationActivityController = __decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR),
    (0, common_1.Controller)('verification'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VerificationActivityController);
//# sourceMappingURL=verification-activity.controller.js.map