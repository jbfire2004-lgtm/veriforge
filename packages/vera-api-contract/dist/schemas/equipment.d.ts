import { z } from 'zod';
export declare const EquipmentSafetyStatusSchema: z.ZodEnum<["OK", "NEEDS_INSPECTION", "UNSAFE"]>;
export declare const LinkComplianceStatusSchema: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
export declare const EquipmentLockoutStatusSchema: z.ZodEnum<["CLEAR", "LOCKED_OUT"]>;
export declare const EquipmentMaintenanceTypeSchema: z.ZodEnum<["PREVENTIVE", "CORRECTIVE", "SCHEDULED", "EMERGENCY"]>;
export declare const EquipmentAttachmentTypeSchema: z.ZodEnum<["PHOTO", "MANUAL", "CERTIFICATE", "INSPECTION_REPORT", "OTHER"]>;
export declare const CreateEquipmentBodySchema: z.ZodObject<{
    name: z.ZodString;
    serialNumber: z.ZodOptional<z.ZodString>;
    assetTag: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodNumber>;
    categoryId: z.ZodOptional<z.ZodNumber>;
    typeId: z.ZodOptional<z.ZodNumber>;
    safetyStatus: z.ZodOptional<z.ZodEnum<["OK", "NEEDS_INSPECTION", "UNSAFE"]>>;
    photoUrl: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    manufacturer: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    yearMade: z.ZodOptional<z.ZodNumber>;
    catalogCategory: z.ZodOptional<z.ZodEnum<["MOBILE_EQUIPMENT", "SAFETY_CRITICAL", "SERIALIZED_TOOLS", "OTHER"]>>;
    catalogTypeKey: z.ZodOptional<z.ZodString>;
    meterHours: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    companyId?: number | undefined;
    catalogTypeKey?: string | undefined;
    serialNumber?: string | undefined;
    assetTag?: string | undefined;
    categoryId?: number | undefined;
    typeId?: number | undefined;
    safetyStatus?: "OK" | "NEEDS_INSPECTION" | "UNSAFE" | undefined;
    photoUrl?: string | undefined;
    description?: string | undefined;
    manufacturer?: string | undefined;
    model?: string | undefined;
    yearMade?: number | undefined;
    catalogCategory?: "MOBILE_EQUIPMENT" | "OTHER" | "SAFETY_CRITICAL" | "SERIALIZED_TOOLS" | undefined;
    meterHours?: number | undefined;
}, {
    name: string;
    companyId?: number | undefined;
    catalogTypeKey?: string | undefined;
    serialNumber?: string | undefined;
    assetTag?: string | undefined;
    categoryId?: number | undefined;
    typeId?: number | undefined;
    safetyStatus?: "OK" | "NEEDS_INSPECTION" | "UNSAFE" | undefined;
    photoUrl?: string | undefined;
    description?: string | undefined;
    manufacturer?: string | undefined;
    model?: string | undefined;
    yearMade?: number | undefined;
    catalogCategory?: "MOBILE_EQUIPMENT" | "OTHER" | "SAFETY_CRITICAL" | "SERIALIZED_TOOLS" | undefined;
    meterHours?: number | undefined;
}>;
export declare const UpdateEquipmentBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    assetTag: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    companyId: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    categoryId: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    typeId: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    safetyStatus: z.ZodOptional<z.ZodOptional<z.ZodEnum<["OK", "NEEDS_INSPECTION", "UNSAFE"]>>>;
    photoUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    manufacturer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    model: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    yearMade: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    catalogCategory: z.ZodOptional<z.ZodOptional<z.ZodEnum<["MOBILE_EQUIPMENT", "SAFETY_CRITICAL", "SERIALIZED_TOOLS", "OTHER"]>>>;
    catalogTypeKey: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meterHours: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    companyId?: number | undefined;
    name?: string | undefined;
    catalogTypeKey?: string | undefined;
    serialNumber?: string | undefined;
    assetTag?: string | undefined;
    categoryId?: number | undefined;
    typeId?: number | undefined;
    safetyStatus?: "OK" | "NEEDS_INSPECTION" | "UNSAFE" | undefined;
    photoUrl?: string | undefined;
    description?: string | undefined;
    manufacturer?: string | undefined;
    model?: string | undefined;
    yearMade?: number | undefined;
    catalogCategory?: "MOBILE_EQUIPMENT" | "OTHER" | "SAFETY_CRITICAL" | "SERIALIZED_TOOLS" | undefined;
    meterHours?: number | undefined;
}, {
    companyId?: number | undefined;
    name?: string | undefined;
    catalogTypeKey?: string | undefined;
    serialNumber?: string | undefined;
    assetTag?: string | undefined;
    categoryId?: number | undefined;
    typeId?: number | undefined;
    safetyStatus?: "OK" | "NEEDS_INSPECTION" | "UNSAFE" | undefined;
    photoUrl?: string | undefined;
    description?: string | undefined;
    manufacturer?: string | undefined;
    model?: string | undefined;
    yearMade?: number | undefined;
    catalogCategory?: "MOBILE_EQUIPMENT" | "OTHER" | "SAFETY_CRITICAL" | "SERIALIZED_TOOLS" | undefined;
    meterHours?: number | undefined;
}>;
export declare const EquipmentComplianceSnapshotSchema: z.ZodObject<{
    complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
    lastInspectionAt: z.ZodNullable<z.ZodString>;
    nextInspectionAt: z.ZodNullable<z.ZodString>;
    lockoutStatus: z.ZodEnum<["CLEAR", "LOCKED_OUT"]>;
    competencyRequired: z.ZodBoolean;
    trainingRequired: z.ZodBoolean;
    complianceUpdatedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    lastInspectionAt: string | null;
    nextInspectionAt: string | null;
    lockoutStatus: "LOCKED_OUT" | "CLEAR";
    competencyRequired: boolean;
    trainingRequired: boolean;
    complianceUpdatedAt: string | null;
}, {
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    lastInspectionAt: string | null;
    nextInspectionAt: string | null;
    lockoutStatus: "LOCKED_OUT" | "CLEAR";
    competencyRequired: boolean;
    trainingRequired: boolean;
    complianceUpdatedAt: string | null;
}>;
export declare const EquipmentDetailSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    serialNumber: z.ZodNullable<z.ZodString>;
    assetTag: z.ZodNullable<z.ZodString>;
    qrToken: z.ZodNullable<z.ZodString>;
    safetyStatus: z.ZodEnum<["OK", "NEEDS_INSPECTION", "UNSAFE"]>;
    isLockedOut: z.ZodBoolean;
    isSafe: z.ZodBoolean;
    companyId: z.ZodNullable<z.ZodNumber>;
    complianceStatus: z.ZodOptional<z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>>;
    lastInspectionAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    nextInspectionAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lockoutStatus: z.ZodOptional<z.ZodEnum<["CLEAR", "LOCKED_OUT"]>>;
    competencyRequired: z.ZodOptional<z.ZodBoolean>;
    trainingRequired: z.ZodOptional<z.ZodBoolean>;
    complianceUpdatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    activeCompanyLink: z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        companyId: z.ZodNumber;
        active: z.ZodBoolean;
        complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
    }, "strip", z.ZodTypeAny, {
        companyId: number;
        id: number;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    }, {
        companyId: number;
        id: number;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    }>>;
}, "strip", z.ZodTypeAny, {
    companyId: number | null;
    id: number;
    name: string;
    serialNumber: string | null;
    assetTag: string | null;
    safetyStatus: "OK" | "NEEDS_INSPECTION" | "UNSAFE";
    qrToken: string | null;
    isLockedOut: boolean;
    isSafe: boolean;
    activeCompanyLink: {
        companyId: number;
        id: number;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    } | null;
    complianceStatus?: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | undefined;
    lastInspectionAt?: string | null | undefined;
    nextInspectionAt?: string | null | undefined;
    lockoutStatus?: "LOCKED_OUT" | "CLEAR" | undefined;
    competencyRequired?: boolean | undefined;
    trainingRequired?: boolean | undefined;
    complianceUpdatedAt?: string | null | undefined;
}, {
    companyId: number | null;
    id: number;
    name: string;
    serialNumber: string | null;
    assetTag: string | null;
    safetyStatus: "OK" | "NEEDS_INSPECTION" | "UNSAFE";
    qrToken: string | null;
    isLockedOut: boolean;
    isSafe: boolean;
    activeCompanyLink: {
        companyId: number;
        id: number;
        active: boolean;
        complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    } | null;
    complianceStatus?: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT" | undefined;
    lastInspectionAt?: string | null | undefined;
    nextInspectionAt?: string | null | undefined;
    lockoutStatus?: "LOCKED_OUT" | "CLEAR" | undefined;
    competencyRequired?: boolean | undefined;
    trainingRequired?: boolean | undefined;
    complianceUpdatedAt?: string | null | undefined;
}>;
export declare const AssignProjectBodySchema: z.ZodObject<{
    projectId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    projectId: number;
}, {
    projectId: number;
}>;
export declare const AssignWorkerBodySchema: z.ZodObject<{
    workerId: z.ZodNumber;
    companyId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    workerId: number;
    companyId?: number | undefined;
}, {
    workerId: number;
    companyId?: number | undefined;
}>;
export declare const LockoutBodySchema: z.ZodObject<{
    reason: z.ZodString;
    companyId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    companyId?: number | undefined;
}, {
    reason: string;
    companyId?: number | undefined;
}>;
export declare const UnlockBodySchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const MaintenanceBodySchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["PREVENTIVE", "CORRECTIVE", "SCHEDULED", "EMERGENCY"]>>;
    performedAt: z.ZodOptional<z.ZodString>;
    performedBy: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    nextDueAt: z.ZodOptional<z.ZodString>;
    meterHours: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: "SCHEDULED" | "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY" | undefined;
    notes?: string | undefined;
    meterHours?: number | undefined;
    performedAt?: string | undefined;
    performedBy?: number | undefined;
    nextDueAt?: string | undefined;
}, {
    type?: "SCHEDULED" | "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY" | undefined;
    notes?: string | undefined;
    meterHours?: number | undefined;
    performedAt?: string | undefined;
    performedBy?: number | undefined;
    nextDueAt?: string | undefined;
}>;
export declare const CalibrationBodySchema: z.ZodObject<{
    calibratedAt: z.ZodOptional<z.ZodString>;
    calibratedBy: z.ZodOptional<z.ZodNumber>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    passed: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    passed?: boolean | undefined;
    notes?: string | undefined;
    expiresAt?: string | undefined;
    calibratedAt?: string | undefined;
    calibratedBy?: number | undefined;
    certificateNumber?: string | undefined;
}, {
    passed?: boolean | undefined;
    notes?: string | undefined;
    expiresAt?: string | undefined;
    calibratedAt?: string | undefined;
    calibratedBy?: number | undefined;
    certificateNumber?: string | undefined;
}>;
export declare const ScanEquipmentQrBodySchema: z.ZodObject<{
    qrToken: z.ZodString;
    companyId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    companyId: number;
    qrToken: string;
}, {
    companyId: number;
    qrToken: string;
}>;
export declare const EquipmentDashboardSchema: z.ZodObject<{
    total: z.ZodNumber;
    lockedOut: z.ZodNumber;
    nonCompliant: z.ZodNumber;
    needsInspection: z.ZodNumber;
    recent: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    recent: unknown[];
    total: number;
    lockedOut: number;
    nonCompliant: number;
    needsInspection: number;
}, {
    recent: unknown[];
    total: number;
    lockedOut: number;
    nonCompliant: number;
    needsInspection: number;
}>;
export declare const EquipmentTimelineEventSchema: z.ZodObject<{
    at: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    detail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    at: string;
    title: string;
    detail?: string | undefined;
}, {
    type: string;
    at: string;
    title: string;
    detail?: string | undefined;
}>;
export declare const EquipmentWalletResponseSchema: z.ZodObject<{
    type: z.ZodLiteral<"equipment">;
    equipmentId: z.ZodNumber;
    qrToken: z.ZodString;
    complianceStatus: z.ZodEnum<["COMPLIANT", "NEEDS_ATTENTION", "NON_COMPLIANT", "LOCKED_OUT"]>;
    lockedOut: z.ZodBoolean;
    lockoutReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "equipment";
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    qrToken: string;
    lockedOut: boolean;
    lockoutReason?: string | null | undefined;
}, {
    type: "equipment";
    equipmentId: number;
    complianceStatus: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT" | "LOCKED_OUT";
    qrToken: string;
    lockedOut: boolean;
    lockoutReason?: string | null | undefined;
}>;
