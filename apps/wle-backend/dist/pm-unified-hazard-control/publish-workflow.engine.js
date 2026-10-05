"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishWorkflowEngine = void 0;
class PublishWorkflowEngine {
    evaluateHazard(input) {
        const violations = [];
        if (input.status !== 'draft')
            violations.push('Only draft hazards can be published');
        if (!input.mappingComplete)
            violations.push('Hazard-control mapping incomplete');
        if (input.sifPotential && input.linkedControlCount < 2) {
            violations.push('SIF-potential hazards require at least two mapped controls');
        }
        if (input.supervisorReviewRequired && input.linkedControlCount === 0) {
            violations.push('Supervisor review required but no controls mapped');
        }
        return {
            canPublish: violations.length === 0,
            violations,
            nextStatus: 'published',
        };
    }
    evaluateControl(input) {
        const violations = [];
        if (input.status !== 'draft')
            violations.push('Only draft controls can be published');
        if (input.verificationStepCount === 0) {
            violations.push('At least one verification step required');
        }
        return {
            canPublish: violations.length === 0,
            violations,
            nextStatus: 'published',
        };
    }
}
exports.PublishWorkflowEngine = PublishWorkflowEngine;
//# sourceMappingURL=publish-workflow.engine.js.map