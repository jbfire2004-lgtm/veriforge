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
exports.InspectionsCoreService = void 0;
const common_1 = require("@nestjs/common");
const inspection_core_service_1 = require("../inspection-core/inspection-core.service");
let InspectionsCoreService = class InspectionsCoreService {
    constructor(inspectionCore) {
        this.inspectionCore = inspectionCore;
    }
    async createInspection(data) {
        return this.inspectionCore.submitInspection({
            equipmentId: data.equipmentId,
            workerId: data.workerId,
            siteId: data.siteId,
            kind: data.kind,
            checklistId: data.checklistId,
            checklist: data.checklist,
            passed: data.passed,
            photos: data.photos,
            correctiveActions: data.correctiveActions,
            notes: data.notes,
            meterReading: data.meterReading,
            signature: data.signature,
        }, data.inspectorId);
    }
    async listForEquipment(equipmentId) {
        return this.inspectionCore.listForEquipment(equipmentId);
    }
};
exports.InspectionsCoreService = InspectionsCoreService;
exports.InspectionsCoreService = InspectionsCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inspection_core_service_1.InspectionCoreService])
], InspectionsCoreService);
//# sourceMappingURL=inspections-core.service.js.map