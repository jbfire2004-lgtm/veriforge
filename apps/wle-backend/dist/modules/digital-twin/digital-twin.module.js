"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalTwinModule = void 0;
const common_1 = require("@nestjs/common");
const digital_twin_controller_1 = require("./digital-twin.controller");
const digital_twin_service_1 = require("./digital-twin.service");
const reporting_core_module_1 = require("../reporting-core/reporting-core.module");
const dashboard_widgets_module_1 = require("../dashboard-widgets/dashboard-widgets.module");
const api_platform_module_1 = require("../api-platform/api-platform.module");
let DigitalTwinModule = class DigitalTwinModule {
};
exports.DigitalTwinModule = DigitalTwinModule;
exports.DigitalTwinModule = DigitalTwinModule = __decorate([
    (0, common_1.Module)({
        imports: [
            reporting_core_module_1.ReportingCoreModule,
            dashboard_widgets_module_1.DashboardWidgetsModule,
            (0, common_1.forwardRef)(() => api_platform_module_1.ApiPlatformModule),
        ],
        controllers: [digital_twin_controller_1.DigitalTwinController],
        providers: [digital_twin_service_1.DigitalTwinService],
        exports: [digital_twin_service_1.DigitalTwinService],
    })
], DigitalTwinModule);
//# sourceMappingURL=digital-twin.module.js.map