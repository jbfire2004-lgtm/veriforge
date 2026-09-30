import { z } from 'zod';
export declare const EquipmentWalletQrSchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    equipmentName: z.ZodString;
    serialNumber: z.ZodNullable<z.ZodString>;
    assetTag: z.ZodNullable<z.ZodString>;
    qrToken: z.ZodString;
    qrContent: z.ZodString;
    scanUrl: z.ZodString;
    verifyUrl: z.ZodString;
    walletUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    serialNumber: string | null;
    assetTag: string | null;
    qrToken: string;
    equipmentName: string;
    qrContent: string;
    scanUrl: string;
    verifyUrl: string;
    walletUrl: string;
}, {
    equipmentId: number;
    serialNumber: string | null;
    assetTag: string | null;
    qrToken: string;
    equipmentName: string;
    qrContent: string;
    scanUrl: string;
    verifyUrl: string;
    walletUrl: string;
}>;
export declare const EquipmentWalletInspectionSchema: z.ZodObject<{
    id: z.ZodNumber;
    inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
    kind: z.ZodEnum<["PRE_USE", "FORMAL"]>;
    passed: z.ZodNullable<z.ZodBoolean>;
    status: z.ZodString;
    lockoutTriggered: z.ZodBoolean;
    completedAt: z.ZodNullable<z.ZodString>;
    nextInspectionDate: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    worker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        firstName: z.ZodString;
        lastName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        id: number;
    }, {
        firstName: string;
        lastName: string;
        id: number;
    }>>>;
    inspectorId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    checklistName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: string;
    id: number;
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    createdAt: string;
    kind: "PRE_USE" | "FORMAL";
    passed: boolean | null;
    lockoutTriggered: boolean;
    nextInspectionDate: string | null;
    completedAt: string | null;
    inspectorId?: number | null | undefined;
    worker?: {
        firstName: string;
        lastName: string;
        id: number;
    } | null | undefined;
    checklistName?: string | undefined;
}, {
    status: string;
    id: number;
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    createdAt: string;
    kind: "PRE_USE" | "FORMAL";
    passed: boolean | null;
    lockoutTriggered: boolean;
    nextInspectionDate: string | null;
    completedAt: string | null;
    inspectorId?: number | null | undefined;
    worker?: {
        firstName: string;
        lastName: string;
        id: number;
    } | null | undefined;
    checklistName?: string | undefined;
}>;
export declare const EquipmentWalletComplianceSchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
    linkComplianceStatus: z.ZodNullable<z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>>;
    lastInspectionAt: z.ZodNullable<z.ZodString>;
    nextInspectionAt: z.ZodNullable<z.ZodString>;
    lockoutStatus: z.ZodEnum<["CLEAR", "LOCKED_OUT"]>;
    lockedOut: z.ZodBoolean;
    lockoutReason: z.ZodNullable<z.ZodString>;
    safetyStatus: z.ZodString;
    competencyRequired: z.ZodBoolean;
    trainingRequired: z.ZodBoolean;
    complianceUpdatedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    safetyStatus: string;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    lastInspectionAt: string | null;
    nextInspectionAt: string | null;
    lockoutStatus: "LOCKED_OUT" | "CLEAR";
    competencyRequired: boolean;
    trainingRequired: boolean;
    complianceUpdatedAt: string | null;
    lockedOut: boolean;
    lockoutReason: string | null;
    linkComplianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | null;
}, {
    equipmentId: number;
    safetyStatus: string;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    lastInspectionAt: string | null;
    nextInspectionAt: string | null;
    lockoutStatus: "LOCKED_OUT" | "CLEAR";
    competencyRequired: boolean;
    trainingRequired: boolean;
    complianceUpdatedAt: string | null;
    lockedOut: boolean;
    lockoutReason: string | null;
    linkComplianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | null;
}>;
export declare const EquipmentWalletFullSchema: z.ZodObject<{
    type: z.ZodLiteral<"equipment">;
    equipment: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        serialNumber: z.ZodNullable<z.ZodString>;
        assetTag: z.ZodNullable<z.ZodString>;
        catalogTypeKey: z.ZodNullable<z.ZodString>;
        photoUrl: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        catalogTypeKey: string | null;
        serialNumber: string | null;
        assetTag: string | null;
        photoUrl: string | null;
    }, {
        id: number;
        name: string;
        catalogTypeKey: string | null;
        serialNumber: string | null;
        assetTag: string | null;
        photoUrl: string | null;
    }>;
    qr: z.ZodObject<{
        equipmentId: z.ZodNumber;
        equipmentName: z.ZodString;
        serialNumber: z.ZodNullable<z.ZodString>;
        assetTag: z.ZodNullable<z.ZodString>;
        qrToken: z.ZodString;
        qrContent: z.ZodString;
        scanUrl: z.ZodString;
        verifyUrl: z.ZodString;
        walletUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        equipmentId: number;
        serialNumber: string | null;
        assetTag: string | null;
        qrToken: string;
        equipmentName: string;
        qrContent: string;
        scanUrl: string;
        verifyUrl: string;
        walletUrl: string;
    }, {
        equipmentId: number;
        serialNumber: string | null;
        assetTag: string | null;
        qrToken: string;
        equipmentName: string;
        qrContent: string;
        scanUrl: string;
        verifyUrl: string;
        walletUrl: string;
    }>;
    inspections: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
        kind: z.ZodEnum<["PRE_USE", "FORMAL"]>;
        passed: z.ZodNullable<z.ZodBoolean>;
        status: z.ZodString;
        lockoutTriggered: z.ZodBoolean;
        completedAt: z.ZodNullable<z.ZodString>;
        nextInspectionDate: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        worker: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodNumber;
            firstName: z.ZodString;
            lastName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            firstName: string;
            lastName: string;
            id: number;
        }, {
            firstName: string;
            lastName: string;
            id: number;
        }>>>;
        inspectorId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        checklistName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        id: number;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        kind: "PRE_USE" | "FORMAL";
        passed: boolean | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        inspectorId?: number | null | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | null | undefined;
        checklistName?: string | undefined;
    }, {
        status: string;
        id: number;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        kind: "PRE_USE" | "FORMAL";
        passed: boolean | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        inspectorId?: number | null | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | null | undefined;
        checklistName?: string | undefined;
    }>, "many">;
    competency: z.ZodUnknown;
    assignedWorkers: z.ZodArray<z.ZodUnknown, "many">;
    assignedProjects: z.ZodArray<z.ZodUnknown, "many">;
    compliance: z.ZodObject<{
        equipmentId: z.ZodNumber;
        complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
        linkComplianceStatus: z.ZodNullable<z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>>;
        lastInspectionAt: z.ZodNullable<z.ZodString>;
        nextInspectionAt: z.ZodNullable<z.ZodString>;
        lockoutStatus: z.ZodEnum<["CLEAR", "LOCKED_OUT"]>;
        lockedOut: z.ZodBoolean;
        lockoutReason: z.ZodNullable<z.ZodString>;
        safetyStatus: z.ZodString;
        competencyRequired: z.ZodBoolean;
        trainingRequired: z.ZodBoolean;
        complianceUpdatedAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        equipmentId: number;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: string | null;
        lockedOut: boolean;
        lockoutReason: string | null;
        linkComplianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | null;
    }, {
        equipmentId: number;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: string | null;
        lockedOut: boolean;
        lockoutReason: string | null;
        linkComplianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | null;
    }>;
    trainingRequirements: z.ZodArray<z.ZodUnknown, "many">;
    maintenance: z.ZodOptional<z.ZodObject<{
        equipmentId: z.ZodNumber;
        maintenanceSchedules: z.ZodArray<z.ZodUnknown, "many">;
        calibrationSchedules: z.ZodArray<z.ZodUnknown, "many">;
        maintenanceRecords: z.ZodArray<z.ZodUnknown, "many">;
        calibrationRecords: z.ZodArray<z.ZodUnknown, "many">;
        nextMaintenanceDue: z.ZodNullable<z.ZodString>;
        nextCalibrationDue: z.ZodNullable<z.ZodString>;
        maintenanceOverdue: z.ZodBoolean;
        calibrationOverdue: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        equipmentId: number;
        maintenanceOverdue: boolean;
        calibrationOverdue: boolean;
        maintenanceSchedules: unknown[];
        calibrationSchedules: unknown[];
        maintenanceRecords: unknown[];
        calibrationRecords: unknown[];
        nextMaintenanceDue: string | null;
        nextCalibrationDue: string | null;
    }, {
        equipmentId: number;
        maintenanceOverdue: boolean;
        calibrationOverdue: boolean;
        maintenanceSchedules: unknown[];
        calibrationSchedules: unknown[];
        maintenanceRecords: unknown[];
        calibrationRecords: unknown[];
        nextMaintenanceDue: string | null;
        nextCalibrationDue: string | null;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "equipment";
    equipment: {
        id: number;
        name: string;
        catalogTypeKey: string | null;
        serialNumber: string | null;
        assetTag: string | null;
        photoUrl: string | null;
    };
    qr: {
        equipmentId: number;
        serialNumber: string | null;
        assetTag: string | null;
        qrToken: string;
        equipmentName: string;
        qrContent: string;
        scanUrl: string;
        verifyUrl: string;
        walletUrl: string;
    };
    inspections: {
        status: string;
        id: number;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        kind: "PRE_USE" | "FORMAL";
        passed: boolean | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        inspectorId?: number | null | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | null | undefined;
        checklistName?: string | undefined;
    }[];
    assignedWorkers: unknown[];
    assignedProjects: unknown[];
    compliance: {
        equipmentId: number;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: string | null;
        lockedOut: boolean;
        lockoutReason: string | null;
        linkComplianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | null;
    };
    trainingRequirements: unknown[];
    competency?: unknown;
    maintenance?: {
        equipmentId: number;
        maintenanceOverdue: boolean;
        calibrationOverdue: boolean;
        maintenanceSchedules: unknown[];
        calibrationSchedules: unknown[];
        maintenanceRecords: unknown[];
        calibrationRecords: unknown[];
        nextMaintenanceDue: string | null;
        nextCalibrationDue: string | null;
    } | undefined;
}, {
    type: "equipment";
    equipment: {
        id: number;
        name: string;
        catalogTypeKey: string | null;
        serialNumber: string | null;
        assetTag: string | null;
        photoUrl: string | null;
    };
    qr: {
        equipmentId: number;
        serialNumber: string | null;
        assetTag: string | null;
        qrToken: string;
        equipmentName: string;
        qrContent: string;
        scanUrl: string;
        verifyUrl: string;
        walletUrl: string;
    };
    inspections: {
        status: string;
        id: number;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        kind: "PRE_USE" | "FORMAL";
        passed: boolean | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        inspectorId?: number | null | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | null | undefined;
        checklistName?: string | undefined;
    }[];
    assignedWorkers: unknown[];
    assignedProjects: unknown[];
    compliance: {
        equipmentId: number;
        safetyStatus: string;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
        lastInspectionAt: string | null;
        nextInspectionAt: string | null;
        lockoutStatus: "LOCKED_OUT" | "CLEAR";
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: string | null;
        lockedOut: boolean;
        lockoutReason: string | null;
        linkComplianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | null;
    };
    trainingRequirements: unknown[];
    competency?: unknown;
    maintenance?: {
        equipmentId: number;
        maintenanceOverdue: boolean;
        calibrationOverdue: boolean;
        maintenanceSchedules: unknown[];
        calibrationSchedules: unknown[];
        maintenanceRecords: unknown[];
        calibrationRecords: unknown[];
        nextMaintenanceDue: string | null;
        nextCalibrationDue: string | null;
    } | undefined;
}>;
export declare const ScanEquipmentQrResponseSchema: z.ZodObject<{
    linked: z.ZodBoolean;
    equipmentId: z.ZodNumber;
    companyId: z.ZodNumber;
    linkId: z.ZodNumber;
    complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
    equipmentName: z.ZodNullable<z.ZodString>;
    walletUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    equipmentName: string | null;
    walletUrl: string;
    linked: boolean;
    linkId: number;
}, {
    companyId: number;
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    equipmentName: string | null;
    walletUrl: string;
    linked: boolean;
    linkId: number;
}>;
