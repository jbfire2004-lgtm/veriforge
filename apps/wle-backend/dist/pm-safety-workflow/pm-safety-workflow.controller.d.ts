import { StreamableFile } from '@nestjs/common';
import { CreatePmSafetyWorkflowDto } from './dto/create-pm-safety-workflow.dto';
import { SignPmSafetyWorkerDto } from './dto/sign-pm-safety-worker.dto';
import { TransitionPmSafetyWorkflowDto } from './dto/transition-pm-safety-workflow.dto';
import { PmSafetyWorkflowService } from './pm-safety-workflow.service';
export declare class PmSafetyWorkflowController {
    private readonly pmSafety;
    constructor(pmSafety: PmSafetyWorkflowService);
    definition(): {
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
    list(companyId?: string, status?: string): Promise<({
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
        taskStepsJson: import(".prisma/client").Prisma.JsonValue | null;
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
    create(dto: CreatePmSafetyWorkflowDto): Promise<{
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
        taskStepsJson: import(".prisma/client").Prisma.JsonValue | null;
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
        taskStepsJson: import(".prisma/client").Prisma.JsonValue | null;
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
    state(id: number): Promise<{
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
            taskStepsJson: import(".prisma/client").Prisma.JsonValue | null;
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
    signWorker(id: number, dto: SignPmSafetyWorkerDto, actorUserId?: string, actorRole?: string): Promise<{
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
        taskStepsJson: import(".prisma/client").Prisma.JsonValue | null;
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
    transition(id: number, dto: TransitionPmSafetyWorkflowDto, actorUserId?: string, actorRole?: string): Promise<{
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
        taskStepsJson: import(".prisma/client").Prisma.JsonValue | null;
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
    events(id: number): Promise<{
        id: number;
        workflowId: number;
        eventType: string;
        channel: string | null;
        payload: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    }[]>;
    exportPdf(id: number): Promise<StreamableFile>;
    private parseActorRequired;
    private parseActorCore;
}
