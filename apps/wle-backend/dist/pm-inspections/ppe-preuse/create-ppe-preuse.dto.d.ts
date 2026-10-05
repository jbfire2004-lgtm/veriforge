export declare class PpePreUseItemDto {
    id: string;
    result: 'pass' | 'fail' | 'na';
    note?: string;
}
export declare class CreatePpePreUseDto {
    projectId: number;
    companyId?: number;
    workerId?: number;
    locationNote?: string;
    taskType?: string;
    items: PpePreUseItemDto[];
    deficiencies?: string;
    removedFromService?: boolean;
    acknowledgedSafeToWork?: boolean;
    inspectedAt?: string;
}
