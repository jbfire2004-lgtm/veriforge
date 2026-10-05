export declare class TrainingIngestRowDto {
    workerId: number;
    certificationId?: number;
    certificationCode?: string;
    certificationName?: string;
    issuedAt: string;
    expiresAt: string;
    providerName?: string;
    certificateNumber?: string;
}
export declare class IngestTrainingRowsDto {
    companyId: number;
    rows: TrainingIngestRowDto[];
}
