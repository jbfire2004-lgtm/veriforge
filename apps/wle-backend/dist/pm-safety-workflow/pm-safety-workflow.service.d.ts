import { type PmSafetyWorkflow, Prisma, type PmSafetyWorkflowStatus, type UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePmSafetyWorkflowDto } from './dto/create-pm-safety-workflow.dto';
import type { SignPmSafetyWorkerDto } from './dto/sign-pm-safety-worker.dto';
import type { PmSafetyAction } from './pm-safety-workflow.types';
export declare const EVENT_TYPES: {
    readonly STATUS_CHANGE: "STATUS_CHANGE";
    readonly NOTIFICATION: "NOTIFICATION";
    readonly PDF_EXPORT: "PDF_EXPORT";
    readonly WORKER_SIGNATURE: "WORKER_SIGNATURE";
};
export type PmSafetyActor = {
    userId: number;
    role: UserRole;
};
export declare class PmSafetyWorkflowService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getDefinition(): {
        version: number;
        workflow: string;
        kinds: string[];
        statuses: string[];
        kindsRequiringWorkerSignBeforeSubmit: import(".prisma/client").$Enums.PmSafetyWorkflowKind[];
        transitions: import("./pm-safety-workflow.types").PmSafetyTransitionEdge[];
        notificationChannels: string[];
        permissionHints: {
            workerSignRoles: string[];
            supervisorRoles: string[];
            projectManagerRoles: string[];
            actorHeaders: string[];
        };
    };
    list(params?: {
        companyId?: number;
        status?: PmSafetyWorkflowStatus;
    }): Promise<({
        company: {
            id: number;
            name: string;
        };
        site: {
            id: number;
            name: string;
            code: string;
        };
        workerUser: {
            id: number;
            username: string;
        };
        supervisorUser: {
            id: number;
            username: string;
        };
    } & {
        id: number;
        kind: import(".prisma/client").$Enums.PmSafetyWorkflowKind;
        title: string;
        status: import(".prisma/client").$Enums.PmSafetyWorkflowStatus;
        companyId: number | null;
        siteId: number | null;
        workDescription: string | null;
        hazardSummary: string | null;
        controlMeasures: string | null;
        jobLocation: string | null;
        taskStepsJson: Prisma.JsonValue | null;
        validFrom: Date | null;
        validTo: Date | null;
        workerUserId: number | null;
        workerSignedAt: Date | null;
        workerSignatureText: string | null;
        supervisorUserId: number | null;
        supervisorApprovedAt: Date | null;
        supervisorSignatureText: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(dto: CreatePmSafetyWorkflowDto): Promise<PmSafetyWorkflow>;
    findOne(id: number): Promise<{
        company: {
            id: number;
            name: string;
        };
        site: {
            id: number;
            name: string;
            code: string;
        };
        workerUser: {
            id: number;
            username: string;
        };
        supervisorUser: {
            id: number;
            username: string;
        };
    } & {
        id: number;
        kind: import(".prisma/client").$Enums.PmSafetyWorkflowKind;
        title: string;
        status: import(".prisma/client").$Enums.PmSafetyWorkflowStatus;
        companyId: number | null;
        siteId: number | null;
        workDescription: string | null;
        hazardSummary: string | null;
        controlMeasures: string | null;
        jobLocation: string | null;
        taskStepsJson: Prisma.JsonValue | null;
        validFrom: Date | null;
        validTo: Date | null;
        workerUserId: number | null;
        workerSignedAt: Date | null;
        workerSignatureText: string | null;
        supervisorUserId: number | null;
        supervisorApprovedAt: Date | null;
        supervisorSignatureText: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getState(id: number): Promise<{
        workflow: {
            company: {
                id: number;
                name: string;
            };
            site: {
                id: number;
                name: string;
                code: string;
            };
            workerUser: {
                id: number;
                username: string;
            };
            supervisorUser: {
                id: number;
                username: string;
            };
        } & {
            id: number;
            kind: import(".prisma/client").$Enums.PmSafetyWorkflowKind;
            title: string;
            status: import(".prisma/client").$Enums.PmSafetyWorkflowStatus;
            companyId: number | null;
            siteId: number | null;
            workDescription: string | null;
            hazardSummary: string | null;
            controlMeasures: string | null;
            jobLocation: string | null;
            taskStepsJson: Prisma.JsonValue | null;
            validFrom: Date | null;
            validTo: Date | null;
            workerUserId: number | null;
            workerSignedAt: Date | null;
            workerSignatureText: string | null;
            supervisorUserId: number | null;
            supervisorApprovedAt: Date | null;
            supervisorSignatureText: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        availableActions: {
            action: "approve" | "reject" | "cancel" | "submit" | "start_review" | "revise" | "close";
            to: import(".prisma/client").$Enums.PmSafetyWorkflowStatus;
            label: string;
        }[];
    }>;
    signWorker(id: number, dto: SignPmSafetyWorkerDto, actor: PmSafetyActor): Promise<PmSafetyWorkflow>;
    transition(id: number, action: PmSafetyAction, actor: PmSafetyActor, note?: string): Promise<PmSafetyWorkflow>;
    listEvents(workflowId: number): Promise<{
        id: number;
        workflowId: number;
        eventType: string;
        channel: string | null;
        payload: Prisma.JsonValue | null;
        createdAt: Date;
    }[]>;
    exportPdfBuffer(id: number): Promise<Buffer>;
    private assertWorkerSignRole;
    private parseTaskStepsJson;
    private ensureExists;
    private appendEventTx;
    private createAuditLogTx;
    private emitNotificationStubTx;
}
