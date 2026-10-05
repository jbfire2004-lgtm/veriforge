export declare class CompetencyEvaluateDto {
    workerId: number;
    equipmentId: number;
    score: number;
    passed: boolean;
    evidenceNotes?: string;
    evidencePhotos?: string[];
    workerSignature?: string;
    evaluatorSignature?: string;
}
