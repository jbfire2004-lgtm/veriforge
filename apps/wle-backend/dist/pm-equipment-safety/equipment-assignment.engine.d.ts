export type AssignmentRuleInput = {
    workerId: number;
    equipmentId: number;
    hasAuthorization: boolean;
    authorizationExpired: boolean;
    certificationValid: boolean;
    inspectionCurrent: boolean;
    conditionScore: number;
    minConditionScore?: number;
    underLoto: boolean;
};
export type AssignmentRuleResult = {
    allowed: boolean;
    failures: string[];
};
export declare class EquipmentAssignmentEngine {
    validate(input: AssignmentRuleInput): AssignmentRuleResult;
}
