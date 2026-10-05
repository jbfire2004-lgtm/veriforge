import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationDeliveryService } from './orientation-delivery.service';
export declare class OrientationDeliveryController {
    private readonly delivery;
    private readonly tenant;
    constructor(delivery: OrientationDeliveryService, tenant: TenantScopeService);
    assign(req: {
        user: SecurityActor;
    }, body: {
        workerId: number;
        orientationId: string;
        companyId?: number;
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
    links(workerIdRaw: string): Promise<{
        workerId: number;
        appDeepLinks: {
            orientationId: string;
            title: string;
            deepLink: string;
            assignedAt: Date;
        }[];
        walletCards: import(".prisma/client").Prisma.JsonValue[];
    }>;
}
