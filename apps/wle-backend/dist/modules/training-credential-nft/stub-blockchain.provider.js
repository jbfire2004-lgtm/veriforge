"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubBlockchainCredentialProvider = void 0;
const crypto_1 = require("crypto");
const training_credential_nft_config_1 = require("./training-credential-nft.config");
class StubBlockchainCredentialProvider {
    async mintTrainingCredential(input) {
        const digest = (0, crypto_1.createHash)('sha256')
            .update(JSON.stringify(input.metadata))
            .digest('hex')
            .slice(0, 16);
        return {
            chain: (0, training_credential_nft_config_1.nftStubChainId)(),
            tokenId: `vera-tr-${input.trainingRecordId}-${digest}`,
            transactionHash: `0xstub-${(0, crypto_1.randomUUID)().replace(/-/g, '')}`,
        };
    }
    async verifyCredential(input) {
        var _a, _b;
        const match = /^vera-tr-(\d+)-/.exec(input.tokenId);
        const trainingRecordId = (_a = input.trainingRecordId) !== null && _a !== void 0 ? _a : (match ? Number(match[1]) : null);
        return {
            valid: Boolean(trainingRecordId && input.tokenId.startsWith('vera-tr-')),
            tokenId: input.tokenId,
            chain: (_b = input.chain) !== null && _b !== void 0 ? _b : (0, training_credential_nft_config_1.nftStubChainId)(),
            trainingRecordId,
            mintedAt: new Date().toISOString(),
            message: trainingRecordId
                ? 'Stub chain: credential token matches Vera training record format.'
                : 'Token format not recognized on stub chain.',
        };
    }
}
exports.StubBlockchainCredentialProvider = StubBlockchainCredentialProvider;
//# sourceMappingURL=stub-blockchain.provider.js.map