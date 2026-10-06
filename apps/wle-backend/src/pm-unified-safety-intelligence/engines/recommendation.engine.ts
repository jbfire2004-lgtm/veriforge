import type { RuleViolation } from './rule-based.engine';
import type { DetectedPattern } from './pattern-recognition.engine';

export type RecommendationOutput = {
  recommendationType: string;
  title: string;
  reason: string;
  evidence: string[];
  confidence: number;
  requiredActions: string[];
};

export class CailRecommendationEngine {
  fromViolations(violations: RuleViolation[]): RecommendationOutput[] {
    return violations.map((v) => {
      const actions = this.actionsForRule(v.ruleId);
      return {
        recommendationType: actions.type,
        title: v.message,
        reason: `Rule ${v.ruleId} triggered (${v.severity})`,
        evidence: [v.module, v.ruleId],
        confidence:
          v.severity === 'critical'
            ? 0.95
            : v.severity === 'high'
            ? 0.88
            : 0.75,
        requiredActions: actions.actions,
      };
    });
  }

  fromPatterns(patterns: DetectedPattern[]): RecommendationOutput[] {
    return patterns.map((p) => ({
      recommendationType: this.typeForPattern(p.category),
      title: p.title,
      reason: p.description,
      evidence: p.evidence,
      confidence:
        p.severity === 'critical' ? 0.92 : p.severity === 'high' ? 0.85 : 0.72,
      requiredActions: this.actionsForPattern(p.category),
    }));
  }

  private actionsForRule(ruleId: string): { type: string; actions: string[] } {
    const map: Record<string, { type: string; actions: string[] }> = {
      CAPA_OVERDUE: {
        type: 'corrective_action',
        actions: ['Assign owner', 'Run escalation sweep', 'Verify closure'],
      },
      HAZARD_CRITICAL_OPEN: {
        type: 'control',
        actions: ['Add engineering/admin controls', 'Supervisor review'],
      },
      CONTROL_WEAK: {
        type: 'control',
        actions: ['Strengthen control effectiveness', 'Map to hazard'],
      },
      TRAINING_LAPSE: {
        type: 'training',
        actions: ['Schedule refresher', 'Block access until complete'],
      },
      ACCESS_CHRONIC_DENIAL: {
        type: 'training',
        actions: ['Coaching', 'Review zone requirements'],
      },
      INCIDENT_OPEN: {
        type: 'corrective_action',
        actions: ['Complete investigation', 'Root cause CAPA'],
      },
      EQUIPMENT_FAILURE_OPEN: {
        type: 'equipment_maintenance',
        actions: ['Lockout equipment', 'Owner verification'],
      },
      EMERGENCY_ACTIVE: {
        type: 'emergency_plan',
        actions: ['Follow ERP', 'Muster accountability'],
      },
    };
    return (
      map[ruleId] ?? {
        type: 'corrective_action',
        actions: ['Review with safety team'],
      }
    );
  }

  private typeForPattern(category: string): string {
    const map: Record<string, string> = {
      chronic_hazard: 'control',
      repeat_deficiency: 'inspection_focus',
      weak_control: 'control',
      project_drift: 'pm_schedule_adjustment',
    };
    return map[category] ?? 'corrective_action';
  }

  private actionsForPattern(category: string): string[] {
    const map: Record<string, string[]> = {
      chronic_hazard: [
        'Engineering review',
        'Update JHA',
        'Increase inspection frequency',
      ],
      repeat_deficiency: ['Targeted inspection', 'Supervisor walkthrough'],
      weak_control: ['Upgrade control tier', 'Verify effectiveness'],
      project_drift: ['Safety stand-down', 'Re-baseline project score'],
    };
    return map[category] ?? ['Document and assign CAPA'];
  }
}
