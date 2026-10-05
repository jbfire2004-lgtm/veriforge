import { OrientationLinkingService } from '../orientation/orientation-linking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from './inactivation.service';
export declare class CompanyLinksService {
    private readonly prisma;
    private readonly inactivation;
    private readonly orientationLinking?;
    constructor(prisma: PrismaService, inactivation: InactivationService, orientationLinking?: OrientationLinkingService);
    listByCompany(companyId: number, activeOnly?: boolean): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
            companyId: number | null;
            photoUrl: string | null;
            userId: number | null;
            email: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            qrToken: string | null;
            unionNumber: string | null;
        };
    } & {
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    })[]>;
    linkWorker(workerId: number, companyId: number, opts?: {
        role?: string;
        trade?: string;
        deactivateOtherCompanies?: boolean;
    }): Promise<{
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    linkByQrToken(qrToken: string, companyId: number, assignedBy?: number): Promise<{
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    endAssignment(workerId: number, companyId: number): Promise<{
        workerId: number;
        companyId: number;
        reason: import("./inactivation.service").WorkerInactivationReason;
        deactivatedAt: Date;
    }>;
    activate(workerId: number, companyId: number): Promise<{
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
}
