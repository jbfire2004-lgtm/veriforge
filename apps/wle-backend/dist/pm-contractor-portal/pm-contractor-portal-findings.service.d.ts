import { PrismaService } from '../prisma/prisma.service';
import { PmContractorPortalAccessService, type PortalActor } from './pm-contractor-portal-access.service';
export declare class PmContractorPortalFindingsService {
    private readonly prisma;
    private readonly access;
    constructor(prisma: PrismaService, access: PmContractorPortalAccessService);
    listFindings(actor: PortalActor, opts?: {
        projectId?: number;
        unacknowledgedOnly?: boolean;
    }): Promise<{
        summary: {
            total: number;
            unacknowledged: number;
            critical: number;
        };
        items: {
            id: string;
            title: string;
            description: string;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            status: import(".prisma/client").$Enums.PmDeficiencyStatus;
            dueAt: Date;
            inspection: {
                project: {
                    id: number;
                    name: string;
                };
                id: string;
                createdAt: Date;
                projectId: number;
                submittedAt: Date;
                inspector: {
                    id: number;
                    username: string;
                };
            };
            acknowledged: boolean;
            acknowledgment: {
                id: string;
                deficiencyId: string;
                contractorCompanyId: number;
                acknowledgedByUserId: number;
                notes: string | null;
                acknowledgedAt: Date;
            };
            photo: {
                id: string;
                fileName: string;
                dataUrl: string;
            };
        }[];
    }>;
    acknowledgeFinding(actor: PortalActor, deficiencyId: string, notes?: string): Promise<{
        acknowledgedBy: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        deficiencyId: string;
        contractorCompanyId: number;
        acknowledgedByUserId: number;
        notes: string | null;
        acknowledgedAt: Date;
    }>;
}
