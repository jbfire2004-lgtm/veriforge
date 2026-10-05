import { ProviderQualificationRule, TrainingProvider } from '@prisma/client';
export interface ProviderValidationIssue {
    code: string;
    message: string;
}
export declare class ProviderQualificationValidator {
    validate(provider: TrainingProvider, rules: ProviderQualificationRule[], matchedStandardCodes: string[]): {
        valid: boolean;
        issues: ProviderValidationIssue[];
    };
}
