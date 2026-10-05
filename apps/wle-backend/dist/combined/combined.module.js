"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinedModule = void 0;
const common_1 = require("@nestjs/common");
const combined_controller_1 = require("./combined.controller");
const combined_service_1 = require("./combined.service");
const prisma_service_1 = require("../prisma/prisma.service");
const rule_engine_module_1 = require("../rules/rule-engine.module");
const verification_module_1 = require("../verification/verification.module");
let CombinedModule = class CombinedModule {
};
exports.CombinedModule = CombinedModule;
exports.CombinedModule = CombinedModule = __decorate([
    (0, common_1.Module)({
        imports: [rule_engine_module_1.RuleEngineModule, (0, common_1.forwardRef)(() => verification_module_1.VerificationModule)],
        controllers: [combined_controller_1.CombinedController],
        providers: [combined_service_1.CombinedService, prisma_service_1.PrismaService],
        exports: [combined_service_1.CombinedService],
    })
], CombinedModule);
//# sourceMappingURL=combined.module.js.map