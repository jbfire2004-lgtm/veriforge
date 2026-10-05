"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiryRuleEngine = void 0;
const common_1 = require("@nestjs/common");
let ExpiryRuleEngine = class ExpiryRuleEngine {
    check(input, now = new Date()) {
        const expired = input.expiresAt ? input.expiresAt < now : false;
        let exceedsMaxValidity = false;
        if (input.expiresAt && input.maxValidityDays) {
            const maxEnd = new Date(input.issuedAt);
            maxEnd.setDate(maxEnd.getDate() + input.maxValidityDays);
            exceedsMaxValidity = input.expiresAt > maxEnd;
        }
        if (input.expiresAt &&
            input.standardDefaultDays &&
            !input.maxValidityDays) {
            const maxEnd = new Date(input.issuedAt);
            maxEnd.setDate(maxEnd.getDate() + input.standardDefaultDays);
            exceedsMaxValidity = input.expiresAt > maxEnd;
        }
        const daysUntilExpiry = input.expiresAt
            ? Math.ceil((input.expiresAt.getTime() - now.getTime()) / 86400000)
            : null;
        const valid = !expired && !exceedsMaxValidity;
        let message;
        if (expired)
            message = 'CERTIFICATE_EXPIRED';
        else if (exceedsMaxValidity)
            message = 'EXPIRY_EXCEEDED';
        return {
            valid,
            expired,
            exceedsMaxValidity,
            daysUntilExpiry,
            message,
        };
    }
};
exports.ExpiryRuleEngine = ExpiryRuleEngine;
exports.ExpiryRuleEngine = ExpiryRuleEngine = __decorate([
    (0, common_1.Injectable)()
], ExpiryRuleEngine);
//# sourceMappingURL=expiry-rule.engine.js.map