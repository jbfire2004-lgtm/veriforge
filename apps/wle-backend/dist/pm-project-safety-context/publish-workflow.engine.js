"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishWorkflowEngine = void 0;
class PublishWorkflowEngine {
    profilePublish(current, hasRequiredFields) {
        const errors = [];
        if (!hasRequiredFields)
            errors.push('Profile missing required configuration');
        if (current === 'archived') {
            return {
                allowed: false,
                nextStatus: current,
                errors: ['Cannot publish archived profile'],
            };
        }
        return {
            allowed: errors.length === 0,
            nextStatus: 'published',
            errors,
        };
    }
    hazardPublish(current, title, description) {
        const errors = [];
        if (!(title === null || title === void 0 ? void 0 : title.trim()))
            errors.push('Hazard title required');
        if (!(description === null || description === void 0 ? void 0 : description.trim()))
            errors.push('Hazard description required');
        return {
            allowed: errors.length === 0 && current !== 'archived',
            nextStatus: 'published',
            errors,
        };
    }
    controlPublish(current, title, description) {
        const errors = [];
        if (!(title === null || title === void 0 ? void 0 : title.trim()))
            errors.push('Control title required');
        if (!(description === null || description === void 0 ? void 0 : description.trim()))
            errors.push('Control description required');
        return {
            allowed: errors.length === 0 && current !== 'archived',
            nextStatus: 'published',
            errors,
        };
    }
    archive(current) {
        if (current === 'draft') {
            return {
                allowed: false,
                nextStatus: current,
                errors: ['Cannot archive draft'],
            };
        }
        return { allowed: true, nextStatus: 'archived', errors: [] };
    }
    mapWorkflowState(status, profilePublished, enforcementActive) {
        if (status === 'draft')
            return 'draft';
        if (status === 'published' && enforcementActive)
            return 'enforced';
        if (status === 'published' && profilePublished)
            return 'published';
        if (status === 'archived')
            return 'updated';
        return 'published';
    }
    validatePublishReadiness(input) {
        const errors = [];
        if (input.publishedHazardCount > 0 && input.hazardsWithoutControls > 0) {
            errors.push(`${input.hazardsWithoutControls} published hazard(s) missing linked controls`);
        }
        if (input.zoneRuleCount === 0) {
            errors.push('At least one zone rule required');
        }
        if (input.equipmentRuleKeys === 0) {
            errors.push('Equipment rules must be defined on profile');
        }
        if (input.trainingRuleKeys === 0) {
            errors.push('Training requirements must be defined');
        }
        if (input.emergencyRuleKeys === 0) {
            errors.push('Emergency requirements must be defined');
        }
        return { valid: errors.length === 0, errors };
    }
}
exports.PublishWorkflowEngine = PublishWorkflowEngine;
//# sourceMappingURL=publish-workflow.engine.js.map