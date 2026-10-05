"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmSafetyEcosystemModule = void 0;
const common_1 = require("@nestjs/common");
const safety_ecosystem_events_service_1 = require("./safety-ecosystem-events.service");
const pm_safety_ecosystem_controller_1 = require("./pm-safety-ecosystem.controller");
let PmSafetyEcosystemModule = class PmSafetyEcosystemModule {
};
exports.PmSafetyEcosystemModule = PmSafetyEcosystemModule;
exports.PmSafetyEcosystemModule = PmSafetyEcosystemModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [pm_safety_ecosystem_controller_1.PmSafetyEcosystemController],
        providers: [safety_ecosystem_events_service_1.SafetyEcosystemEventsService],
        exports: [safety_ecosystem_events_service_1.SafetyEcosystemEventsService],
    })
], PmSafetyEcosystemModule);
//# sourceMappingURL=pm-safety-ecosystem.module.js.map