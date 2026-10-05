export type CompetencyLevel = 'Awareness' | 'Operator' | 'Supervisor' | 'Instructor';
export type TaeRequirementType = 'HiringClient' | 'Project' | 'Legislative';
export type TaeRequirementInput = {
    id: string;
    name: string;
    code: string;
    minLevel: CompetencyLevel;
    validityDays?: number;
    approvedProviders?: string[];
    evidenceTypes?: string[];
    jurisdiction?: string;
};
export type TaeEvidenceFile = {
    fileId: string;
    fileName?: string;
    mimeType?: string;
};
export type TaeTrainingRecord = {
    id: string;
    workerId: string;
    courseCode: string;
    courseName?: string;
    provider?: string | null;
    level?: CompetencyLevel | null;
    completedAt?: string | null;
    expiresAt?: string | null;
    evidenceFiles?: TaeEvidenceFile[];
    verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
};
export type TaeAssessmentInput = {
    context: {
        jurisdiction?: string;
        legislationRefs?: string[];
        dateNow: string;
    };
    hiringClientRequirements: TaeRequirementInput[];
    projectRequirements: TaeRequirementInput[];
    legislativeRequirements: TaeRequirementInput[];
    worker: {
        id: string;
        name?: string;
        role?: string;
        companyId?: string;
    };
    trainingRecords: TaeTrainingRecord[];
};
export type TaeRequirementResult = {
    requirementId: string;
    requirementType: TaeRequirementType;
    name: string;
    score: number;
    status: 'Met' | 'ExpiringSoon' | 'NotMet';
    validityStatus: 'Valid' | 'ExpiringSoon' | 'Expired' | 'NoRecord';
    providerStatus: 'Valid' | 'Invalid' | 'UnknownButAccepted' | 'NoRecord';
    competencyStatus: 'MeetsOrExceeds' | 'Insufficient' | 'NoRecord';
    evidenceStatus: 'Complete' | 'Incomplete' | 'None';
    mappedTrainingRecordIds: string[];
};
export type TaeCorrectiveAction = {
    id: string;
    requirementId: string;
    workerId: string;
    type: 'Training' | 'Evidence' | 'Provider' | 'Competency';
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    recommendedDueDays: number;
    blockingForSiteAccess: boolean;
};
export type TaeAssessmentResult = {
    workerId: string;
    overallScore: number;
    overallStatus: 'Compliant' | 'ConditionallyCompliant' | 'NonCompliant';
    requirementResults: TaeRequirementResult[];
    correctiveActions: TaeCorrectiveAction[];
};
