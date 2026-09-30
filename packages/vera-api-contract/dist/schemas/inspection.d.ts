import { z } from 'zod';
export declare const InspectionTypeSchema: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
export declare const InspectionChecklistCategorySchema: z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>;
export declare const ChecklistItemSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    required: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    required?: boolean | undefined;
}, {
    id: string;
    label: string;
    required?: boolean | undefined;
}>;
export declare const InspectionChecklistSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    category: z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>;
    inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        required?: boolean | undefined;
    }, {
        id: string;
        label: string;
        required?: boolean | undefined;
    }>, "many">;
    intervalDays: z.ZodNullable<z.ZodNumber>;
    intervalHours: z.ZodNullable<z.ZodNumber>;
    active: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    items: {
        id: string;
        label: string;
        required?: boolean | undefined;
    }[];
    intervalDays: number | null;
    intervalHours: number | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}, {
    id: number;
    name: string;
    category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    items: {
        id: string;
        label: string;
        required?: boolean | undefined;
    }[];
    intervalDays: number | null;
    intervalHours: number | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}>;
export declare const CreateChecklistBodySchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>;
    inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        required?: boolean | undefined;
    }, {
        id: string;
        label: string;
        required?: boolean | undefined;
    }>, "many">;
    intervalDays: z.ZodOptional<z.ZodNumber>;
    intervalHours: z.ZodOptional<z.ZodNumber>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    items: {
        id: string;
        label: string;
        required?: boolean | undefined;
    }[];
    intervalDays?: number | undefined;
    intervalHours?: number | undefined;
    active?: boolean | undefined;
}, {
    name: string;
    category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    items: {
        id: string;
        label: string;
        required?: boolean | undefined;
    }[];
    intervalDays?: number | undefined;
    intervalHours?: number | undefined;
    active?: boolean | undefined;
}>;
export declare const UpdateChecklistBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>>;
    inspectionType: z.ZodOptional<z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        required: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        required?: boolean | undefined;
    }, {
        id: string;
        label: string;
        required?: boolean | undefined;
    }>, "many">>;
    intervalDays: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    intervalHours: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    active: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    category?: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL" | undefined;
    inspectionType?: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC" | undefined;
    items?: {
        id: string;
        label: string;
        required?: boolean | undefined;
    }[] | undefined;
    intervalDays?: number | undefined;
    intervalHours?: number | undefined;
    active?: boolean | undefined;
}, {
    name?: string | undefined;
    category?: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL" | undefined;
    inspectionType?: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC" | undefined;
    items?: {
        id: string;
        label: string;
        required?: boolean | undefined;
    }[] | undefined;
    intervalDays?: number | undefined;
    intervalHours?: number | undefined;
    active?: boolean | undefined;
}>;
export declare const SubmitInspectionBodySchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    workerId: z.ZodOptional<z.ZodNumber>;
    siteId: z.ZodOptional<z.ZodNumber>;
    checklistId: z.ZodOptional<z.ZodNumber>;
    inspectionType: z.ZodOptional<z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>>;
    kind: z.ZodOptional<z.ZodEnum<["PRE_USE", "FORMAL"]>>;
    checklist: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    passed: z.ZodBoolean;
    photos: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correctiveActions: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    meterReading: z.ZodOptional<z.ZodNumber>;
    signature: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    checklist: Record<string, unknown>;
    passed: boolean;
    workerId?: number | undefined;
    inspectionType?: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC" | undefined;
    siteId?: number | undefined;
    checklistId?: number | undefined;
    kind?: "PRE_USE" | "FORMAL" | undefined;
    photos?: string[] | undefined;
    correctiveActions?: string | undefined;
    notes?: string | undefined;
    meterReading?: number | undefined;
    signature?: string | undefined;
}, {
    equipmentId: number;
    checklist: Record<string, unknown>;
    passed: boolean;
    workerId?: number | undefined;
    inspectionType?: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC" | undefined;
    siteId?: number | undefined;
    checklistId?: number | undefined;
    kind?: "PRE_USE" | "FORMAL" | undefined;
    photos?: string[] | undefined;
    correctiveActions?: string | undefined;
    notes?: string | undefined;
    meterReading?: number | undefined;
    signature?: string | undefined;
}>;
export declare const InspectorSummarySchema: z.ZodObject<{
    id: z.ZodNumber;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    email?: string | null | undefined;
    username?: string | null | undefined;
}, {
    id: number;
    email?: string | null | undefined;
    username?: string | null | undefined;
}>;
export declare const InspectionResponseSchema: z.ZodObject<{
    id: z.ZodNumber;
    equipmentId: z.ZodNullable<z.ZodNumber>;
    workerId: z.ZodNullable<z.ZodNumber>;
    siteId: z.ZodNullable<z.ZodNumber>;
    /** User who performed / signed the inspection (alias of supervisorId). */
    inspectorId: z.ZodNullable<z.ZodNumber>;
    inspector: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }>>>;
    supervisorId: z.ZodNullable<z.ZodNumber>;
    supervisor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }>>>;
    checklistId: z.ZodNullable<z.ZodNumber>;
    kind: z.ZodEnum<["PRE_USE", "FORMAL"]>;
    inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
    checklist: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    passed: z.ZodNullable<z.ZodBoolean>;
    status: z.ZodString;
    photos: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    correctiveActions: z.ZodNullable<z.ZodString>;
    lockoutTriggered: z.ZodBoolean;
    nextInspectionDate: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    meterReading: z.ZodNullable<z.ZodNumber>;
    signature: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    equipment: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        catalogTypeKey: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    }, {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    }>>;
    worker: z.ZodOptional<z.ZodObject<{
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
    }>>;
    checklistTemplate: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        category: z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>;
        inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            required?: boolean | undefined;
        }, {
            id: string;
            label: string;
            required?: boolean | undefined;
        }>, "many">;
        intervalDays: z.ZodNullable<z.ZodNumber>;
        intervalHours: z.ZodNullable<z.ZodNumber>;
        active: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    }, {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    id: number;
    workerId: number | null;
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    createdAt: string;
    equipmentId: number | null;
    siteId: number | null;
    checklistId: number | null;
    kind: "PRE_USE" | "FORMAL";
    checklist: Record<string, unknown> | null;
    passed: boolean | null;
    correctiveActions: string | null;
    notes: string | null;
    meterReading: number | null;
    signature: string | null;
    inspectorId: number | null;
    supervisorId: number | null;
    lockoutTriggered: boolean;
    nextInspectionDate: string | null;
    completedAt: string | null;
    photos?: string[] | null | undefined;
    inspector?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    supervisor?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    equipment?: {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    } | undefined;
    worker?: {
        firstName: string;
        lastName: string;
        id: number;
    } | undefined;
    checklistTemplate?: {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    } | undefined;
}, {
    status: string;
    id: number;
    workerId: number | null;
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    createdAt: string;
    equipmentId: number | null;
    siteId: number | null;
    checklistId: number | null;
    kind: "PRE_USE" | "FORMAL";
    checklist: Record<string, unknown> | null;
    passed: boolean | null;
    correctiveActions: string | null;
    notes: string | null;
    meterReading: number | null;
    signature: string | null;
    inspectorId: number | null;
    supervisorId: number | null;
    lockoutTriggered: boolean;
    nextInspectionDate: string | null;
    completedAt: string | null;
    photos?: string[] | null | undefined;
    inspector?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    supervisor?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    equipment?: {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    } | undefined;
    worker?: {
        firstName: string;
        lastName: string;
        id: number;
    } | undefined;
    checklistTemplate?: {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    } | undefined;
}>;
export declare const InspectionDashboardSchema: z.ZodObject<{
    totalInspections: z.ZodNumber;
    passed: z.ZodNumber;
    failed: z.ZodNumber;
    lockedOutEquipment: z.ZodNumber;
    dueWithin7Days: z.ZodNumber;
    recent: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        equipmentId: z.ZodNullable<z.ZodNumber>;
        workerId: z.ZodNullable<z.ZodNumber>;
        siteId: z.ZodNullable<z.ZodNumber>;
        /** User who performed / signed the inspection (alias of supervisorId). */
        inspectorId: z.ZodNullable<z.ZodNumber>;
        inspector: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodNumber;
            email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        }, {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        }>>>;
        supervisorId: z.ZodNullable<z.ZodNumber>;
        supervisor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodNumber;
            email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        }, {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        }>>>;
        checklistId: z.ZodNullable<z.ZodNumber>;
        kind: z.ZodEnum<["PRE_USE", "FORMAL"]>;
        inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
        checklist: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        passed: z.ZodNullable<z.ZodBoolean>;
        status: z.ZodString;
        photos: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
        correctiveActions: z.ZodNullable<z.ZodString>;
        lockoutTriggered: z.ZodBoolean;
        nextInspectionDate: z.ZodNullable<z.ZodString>;
        notes: z.ZodNullable<z.ZodString>;
        meterReading: z.ZodNullable<z.ZodNumber>;
        signature: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        equipment: z.ZodOptional<z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            catalogTypeKey: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            catalogTypeKey: string | null;
        }, {
            id: number;
            name: string;
            catalogTypeKey: string | null;
        }>>;
        worker: z.ZodOptional<z.ZodObject<{
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
        }>>;
        checklistTemplate: z.ZodOptional<z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
            category: z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>;
            inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
            items: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                required: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                label: string;
                required?: boolean | undefined;
            }, {
                id: string;
                label: string;
                required?: boolean | undefined;
            }>, "many">;
            intervalDays: z.ZodNullable<z.ZodNumber>;
            intervalHours: z.ZodNullable<z.ZodNumber>;
            active: z.ZodBoolean;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
            category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
            inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
            items: {
                id: string;
                label: string;
                required?: boolean | undefined;
            }[];
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            createdAt: string;
            updatedAt: string;
        }, {
            id: number;
            name: string;
            category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
            inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
            items: {
                id: string;
                label: string;
                required?: boolean | undefined;
            }[];
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            createdAt: string;
            updatedAt: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        status: string;
        id: number;
        workerId: number | null;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        kind: "PRE_USE" | "FORMAL";
        checklist: Record<string, unknown> | null;
        passed: boolean | null;
        correctiveActions: string | null;
        notes: string | null;
        meterReading: number | null;
        signature: string | null;
        inspectorId: number | null;
        supervisorId: number | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        photos?: string[] | null | undefined;
        inspector?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        supervisor?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        equipment?: {
            id: number;
            name: string;
            catalogTypeKey: string | null;
        } | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | undefined;
        checklistTemplate?: {
            id: number;
            name: string;
            category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
            inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
            items: {
                id: string;
                label: string;
                required?: boolean | undefined;
            }[];
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            createdAt: string;
            updatedAt: string;
        } | undefined;
    }, {
        status: string;
        id: number;
        workerId: number | null;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        kind: "PRE_USE" | "FORMAL";
        checklist: Record<string, unknown> | null;
        passed: boolean | null;
        correctiveActions: string | null;
        notes: string | null;
        meterReading: number | null;
        signature: string | null;
        inspectorId: number | null;
        supervisorId: number | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        photos?: string[] | null | undefined;
        inspector?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        supervisor?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        equipment?: {
            id: number;
            name: string;
            catalogTypeKey: string | null;
        } | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | undefined;
        checklistTemplate?: {
            id: number;
            name: string;
            category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
            inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
            items: {
                id: string;
                label: string;
                required?: boolean | undefined;
            }[];
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            createdAt: string;
            updatedAt: string;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    passed: number;
    totalInspections: number;
    failed: number;
    lockedOutEquipment: number;
    dueWithin7Days: number;
    recent: {
        status: string;
        id: number;
        workerId: number | null;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        kind: "PRE_USE" | "FORMAL";
        checklist: Record<string, unknown> | null;
        passed: boolean | null;
        correctiveActions: string | null;
        notes: string | null;
        meterReading: number | null;
        signature: string | null;
        inspectorId: number | null;
        supervisorId: number | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        photos?: string[] | null | undefined;
        inspector?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        supervisor?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        equipment?: {
            id: number;
            name: string;
            catalogTypeKey: string | null;
        } | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | undefined;
        checklistTemplate?: {
            id: number;
            name: string;
            category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
            inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
            items: {
                id: string;
                label: string;
                required?: boolean | undefined;
            }[];
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            createdAt: string;
            updatedAt: string;
        } | undefined;
    }[];
}, {
    passed: number;
    totalInspections: number;
    failed: number;
    lockedOutEquipment: number;
    dueWithin7Days: number;
    recent: {
        status: string;
        id: number;
        workerId: number | null;
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        createdAt: string;
        equipmentId: number | null;
        siteId: number | null;
        checklistId: number | null;
        kind: "PRE_USE" | "FORMAL";
        checklist: Record<string, unknown> | null;
        passed: boolean | null;
        correctiveActions: string | null;
        notes: string | null;
        meterReading: number | null;
        signature: string | null;
        inspectorId: number | null;
        supervisorId: number | null;
        lockoutTriggered: boolean;
        nextInspectionDate: string | null;
        completedAt: string | null;
        photos?: string[] | null | undefined;
        inspector?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        supervisor?: {
            id: number;
            email?: string | null | undefined;
            username?: string | null | undefined;
        } | null | undefined;
        equipment?: {
            id: number;
            name: string;
            catalogTypeKey: string | null;
        } | undefined;
        worker?: {
            firstName: string;
            lastName: string;
            id: number;
        } | undefined;
        checklistTemplate?: {
            id: number;
            name: string;
            category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
            inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
            items: {
                id: string;
                label: string;
                required?: boolean | undefined;
            }[];
            intervalDays: number | null;
            intervalHours: number | null;
            active: boolean;
            createdAt: string;
            updatedAt: string;
        } | undefined;
    }[];
}>;
export declare const UnlockEquipmentBodySchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export declare const UnlockEquipmentResponseSchema: z.ZodObject<{
    equipmentId: z.ZodNumber;
    unlocked: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    equipmentId: number;
    unlocked: boolean;
}, {
    equipmentId: number;
    unlocked: boolean;
}>;
export declare const NotifyDueResponseSchema: z.ZodObject<{
    notified: z.ZodNumber;
    equipmentCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    notified: number;
    equipmentCount: number;
}, {
    notified: number;
    equipmentCount: number;
}>;
export declare const DueInspectionListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodNumber;
    equipmentId: z.ZodNullable<z.ZodNumber>;
    workerId: z.ZodNullable<z.ZodNumber>;
    siteId: z.ZodNullable<z.ZodNumber>;
    /** User who performed / signed the inspection (alias of supervisorId). */
    inspectorId: z.ZodNullable<z.ZodNumber>;
    inspector: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }>>>;
    supervisorId: z.ZodNullable<z.ZodNumber>;
    supervisor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        id: z.ZodNumber;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        username: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }, {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    }>>>;
    checklistId: z.ZodNullable<z.ZodNumber>;
    kind: z.ZodEnum<["PRE_USE", "FORMAL"]>;
    inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
    checklist: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    passed: z.ZodNullable<z.ZodBoolean>;
    status: z.ZodString;
    photos: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    correctiveActions: z.ZodNullable<z.ZodString>;
    lockoutTriggered: z.ZodBoolean;
    nextInspectionDate: z.ZodNullable<z.ZodString>;
    notes: z.ZodNullable<z.ZodString>;
    meterReading: z.ZodNullable<z.ZodNumber>;
    signature: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    equipment: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        catalogTypeKey: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    }, {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    }>>;
    worker: z.ZodOptional<z.ZodObject<{
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
    }>>;
    checklistTemplate: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        category: z.ZodEnum<["MOBILE_EQUIPMENT", "LIFTING_GEAR", "VEHICLE", "TOOL", "PME", "CRANE", "GENERAL"]>;
        inspectionType: z.ZodEnum<["PRE_USE", "SCHEDULED", "PME", "CRANE_LIFT", "LIFTING_GEAR", "VEHICLE", "TOOL", "HYDRAULIC_PNEUMATIC"]>;
        items: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            required?: boolean | undefined;
        }, {
            id: string;
            label: string;
            required?: boolean | undefined;
        }>, "many">;
        intervalDays: z.ZodNullable<z.ZodNumber>;
        intervalHours: z.ZodNullable<z.ZodNumber>;
        active: z.ZodBoolean;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    }, {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    id: number;
    workerId: number | null;
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    createdAt: string;
    equipmentId: number | null;
    siteId: number | null;
    checklistId: number | null;
    kind: "PRE_USE" | "FORMAL";
    checklist: Record<string, unknown> | null;
    passed: boolean | null;
    correctiveActions: string | null;
    notes: string | null;
    meterReading: number | null;
    signature: string | null;
    inspectorId: number | null;
    supervisorId: number | null;
    lockoutTriggered: boolean;
    nextInspectionDate: string | null;
    completedAt: string | null;
    photos?: string[] | null | undefined;
    inspector?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    supervisor?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    equipment?: {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    } | undefined;
    worker?: {
        firstName: string;
        lastName: string;
        id: number;
    } | undefined;
    checklistTemplate?: {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    } | undefined;
}, {
    status: string;
    id: number;
    workerId: number | null;
    inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
    createdAt: string;
    equipmentId: number | null;
    siteId: number | null;
    checklistId: number | null;
    kind: "PRE_USE" | "FORMAL";
    checklist: Record<string, unknown> | null;
    passed: boolean | null;
    correctiveActions: string | null;
    notes: string | null;
    meterReading: number | null;
    signature: string | null;
    inspectorId: number | null;
    supervisorId: number | null;
    lockoutTriggered: boolean;
    nextInspectionDate: string | null;
    completedAt: string | null;
    photos?: string[] | null | undefined;
    inspector?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    supervisor?: {
        id: number;
        email?: string | null | undefined;
        username?: string | null | undefined;
    } | null | undefined;
    equipment?: {
        id: number;
        name: string;
        catalogTypeKey: string | null;
    } | undefined;
    worker?: {
        firstName: string;
        lastName: string;
        id: number;
    } | undefined;
    checklistTemplate?: {
        id: number;
        name: string;
        category: "PME" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "MOBILE_EQUIPMENT" | "CRANE" | "GENERAL";
        inspectionType: "PRE_USE" | "SCHEDULED" | "PME" | "CRANE_LIFT" | "LIFTING_GEAR" | "VEHICLE" | "TOOL" | "HYDRAULIC_PNEUMATIC";
        items: {
            id: string;
            label: string;
            required?: boolean | undefined;
        }[];
        intervalDays: number | null;
        intervalHours: number | null;
        active: boolean;
        createdAt: string;
        updatedAt: string;
    } | undefined;
}>, "many">;
