"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionConfidencePolicyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const expiry_rule_engine_1 = require("../modules/training-standards-compliance/engines/expiry-rule.engine");
let IngestionConfidencePolicyService = class IngestionConfidencePolicyService {
    constructor() {
        this.expiry = new expiry_rule_engine_1.ExpiryRuleEngine();
    }
    resolveValidationOutcome(input) {
        var _a, _b;
        const confidence = 'confidence' in input && input.confidence
            ? input.confidence
            : input;
        const issuedAt = 'confidence' in input ? ((_a = input.issuedAt) !== null && _a !== void 0 ? _a : null) : null;
        const expiresAt = 'confidence' in input ? ((_b = input.expiresAt) !== null && _b !== void 0 ? _b : null) : null;
        if (confidence.blocked) {
            return client_1.TrainingValidationOutcome.NEEDS_REVIEW;
        }
        if (confidence.needsReview) {
            return client_1.TrainingValidationOutcome.NEEDS_REVIEW;
        }
        if (issuedAt && expiresAt && !Number.isNaN(issuedAt.getTime()) && !Number.isNaN(expiresAt.getTime())) {
            const expiry = this.expiry.check({ issuedAt, expiresAt });
            if (expiry.valid && !expiry.expired) {
                return client_1.TrainingValidationOutcome.APPROVED;
            }
            return client_1.TrainingValidationOutcome.NEEDS_REVIEW;
        }
        return client_1.TrainingValidationOutcome.PENDING;
    }
};
exports.IngestionConfidencePolicyService = IngestionConfidencePolicyService;
exports.IngestionConfidencePolicyService = IngestionConfidencePolicyService = __decorate([
    (0, common_1.Injectable)()
], IngestionConfidencePolicyService);
//# sourceMappingURL=ingestion-confidence-policy.service.js.map