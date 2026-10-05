"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationModule = void 0;
const common_1 = require("@nestjs/common");
const verification_controller_1 = require("./verification.controller");
const verification_core_controller_1 = require("./verification-core.controller");
const verification_activity_controller_1 = require("./verification-activity.controller");
const verification_service_1 = require("./verification.service");
const public_token_resolver_1 = require("./public-token.resolver");
const prisma_service_1 = require("../prisma/prisma.service");
const rule_engine_module_1 = require("../rules/rule-engine.module");
const vera_core_module_1 = require("../modules/vera-core/vera-core.module");
const training_credential_nft_module_1 = require("../modules/training-credential-nft/training-credential-nft.module");
const training_standards_compliance_module_1 = require("../modules/training-standards-compliance/training-standards-compliance.module");
const domain_event_bus_module_1 = require("../modules/api-platform/events/domain-event-bus.module");
const notifications_module_1 = require("../notifications/notifications.module");
let VerificationModule = class VerificationModule {
};
exports.VerificationModule = VerificationModule;
exports.VerificationModule = VerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            rule_engine_module_1.RuleEngineModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            training_credential_nft_module_1.TrainingCredentialNftModule,
            training_standards_compliance_module_1.TrainingStandardsComplianceModule,
            domain_event_bus_module_1.DomainEventBusModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [
            verification_controller_1.VerificationController,
            verification_core_controller_1.VerificationCoreController,
            verification_activity_controller_1.VerificationActivityController,
        ],
        providers: [verification_service_1.VerificationService, public_token_resolver_1.PublicTokenResolver, prisma_service_1.PrismaService],
        exports: [verification_service_1.VerificationService, public_token_resolver_1.PublicTokenResolver],
    })
], VerificationModule);
//# sourceMappingURL=verification.module.js.map