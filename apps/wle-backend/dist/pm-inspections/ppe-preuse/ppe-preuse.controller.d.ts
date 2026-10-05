import { UserRole } from '@prisma/client';
import { CailScopeService } from '../../safety-intelligence/cail/cail-scope.service';
import { CreatePpePreUseDto } from './create-ppe-preuse.dto';
import { PpePreUseService } from './ppe-preuse.service';
export declare class PpePreUseController {
    private readonly service;
    private readonly scope;
    constructor(service: PpePreUseService, scope: CailScopeService);
    checklist(): import("./ppe-preuse.constants").PpePreUseChecklistItemDef[];
    list(req: {
        user: {
            id: number;
            role: UserRole;
        };
    }, projectId?: string, companyId?: string): Promise<({
        company: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        workerUser: {
            id: number;
            username: string;
            email: string;
        };
    } & {
        id: string;
        projectId: number;
        companyId: number;
        workerUserId: number;
        workerId: number | null;
        inspectedAt: Date;
        locationNote: string | null;
        taskType: string | null;
        overallResult: import(".prisma/client").$Enums.PpePreUseOverallResult;
        items: import(".prisma/client").Prisma.JsonValue;
        deficiencies: string | null;
        removedFromService: boolean;
        acknowledgedSafeToWork: boolean;
        createdAt: Date;
    })[]>;
    getOne(id: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        company: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        workerUser: {
            id: number;
            username: string;
            email: string;
        };
    } & {
        id: string;
        projectId: number;
        companyId: number;
        workerUserId: number;
        workerId: number | null;
        inspectedAt: Date;
        locationNote: string | null;
        taskType: string | null;
        overallResult: import(".prisma/client").$Enums.PpePreUseOverallResult;
        items: import(".prisma/client").Prisma.JsonValue;
        deficiencies: string | null;
        removedFromService: boolean;
        acknowledgedSafeToWork: boolean;
        createdAt: Date;
    }>;
    create(dto: CreatePpePreUseDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        company: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        workerUser: {
            id: number;
            username: string;
            email: string;
        };
    } & {
        id: string;
        projectId: number;
        companyId: number;
        workerUserId: number;
        workerId: number | null;
        inspectedAt: Date;
        locationNote: string | null;
        taskType: string | null;
        overallResult: import(".prisma/client").$Enums.PpePreUseOverallResult;
        items: import(".prisma/client").Prisma.JsonValue;
        deficiencies: string | null;
        removedFromService: boolean;
        acknowledgedSafeToWork: boolean;
        createdAt: Date;
    }>;
}
