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
exports.PmSafetyEventsCailService = void 0;
const common_1 = require("@nestjs/common");
const cail_emitter_service_1 = require("../safety-intelligence/cail/cail-emitter.service");
let PmSafetyEventsCailService = class PmSafetyEventsCailService {
    constructor(emitter) {
        this.emitter = emitter;
    }
    async emitFromEvent(input) {
        const sevMap = {
            low: 'low',
            medium: 'medium',
            high: 'high',
            critical: 'critical',
        };
        return this.emitter.emit({
            projectId: input.projectId,
            ownerCompanyId: input.ownerCompanyId,
            sourceType: 'incident',
            sourceId: input.eventId,
            sourceItemId: input.sourceItemId,
            title: input.title.slice(0, 120),
            description: input.description,
            severity: sevMap[input.severity],
            createdByUserId: input.createdByUserId,
            siteId: input.siteId,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            assignedUserId: input.assignedUserId,
            dueDate: input.dueDate,
            tags: ['pm-safety-event'],
        });
    }
};
exports.PmSafetyEventsCailService = PmSafetyEventsCailService;
exports.PmSafetyEventsCailService = PmSafetyEventsCailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cail_emitter_service_1.CailEmitterService])
], PmSafetyEventsCailService);
//# sourceMappingURL=pm-safety-events-cail.service.js.map