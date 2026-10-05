"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingRecordsModule = void 0;
const common_1 = require("@nestjs/common");
const training_records_controller_1 = require("./training-records.controller");
const training_records_service_1 = require("./training-records.service");
const prisma_module_1 = require("../prisma/prisma.module");
const api_platform_module_1 = require("../modules/api-platform/api-platform.module");
const credential_ledger_module_1 = require("../modules/credential-ledger/credential-ledger.module");
let TrainingRecordsModule = class TrainingRecordsModule {
};
exports.TrainingRecordsModule = TrainingRecordsModule;
exports.TrainingRecordsModule = TrainingRecordsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            credential_ledger_module_1.CredentialLedgerModule,
            (0, common_1.forwardRef)(() => api_platform_module_1.ApiPlatformModule),
        ],
        controllers: [training_records_controller_1.TrainingRecordsController],
        providers: [training_records_service_1.TrainingRecordsService],
        exports: [training_records_service_1.TrainingRecordsService],
    })
], TrainingRecordsModule);
//# sourceMappingURL=training-records.module.js.map