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
exports.RegistryService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
let RegistryService = class RegistryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    token(prefix) {
        return `${prefix}-${(0, crypto_1.randomBytes)(8).toString('hex')}`;
    }
    async searchWorkers(query) {
        var _a, _b;
        const limit = Math.min((_a = query.limit) !== null && _a !== void 0 ? _a : 25, 100);
        const where = { AND: [] };
        const and = where.AND;
        if (query.phone) {
            and.push({
                phone: {
                    contains: query.phone.replace(/\D/g, ''),
                    mode: 'insensitive',
                },
            });
        }
        if (query.email) {
            and.push({
                email: {
                    equals: query.email.trim().toLowerCase(),
                    mode: 'insensitive',
                },
            });
        }
        if (query.dateOfBirth) {
            const dob = new Date(query.dateOfBirth);
            if (!Number.isNaN(dob.getTime())) {
                const next = new Date(dob);
                next.setDate(next.getDate() + 1);
                and.push({ dateOfBirth: { gte: dob, lt: next } });
            }
        }
        if ((_b = query.q) === null || _b === void 0 ? void 0 : _b.trim()) {
            const q = query.q.trim();
            and.push({
                OR: [
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q.replace(/\D/g, ''), mode: 'insensitive' } },
                    { unionNumber: { contains: q, mode: 'insensitive' } },
                ],
            });
        }
        if (and.length === 0)
            delete where.AND;
        return this.prisma.worker.findMany({
            where,
            take: limit,
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            include: {
                companyLinks: { where: { active: true }, include: { company: true } },
            },
        });
    }
    async findDuplicateWorkers(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const or = [];
        if (worker.email)
            or.push({ email: worker.email });
        if (worker.phone)
            or.push({ phone: worker.phone });
        if (worker.dateOfBirth) {
            or.push({
                dateOfBirth: worker.dateOfBirth,
                firstName: { equals: worker.firstName, mode: 'insensitive' },
                lastName: { equals: worker.lastName, mode: 'insensitive' },
            });
        }
        if (or.length === 0) {
            or.push({
                firstName: { equals: worker.firstName, mode: 'insensitive' },
                lastName: { equals: worker.lastName, mode: 'insensitive' },
            });
        }
        return this.prisma.worker.findMany({
            where: { id: { not: workerId }, OR: or },
            take: 20,
        });
    }
    async mergeWorkers(survivorId, mergedId, mergedByUserId, reason) {
        if (survivorId === mergedId) {
            throw new common_1.BadRequestException('Cannot merge worker with itself');
        }
        const [survivor, merged] = await Promise.all([
            this.prisma.worker.findUnique({ where: { id: survivorId } }),
            this.prisma.worker.findUnique({ where: { id: mergedId } }),
        ]);
        if (!survivor || !merged)
            throw new common_1.NotFoundException('Worker not found');
        await this.prisma.$transaction(async (tx) => {
            var _a, _b, _c, _d, _e;
            await tx.trainingRecord.updateMany({
                where: { workerId: mergedId },
                data: { workerId: survivorId },
            });
            await tx.credential.updateMany({
                where: { workerId: mergedId },
                data: { workerId: survivorId },
            });
            await tx.companyLink.updateMany({
                where: { workerId: mergedId },
                data: { workerId: survivorId },
            });
            await tx.projectAssignment.updateMany({
                where: { workerId: mergedId },
                data: { workerId: survivorId },
            });
            await tx.unionMembership.updateMany({
                where: { workerId: mergedId },
                data: { workerId: survivorId },
            });
            await tx.worker.update({
                where: { id: survivorId },
                data: {
                    email: (_a = survivor.email) !== null && _a !== void 0 ? _a : merged.email,
                    phone: (_b = survivor.phone) !== null && _b !== void 0 ? _b : merged.phone,
                    dateOfBirth: (_c = survivor.dateOfBirth) !== null && _c !== void 0 ? _c : merged.dateOfBirth,
                    unionNumber: (_d = survivor.unionNumber) !== null && _d !== void 0 ? _d : merged.unionNumber,
                    photoUrl: (_e = survivor.photoUrl) !== null && _e !== void 0 ? _e : merged.photoUrl,
                },
            });
            await tx.workerMergeRecord.create({
                data: {
                    survivorWorkerId: survivorId,
                    mergedWorkerId: mergedId,
                    mergedByUserId: mergedByUserId !== null && mergedByUserId !== void 0 ? mergedByUserId : null,
                    reason: reason !== null && reason !== void 0 ? reason : null,
                },
            });
            await tx.worker.delete({ where: { id: mergedId } });
        });
        return this.getWorkerProfile(survivorId);
    }
    async getWorkerProfile(workerId) {
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                companyLinks: {
                    orderBy: { startDate: 'desc' },
                    include: { company: true },
                },
                unionMemberships: { include: { unionHall: true } },
                trainingRecords: {
                    include: { certification: true },
                    orderBy: { issuedAt: 'desc' },
                },
                competencyEvaluations: {
                    include: { equipment: true },
                    orderBy: { createdAt: 'desc' },
                },
                projectAssignments: {
                    include: { project: true },
                    orderBy: { assignedAt: 'desc' },
                },
                workerWalletItems: true,
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        return worker;
    }
    async searchEquipment(query) {
        var _a, _b;
        const limit = Math.min((_a = query.limit) !== null && _a !== void 0 ? _a : 25, 100);
        const where = { AND: [] };
        const and = where.AND;
        if (query.serial)
            and.push({
                serialNumber: { contains: query.serial, mode: 'insensitive' },
            });
        if (query.assetTag)
            and.push({ assetTag: { contains: query.assetTag, mode: 'insensitive' } });
        if (query.qr) {
            and.push({
                OR: [
                    { qrToken: query.qr },
                    { id: Number.isFinite(Number(query.qr)) ? Number(query.qr) : -1 },
                ],
            });
        }
        if ((_b = query.q) === null || _b === void 0 ? void 0 : _b.trim()) {
            const q = query.q.trim();
            and.push({
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { serialNumber: { contains: q, mode: 'insensitive' } },
                    { assetTag: { contains: q, mode: 'insensitive' } },
                ],
            });
        }
        if (and.length === 0)
            delete where.AND;
        return this.prisma.equipment.findMany({
            where,
            take: limit,
            orderBy: { name: 'asc' },
            include: {
                equipmentLinks: { where: { active: true }, include: { company: true } },
            },
        });
    }
    async mergeEquipment(survivorId, mergedId, mergedByUserId, reason) {
        if (survivorId === mergedId) {
            throw new common_1.BadRequestException('Cannot merge equipment with itself');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.inspection.updateMany({
                where: { equipmentId: mergedId },
                data: { equipmentId: survivorId },
            });
            await tx.equipmentLink.updateMany({
                where: { equipmentId: mergedId },
                data: { equipmentId: survivorId },
            });
            await tx.equipmentProjectAssignment.updateMany({
                where: { equipmentId: mergedId },
                data: { equipmentId: survivorId },
            });
            await tx.equipmentMergeRecord.create({
                data: {
                    survivorEquipmentId: survivorId,
                    mergedEquipmentId: mergedId,
                    mergedByUserId: mergedByUserId !== null && mergedByUserId !== void 0 ? mergedByUserId : null,
                    reason: reason !== null && reason !== void 0 ? reason : null,
                },
            });
            await tx.equipment.delete({ where: { id: mergedId } });
        });
        return this.getEquipmentProfile(survivorId);
    }
    async getEquipmentProfile(equipmentId) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                equipmentLinks: {
                    orderBy: { startDate: 'desc' },
                    include: {
                        company: true,
                        assignedWorkers: { include: { worker: true } },
                    },
                },
                inspections: { orderBy: { createdAt: 'desc' }, take: 50 },
                trainingRequirements: { include: { certification: true } },
                competencyRequirements: { include: { certification: true } },
                projectAssignments: {
                    include: { project: true },
                    orderBy: { assignedAt: 'desc' },
                },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        return equipment;
    }
    async ensureWorkerQrToken(workerId) {
        const w = await this.prisma.worker.findUnique({ where: { id: workerId } });
        if (!w)
            throw new common_1.NotFoundException('Worker not found');
        if (w.qrToken)
            return w.qrToken;
        const qrToken = this.token('w');
        await this.prisma.worker.update({
            where: { id: workerId },
            data: { qrToken },
        });
        return qrToken;
    }
    async ensureEquipmentQrToken(equipmentId) {
        const e = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
        });
        if (!e)
            throw new common_1.NotFoundException('Equipment not found');
        if (e.qrToken)
            return e.qrToken;
        const qrToken = this.token('e');
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: { qrToken },
        });
        return qrToken;
    }
};
exports.RegistryService = RegistryService;
exports.RegistryService = RegistryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegistryService);
//# sourceMappingURL=registry.service.js.map