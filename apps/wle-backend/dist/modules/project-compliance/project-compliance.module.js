"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectComplianceModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const audit_module_1 = require("../../audit/audit.module");
const project_compliance_alerts_service_1 = require("./project-compliance-alerts.service");
const project_compliance_controller_1 = require("./project-compliance.controller");
const project_compliance_service_1 = require("./project-compliance.service");
let ProjectComplianceModule = class ProjectComplianceModule {
};
exports.ProjectComplianceModule = ProjectComplianceModule;
exports.ProjectComplianceModule = ProjectComplianceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, audit_module_1.AuditModule],
        controllers: [project_compliance_controller_1.ProjectComplianceController],
        providers: [project_compliance_service_1.ProjectComplianceService, project_compliance_alerts_service_1.ProjectComplianceAlertsService],
        exports: [project_compliance_service_1.ProjectComplianceService, project_compliance_alerts_service_1.ProjectComplianceAlertsService],
    })
], ProjectComplianceModule);
//# sourceMappingURL=project-compliance.module.js.map