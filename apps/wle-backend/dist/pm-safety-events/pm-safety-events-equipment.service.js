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
exports.PmSafetyEventsEquipmentService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const inactivation_service_1 = require("../modules/vera-core/inactivation.service");
let PmSafetyEventsEquipmentService = class PmSafetyEventsEquipmentService {
    constructor(prisma, inactivation) {
        this.prisma = prisma;
        this.inactivation = inactivation;
    }
    async applyLockoutsForEvent(eventId, actorUserId) {
        var _a;
        const links = await this.prisma.pmSafetyEventEquipment.findMany({
            where: { eventId },
            include: { equipment: true },
        });
        const event = await this.prisma.pmSafetyEvent.findUnique({
            where: { id: eventId },
        });
        if (!event)
            return [];
        const locked = [];
        const shouldLock = event.eventType === 'equipment_failure' ||
            event.severity === 'critical' ||
            event.severity === 'high';
        if (!shouldLock)
            return locked;
        for (const link of links) {
            const reason = `Safety event ${event.title}: ${(_a = link.failureNotes) !== null && _a !== void 0 ? _a : 'equipment involved'}`;
            await this.inactivation.lockoutEquipment(link.equipmentId, reason);
            await this.prisma.equipment.update({
                where: { id: link.equipmentId },
                data: {
                    safetyStatus: client_1.EquipmentSafetyStatus.UNSAFE,
                    lockedOutAt: new Date(),
                    lockoutReason: reason,
                },
            });
            await this.prisma.pmSafetyEventEquipment.update({
                where: { id: link.id },
                data: { lockoutApplied: true },
            });
            locked.push(link.equipmentId);
        }
        return locked;
    }
};
exports.PmSafetyEventsEquipmentService = PmSafetyEventsEquipmentService;
exports.PmSafetyEventsEquipmentService = PmSafetyEventsEquipmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inactivation_service_1.InactivationService])
], PmSafetyEventsEquipmentService);
//# sourceMappingURL=pm-safety-events-equipment.service.js.map