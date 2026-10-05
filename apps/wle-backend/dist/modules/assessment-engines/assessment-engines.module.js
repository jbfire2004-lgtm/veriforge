"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentEnginesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const fit_test_module_1 = require("../fit-test/fit-test.module");
const assessment_engines_controller_1 = require("./assessment-engines.controller");
const assessment_engines_service_1 = require("./assessment-engines.service");
const training_assessment_runner_service_1 = require("./training-assessment-runner.service");
const assessment_export_service_1 = require("./assessment-export.service");
let AssessmentEnginesModule = class AssessmentEnginesModule {
};
exports.AssessmentEnginesModule = AssessmentEnginesModule;
exports.AssessmentEnginesModule = AssessmentEnginesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, fit_test_module_1.FitTestModule],
        controllers: [assessment_engines_controller_1.AssessmentEnginesController],
        providers: [
            assessment_engines_service_1.AssessmentEnginesService,
            training_assessment_runner_service_1.TrainingAssessmentRunnerService,
            assessment_export_service_1.AssessmentExportService,
        ],
        exports: [
            assessment_engines_service_1.AssessmentEnginesService,
            training_assessment_runner_service_1.TrainingAssessmentRunnerService,
            assessment_export_service_1.AssessmentExportService,
        ],
    })
], AssessmentEnginesModule);
//# sourceMappingURL=assessment-engines.module.js.map