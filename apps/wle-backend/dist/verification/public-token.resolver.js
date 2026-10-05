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
exports.PublicTokenResolver = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const public_token_util_1 = require("./public-token.util");
let PublicTokenResolver = class PublicTokenResolver {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveWorkerRef(ref) {
        const trimmed = ref.trim();
        if (!trimmed)
            throw new common_1.NotFoundException('Worker not found');
        if ((0, public_token_util_1.isPublicQrToken)(trimmed)) {
            const worker = await this.prisma.worker.findFirst({
                where: { qrToken: trimmed },
                select: { id: true, qrToken: true },
            });
            if (!worker)
                throw new common_1.NotFoundException('Worker not found');
            return {
                workerId: worker.id,
                qrToken: worker.qrToken,
                viaToken: true,
            };
        }
        const numeric = Number(trimmed);
        if (!Number.isInteger(numeric) || numeric <= 0) {
            throw new common_1.NotFoundException('Worker not found');
        }
        const worker = await this.prisma.worker.findUnique({
            where: { id: numeric },
            select: { id: true, qrToken: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        return {
            workerId: worker.id,
            qrToken: worker.qrToken,
            viaToken: false,
        };
    }
    async resolveEquipmentRef(ref) {
        const trimmed = ref.trim();
        if (!trimmed)
            throw new common_1.NotFoundException('Equipment not found');
        if ((0, public_token_util_1.isPublicQrToken)(trimmed)) {
            const equipment = await this.prisma.equipment.findFirst({
                where: { qrToken: trimmed },
                select: { id: true, qrToken: true },
            });
            if (!equipment)
                throw new common_1.NotFoundException('Equipment not found');
            return {
                equipmentId: equipment.id,
                qrToken: equipment.qrToken,
                viaToken: true,
            };
        }
        const numeric = Number(trimmed);
        if (!Number.isInteger(numeric) || numeric <= 0) {
            throw new common_1.NotFoundException('Equipment not found');
        }
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: numeric },
            select: { id: true, qrToken: true },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        return {
            equipmentId: equipment.id,
            qrToken: equipment.qrToken,
            viaToken: false,
        };
    }
    async ensureWorkerToken(workerId) {
        const row = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { qrToken: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Worker not found');
        if (row.qrToken)
            return row.qrToken;
        const { randomUUID } = await Promise.resolve().then(() => require('crypto'));
        const token = `w-${randomUUID()}`;
        await this.prisma.worker.update({
            where: { id: workerId },
            data: { qrToken: token },
        });
        return token;
    }
    async ensureEquipmentToken(equipmentId) {
        const row = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            select: { qrToken: true },
        });
        if (!row)
            throw new common_1.NotFoundException('Equipment not found');
        if (row.qrToken)
            return row.qrToken;
        const { randomUUID } = await Promise.resolve().then(() => require('crypto'));
        const token = `e-${randomUUID()}`;
        await this.prisma.equipment.update({
            where: { id: equipmentId },
            data: { qrToken: token },
        });
        return token;
    }
};
exports.PublicTokenResolver = PublicTokenResolver;
exports.PublicTokenResolver = PublicTokenResolver = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicTokenResolver);
//# sourceMappingURL=public-token.resolver.js.map