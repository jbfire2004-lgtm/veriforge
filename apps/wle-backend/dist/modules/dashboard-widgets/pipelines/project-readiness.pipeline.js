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
exports.ProjectReadinessPipeline = void 0;
const common_1 = require("@nestjs/common");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
let ProjectReadinessPipeline = class ProjectReadinessPipeline {
    constructor(reporting) {
        this.reporting = reporting;
    }
    async run(companyId) {
        const report = await this.reporting.projectReadiness(companyId);
        const s = report.summary;
        let missingWorkers = 0;
        let missingEquipment = 0;
        let missingTraining = 0;
        for (const row of report.rows) {
            missingWorkers += Math.max(0, row.totalWorkers - row.compliantWorkers);
            missingEquipment += Math.max(0, row.totalEquipment - row.compliantEquipment);
            if (row.readinessScore < 70)
                missingTraining += 1;
        }
        return {
            averageReadiness: s.averageReadiness,
            totalProjects: s.totalProjects,
            ready: s.ready,
            atRisk: s.atRisk,
            notReady: s.notReady,
            missingWorkers,
            missingEquipment,
            missingTraining,
        };
    }
};
exports.ProjectReadinessPipeline = ProjectReadinessPipeline;
exports.ProjectReadinessPipeline = ProjectReadinessPipeline = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService])
], ProjectReadinessPipeline);
//# sourceMappingURL=project-readiness.pipeline.js.map