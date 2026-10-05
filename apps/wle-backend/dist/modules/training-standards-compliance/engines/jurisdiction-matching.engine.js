"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JurisdictionMatchingEngine = void 0;
const common_1 = require("@nestjs/common");
let JurisdictionMatchingEngine = class JurisdictionMatchingEngine {
    match(jurisdictionCode, requirements, satisfiedStandardCodes) {
        const satisfied = new Set(satisfiedStandardCodes);
        const applicable = requirements.filter((r) => r.jurisdictionCode === jurisdictionCode ||
            r.jurisdictionCode === 'CA-FED');
        const required = applicable.filter((r) => r.required);
        const matched = required
            .map((r) => r.standardCode)
            .filter((c) => satisfied.has(c));
        const missing = required
            .map((r) => r.standardCode)
            .filter((c) => !satisfied.has(c));
        const score = required.length === 0
            ? 100
            : Math.round((matched.length / required.length) * 100);
        return {
            jurisdictionCode,
            matched,
            missing,
            score,
        };
    }
    normalizeJurisdiction(region) {
        if (!(region === null || region === void 0 ? void 0 : region.trim()))
            return 'ON';
        const r = region.trim().toUpperCase();
        if ([
            'ON',
            'BC',
            'AB',
            'SK',
            'MB',
            'QC',
            'NB',
            'NS',
            'PE',
            'NL',
            'YT',
            'NT',
            'NU',
        ].includes(r)) {
            return r;
        }
        if (r.includes('ONTARIO'))
            return 'ON';
        if (r.includes('BRITISH') || r.includes('BC'))
            return 'BC';
        if (r.includes('ALBERTA'))
            return 'AB';
        if (r.includes('FEDERAL') || r.includes('CANADA'))
            return 'CA-FED';
        return 'ON';
    }
};
exports.JurisdictionMatchingEngine = JurisdictionMatchingEngine;
exports.JurisdictionMatchingEngine = JurisdictionMatchingEngine = __decorate([
    (0, common_1.Injectable)()
], JurisdictionMatchingEngine);
//# sourceMappingURL=jurisdiction-matching.engine.js.map