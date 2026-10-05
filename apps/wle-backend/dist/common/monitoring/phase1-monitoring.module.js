"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phase1MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../../audit/audit.module");
const phase1_monitoring_service_1 = require("./phase1-monitoring.service");
let Phase1MonitoringModule = class Phase1MonitoringModule {
};
exports.Phase1MonitoringModule = Phase1MonitoringModule;
exports.Phase1MonitoringModule = Phase1MonitoringModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        providers: [phase1_monitoring_service_1.Phase1MonitoringService],
        exports: [phase1_monitoring_service_1.Phase1MonitoringService],
    })
], Phase1MonitoringModule);
//# sourceMappingURL=phase1-monitoring.module.js.map