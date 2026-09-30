"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.competencyEngine = exports.expiryEngine = exports.CompetencyEngine = exports.ExpiryEngine = void 0;
const LEVEL_SCORES = {
    basic: 50,
    intermediate: 75,
    advanced: 90,
    expert: 100,
};
class ExpiryEngine {
    computeExpiry(completionDate, expiryDays) {
        const expiry = new Date(completionDate);
        expiry.setDate(expiry.getDate() + expiryDays);
        return expiry;
    }
    isExpired(expiryDate, now = new Date()) {
        if (!expiryDate)
            return false;
        return expiryDate.getTime() < now.getTime();
    }
    isExpiringSoon(expiryDate, withinDays = 30, now = new Date()) {
        if (!expiryDate)
            return false;
        const threshold = now.getTime() + withinDays * 24 * 60 * 60 * 1000;
        return expiryDate.getTime() <= threshold && expiryDate.getTime() > now.getTime();
    }
}
exports.ExpiryEngine = ExpiryEngine;
class CompetencyEngine {
    scoreFromLevel(level) {
        return LEVEL_SCORES[level.toLowerCase()] ?? 50;
    }
    aggregate(records) {
        const active = records.filter((r) => r.status === 'verified' || r.status === 'completed');
        if (active.length === 0)
            return 0;
        return Math.round(active.reduce((s, r) => s + r.competencyScore, 0) / active.length);
    }
    levelFromScore(score) {
        if (score >= 95)
            return 'expert';
        if (score >= 80)
            return 'advanced';
        if (score >= 65)
            return 'intermediate';
        return 'basic';
    }
}
exports.CompetencyEngine = CompetencyEngine;
exports.expiryEngine = new ExpiryEngine();
exports.competencyEngine = new CompetencyEngine();
