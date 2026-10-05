import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
export declare class OrientationDeliveryService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    assign(input: {
        workerId: number;
        orientationId: string;
        companyId: number;
        assignedById: number;
    }): Promise<{
        deliveryId: string;
        deepLink: string;
        walletCard: {
            cardType: string;
            title: string;
            orientationId: string;
            version: string;
            workerId: number;
            companyId: number;
            deepLink: string;
            status: string;
            issuedAt: string;
        };
        orientation: {
            id: string;
            title: string;
            version: string;
        };
    }>;
    listLinks(workerId: number): Promise<{
        workerId: number;
        appDeepLinks: {
            orientationId: string;
            title: string;
            deepLink: string;
            assignedAt: Date;
        }[];
        walletCards: Prisma.JsonValue[];
    }>;
}
