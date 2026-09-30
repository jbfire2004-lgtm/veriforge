"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.hashId = hashId;
function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
}
function hashId(id, salt = "vera-industry") {
    let h = 0;
    const s = `${salt}:${id}`;
    for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
    }
    return `ind-${Math.abs(h).toString(36)}`;
}
//# sourceMappingURL=scoring.js.map