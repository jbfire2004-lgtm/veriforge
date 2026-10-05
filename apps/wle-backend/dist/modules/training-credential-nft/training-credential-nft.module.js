"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingCredentialNftModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const blockchain_provider_interface_1 = require("./blockchain-provider.interface");
const stub_blockchain_provider_1 = require("./stub-blockchain.provider");
const training_credential_nft_controller_1 = require("./training-credential-nft.controller");
const training_credential_nft_coordinator_service_1 = require("./training-credential-nft-coordinator.service");
const training_credential_nft_eligibility_service_1 = require("./training-credential-nft-eligibility.service");
const training_credential_nft_minting_service_1 = require("./training-credential-nft-minting.service");
const training_credential_nft_projection_service_1 = require("./training-credential-nft-projection.service");
const training_credential_nft_registry_service_1 = require("./training-credential-nft-registry.service");
let TrainingCredentialNftModule = class TrainingCredentialNftModule {
};
exports.TrainingCredentialNftModule = TrainingCredentialNftModule;
exports.TrainingCredentialNftModule = TrainingCredentialNftModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [training_credential_nft_controller_1.TrainingCredentialNftController],
        providers: [
            training_credential_nft_registry_service_1.TrainingCredentialNftRegistryService,
            training_credential_nft_eligibility_service_1.TrainingCredentialNftEligibilityService,
            training_credential_nft_minting_service_1.TrainingCredentialNftMintingService,
            training_credential_nft_coordinator_service_1.TrainingCredentialNftCoordinatorService,
            training_credential_nft_projection_service_1.TrainingCredentialNftProjectionService,
            {
                provide: blockchain_provider_interface_1.BLOCKCHAIN_CREDENTIAL_PROVIDER,
                useClass: stub_blockchain_provider_1.StubBlockchainCredentialProvider,
            },
        ],
        exports: [
            training_credential_nft_coordinator_service_1.TrainingCredentialNftCoordinatorService,
            training_credential_nft_projection_service_1.TrainingCredentialNftProjectionService,
            training_credential_nft_registry_service_1.TrainingCredentialNftRegistryService,
            blockchain_provider_interface_1.BLOCKCHAIN_CREDENTIAL_PROVIDER,
        ],
    })
], TrainingCredentialNftModule);
//# sourceMappingURL=training-credential-nft.module.js.map