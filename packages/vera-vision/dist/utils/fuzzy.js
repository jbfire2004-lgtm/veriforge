"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuzzyScore = fuzzyScore;
exports.normalize = normalize;
exports.bestMatch = bestMatch;
/** Normalized Levenshtein similarity 0–1 */
function fuzzyScore(a, b) {
    const s = normalize(a);
    const t = normalize(b);
    if (!s && !t)
        return 1;
    if (!s || !t)
        return 0;
    if (s === t)
        return 1;
    const dist = levenshtein(s, t);
    return 1 - dist / Math.max(s.length, t.length);
}
function normalize(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++)
        dp[i][0] = i;
    for (let j = 0; j <= n; j++)
        dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    return dp[m][n];
}
function bestMatch(query, items, threshold = 0.55) {
    let best = null;
    for (const item of items) {
        const score = fuzzyScore(query, item.name);
        if (score >= threshold && (!best || score > best.score)) {
            best = { item, score };
        }
    }
    return best;
}
//# sourceMappingURL=fuzzy.js.map