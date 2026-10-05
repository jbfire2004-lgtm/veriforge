"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSecurityActor = toSecurityActor;
function toSecurityActor(user) {
    var _a, _b, _c, _d, _e;
    return {
        id: user.id,
        userId: (_a = user.userId) !== null && _a !== void 0 ? _a : user.id,
        email: user.email,
        role: user.role,
        companyId: (_b = user.companyId) !== null && _b !== void 0 ? _b : null,
        companyName: (_c = user.companyName) !== null && _c !== void 0 ? _c : null,
        trainingProviderId: (_d = user.trainingProviderId) !== null && _d !== void 0 ? _d : null,
        instructorId: (_e = user.instructorId) !== null && _e !== void 0 ? _e : null,
    };
}
//# sourceMappingURL=actor.util.js.map