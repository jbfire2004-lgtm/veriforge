"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicBaseUrl = publicBaseUrl;
exports.workerVerifyUrlByToken = workerVerifyUrlByToken;
exports.workerVerifyUrl = workerVerifyUrl;
exports.workerStaffWalletPath = workerStaffWalletPath;
exports.equipmentVerifyUrlByToken = equipmentVerifyUrlByToken;
exports.equipmentVerifyUrl = equipmentVerifyUrl;
exports.equipmentStaffWalletPath = equipmentStaffWalletPath;
exports.workerQrJsonPayload = workerQrJsonPayload;
exports.equipmentQrJsonPayload = equipmentQrJsonPayload;
exports.workerScanAliasUrl = workerScanAliasUrl;
exports.equipmentScanAliasUrl = equipmentScanAliasUrl;
const public_base_url_1 = require("../config/public-base-url");
function publicBaseUrl() {
    return (0, public_base_url_1.resolvePublicBaseUrl)();
}
function workerVerifyUrlByToken(qrToken, base = publicBaseUrl()) {
    return `${base}/verify/t/${encodeURIComponent(qrToken)}`;
}
function workerVerifyUrl(workerId, base = publicBaseUrl()) {
    return `${base}/verify/${workerId}`;
}
function workerStaffWalletPath(workerId) {
    return `/wallet/${workerId}`;
}
function equipmentVerifyUrlByToken(qrToken, base = publicBaseUrl()) {
    return `${base}/verify/t/${encodeURIComponent(qrToken)}`;
}
function equipmentVerifyUrl(equipmentId, base = publicBaseUrl()) {
    return `${base}/verify/equipment?id=${equipmentId}`;
}
function equipmentStaffWalletPath(equipmentId) {
    return `/equipment/${equipmentId}/wallet`;
}
function workerQrJsonPayload(qrToken, workerId) {
    return { type: 'worker', token: qrToken, id: workerId };
}
function equipmentQrJsonPayload(qrToken, equipmentId) {
    return { type: 'equipment', token: qrToken, id: equipmentId };
}
function workerScanAliasUrl(workerId, base = publicBaseUrl()) {
    return `${base}/scan/worker/${workerId}`;
}
function equipmentScanAliasUrl(equipmentId, base = publicBaseUrl()) {
    return `${base}/scan/equipment/${equipmentId}`;
}
//# sourceMappingURL=wallet-routes.js.map