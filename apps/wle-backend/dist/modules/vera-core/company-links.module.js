"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyLinksModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const inactivation_module_1 = require("./inactivation.module");
const orientation_module_1 = require("../orientation/orientation.module");
const company_links_service_1 = require("./company-links.service");
let CompanyLinksModule = class CompanyLinksModule {
};
exports.CompanyLinksModule = CompanyLinksModule;
exports.CompanyLinksModule = CompanyLinksModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, inactivation_module_1.InactivationModule, orientation_module_1.OrientationModule],
        providers: [company_links_service_1.CompanyLinksService],
        exports: [company_links_service_1.CompanyLinksService],
    })
], CompanyLinksModule);
//# sourceMappingURL=company-links.module.js.map