"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVeraPmDevOpen = isVeraPmDevOpen;
exports.veraPmDevOpenActor = veraPmDevOpenActor;
const client_1 = require("@prisma/client");
function isVeraPmDevOpen() {
    var _a;
    if (process.env.NODE_ENV === 'production')
        return false;
    const flag = (_a = process.env.VERA_PM_DEV_OPEN) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
    return flag === '1' || flag === 'true' || flag === 'yes';
}
function veraPmDevOpenActor() {
    var _a;
    const companyIdRaw = Number((_a = process.env.VERA_PM_DEV_COMPANY_ID) !== null && _a !== void 0 ? _a : '1');
    const companyId = Number.isFinite(companyIdRaw) && companyIdRaw > 0 ? companyIdRaw : 1;
    return {
        id: 1,
        userId: 1,
        email: 'dev-open@vera.local',
        role: client_1.UserRole.SUPER_ADMIN,
        companyId,
        companyName: 'Dev Open Company',
    };
}
//# sourceMappingURL=pm-dev-open.js.map