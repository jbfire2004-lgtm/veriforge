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
exports.EquipmentCompliancePipeline = void 0;
const common_1 = require("@nestjs/common");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
let EquipmentCompliancePipeline = class EquipmentCompliancePipeline {
    constructor(reporting) {
        this.reporting = reporting;
    }
    async run(companyId) {
        const report = await this.reporting.equipmentCompliance(companyId);
        const s = report.summary;
        const nextDue = report.recent
            .map((r) => r.nextInspectionDue)
            .filter(Boolean)
            .sort()[0];
        return {
            total: s.total,
            compliant: s.compliant,
            nonCompliant: s.nonCompliant,
            lockedOut: s.lockedOut,
            overdueInspection: s.overdueInspection,
            complianceRate: s.complianceRate,
            nextInspectionDue: nextDue !== null && nextDue !== void 0 ? nextDue : null,
        };
    }
};
exports.EquipmentCompliancePipeline = EquipmentCompliancePipeline;
exports.EquipmentCompliancePipeline = EquipmentCompliancePipeline = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService])
], EquipmentCompliancePipeline);
//# sourceMappingURL=equipment-compliance.pipeline.js.map