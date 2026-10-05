import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from '../../safety-intelligence/cail/cail-scope.service';
import type { CreatePpePreUseDto } from './create-ppe-preuse.dto';
export declare class PpePreUseService {
    private readonly prisma;
    private readonly scope;
    constructor(prisma: PrismaService, scope: CailScopeService);
    checklist(): import("./ppe-preuse.constants").PpePreUseChecklistItemDef[];
    create(dto: CreatePpePreUseDto, actor: CailActor): Promise<{
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
        items: Prisma.JsonValue;
        deficiencies: string | null;
        removedFromService: boolean;
        acknowledgedSafeToWork: boolean;
        createdAt: Date;
    }>;
    list(actor: CailActor, filters: {
        projectId?: number;
        companyId?: number;
    }): Promise<({
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
        items: Prisma.JsonValue;
        deficiencies: string | null;
        removedFromService: boolean;
        acknowledgedSafeToWork: boolean;
        createdAt: Date;
    })[]>;
    getById(id: string, actor: CailActor): Promise<{
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
        items: Prisma.JsonValue;
        deficiencies: string | null;
        removedFromService: boolean;
        acknowledgedSafeToWork: boolean;
        createdAt: Date;
    }>;
}
