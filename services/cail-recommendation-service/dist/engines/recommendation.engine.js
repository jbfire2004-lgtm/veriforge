"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationEngine = exports.RecommendationEngine = void 0;
class RecommendationEngine {
    generate(types, context) {
        const drafts = [];
        for (const violation of context.violations ?? []) {
            drafts.push(...this.fromViolation(violation));
        }
        for (const pattern of context.patterns ?? []) {
            drafts.push(this.fromPattern(pattern));
        }
        if (types.includes('control'))
            drafts.push(...this.recommendControls(context));
        if (types.includes('training'))
            drafts.push(...this.recommendTraining(context));
        if (types.includes('corrective_action'))
            drafts.push(...this.recommendCorrectiveActions(context));
        if (types.includes('equipment_maintenance'))
            drafts.push(...this.recommendEquipmentMaintenance(context));
        if (types.includes('jha_improvement'))
            drafts.push(...this.recommendJhaImprovements(context));
        if (types.includes('inspection_focus'))
            drafts.push(...this.recommendInspectionFocus(context));
        if (types.includes('pm_schedule_adjustment'))
            drafts.push(...this.recommendScheduleAdjustments(context));
        const deduped = new Map();
        for (const d of drafts) {
            const key = `${d.recommendationType}:${d.title}`;
            if (!deduped.has(key))
                deduped.set(key, d);
        }
        return [...deduped.values()];
    }
    fromViolation(v) {
        const map = {
            CAPA_OVERDUE: { type: 'corrective_action', actions: ['Assign owner', 'Run escalation sweep', 'Verify closure'] },
            HAZARD_CRITICAL_OPEN: { type: 'control', actions: ['Add engineering/admin controls', 'Supervisor review'] },
            CONTROL_WEAK: { type: 'control', actions: ['Strengthen control effectiveness', 'Map to hazard'] },
            TRAINING_LAPSE: { type: 'training', actions: ['Schedule refresher', 'Block access until complete'] },
            ACCESS_CHRONIC_DENIAL: { type: 'training', actions: ['Coaching', 'Review zone requirements'] },
            INCIDENT_OPEN: { type: 'corrective_action', actions: ['Complete investigation', 'Root cause CAPA'] },
            EQUIPMENT_FAILURE_OPEN: { type: 'equipment_maintenance', actions: ['Lockout equipment', 'Owner verification'] },
            EMERGENCY_ACTIVE: { type: 'corrective_action', actions: ['Follow ERP', 'Muster accountability'] },
        };
        const entry = map[v.ruleId] ?? { type: 'corrective_action', actions: ['Review with safety team'] };
        const confidence = v.severity === 'critical' ? 0.95 : v.severity === 'high' ? 0.88 : 0.75;
        return [{
                recommendationType: entry.type,
                title: v.message,
                reason: `Rule ${v.ruleId} triggered (${v.severity})`,
                evidence: [v.module ?? 'rules', v.ruleId],
                requiredActions: entry.actions,
                confidence,
            }];
    }
    fromPattern(p) {
        const typeMap = {
            chronic_hazard: 'control',
            repeat_deficiency: 'inspection_focus',
            weak_control: 'control',
            project_drift: 'pm_schedule_adjustment',
        };
        const actionsMap = {
            chronic_hazard: ['Engineering review', 'Update JHA', 'Increase inspection frequency'],
            repeat_deficiency: ['Targeted inspection', 'Supervisor walkthrough'],
            weak_control: ['Upgrade control tier', 'Verify effectiveness'],
            project_drift: ['Safety stand-down', 'Re-baseline project score', 'Adjust high-risk schedule slots'],
        };
        return {
            recommendationType: typeMap[p.category] ?? 'corrective_action',
            title: p.title,
            reason: p.description,
            evidence: p.evidence ?? [p.category],
            requiredActions: actionsMap[p.category] ?? ['Document and assign CAPA'],
            confidence: p.severity === 'critical' ? 0.92 : p.severity === 'high' ? 0.85 : 0.72,
        };
    }
    recommendControls(ctx) {
        const out = [];
        if ((ctx.criticalHazards ?? 0) > 0) {
            out.push({
                recommendationType: 'control',
                title: 'Strengthen controls for critical hazards',
                reason: `${ctx.criticalHazards} critical hazard(s) require additional control layers`,
                evidence: ['critical_hazards'],
                requiredActions: ['Add engineering/admin controls', 'Supervisor sign-off', 'Verify effectiveness'],
                confidence: 0.9,
            });
        }
        if ((ctx.weakControls ?? 0) > 0) {
            out.push({
                recommendationType: 'control',
                title: 'Upgrade weak hazard controls',
                reason: `${ctx.weakControls} control(s) below effectiveness threshold`,
                evidence: ['weak_controls'],
                requiredActions: ['Map controls to hazards', 'Increase control tier', 'Re-inspect'],
                confidence: 0.85,
            });
        }
        return out;
    }
    recommendTraining(ctx) {
        const out = [];
        if ((ctx.trainingExpired ?? 0) > 0) {
            out.push({
                recommendationType: 'training',
                title: 'Renew expired training certifications',
                reason: `${ctx.trainingExpired} worker training record(s) expired`,
                evidence: ['training_expired'],
                requiredActions: ['Schedule refresher', 'Block site access until complete'],
                confidence: 0.93,
            });
        }
        if ((ctx.trainingExpiring ?? 0) > 0) {
            out.push({
                recommendationType: 'training',
                title: 'Schedule upcoming training renewals',
                reason: `${ctx.trainingExpiring} certification(s) expiring within 7 days`,
                evidence: ['training_expiring'],
                requiredActions: ['Notify worker', 'Book training session'],
                confidence: 0.8,
            });
        }
        if ((ctx.accessDenials30d ?? 0) >= 3) {
            out.push({
                recommendationType: 'training',
                title: 'Coaching for chronic access denials',
                reason: `${ctx.accessDenials30d} access denials in the last 30 days`,
                evidence: ['access_denials'],
                requiredActions: ['Review zone requirements', 'Supervisor coaching', 'Update training plan'],
                confidence: 0.82,
            });
        }
        return out;
    }
    recommendCorrectiveActions(ctx) {
        const out = [];
        if ((ctx.overdueCapa ?? 0) > 0) {
            out.push({
                recommendationType: 'corrective_action',
                title: 'Close overdue corrective actions',
                reason: `${ctx.overdueCapa} CAPA item(s) past due date`,
                evidence: ['overdue_capa'],
                requiredActions: ['Assign accountable owner', 'Escalate to supervisor', 'Verify effectiveness'],
                confidence: 0.94,
            });
        }
        if ((ctx.openCapa ?? 0) > 3) {
            out.push({
                recommendationType: 'corrective_action',
                title: 'Reduce open CAPA backlog',
                reason: `${ctx.openCapa} open corrective actions affecting project safety`,
                evidence: ['open_capa'],
                requiredActions: ['Prioritize by severity', 'Weekly CAPA review', 'Root cause verification'],
                confidence: 0.86,
            });
        }
        if (ctx.emergencyActive) {
            out.push({
                recommendationType: 'corrective_action',
                title: 'Execute emergency response corrective path',
                reason: 'Active emergency condition requires immediate CAPA triage',
                evidence: ['emergency_active'],
                requiredActions: ['Follow ERP', 'Document actions', 'Post-incident review'],
                confidence: 0.97,
            });
        }
        return out;
    }
    recommendEquipmentMaintenance(ctx) {
        const out = [];
        if (ctx.lockoutActive || (ctx.equipmentFailures ?? 0) > 0) {
            out.push({
                recommendationType: 'equipment_maintenance',
                title: 'Complete equipment maintenance before return to service',
                reason: ctx.lockoutActive
                    ? 'Equipment is locked out pending verification'
                    : `${ctx.equipmentFailures} failure(s) recorded in the last 90 days`,
                evidence: ctx.lockoutActive ? ['lockout_active'] : ['equipment_failures'],
                requiredActions: ['Complete repair', 'Inspection sign-off', 'Clear lockout'],
                confidence: 0.91,
            });
        }
        return out;
    }
    recommendJhaImprovements(ctx) {
        const out = [];
        if ((ctx.jhaSignatureGap ?? 0) > 0 || (ctx.hazardCoverageGap ?? 0) > 0) {
            out.push({
                recommendationType: 'jha_improvement',
                title: 'Improve JHA completeness and hazard coverage',
                reason: [
                    ctx.jhaSignatureGap ? `Missing ${ctx.jhaSignatureGap} signature(s)` : null,
                    ctx.hazardCoverageGap ? `${ctx.hazardCoverageGap}% hazard coverage gap` : null,
                ]
                    .filter(Boolean)
                    .join('; '),
                evidence: ['jha_quality'],
                requiredActions: ['Collect missing signatures', 'Add task hazards', 'Supervisor review'],
                confidence: 0.84,
            });
        }
        if ((ctx.criticalHazards ?? 0) > 0) {
            out.push({
                recommendationType: 'jha_improvement',
                title: 'Align JHA with critical hazard library',
                reason: 'Critical hazards published but not reflected in active JHA',
                evidence: ['critical_hazards', 'jha_gap'],
                requiredActions: ['Update JHA steps', 'Add required PPE/controls', 'Re-approve JHA'],
                confidence: 0.87,
            });
        }
        return out;
    }
    recommendInspectionFocus(ctx) {
        const out = [];
        if ((ctx.repeatDeficiencies ?? 0) > 0) {
            out.push({
                recommendationType: 'inspection_focus',
                title: 'Target repeat inspection deficiencies',
                reason: `${ctx.repeatDeficiencies} repeat finding(s) in the last 90 days`,
                evidence: ['repeat_deficiencies'],
                requiredActions: ['Focused inspection', 'Supervisor walkthrough', 'CAPA for root cause'],
                confidence: 0.88,
            });
        }
        if ((ctx.weakControls ?? 0) > 0) {
            out.push({
                recommendationType: 'inspection_focus',
                title: 'Inspect weak control implementation',
                reason: 'Controls flagged below effectiveness during last audit',
                evidence: ['weak_controls'],
                requiredActions: ['Field verify controls', 'Photo evidence', 'Update inspection checklist'],
                confidence: 0.81,
            });
        }
        return out;
    }
    recommendScheduleAdjustments(ctx) {
        const out = [];
        if ((ctx.scheduleConflicts ?? 0) > 0 || (ctx.safetyBlockedSlots ?? 0) > 0) {
            out.push({
                recommendationType: 'pm_schedule_adjustment',
                title: 'Adjust project schedule for safety conflicts',
                reason: [
                    ctx.scheduleConflicts ? `${ctx.scheduleConflicts} scheduling conflict(s)` : null,
                    ctx.safetyBlockedSlots ? `${ctx.safetyBlockedSlots} safety-blocked slot(s)` : null,
                ]
                    .filter(Boolean)
                    .join('; '),
                evidence: ['schedule_conflicts', 'safety_blocked'],
                requiredActions: ['Re-sequence tasks', 'Resolve worker/equipment double-booking', 'Re-run safety gate'],
                confidence: 0.89,
            });
        }
        if (ctx.projectScore !== undefined && ctx.projectScore < 60) {
            out.push({
                recommendationType: 'pm_schedule_adjustment',
                title: 'Re-baseline schedule after low safety score',
                reason: `Project safety score ${ctx.projectScore} below threshold`,
                evidence: ['low_project_score'],
                requiredActions: ['Safety stand-down', 'Defer non-critical work', 'Add buffer for CAPA closure'],
                confidence: 0.83,
            });
        }
        return out;
    }
}
exports.RecommendationEngine = RecommendationEngine;
exports.recommendationEngine = new RecommendationEngine();
