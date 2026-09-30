"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_DELAYS_YEARS = void 0;
exports.clamp = clamp;
function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
}
exports.SYSTEM_DELAYS_YEARS = {
    sol: 0,
    alpha_centauri: 4.37,
    proxima: 4.24,
    trappist_1: 40,
};
//# sourceMappingURL=scoring.js.map