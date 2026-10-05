"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLIC_QR_TOKEN_RE = void 0;
exports.isPublicQrToken = isPublicQrToken;
exports.workerTokenPrefix = workerTokenPrefix;
exports.equipmentTokenPrefix = equipmentTokenPrefix;
exports.PUBLIC_QR_TOKEN_RE = /^[we]-[a-f0-9-]{20,}$/i;
function isPublicQrToken(ref) {
    return exports.PUBLIC_QR_TOKEN_RE.test(ref.trim());
}
function workerTokenPrefix() {
    return 'w';
}
function equipmentTokenPrefix() {
    return 'e';
}
//# sourceMappingURL=public-token.util.js.map