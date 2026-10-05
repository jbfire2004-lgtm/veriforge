"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashRegulatoryDecisionPayload = hashRegulatoryDecisionPayload;
exports.hashOriginalDocumentRef = hashOriginalDocumentRef;
const crypto_1 = require("crypto");
function hashRegulatoryDecisionPayload(payload) {
    return (0, crypto_1.createHash)('sha256').update(JSON.stringify(payload)).digest('hex');
}
function hashOriginalDocumentRef(parts) {
    var _a, _b, _c;
    const key = (_c = (_b = (_a = parts.coreFileObjectKey) !== null && _a !== void 0 ? _a : (parts.coreFileId != null ? `core-file:${parts.coreFileId}` : null)) !== null && _b !== void 0 ? _b : (parts.ingestionRunId != null
        ? `ingestion-run:${parts.ingestionRunId}`
        : null)) !== null && _c !== void 0 ? _c : parts.certificateNumber;
    if (!key)
        return null;
    return (0, crypto_1.createHash)('sha256').update(key).digest('hex');
}
//# sourceMappingURL=training-credential-nft-hash.util.js.map