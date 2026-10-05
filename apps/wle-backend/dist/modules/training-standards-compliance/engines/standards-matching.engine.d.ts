import { TrainingStandard } from '@prisma/client';
export interface StandardsMatchInput {
    courseStandardKeys: string[];
    contentText?: string | null;
    certificationName?: string | null;
    catalogStandards: TrainingStandard[];
}
export interface StandardsMatchResult {
    matched: string[];
    missing: string[];
    score: number;
    byKind: Record<string, string[]>;
}
export declare class StandardsMatchingEngine {
    match(input: StandardsMatchInput): StandardsMatchResult;
}
