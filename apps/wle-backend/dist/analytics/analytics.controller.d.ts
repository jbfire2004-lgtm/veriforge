import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    overview(): Promise<{
        workers: number;
        equipment: number;
        companies: number;
        incidents: number;
        documents: number;
        safetyStations: number;
        trainingRecords: number;
        credentials: number;
    }>;
    incidentsBySeverity(): Promise<{
        severity: string;
        count: number;
    }[]>;
    incidentsTimeline(): Promise<{
        date: string;
        count: number;
    }[]>;
    trainingExpiry(): Promise<{
        expired: number;
        expiringSoon: number;
    }>;
    companyRisk(): Promise<{
        companyId: number;
        companyName: string;
        riskScore: number;
    }[]>;
    recent(limitRaw?: string): Promise<{
        trainingRecords: {
            worker: {
                id: number;
                companyId: number;
                firstName: string;
                lastName: string;
            };
            certification: {
                id: number;
                name: string;
            };
            id: number;
            certificateNumber: string;
            expiresAt: Date;
            issuedAt: Date;
        }[];
        credentials: {
            worker: {
                id: number;
                companyId: number;
                firstName: string;
                lastName: string;
            };
            certification: {
                id: number;
                name: string;
            };
            id: number;
            name: string;
            expiresAt: Date;
            issuedAt: Date;
        }[];
        documents: {
            id: number;
            companyId: number;
            createdAt: Date;
            name: string;
            equipmentId: number;
            workerId: number;
            type: string;
            url: string;
        }[];
    }>;
}
