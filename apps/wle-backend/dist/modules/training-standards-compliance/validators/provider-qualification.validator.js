"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderQualificationValidator = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ProviderQualificationValidator = class ProviderQualificationValidator {
    validate(provider, rules, matchedStandardCodes) {
        const issues = [];
        const matched = new Set(matchedStandardCodes);
        if (!provider.active) {
            issues.push({
                code: 'PROVIDER_INACTIVE',
                message: 'Provider is inactive',
            });
        }
        if (provider.approvalStatus !== client_1.ProviderApprovalStatus.APPROVED) {
            issues.push({
                code: 'PROVIDER_NOT_APPROVED',
                message: `Approval status is ${provider.approvalStatus}`,
            });
        }
        const activeRules = rules.filter((r) => r.active);
        for (const rule of activeRules) {
            if (rule.requiredApprovalStatus &&
                provider.approvalStatus !== rule.requiredApprovalStatus) {
                issues.push({
                    code: 'PROVIDER_NOT_APPROVED',
                    message: `Rule ${rule.ruleKey}: requires ${rule.requiredApprovalStatus}`,
                });
            }
            for (const code of rule.requiredStandardCodes) {
                if (!matched.has(code)) {
                    issues.push({
                        code: 'CSA_STANDARD_MISSING',
                        message: `Provider rule ${rule.ruleKey}: missing ${code}`,
                    });
                }
            }
        }
        return { valid: issues.length === 0, issues };
    }
};
exports.ProviderQualificationValidator = ProviderQualificationValidator;
exports.ProviderQualificationValidator = ProviderQualificationValidator = __decorate([
    (0, common_1.Injectable)()
], ProviderQualificationValidator);
//# sourceMappingURL=provider-qualification.validator.js.map