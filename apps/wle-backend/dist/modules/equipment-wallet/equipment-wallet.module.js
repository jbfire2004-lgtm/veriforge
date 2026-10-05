"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentWalletModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const competency_module_1 = require("../competency/competency.module");
const maintenance_calibration_core_module_1 = require("../maintenance-calibration-core/maintenance-calibration-core.module");
const equipment_wallet_controller_1 = require("./equipment-wallet.controller");
const equipment_wallet_service_1 = require("./equipment-wallet.service");
let EquipmentWalletModule = class EquipmentWalletModule {
};
exports.EquipmentWalletModule = EquipmentWalletModule;
exports.EquipmentWalletModule = EquipmentWalletModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, competency_module_1.CompetencyModule, maintenance_calibration_core_module_1.MaintenanceCalibrationCoreModule],
        controllers: [equipment_wallet_controller_1.EquipmentWalletController],
        providers: [equipment_wallet_service_1.EquipmentWalletService],
        exports: [equipment_wallet_service_1.EquipmentWalletService],
    })
], EquipmentWalletModule);
//# sourceMappingURL=equipment-wallet.module.js.map