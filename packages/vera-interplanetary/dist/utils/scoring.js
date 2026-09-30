"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMM_DELAYS = void 0;
exports.clamp = clamp;
function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
}
exports.COMM_DELAYS = {
    earth: 0,
    orbit: 0.5,
    moon: 1.3,
    mars: 22,
    deep_space: 40,
};
//# sourceMappingURL=scoring.js.map