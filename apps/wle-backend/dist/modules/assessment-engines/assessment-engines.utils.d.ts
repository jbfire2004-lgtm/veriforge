import type { CompetencyLevel } from '../training-assessment/training-assessment.types';
export declare function courseCodeFromName(name: string): string;
export declare function mapVerificationStatus(status: string | null | undefined): 'Pending' | 'Verified' | 'Rejected' | undefined;
export declare function inferCompetencyLevel(role: string | null | undefined): CompetencyLevel;
