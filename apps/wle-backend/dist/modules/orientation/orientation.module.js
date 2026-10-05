"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationModule = void 0;
const common_1 = require("@nestjs/common");
const orientation_controller_1 = require("./orientation.controller");
const orientation_service_1 = require("./orientation.service");
const orientation_ai_service_1 = require("./orientation-ai.service");
const orientation_translation_service_1 = require("./orientation-translation.service");
const orientation_linking_service_1 = require("./orientation-linking.service");
const orientation_core_integration_service_1 = require("./orientation-core-integration.service");
const orientation_access_service_1 = require("./orientation-access.service");
const orientation_upload_service_1 = require("./orientation-upload.service");
const orientation_definition_service_1 = require("./veriforge/orientation-definition.service");
const orientation_requirement_service_1 = require("./veriforge/orientation-requirement.service");
const orientation_completion_service_1 = require("./veriforge/orientation-completion.service");
const worker_orientation_profile_service_1 = require("./veriforge/worker-orientation-profile.service");
const orientation_ai_generate_service_1 = require("./veriforge/orientation-ai-generate.service");
const orientation_delivery_service_1 = require("./veriforge/orientation-delivery.service");
const orientation_definition_controller_1 = require("./veriforge/orientation-definition.controller");
const orientation_requirement_controller_1 = require("./veriforge/orientation-requirement.controller");
const orientation_completion_controller_1 = require("./veriforge/orientation-completion.controller");
const worker_orientation_profile_controller_1 = require("./veriforge/worker-orientation-profile.controller");
const orientation_ai_controller_1 = require("./veriforge/orientation-ai.controller");
const orientation_delivery_controller_1 = require("./veriforge/orientation-delivery.controller");
let OrientationModule = class OrientationModule {
};
exports.OrientationModule = OrientationModule;
exports.OrientationModule = OrientationModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            orientation_controller_1.OrientationController,
            orientation_definition_controller_1.OrientationDefinitionController,
            orientation_requirement_controller_1.OrientationRequirementController,
            orientation_completion_controller_1.OrientationCompletionController,
            worker_orientation_profile_controller_1.WorkerOrientationProfileController,
            orientation_ai_controller_1.OrientationAiController,
            orientation_delivery_controller_1.OrientationDeliveryController,
        ],
        providers: [
            orientation_service_1.OrientationService,
            orientation_ai_service_1.OrientationAiService,
            orientation_translation_service_1.OrientationTranslationService,
            orientation_linking_service_1.OrientationLinkingService,
            orientation_core_integration_service_1.OrientationCoreIntegrationService,
            orientation_access_service_1.OrientationAccessService,
            orientation_upload_service_1.OrientationUploadService,
            orientation_definition_service_1.OrientationDefinitionService,
            orientation_requirement_service_1.OrientationRequirementService,
            orientation_completion_service_1.OrientationCompletionService,
            worker_orientation_profile_service_1.WorkerOrientationProfileService,
            orientation_ai_generate_service_1.OrientationAiGenerateService,
            orientation_delivery_service_1.OrientationDeliveryService,
        ],
        exports: [
            orientation_service_1.OrientationService,
            orientation_linking_service_1.OrientationLinkingService,
            orientation_access_service_1.OrientationAccessService,
            orientation_core_integration_service_1.OrientationCoreIntegrationService,
            orientation_definition_service_1.OrientationDefinitionService,
            orientation_requirement_service_1.OrientationRequirementService,
            orientation_completion_service_1.OrientationCompletionService,
            worker_orientation_profile_service_1.WorkerOrientationProfileService,
            orientation_delivery_service_1.OrientationDeliveryService,
        ],
    })
], OrientationModule);
//# sourceMappingURL=orientation.module.js.map