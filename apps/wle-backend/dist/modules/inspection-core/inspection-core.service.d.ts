import { InspectionType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from '../vera-core/inactivation.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto/checklist.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { EquipmentBridgeService } from '../../safety-intelligence/equipment-bridge/equipment-bridge.service';
export declare class InspectionCoreService {
    private readonly prisma;
    private readonly inactivation;
    private readonly compliance;
    private readonly equipmentCailBridge;
    constructor(prisma: PrismaService, inactivation: InactivationService, compliance: EquipmentComplianceService, equipmentCailBridge: EquipmentBridgeService);
    dashboard(companyId?: number): Promise<{
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
                items: Prisma.JsonValue;
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
            checklist: Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: Prisma.JsonValue | null;
            correctiveActions: string | null;
            lockoutTriggered: boolean;
            nextInspectionDate: Date | null;
        }[];
    }>;
    listChecklists(filters?: {
        inspectionType?: InspectionType;
        category?: string;
        activeOnly?: boolean;
    }): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getChecklist(id: number): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createChecklist(dto: CreateChecklistDto): Promise<{
        id: number;
        seedKey: string | null;
        name: string;
        category: import(".prisma/client").$Enums.InspectionChecklistCategory;
        inspectionType: import(".prisma/client").$Enums.InspectionType;
        items: Prisma.JsonValue;
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
        items: Prisma.JsonValue;
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        seedVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    submitInspection(dto: CreateInspectionDto, inspectorUserId: number): Promise<{
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
            items: Prisma.JsonValue;
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
        checklist: Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: Prisma.JsonValue | null;
        correctiveActions: string | null;
        nextInspectionDate: Date | null;
    }>;
    unlockEquipment(equipmentId: number, userId: number, notes?: string): Promise<{
        equipmentId: number;
        unlocked: boolean;
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
            items: Prisma.JsonValue;
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
        checklist: Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: Prisma.JsonValue | null;
        correctiveActions: string | null;
        lockoutTriggered: boolean;
        nextInspectionDate: Date | null;
    }[]>;
    getInspection(id: number): Promise<{
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
            items: Prisma.JsonValue;
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
        checklist: Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: Prisma.JsonValue | null;
        correctiveActions: string | null;
        lockoutTriggered: boolean;
        nextInspectionDate: Date | null;
    }>;
    listDue(companyId?: number, withinDays?: number): Promise<{
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
            items: Prisma.JsonValue;
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
        checklist: Prisma.JsonValue | null;
        passed: boolean | null;
        completedAt: Date | null;
        signature: string | null;
        meterReading: number | null;
        photos: Prisma.JsonValue | null;
        correctiveActions: string | null;
        lockoutTriggered: boolean;
        nextInspectionDate: Date | null;
    }[]>;
    notifyDueInspections(companyId?: number, withinDays?: number): Promise<{
        notified: number;
        equipmentCount: number;
    }>;
    private computeNextInspectionDate;
    private syncWorkerWallet;
    private notifyInspectionFailed;
}
