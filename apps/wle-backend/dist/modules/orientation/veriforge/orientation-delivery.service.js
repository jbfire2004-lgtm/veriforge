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
exports.OrientationDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const audit_log_service_1 = require("../../../audit/audit-log.service");
const audit_actions_1 = require("../../../audit/audit-actions");
const public_base_url_1 = require("../../../config/public-base-url");
let OrientationDeliveryService = class OrientationDeliveryService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async assign(input) {
        const orientation = await this.prisma.orientationDefinition.findUnique({
            where: { id: input.orientationId },
        });
        if (!orientation) {
            throw new common_1.NotFoundException('Orientation definition not found');
        }
        if (orientation.companyId !== input.companyId) {
            throw new common_1.BadRequestException('orientationId does not belong to companyId');
        }
        if (!orientation.isPublished) {
            throw new common_1.BadRequestException('Only published orientations can be assigned for delivery');
        }
        const worker = await this.prisma.worker.findUnique({
            where: { id: input.workerId },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const publicBase = (0, public_base_url_1.resolvePublicBaseUrl)();
        const deepLink = `${publicBase}/onboarding/orientation/${orientation.id}?workerId=${worker.id}`;
        const walletPayload = {
            cardType: 'orientation',
            title: orientation.title,
            orientationId: orientation.id,
            version: orientation.version,
            workerId: worker.id,
            companyId: input.companyId,
            deepLink,
            status: 'assigned',
            issuedAt: new Date().toISOString(),
        };
        const row = await this.prisma.orientationDeliveryLink.upsert({
            where: {
                workerId_orientationId: {
                    workerId: input.workerId,
                    orientationId: input.orientationId,
                },
            },
            create: {
                workerId: input.workerId,
                orientationId: input.orientationId,
                companyId: input.companyId,
                deepLink,
                walletPayload: walletPayload,
                assignedById: input.assignedById,
            },
            update: {
                deepLink,
                walletPayload: walletPayload,
                assignedById: input.assignedById,
            },
        });
        await this.auditLog.logAudit({ id: input.assignedById, companyId: input.companyId }, audit_actions_1.AuditAction.ORIENTATION_DELIVERY_ASSIGNED, {
            type: audit_actions_1.AuditEntityType.ORIENTATION_DELIVERY,
            id: row.id,
            tenantId: input.companyId,
        }, { workerId: input.workerId, orientationId: input.orientationId });
        return {
            deliveryId: row.id,
            deepLink: row.deepLink,
            walletCard: walletPayload,
            orientation: {
                id: orientation.id,
                title: orientation.title,
                version: orientation.version,
            },
        };
    }
    async listLinks(workerId) {
        const rows = await this.prisma.orientationDeliveryLink.findMany({
            where: { workerId },
            include: {
                orientation: {
                    select: { id: true, title: true, version: true, type: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return {
            workerId,
            appDeepLinks: rows.map((r) => ({
                orientationId: r.orientationId,
                title: r.orientation.title,
                deepLink: r.deepLink,
                assignedAt: r.createdAt,
            })),
            walletCards: rows.map((r) => r.walletPayload),
        };
    }
};
exports.OrientationDeliveryService = OrientationDeliveryService;
exports.OrientationDeliveryService = OrientationDeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], OrientationDeliveryService);
//# sourceMappingURL=orientation-delivery.service.js.map