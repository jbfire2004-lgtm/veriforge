import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    recent(limit?: number): Promise<{
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
    incidentsBySeverity(): Promise<{
        severity: string;
        count: number;
    }[]>;
    incidentsTimeline(): Promise<{
        date: string;
        count: number;
    }[]>;
    trainingExpirySummary(): Promise<{
        expired: number;
        expiringSoon: number;
    }>;
    companyRiskRanking(): Promise<{
        companyId: number;
        companyName: string;
        riskScore: number;
    }[]>;
    global(): Promise<{
        totalCompanies: number;
        totalWorkers: number;
        totalEquipment: number;
        expiredTraining: number;
        expiredCredentials: number;
        workerIncidents: number;
        equipmentIncidents: number;
        months: string[];
        incidentTrend: number[];
        expiryTrend: number[];
    }>;
}
