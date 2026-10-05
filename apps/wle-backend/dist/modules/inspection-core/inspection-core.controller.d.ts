import { InspectionChecklistCategory, InspectionType } from '@prisma/client';
import { CreateChecklistDto, UpdateChecklistDto } from './dto/checklist.dto';
import { CreateInspectionDto, UnlockAfterInspectionDto } from './dto/create-inspection.dto';
import { InspectionCoreService } from './inspection-core.service';
export declare class InspectionCoreController {
    private readonly inspections;
    constructor(inspections: InspectionCoreService);
    dashboard(companyId?: string): Promise<{
        totalInspections: number;
        passed: number;
        failed: number;
        lockedOutEquipment: number;
        dueWithin7Days: number;
        recent: {
            inspectorId: number;
            inspector: {
                id: number;
                username: string;
                email: string;
            };
            supervisorId: number;
            supervisor: {
                id: number;
                username: string;
                email: string;
            };
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            equipment: {
                id: number;
                companyId: number;
                name: string;
                catalogTypeKey: string;
            };
            checklistTemplate: {
                id: number;
                seedKey: string | null;
                name: string;
                category: import(".prisma/client").$Enums.InspectionChecklistCategory;
                inspectionType: import(".prisma/client").$Enums.InspectionType;
                items: import(".prisma/client").Prisma.JsonValue;
                intervalDays: number | null;
                intervalHours: number | null;
                active: boolean;
                seedVersion: number;
                createdAt: Date;
                updatedAt: Date;
            };
            id: number;
            workerId: number | null;
            equipmentId: number | null;
            siteId: number | null;
            checklistId: number | null;
            status: string;
            notes: string | null;
            createdAt: Date;
            kind: import(".prisma/client").$Enums.InspectionKind;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            checklist: import(".prisma/client").Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: import(".prisma/client").Prisma.JsonValue | null;
            correctiveActions: string | null;
            lockoutTriggered: boolean;
            nextInspectionDate: Date | null;
        }[];
    }>;
    listDue(companyId?: string, withinDays?: string): Promise<{
        inspectorId: number;
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        supervisorId: number;
        supervisor: {
            id: number;
            username: string;
            email: string;
        };
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            companyId: number;
            name: string;
            catalogTypeKey: string;
        };
        checklistTemplate: {
            id: number;
            seedKey: string | null;
            name: string;
            category: import(".prisma/client").$Enums.InspectionChecklistCategory;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            items: import(".prisma/client").Prisma.JsonValue;
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
            updatedAt: Date;
        };
        id: number;
        workerId: number | null;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        kind: import(".prisma/client").$Enums.InspectionKind;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        checklist: import(".prisma/client").Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: import(".prisma/client").Prisma.JsonValue | null;
        correctiveActions: string | null;
        lockoutTriggered: boolean;
        nextInspectionDate: Date | null;
    }[]>;
    notifyDue(companyId?: string, withinDays?: string): Promise<{
        notified: number;
        equipmentCount: number;
    }>;
    listChecklists(inspectionType?: InspectionType, category?: InspectionChecklistCategory, activeOnly?: string): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: import(".prisma/client").Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createChecklist(dto: CreateChecklistDto): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: import(".prisma/client").Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getChecklist(id: number): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: import(".prisma/client").Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateChecklist(id: number, dto: UpdateChecklistDto): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: import(".prisma/client").Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listForEquipment(equipmentId: number): Promise<{
        inspectorId: number;
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        supervisorId: number;
        supervisor: {
            id: number;
            username: string;
            email: string;
        };
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            companyId: number;
            name: string;
            catalogTypeKey: string;
        };
        checklistTemplate: {
            id: number;
            seedKey: string | null;
            name: string;
            category: import(".prisma/client").$Enums.InspectionChecklistCategory;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            items: import(".prisma/client").Prisma.JsonValue;
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
            updatedAt: Date;
        };
        id: number;
        workerId: number | null;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        kind: import(".prisma/client").$Enums.InspectionKind;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        checklist: import(".prisma/client").Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: import(".prisma/client").Prisma.JsonValue | null;
        correctiveActions: string | null;
        lockoutTriggered: boolean;
        nextInspectionDate: Date | null;
    }[]>;
    unlock(equipmentId: number, body: UnlockAfterInspectionDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
        equipmentId: number;
        unlocked: boolean;
    }>;
    submit(dto: CreateInspectionDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
        lockoutTriggered: boolean;
        inspectorId: number;
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        supervisorId: number;
        supervisor: {
            id: number;
            username: string;
            email: string;
        };
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            companyId: number;
            name: string;
            catalogTypeKey: string;
        };
        checklistTemplate: {
            id: number;
            seedKey: string | null;
            name: string;
            category: import(".prisma/client").$Enums.InspectionChecklistCategory;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            items: import(".prisma/client").Prisma.JsonValue;
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
            updatedAt: Date;
        };
        id: number;
        workerId: number | null;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        kind: import(".prisma/client").$Enums.InspectionKind;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        checklist: import(".prisma/client").Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: import(".prisma/client").Prisma.JsonValue | null;
        correctiveActions: string | null;
        nextInspectionDate: Date | null;
    }>;
    getOne(id: number): Promise<{
        inspectorId: number;
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        supervisorId: number;
        supervisor: {
            id: number;
            username: string;
            email: string;
        };
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            companyId: number;
            name: string;
            catalogTypeKey: string;
        };
        checklistTemplate: {
            id: number;
            seedKey: string | null;
            name: string;
            category: import(".prisma/client").$Enums.InspectionChecklistCategory;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            items: import(".prisma/client").Prisma.JsonValue;
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            seedVersion: number;
            createdAt: Date;
            updatedAt: Date;
        };
        id: number;
        workerId: number | null;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        status: string;
        notes: string | null;
        createdAt: Date;
        kind: import(".prisma/client").$Enums.InspectionKind;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        checklist: import(".prisma/client").Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: import(".prisma/client").Prisma.JsonValue | null;
        correctiveActions: string | null;
        lockoutTriggered: boolean;
        nextInspectionDate: Date | null;
    }>;
}
