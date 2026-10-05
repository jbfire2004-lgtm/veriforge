"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeficiencyScoringEngine = void 0;
const common_1 = require("@nestjs/common");
const pm_inspections_constants_1 = require("./pm-inspections.constants");
let DeficiencyScoringEngine = class DeficiencyScoringEngine {
    severityForFailedItem(item, templateCategory) {
        if (item.critical)
            return 'critical';
        if (item.energyType)
            return 'critical';
        if (item.required && item.weight && item.weight >= 20)
            return 'high';
        if (templateCategory === 'CRANE' || templateCategory === 'PME')
            return 'high';
        return 'medium';
    }
    dueDateFor(severity) {
        var _a;
        const days = (_a = pm_inspections_constants_1.DEFICIENCY_ESCALATION_DAYS[severity]) !== null && _a !== void 0 ? _a : 14;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    requiresSupervisorReview(severity) {
        return severity === 'high' || severity === 'critical';
    }
};
exports.DeficiencyScoringEngine = DeficiencyScoringEngine;
exports.DeficiencyScoringEngine = DeficiencyScoringEngine = __decorate([
    (0, common_1.Injectable)()
], DeficiencyScoringEngine);
//# sourceMappingURL=deficiency-scoring.engine.js.map