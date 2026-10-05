import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationCompletionService } from './orientation-completion.service';
import type { OrientationCompletionStatus } from './orientation.types';
export declare class OrientationCompletionController {
    private readonly completions;
    private readonly tenant;
    constructor(completions: OrientationCompletionService, tenant: TenantScopeService);
    create(req: {
        user: SecurityActor;
    }, body: {
        workerId: number;
        orientationId: string;
        companyId?: number;
        projectId?: number;
        score?: number;
        status?: OrientationCompletionStatus;
        clientSyncId?: string;
    }): Promise<any>;
    list(workerIdRaw?: string, orientationId?: string): Promise<({
        orientation: {
            id: string;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            version: string;
        };
    } & {
        id: string;
        workerId: number;
        orientationId: string;
        companyId: number;
        projectId: number | null;
        completedOn: Date | null;
        expiresOn: Date | null;
        score: number | null;
        status: import(".prisma/client").$Enums.OrientationCompletionStatus;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
