"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashId = hashId;
exports.aggregateHazardKeywords = aggregateHazardKeywords;
exports.clamp = clamp;
function hashId(id, salt = "vera-network") {
    let h = 0;
    const s = `${salt}:${id}`;
    for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i);
        h |= 0;
    }
    return `anon-${Math.abs(h).toString(36)}`;
}
function aggregateHazardKeywords(texts) {
    const map = new Map();
    const keywords = [
        "fall",
        "height",
        "electrical",
        "confined",
        "chemical",
        "fire",
        "lift",
        "crane",
        "pressure",
        "thermal",
    ];
    for (const text of texts) {
        const lower = text.toLowerCase();
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                map.set(kw, (map.get(kw) ?? 0) + 1);
            }
        }
    }
    return map;
}
function clamp(n, min = 0, max = 100) {
    return Math.max(min, Math.min(max, n));
}
//# sourceMappingURL=anonymize.js.map