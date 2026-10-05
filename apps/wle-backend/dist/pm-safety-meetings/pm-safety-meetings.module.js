"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSafetyMeetingsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const safety_intelligence_module_1 = require("../safety-intelligence/safety-intelligence.module");
const pm_corrective_actions_module_1 = require("../pm-corrective-actions/pm-corrective-actions.module");
const pm_safety_meetings_controller_1 = require("./pm-safety-meetings.controller");
const pm_safety_meetings_service_1 = require("./pm-safety-meetings.service");
const pm_safety_meetings_templates_service_1 = require("./pm-safety-meetings-templates.service");
const pm_safety_meetings_topic_library_service_1 = require("./pm-safety-meetings-topic-library.service");
const pm_safety_meetings_intelligence_service_1 = require("./pm-safety-meetings-intelligence.service");
const pm_safety_meetings_cail_service_1 = require("./pm-safety-meetings-cail.service");
let PmSafetyMeetingsModule = class PmSafetyMeetingsModule {
};
exports.PmSafetyMeetingsModule = PmSafetyMeetingsModule;
exports.PmSafetyMeetingsModule = PmSafetyMeetingsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, safety_intelligence_module_1.SafetyIntelligenceModule, pm_corrective_actions_module_1.PmCorrectiveActionsModule],
        controllers: [pm_safety_meetings_controller_1.PmSafetyMeetingsController],
        providers: [
            pm_safety_meetings_service_1.PmSafetyMeetingsService,
            pm_safety_meetings_templates_service_1.PmSafetyMeetingsTemplatesService,
            pm_safety_meetings_topic_library_service_1.PmSafetyMeetingsTopicLibraryService,
            pm_safety_meetings_intelligence_service_1.PmSafetyMeetingsIntelligenceService,
            pm_safety_meetings_cail_service_1.PmSafetyMeetingsCailService,
        ],
        exports: [pm_safety_meetings_service_1.PmSafetyMeetingsService],
    })
], PmSafetyMeetingsModule);
//# sourceMappingURL=pm-safety-meetings.module.js.map