"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priorityEngine = exports.PriorityEngine = void 0;
const SEVERITY_DUE_DAYS = {
    low: 30,
    medium: 14,
    high: 7,
    critical: 3,
};
const SEVERITY_PRIORITY = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
};
class PriorityEngine {
    compute(input) {
        const severity = input.severity.toLowerCase();
        const explainability = [];
        let priority = SEVERITY_PRIORITY[severity] ?? 'medium';
        explainability.push(`Base priority from severity: ${priority}`);
        if (input.sifLinked) {
            priority = 'critical';
            explainability.push('SIF-linked — priority elevated to critical');
        }
        else if (input.hecaLinked && priority !== 'critical') {
            priority = 'high';
            explainability.push('HECA-linked — priority elevated to high');
        }
        if (input.equipmentUnsafe && priority !== 'critical') {
            priority = 'high';
            explainability.push('Equipment unsafe — priority elevated');
        }
        if (input.actionType === 'immediate') {
            priority = 'critical';
            explainability.push('Immediate action type — priority critical');
        }
        const dueDays = SEVERITY_DUE_DAYS[severity] ?? 14;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);
        return { severity, priority, dueDate, explainability };
    }
}
exports.PriorityEngine = PriorityEngine;
exports.priorityEngine = new PriorityEngine();
