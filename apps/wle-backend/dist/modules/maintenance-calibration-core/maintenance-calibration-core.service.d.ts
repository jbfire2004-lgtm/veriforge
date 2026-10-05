import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { CreateCalibrationRecordDto, CreateCalibrationScheduleDto, CreateMaintenanceRecordDto, CreateMaintenanceScheduleDto } from './dto/maintenance-calibration.dto';
export declare class MaintenanceCalibrationCoreService {
    private readonly prisma;
    private readonly compliance;
    constructor(prisma: PrismaService, compliance: EquipmentComplianceService);
    dashboard(companyId?: number): Promise<{
        maintenanceRecordCount: number;
        calibrationRecordCount: number;
        maintenanceDueWithin14Days: number;
        calibrationDueWithin14Days: number;
        maintenanceOverdue: number;
        calibrationOverdue: number;
        recentMaintenance: ({
            equipment: {
                id: number;
                companyId: number;
                name: string;
            };
        } & {
            id: number;
            equipmentId: number;
            type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
            performedAt: Date;
            performedBy: number | null;
            notes: string | null;
            nextDueAt: Date | null;
            meterHours: number | null;
            createdAt: Date;
        })[];
        recentCalibration: ({
            equipment: {
                id: number;
                companyId: number;
                name: string;
            };
        } & {
            id: number;
            equipmentId: number;
            calibratedAt: Date;
            calibratedBy: number | null;
            certificateNumber: string | null;
            expiresAt: Date | null;
            passed: boolean;
            notes: string | null;
            createdAt: Date;
        })[];
    }>;
    listMaintenanceRecords(equipmentId?: number, companyId?: number): Promise<({
        equipment: {
            id: number;
            companyId: number;
            name: string;
        };
    } & {
        id: number;
        equipmentId: number;
        type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
        performedAt: Date;
        performedBy: number | null;
        notes: string | null;
        nextDueAt: Date | null;
        meterHours: number | null;
        createdAt: Date;
    })[]>;
    createMaintenanceRecord(dto: CreateMaintenanceRecordDto, userId?: number): Promise<{
        equipment: {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: Prisma.JsonValue;
            pmSafetyMetadataJson: Prisma.JsonValue;
            deletedAt: Date | null;
        };
    } & {
        id: number;
        equipmentId: number;
        type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
        performedAt: Date;
        performedBy: number | null;
        notes: string | null;
        nextDueAt: Date | null;
        meterHours: number | null;
        createdAt: Date;
    }>;
    listMaintenanceSchedules(equipmentId?: number, companyId?: number): Promise<({
        equipment: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        equipmentId: number;
        type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
        intervalDays: number;
        intervalHours: number | null;
        nextDueAt: Date | null;
        lastPerformedAt: Date | null;
        active: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createMaintenanceSchedule(dto: CreateMaintenanceScheduleDto): Promise<{
        id: number;
        equipmentId: number;
        type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
        intervalDays: number;
        intervalHours: number | null;
        nextDueAt: Date | null;
        lastPerformedAt: Date | null;
        active: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listCalibrationRecords(equipmentId?: number, companyId?: number): Promise<({
        equipment: {
            id: number;
            companyId: number;
            name: string;
        };
    } & {
        id: number;
        equipmentId: number;
        calibratedAt: Date;
        calibratedBy: number | null;
        certificateNumber: string | null;
        expiresAt: Date | null;
        passed: boolean;
        notes: string | null;
        createdAt: Date;
    })[]>;
    createCalibrationRecord(dto: CreateCalibrationRecordDto, userId?: number): Promise<{
        equipment: {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: Prisma.JsonValue;
            pmSafetyMetadataJson: Prisma.JsonValue;
            deletedAt: Date | null;
        };
    } & {
        id: number;
        equipmentId: number;
        calibratedAt: Date;
        calibratedBy: number | null;
        certificateNumber: string | null;
        expiresAt: Date | null;
        passed: boolean;
        notes: string | null;
        createdAt: Date;
    }>;
    listCalibrationSchedules(equipmentId?: number, companyId?: number): Promise<({
        equipment: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        equipmentId: number;
        intervalDays: number;
        nextDueAt: Date | null;
        lastCalibratedAt: Date | null;
        active: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createCalibrationSchedule(dto: CreateCalibrationScheduleDto): Promise<{
        id: number;
        equipmentId: number;
        intervalDays: number;
        nextDueAt: Date | null;
        lastCalibratedAt: Date | null;
        active: boolean;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getEquipmentSummary(equipmentId: number): Promise<{
        equipmentId: number;
        maintenanceSchedules: {
            id: number;
            equipmentId: number;
            type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
            intervalDays: number;
            intervalHours: number | null;
            nextDueAt: Date | null;
            lastPerformedAt: Date | null;
            active: boolean;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        calibrationSchedules: {
            id: number;
            equipmentId: number;
            intervalDays: number;
            nextDueAt: Date | null;
            lastCalibratedAt: Date | null;
            active: boolean;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        maintenanceRecords: {
            id: number;
            equipmentId: number;
            type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
            performedAt: Date;
            performedBy: number | null;
            notes: string | null;
            nextDueAt: Date | null;
            meterHours: number | null;
            createdAt: Date;
        }[];
        calibrationRecords: {
            id: number;
            equipmentId: number;
            calibratedAt: Date;
            calibratedBy: number | null;
            certificateNumber: string | null;
            expiresAt: Date | null;
            passed: boolean;
            notes: string | null;
            createdAt: Date;
        }[];
        nextMaintenanceDue: Date;
        nextCalibrationDue: Date;
        maintenanceOverdue: boolean;
        calibrationOverdue: boolean;
    }>;
    notifyDue(companyId?: number, withinDays?: number): Promise<{
        notified: number;
        equipmentCount: number;
    }>;
    private ensureMaintenanceSchedule;
    private ensureCalibrationSchedule;
    private addDays;
    private assertEquipment;
}
