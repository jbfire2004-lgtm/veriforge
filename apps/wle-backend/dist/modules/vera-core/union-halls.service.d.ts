import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from './company-links.service';
import { InactivationService } from './inactivation.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
export declare class UnionHallsService {
    private readonly prisma;
    private readonly companyLinks;
    private readonly inactivation;
    private readonly events?;
    constructor(prisma: PrismaService, companyLinks: CompanyLinksService, inactivation: InactivationService, events?: EventBusService);
    listHalls(): Promise<{
        id: number;
        name: string;
        localNumber: string | null;
        region: string | null;
        createdAt: Date;
    }[]>;
    createHall(data: {
        name: string;
        localNumber?: string;
        region?: string;
    }): Promise<{
        id: number;
        name: string;
        localNumber: string | null;
        region: string | null;
        createdAt: Date;
    }>;
    listMembers(unionHallId: number, activeOnly?: boolean): Promise<({
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
        unionHallId: number;
        workerId: number;
        memberNumber: string | null;
        status: import(".prisma/client").$Enums.UnionMembershipStatus;
        joinedAt: Date;
        endedAt: Date | null;
    })[]>;
    addMember(unionHallId: number, data: {
        firstName: string;
        lastName: string;
        memberNumber?: string;
        email?: string;
        phone?: string;
    }): Promise<{
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
        unionHall: {
            id: number;
            name: string;
            localNumber: string | null;
            region: string | null;
            createdAt: Date;
        };
    } & {
        id: number;
        unionHallId: number;
        workerId: number;
        memberNumber: string | null;
        status: import(".prisma/client").$Enums.UnionMembershipStatus;
        joinedAt: Date;
        endedAt: Date | null;
    }>;
    dispatchWorker(unionHallId: number, workerId: number, companyId: number, dispatchedBy?: number, notes?: string): Promise<{
        id: number;
        unionHallId: number;
        workerId: number;
        companyId: number;
        dispatchedBy: number | null;
        dispatchedAt: Date;
        notes: string | null;
        recalledAt: Date | null;
    }>;
    recallWorker(unionHallId: number, workerId: number, companyId: number): Promise<{
        unionHallId: number;
        workerId: number;
        companyId: number;
        recalled: boolean;
    }>;
}
