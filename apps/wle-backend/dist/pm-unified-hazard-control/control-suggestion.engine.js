"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlSuggestionEngine = void 0;
class ControlSuggestionEngine {
    suggest(input) {
        const suggestions = [];
        if (input.sifPotential) {
            suggestions.push({
                title: 'Supervisor pre-task review',
                description: 'Mandatory supervisor sign-off before work starts on SIF-potential hazard.',
                controlType: 'administrative',
                controlStrength: 4,
                hierarchyLevel: 2,
                trainingCodes: ['SUPERVISOR_SIF_REVIEW'],
                ppeTypes: [],
                permitTypes: [],
                reason: 'SIF potential detected',
            });
        }
        for (const energy of input.energyTypes) {
            if (energy === 'electrical') {
                suggestions.push({
                    title: 'Electrical LOTO',
                    description: 'De-energize, lock and tag all sources; verify zero energy.',
                    controlType: 'engineering',
                    controlStrength: 5,
                    hierarchyLevel: 1,
                    trainingCodes: ['LOTO_QUALIFIED'],
                    ppeTypes: ['arc_rated_ppe'],
                    permitTypes: ['loto'],
                    reason: `Energy: ${energy}`,
                });
            }
            if (energy === 'chemical') {
                suggestions.push({
                    title: 'SDS and chemical handling',
                    description: 'Review SDS; use compatible PPE and ventilation.',
                    controlType: 'administrative',
                    controlStrength: 4,
                    hierarchyLevel: 2,
                    trainingCodes: ['HAZCOM', 'SDS_ACK'],
                    ppeTypes: ['chemical_gloves', 'respirator'],
                    permitTypes: ['chemical_handling'],
                    reason: `Energy: ${energy}`,
                });
            }
            if (energy === 'gravity' || energy === 'motion') {
                suggestions.push({
                    title: 'Fall / struck-by protection',
                    description: 'Barricade, spotter, and fall protection as required.',
                    controlType: 'engineering',
                    controlStrength: 4,
                    hierarchyLevel: 2,
                    trainingCodes: ['FALL_PROTECTION'],
                    ppeTypes: ['hard_hat', 'high_vis_vest'],
                    permitTypes: [],
                    reason: `Energy: ${energy}`,
                });
            }
        }
        if (input.category === 'equipment' || input.equipmentType) {
            suggestions.push({
                title: 'Pre-use equipment inspection',
                description: 'Complete equipment inspection checklist before operation.',
                controlType: 'procedural',
                controlStrength: 3,
                hierarchyLevel: 3,
                trainingCodes: ['EQUIPMENT_PREUSE'],
                ppeTypes: [],
                permitTypes: [],
                reason: 'Equipment-related hazard',
            });
        }
        if (input.missingControlCount > 0) {
            suggestions.push({
                title: 'Supplemental administrative control',
                description: 'Add signage, briefing, or restricted access until engineering controls verified.',
                controlType: 'administrative',
                controlStrength: 2,
                hierarchyLevel: 4,
                trainingCodes: ['TOOLBOX_BRIEFING'],
                ppeTypes: [],
                permitTypes: [],
                reason: 'Missing mapped controls',
            });
        }
        return suggestions;
    }
    detectWeakControls(links) {
        var _a;
        const issues = [];
        for (const l of links) {
            if (((_a = l.effectivenessScore) !== null && _a !== void 0 ? _a : 3) < 2)
                issues.push('Control effectiveness below threshold');
            if (!l.verified)
                issues.push('Control not verified in field');
        }
        return issues;
    }
}
exports.ControlSuggestionEngine = ControlSuggestionEngine;
//# sourceMappingURL=control-suggestion.engine.js.map