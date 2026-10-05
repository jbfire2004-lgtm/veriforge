import { InspectionKind } from '@prisma/client';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
export declare class InspectionsCoreService {
    private readonly inspectionCore;
    constructor(inspectionCore: InspectionCoreService);
    createInspection(data: {
        equipmentId: number;
        inspectorId: number;
        workerId?: number;
        siteId?: number;
        kind?: InspectionKind;
        checklistId?: number;
        checklist: Record<string, unknown>;
        passed: boolean;
        photos?: string[];
        correctiveActions?: string;
        notes?: string;
        meterReading?: number;
        signature?: string;
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
}
