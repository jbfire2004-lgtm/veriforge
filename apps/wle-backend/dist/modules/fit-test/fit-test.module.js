"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitTestModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const fit_test_controller_1 = require("./fit-test.controller");
const fit_test_service_1 = require("./fit-test.service");
let FitTestModule = class FitTestModule {
};
exports.FitTestModule = FitTestModule;
exports.FitTestModule = FitTestModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [fit_test_controller_1.FitTestController],
        providers: [fit_test_service_1.FitTestService],
        exports: [fit_test_service_1.FitTestService],
    })
], FitTestModule);
//# sourceMappingURL=fit-test.module.js.map