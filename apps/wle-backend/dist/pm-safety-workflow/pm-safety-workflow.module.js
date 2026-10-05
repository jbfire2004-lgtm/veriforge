"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSafetyWorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_workflow_controller_1 = require("./pm-safety-workflow.controller");
const pm_safety_workflow_service_1 = require("./pm-safety-workflow.service");
let PmSafetyWorkflowModule = class PmSafetyWorkflowModule {
};
exports.PmSafetyWorkflowModule = PmSafetyWorkflowModule;
exports.PmSafetyWorkflowModule = PmSafetyWorkflowModule = __decorate([
    (0, common_1.Module)({
        controllers: [pm_safety_workflow_controller_1.PmSafetyWorkflowController],
        providers: [pm_safety_workflow_service_1.PmSafetyWorkflowService, prisma_service_1.PrismaService],
        exports: [pm_safety_workflow_service_1.PmSafetyWorkflowService],
    })
], PmSafetyWorkflowModule);
//# sourceMappingURL=pm-safety-workflow.module.js.map