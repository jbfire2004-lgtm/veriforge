import { InstructorQualificationRule, TrainingInstructor } from '@prisma/client';
export interface InstructorValidationIssue {
    code: string;
    message: string;
}
export declare class InstructorQualificationValidator {
    validate(instructor: TrainingInstructor, courseCode: string, rules: InstructorQualificationRule[], matchedStandardCodes: string[]): {
        valid: boolean;
        issues: InstructorValidationIssue[];
    };
}
