export declare class ReportingQueryDto {
    companyId?: number;
    projectId?: number;
    unionHallId?: number;
    from?: string;
    to?: string;
    limit?: number;
}
export declare class ReportingExportQueryDto extends ReportingQueryDto {
    format?: 'csv';
}
