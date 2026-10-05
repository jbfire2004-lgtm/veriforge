"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionScoringEngine = void 0;
const common_1 = require("@nestjs/common");
const inspection_template_engine_1 = require("./inspection-template.engine");
let InspectionScoringEngine = class InspectionScoringEngine {
    constructor(templateEngine) {
        this.templateEngine = templateEngine;
    }
    score(scoringMode, items, answers, scoringRules = {}) {
        var _a;
        const visible = this.templateEngine.visibleItems(items, answers);
        const failedItemIds = [];
        const explainability = [];
        let earned = 0;
        let possible = 0;
        for (const item of visible) {
            if (item.type !== 'pass_fail' && item.type !== 'numeric')
                continue;
            const answer = answers[item.id];
            const failed = this.isFailed(item, answer);
            if (failed) {
                failedItemIds.push(item.id);
                explainability.push({
                    rule: 'failed_item',
                    detail: `${item.label} did not pass`,
                });
            }
            const weight = (_a = item.weight) !== null && _a !== void 0 ? _a : 1;
            possible += weight;
            if (!failed)
                earned += weight;
        }
        const failThreshold = typeof scoringRules.failThresholdPercent === 'number'
            ? scoringRules.failThresholdPercent
            : 100;
        const reviewThreshold = typeof scoringRules.reviewThresholdRisk === 'number'
            ? scoringRules.reviewThresholdRisk
            : 50;
        let scorePercent = possible > 0 ? Math.round((earned / possible) * 100) : 100;
        if (scoringMode === 'pass_fail') {
            scorePercent = failedItemIds.length === 0 ? 100 : 0;
        }
        const passed = scorePercent >= failThreshold && failedItemIds.length === 0;
        const riskScore = Math.min(100, failedItemIds.length * 15 + (100 - scorePercent));
        const requiresSupervisorReview = !passed ||
            riskScore >= reviewThreshold ||
            failedItemIds.some((id) => {
                const it = items.find((i) => i.id === id);
                return !!(it === null || it === void 0 ? void 0 : it.energyType);
            });
        if (requiresSupervisorReview) {
            explainability.push({
                rule: 'supervisor_review',
                detail: 'Failed items, high risk, or high-energy finding',
            });
        }
        return {
            scorePercent,
            passed,
            riskScore,
            requiresSupervisorReview,
            failedItemIds,
            explainability,
        };
    }
    isFailed(item, answer) {
        if (item.type === 'pass_fail') {
            if (answer === false || answer === 'fail' || answer === 'no')
                return true;
            if (Array.isArray(item.failValues) && item.failValues.includes(answer)) {
                return true;
            }
            return answer !== true && answer !== 'pass' && answer !== 'yes';
        }
        if (item.type === 'numeric' && typeof answer === 'number') {
            const min = item.min;
            if (min != null && answer < min)
                return true;
        }
        return false;
    }
};
exports.InspectionScoringEngine = InspectionScoringEngine;
exports.InspectionScoringEngine = InspectionScoringEngine = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inspection_template_engine_1.InspectionTemplateEngine])
], InspectionScoringEngine);
//# sourceMappingURL=inspection-scoring.engine.js.map