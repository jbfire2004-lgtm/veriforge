import { Injectable } from '@nestjs/common';

const HIERARCHY: Record<string, number> = {
  elimination: 5,
  substitution: 4,
  engineering: 4,
  administrative: 3,
  ppe: 1,
};

export type ControlRow = {
  controlType: string;
  adequate: boolean | null;
  effectivenessScore: number | null;
  verified: boolean;
  ppeRequired: boolean;
};

export type ControlEvaluationOutput = {
  controlStrength: number;
  missingControls: number;
  weakControls: number;
  ineffectiveControls: number;
  findings: string[];
};

@Injectable()
export class ControlEffectivenessEngine {
  evaluate(
    hazardRiskScore: number,
    controls: ControlRow[],
  ): ControlEvaluationOutput {
    const findings: string[] = [];
    let missingControls = 0;
    let weakControls = 0;
    const ineffectiveControls = 0;

    if (hazardRiskScore >= 12 && controls.length === 0) {
      missingControls++;
      findings.push('High-risk hazard has no controls');
    }

    let strengthSum = 0;
    let nonPpeCount = 0;
    for (const c of controls) {
      const base = HIERARCHY[c.controlType] ?? 2;
      const eff = c.effectivenessScore ?? (c.adequate === false ? 1 : 4);
      strengthSum += base * (eff / 5);
      if (c.controlType !== 'ppe') nonPpeCount++;
      if (c.adequate === false || eff < 3) {
        weakControls++;
        findings.push(`Weak ${c.controlType} control`);
      }
      if (!c.verified && hazardRiskScore >= 12) {
        findings.push(`Unverified control: ${c.controlType}`);
      }
    }

    if (hazardRiskScore >= 12 && nonPpeCount === 0 && controls.length > 0) {
      weakControls++;
      findings.push('Only PPE controls for high-risk hazard');
    }

    if (controls.length === 0 && hazardRiskScore < 12) {
      strengthSum = 3;
    }

    const controlStrength = Math.min(
      5,
      controls.length ? strengthSum / controls.length : 0,
    );

    return {
      controlStrength,
      missingControls,
      weakControls,
      ineffectiveControls,
      findings,
    };
  }
}
