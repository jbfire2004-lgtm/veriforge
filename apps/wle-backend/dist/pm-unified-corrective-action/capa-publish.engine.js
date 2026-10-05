"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaPublishEngine = void 0;
class CapaPublishEngine {
    evaluate(input) {
        var _a;
        const violations = [];
        if (input.status !== 'draft') {
            violations.push('Only draft corrective actions can be published');
        }
        if (!((_a = input.title) === null || _a === void 0 ? void 0 : _a.trim())) {
            violations.push('Title required');
        }
        const req = input.verificationRequirements;
        if (!req || Object.keys(req).length === 0) {
            violations.push('Verification requirements must be defined');
        }
        return {
            canPublish: violations.length === 0,
            violations,
            nextStatus: input.hasPrimaryAssignee ? 'assigned' : 'open',
        };
    }
}
exports.CapaPublishEngine = CapaPublishEngine;
//# sourceMappingURL=capa-publish.engine.js.map