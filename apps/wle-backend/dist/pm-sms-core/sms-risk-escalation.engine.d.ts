import { PmDeficiencySeverity, PmEnergyControlState, PmSclState } from '@prisma/client';
export type SmsRiskTagInput = {
    sclState?: PmSclState | null;
    hecaInvolved?: boolean;
    hecaType?: string | null;
    energyTypes?: string[];
    energyControlState?: PmEnergyControlState | null;
    highEnergyFlag?: boolean;
};
export type EscalationResult = {
    severity: PmDeficiencySeverity;
    escalated: boolean;
    escalationScore: number;
    requiresInvestigation: boolean;
    dueDateMultiplier: number;
    factors: string[];
};
export declare class SmsRiskEscalationEngine {
    evaluate(baseSeverity: PmDeficiencySeverity, tags: SmsRiskTagInput): EscalationResult;
    private bumpSeverity;
}
