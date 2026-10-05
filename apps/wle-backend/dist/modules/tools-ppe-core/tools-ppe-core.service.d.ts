import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignToProjectDto, AssignToWorkerDto, CreatePpeDto, CreateToolDto, PpeInspectDto, ToolInspectDto, UpdateToolDto } from './dto/tools-ppe.dto';
export declare class ToolsPpeCoreService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    dashboard(companyId?: number): Promise<{
        toolCount: number;
        toolsInspectionDue: number;
        ppeCount: number;
        ppeExpired: number;
        ppeExpiringSoon: number;
        activeToolAssignments: number;
        activePpeAssignments: number;
    }>;
    listTools(companyId?: number): Promise<({
        assignments: ({
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
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            toolId: number;
            workerId: number | null;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
    } & {
        id: number;
        companyId: number;
        name: string;
        serialNumber: string | null;
        assetTag: string | null;
        category: string | null;
        status: import(".prisma/client").$Enums.ToolStatus;
        inspectionIntervalDays: number;
        lastInspectionAt: Date | null;
        nextInspectionAt: Date | null;
        qrToken: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createTool(dto: CreateToolDto): Promise<{
        id: number;
        companyId: number;
        name: string;
        serialNumber: string | null;
        assetTag: string | null;
        category: string | null;
        status: import(".prisma/client").$Enums.ToolStatus;
        inspectionIntervalDays: number;
        lastInspectionAt: Date | null;
        nextInspectionAt: Date | null;
        qrToken: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getTool(id: number): Promise<{
        defaultChecklist: {
            id: string;
            label: string;
            required: boolean;
        }[];
        assignments: ({
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
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            toolId: number;
            workerId: number | null;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
        inspections: {
            id: number;
            toolId: number;
            inspectorUserId: number | null;
            workerId: number | null;
            passed: boolean;
            checklist: Prisma.JsonValue | null;
            notes: string | null;
            completedAt: Date;
            nextInspectionDate: Date | null;
            createdAt: Date;
        }[];
        id: number;
        companyId: number;
        name: string;
        serialNumber: string | null;
        assetTag: string | null;
        category: string | null;
        status: import(".prisma/client").$Enums.ToolStatus;
        inspectionIntervalDays: number;
        lastInspectionAt: Date | null;
        nextInspectionAt: Date | null;
        qrToken: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTool(id: number, dto: UpdateToolDto): Promise<{
        id: number;
        companyId: number;
        name: string;
        serialNumber: string | null;
        assetTag: string | null;
        category: string | null;
        status: import(".prisma/client").$Enums.ToolStatus;
        inspectionIntervalDays: number;
        lastInspectionAt: Date | null;
        nextInspectionAt: Date | null;
        qrToken: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    inspectTool(toolId: number, dto: ToolInspectDto, inspectorUserId: number): Promise<{
        id: number;
        toolId: number;
        inspectorUserId: number | null;
        workerId: number | null;
        passed: boolean;
        checklist: Prisma.JsonValue | null;
        notes: string | null;
        completedAt: Date;
        nextInspectionDate: Date | null;
        createdAt: Date;
    }>;
    assignToolToWorker(toolId: number, dto: AssignToWorkerDto, assignedBy?: number): Promise<{
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
        project: {
            id: number;
            companyId: number;
            siteId: number | null;
            name: string;
            code: string | null;
            client: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
            createdAt: Date;
        };
    } & {
        id: number;
        toolId: number;
        workerId: number | null;
        projectId: number | null;
        companyId: number;
        status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
        assignedBy: number | null;
        assignedAt: Date;
        returnedAt: Date | null;
    }>;
    assignToolToProject(toolId: number, dto: AssignToProjectDto, assignedBy?: number): Promise<{
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
        project: {
            id: number;
            companyId: number;
            siteId: number | null;
            name: string;
            code: string | null;
            client: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
            createdAt: Date;
        };
    } & {
        id: number;
        toolId: number;
        workerId: number | null;
        projectId: number | null;
        companyId: number;
        status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
        assignedBy: number | null;
        assignedAt: Date;
        returnedAt: Date | null;
    }>;
    returnTool(toolId: number): Promise<{
        toolId: number;
        returned: boolean;
    }>;
    listPpe(companyId?: number): Promise<({
        assignments: ({
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
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            ppeId: number;
            workerId: number;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
    } & {
        id: number;
        companyId: number;
        name: string;
        ppeType: import(".prisma/client").$Enums.PpeType;
        serialNumber: string | null;
        status: import(".prisma/client").$Enums.PpeStatus;
        issuedAt: Date;
        expiresAt: Date;
        condition: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createPpe(dto: CreatePpeDto): Promise<{
        id: number;
        companyId: number;
        name: string;
        ppeType: import(".prisma/client").$Enums.PpeType;
        serialNumber: string | null;
        status: import(".prisma/client").$Enums.PpeStatus;
        issuedAt: Date;
        expiresAt: Date;
        condition: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPpe(id: number): Promise<{
        assignments: ({
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
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            ppeId: number;
            workerId: number;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
        inspections: {
            id: number;
            ppeId: number;
            inspectorUserId: number | null;
            workerId: number | null;
            passed: boolean;
            checklist: Prisma.JsonValue | null;
            notes: string | null;
            completedAt: Date;
            extendedExpiresAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: number;
        companyId: number;
        name: string;
        ppeType: import(".prisma/client").$Enums.PpeType;
        serialNumber: string | null;
        status: import(".prisma/client").$Enums.PpeStatus;
        issuedAt: Date;
        expiresAt: Date;
        condition: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    inspectPpe(ppeId: number, dto: PpeInspectDto, inspectorUserId: number): Promise<{
        id: number;
        ppeId: number;
        inspectorUserId: number | null;
        workerId: number | null;
        passed: boolean;
        checklist: Prisma.JsonValue | null;
        notes: string | null;
        completedAt: Date;
        extendedExpiresAt: Date | null;
        createdAt: Date;
    }>;
    assignPpeToWorker(ppeId: number, dto: AssignToWorkerDto, assignedBy?: number): Promise<{
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
        project: {
            id: number;
            companyId: number;
            siteId: number | null;
            name: string;
            code: string | null;
            client: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
            createdAt: Date;
        };
    } & {
        id: number;
        ppeId: number;
        workerId: number;
        projectId: number | null;
        companyId: number;
        status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
        assignedBy: number | null;
        assignedAt: Date;
        returnedAt: Date | null;
    }>;
    assignPpeToProject(ppeId: number, dto: AssignToProjectDto, assignedBy?: number): Promise<{
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
        project: {
            id: number;
            companyId: number;
            siteId: number | null;
            name: string;
            code: string | null;
            client: string | null;
            status: import(".prisma/client").$Enums.ProjectStatus;
            startDate: Date | null;
            endDate: Date | null;
            createdAt: Date;
        };
    } & {
        id: number;
        ppeId: number;
        workerId: number;
        projectId: number | null;
        companyId: number;
        status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
        assignedBy: number | null;
        assignedAt: Date;
        returnedAt: Date | null;
    }>;
    returnPpe(ppeId: number): Promise<{
        ppeId: number;
        returned: boolean;
    }>;
    processPpeExpiry(companyId?: number): Promise<{
        ppeExpired: number;
        toolsMarkedDue: number;
    }>;
    getWorkerToolsPpe(workerId: number): Promise<{
        tools: ({
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
            tool: {
                id: number;
                companyId: number;
                name: string;
                serialNumber: string | null;
                assetTag: string | null;
                category: string | null;
                status: import(".prisma/client").$Enums.ToolStatus;
                inspectionIntervalDays: number;
                lastInspectionAt: Date | null;
                nextInspectionAt: Date | null;
                qrToken: string | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            toolId: number;
            workerId: number | null;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
        ppe: ({
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
            ppe: {
                id: number;
                companyId: number;
                name: string;
                ppeType: import(".prisma/client").$Enums.PpeType;
                serialNumber: string | null;
                status: import(".prisma/client").$Enums.PpeStatus;
                issuedAt: Date;
                expiresAt: Date;
                condition: string | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            ppeId: number;
            workerId: number;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
    }>;
    private defaultPpeExpiry;
    private closeActiveToolAssignments;
    private closeActivePpeAssignments;
    private syncWorkerWalletItem;
}
