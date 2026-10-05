export declare class EvaluateCompetencyDto {
    workerId: number;
    equipmentId: number;
    score: number;
    passed: boolean;
    evaluationDate?: string;
    notes?: string;
    evidenceNotes?: string;
    evidencePhotos?: string[];
    workerSignature?: string;
    evaluatorSignature?: string;
}
export declare class CheckCompetencyDto {
    workerId: number;
    equipmentId: number;
}
export declare class UpsertCompetencyRequirementDto {
    minPassingScore?: number;
    expiryDays?: number | null;
    requireEvaluation?: boolean;
    certificationId?: number | null;
}
