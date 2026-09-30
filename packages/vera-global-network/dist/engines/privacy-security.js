"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacySecurityLayer = void 0;
class PrivacySecurityLayer {
    envelope(ctx) {
        return {
            differentialPrivacyEpsilon: 0.8,
            federatedLearningRound: Math.floor(Date.now() / 86400000) % 1000,
            anonymizationLevel: "company-hash-only",
            companyIsolation: true,
            encryptedFederation: !ctx.offline,
        };
    }
    sanitizeCompanyData(data) {
        const copy = { ...data };
        delete copy.companyId;
        delete copy.workerNames;
        delete copy.equipmentSerial;
        return copy;
    }
}
exports.PrivacySecurityLayer = PrivacySecurityLayer;
//# sourceMappingURL=privacy-security.js.map