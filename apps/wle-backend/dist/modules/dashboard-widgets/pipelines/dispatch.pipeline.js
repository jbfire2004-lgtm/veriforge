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
exports.DispatchPipeline = void 0;
const common_1 = require("@nestjs/common");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
let DispatchPipeline = class DispatchPipeline {
    constructor(reporting) {
        this.reporting = reporting;
    }
    async run(unionHallId, companyId) {
        var _a, _b;
        const report = await this.reporting.unionDispatchStatus(unionHallId, companyId);
        const s = report.summary;
        const missingTraining = report.recent.filter((d) => !d.workerCompliant).length;
        return {
            readyForDispatch: Math.max(0, ((_a = s.activeMembers) !== null && _a !== void 0 ? _a : 0) - missingTraining),
            missingTraining,
            currentlyDispatched: s.activeDispatches,
            activeMembers: (_b = s.activeMembers) !== null && _b !== void 0 ? _b : 0,
            totalDispatches: s.totalDispatches,
        };
    }
};
exports.DispatchPipeline = DispatchPipeline;
exports.DispatchPipeline = DispatchPipeline = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService])
], DispatchPipeline);
//# sourceMappingURL=dispatch.pipeline.js.map