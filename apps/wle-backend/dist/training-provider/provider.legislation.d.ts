export interface ProgramAssessmentResult {
    score: number;
    passed: boolean;
    missing: string[];
    matched: string[];
}
export declare class TrainingLegislationEngine {
    private requiredKeywords;
    assessProgram(content: string): ProgramAssessmentResult;
}
