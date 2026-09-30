"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyGateEngine = exports.SafetyGateEngine = void 0;
exports.parseChecklistItems = parseChecklistItems;
class SafetyGateEngine {
    evaluate(inspectionId, checklistItems, context) {
        const checks = [];
        if (context.equipmentSafe === false) {
            checks.push({
                passed: false,
                reason: 'Equipment safety check failed',
                gate: 'equipment_safety',
            });
        }
        else if (context.equipmentSafe === true) {
            checks.push({
                passed: true,
                reason: 'Equipment safety verified',
                gate: 'equipment_safety',
            });
        }
        if (context.hazardControlsActive === false) {
            checks.push({
                passed: false,
                reason: 'Required hazard controls are not active',
                gate: 'hazard_controls',
            });
        }
        else if (context.hazardControlsActive === true) {
            checks.push({
                passed: true,
                reason: 'Hazard controls active',
                gate: 'hazard_controls',
            });
        }
        const requiredItems = checklistItems.filter((item) => item.required !== false);
        if (context.checklistComplete === false && requiredItems.length > 0) {
            checks.push({
                passed: false,
                reason: 'Required checklist items incomplete',
                gate: 'checklist_complete',
            });
        }
        else if (context.checklistComplete === true || requiredItems.length === 0) {
            checks.push({
                passed: true,
                reason: 'Checklist requirements met',
                gate: 'checklist_complete',
            });
        }
        const criticalOpen = context.openCriticalFindings ?? 0;
        checks.push({
            passed: criticalOpen === 0,
            reason: criticalOpen === 0
                ? 'No open critical findings'
                : `${criticalOpen} open critical finding(s)`,
            gate: 'critical_findings',
        });
        const failed = checks.filter((c) => !c.passed);
        return {
            passed: failed.length === 0,
            reason: failed.length === 0
                ? 'All inspection safety gates passed'
                : failed.map((f) => f.reason).join('; '),
            gates: failed.map((f) => f.gate),
            checks,
        };
    }
}
exports.SafetyGateEngine = SafetyGateEngine;
exports.safetyGateEngine = new SafetyGateEngine();
function parseChecklistItems(value) {
    if (!Array.isArray(value))
        return [];
    return value.map((item) => {
        const row = item;
        return {
            key: String(row.key ?? row.itemKey ?? ''),
            label: String(row.label ?? row.key ?? ''),
            weight: row.weight != null ? Number(row.weight) : 1,
            required: row.required !== false,
            critical: row.critical === true,
        };
    });
}
