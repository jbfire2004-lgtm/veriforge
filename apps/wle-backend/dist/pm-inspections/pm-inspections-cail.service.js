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
exports.PmInspectionsCailService = void 0;
const common_1 = require("@nestjs/common");
const cail_emitter_service_1 = require("../safety-intelligence/cail/cail-emitter.service");
let PmInspectionsCailService = class PmInspectionsCailService {
    constructor(emitter) {
        this.emitter = emitter;
    }
    severityMap(sev) {
        const map = {
            low: 'low',
            medium: 'medium',
            high: 'high',
            critical: 'critical',
        };
        return map[sev];
    }
    async emitFromDeficiency(input) {
        return this.emitter.emit({
            projectId: input.projectId,
            ownerCompanyId: input.ownerCompanyId,
            sourceType: 'inspection',
            sourceId: input.inspectionId,
            sourceItemId: input.deficiencyId,
            title: input.title.slice(0, 120),
            description: input.description,
            severity: this.severityMap(input.severity),
            createdByUserId: input.createdByUserId,
            siteId: input.siteId,
            equipmentId: input.equipmentId,
            workerId: input.workerId,
            assignedUserId: input.assignedUserId,
            dueDate: input.dueDate,
            tags: ['pm-inspection', 'deficiency'],
        });
    }
};
exports.PmInspectionsCailService = PmInspectionsCailService;
exports.PmInspectionsCailService = PmInspectionsCailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cail_emitter_service_1.CailEmitterService])
], PmInspectionsCailService);
//# sourceMappingURL=pm-inspections-cail.service.js.map