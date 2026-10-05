"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const equipment_wallet_service_1 = require("../equipment-wallet/equipment-wallet.service");
const tools_ppe_core_service_1 = require("../tools-ppe-core/tools-ppe-core.service");
const registry_service_1 = require("./registry.service");
const training_wallet_integration_service_1 = require("./training-wallet-integration.service");
const wallet_routes_1 = require("../../common/wallet-routes");
let WalletsService = class WalletsService {
    constructor(registry, toolsPpe, equipmentWallet, walletIntegration) {
        this.registry = registry;
        this.toolsPpe = toolsPpe;
        this.equipmentWallet = equipmentWallet;
        this.walletIntegration = walletIntegration;
    }
    async getWorkerWallet(workerId) {
        const profile = await this.registry.getWorkerProfile(workerId);
        const qrToken = await this.registry.ensureWorkerQrToken(workerId);
        const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.vera.local';
        const toolsPpe = await this.toolsPpe.getWorkerToolsPpe(workerId);
        const training = await this.walletIntegration.listWalletTraining(workerId);
        return {
            type: 'worker',
            workerId,
            qrToken,
            qrContent: (0, wallet_routes_1.workerVerifyUrl)(workerId, baseUrl),
            verifyUrl: (0, wallet_routes_1.workerVerifyUrl)(workerId, baseUrl),
            walletUrl: (0, wallet_routes_1.workerStaffWalletPath)(workerId),
            qrJson: { type: 'worker', id: workerId, token: qrToken },
            training,
            companyHistory: profile.companyLinks,
            projectHistory: profile.projectAssignments,
            unionHalls: profile.unionMemberships,
            equipmentCompetency: profile.competencyEvaluations,
            walletItems: profile.workerWalletItems,
            toolsAssigned: toolsPpe.tools,
            ppeAssigned: toolsPpe.ppe,
        };
    }
    async getEquipmentWallet(equipmentId) {
        var _a, _b, _c;
        const profile = await this.registry.getEquipmentProfile(equipmentId);
        const qrToken = await this.registry.ensureEquipmentQrToken(equipmentId);
        const lockedOut = Boolean(profile.lockedOutAt);
        const linkStatus = (_a = profile.equipmentLinks.find((l) => l.active)) === null || _a === void 0 ? void 0 : _a.complianceStatus;
        const complianceStatus = (_c = (_b = profile.complianceStatus) !== null && _b !== void 0 ? _b : linkStatus) !== null && _c !== void 0 ? _c : (lockedOut ? 'LOCKED_OUT' : 'COMPLIANT');
        return {
            type: 'equipment',
            equipmentId,
            qrToken,
            qrContent: JSON.stringify({
                type: 'equipment',
                id: equipmentId,
                token: qrToken,
            }),
            inspectionHistory: profile.inspections,
            competencyRequirements: profile.competencyRequirements,
            trainingRequirements: profile.trainingRequirements,
            assignedWorkers: profile.equipmentLinks.flatMap((l) => l.assignedWorkers.map((aw) => (Object.assign(Object.assign({}, aw.worker), { companyId: l.companyId })))),
            assignedProjects: profile.projectAssignments,
            companyHistory: profile.equipmentLinks,
            complianceStatus,
            lastInspectionAt: profile.lastInspectionAt,
            nextInspectionAt: profile.nextInspectionAt,
            lockoutStatus: profile.lockoutStatus,
            competencyRequired: profile.competencyRequired,
            trainingRequired: profile.trainingRequired,
            complianceUpdatedAt: profile.complianceUpdatedAt,
            lockedOut,
            lockoutReason: profile.lockoutReason,
            walletUrl: `/equipment/${equipmentId}/wallet`,
        };
    }
    async getEquipmentWalletFull(equipmentId) {
        return this.equipmentWallet.getFullWallet(equipmentId);
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [registry_service_1.RegistryService,
        tools_ppe_core_service_1.ToolsPpeCoreService,
        equipment_wallet_service_1.EquipmentWalletService,
        training_wallet_integration_service_1.TrainingWalletIntegrationService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map