import { z } from 'zod';
export declare const SafetyFormFieldTypeSchema: z.ZodEnum<["text", "number", "select", "multiselect", "date", "signature", "photo", "hazard", "risk", "energy", "checklist", "table", "location", "project", "worker", "equipment", "textarea", "boolean"]>;
export declare const SafetyFormFieldSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["text", "number", "select", "multiselect", "date", "signature", "photo", "hazard", "risk", "energy", "checklist", "table", "location", "project", "worker", "equipment", "textarea", "boolean"]>;
    label: z.ZodString;
    required: z.ZodOptional<z.ZodBoolean>;
    options: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        value: z.ZodString;
        label: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        label: string;
    }, {
        value: string;
        label: string;
    }>]>, "many">>;
    placeholder: z.ZodOptional<z.ZodString>;
    conditional: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    validation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    defaultValue: z.ZodOptional<z.ZodUnknown>;
    helpText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "number" | "boolean" | "date" | "checklist" | "signature" | "equipment" | "worker" | "text" | "select" | "multiselect" | "photo" | "hazard" | "risk" | "energy" | "table" | "location" | "project" | "textarea";
    id: string;
    label: string;
    options?: (string | {
        value: string;
        label: string;
    })[] | undefined;
    validation?: Record<string, unknown> | undefined;
    required?: boolean | undefined;
    conditional?: Record<string, unknown> | undefined;
    placeholder?: string | undefined;
    defaultValue?: unknown;
    helpText?: string | undefined;
}, {
    type: "number" | "boolean" | "date" | "checklist" | "signature" | "equipment" | "worker" | "text" | "select" | "multiselect" | "photo" | "hazard" | "risk" | "energy" | "table" | "location" | "project" | "textarea";
    id: string;
    label: string;
    options?: (string | {
        value: string;
        label: string;
    })[] | undefined;
    validation?: Record<string, unknown> | undefined;
    required?: boolean | undefined;
    conditional?: Record<string, unknown> | undefined;
    placeholder?: string | undefined;
    defaultValue?: unknown;
    helpText?: string | undefined;
}>;
export declare const SafetyFormDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodString;
    version: z.ZodNumber;
    fields: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["text", "number", "select", "multiselect", "date", "signature", "photo", "hazard", "risk", "energy", "checklist", "table", "location", "project", "worker", "equipment", "textarea", "boolean"]>;
        label: z.ZodString;
        required: z.ZodOptional<z.ZodBoolean>;
        options: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
            value: z.ZodString;
            label: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            label: string;
        }, {
            value: string;
            label: string;
        }>]>, "many">>;
        placeholder: z.ZodOptional<z.ZodString>;
        conditional: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        validation: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        defaultValue: z.ZodOptional<z.ZodUnknown>;
        helpText: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "number" | "boolean" | "date" | "checklist" | "signature" | "equipment" | "worker" | "text" | "select" | "multiselect" | "photo" | "hazard" | "risk" | "energy" | "table" | "location" | "project" | "textarea";
        id: string;
        label: string;
        options?: (string | {
            value: string;
            label: string;
        })[] | undefined;
        validation?: Record<string, unknown> | undefined;
        required?: boolean | undefined;
        conditional?: Record<string, unknown> | undefined;
        placeholder?: string | undefined;
        defaultValue?: unknown;
        helpText?: string | undefined;
    }, {
        type: "number" | "boolean" | "date" | "checklist" | "signature" | "equipment" | "worker" | "text" | "select" | "multiselect" | "photo" | "hazard" | "risk" | "energy" | "table" | "location" | "project" | "textarea";
        id: string;
        label: string;
        options?: (string | {
            value: string;
            label: string;
        })[] | undefined;
        validation?: Record<string, unknown> | undefined;
        required?: boolean | undefined;
        conditional?: Record<string, unknown> | undefined;
        placeholder?: string | undefined;
        defaultValue?: unknown;
        helpText?: string | undefined;
    }>, "many">;
    workflow: z.ZodOptional<z.ZodObject<{
        requiresSupervisor: z.ZodOptional<z.ZodBoolean>;
        autoGenerateCorrectiveActions: z.ZodOptional<z.ZodBoolean>;
        autoFlagSIF: z.ZodOptional<z.ZodBoolean>;
        autoFlagHECA: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        requiresSupervisor?: boolean | undefined;
        autoGenerateCorrectiveActions?: boolean | undefined;
        autoFlagSIF?: boolean | undefined;
        autoFlagHECA?: boolean | undefined;
    }, {
        requiresSupervisor?: boolean | undefined;
        autoGenerateCorrectiveActions?: boolean | undefined;
        autoFlagSIF?: boolean | undefined;
        autoFlagHECA?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    category: string;
    version: number;
    fields: {
        type: "number" | "boolean" | "date" | "checklist" | "signature" | "equipment" | "worker" | "text" | "select" | "multiselect" | "photo" | "hazard" | "risk" | "energy" | "table" | "location" | "project" | "textarea";
        id: string;
        label: string;
        options?: (string | {
            value: string;
            label: string;
        })[] | undefined;
        validation?: Record<string, unknown> | undefined;
        required?: boolean | undefined;
        conditional?: Record<string, unknown> | undefined;
        placeholder?: string | undefined;
        defaultValue?: unknown;
        helpText?: string | undefined;
    }[];
    workflow?: {
        requiresSupervisor?: boolean | undefined;
        autoGenerateCorrectiveActions?: boolean | undefined;
        autoFlagSIF?: boolean | undefined;
        autoFlagHECA?: boolean | undefined;
    } | undefined;
}, {
    id: string;
    name: string;
    category: string;
    version: number;
    fields: {
        type: "number" | "boolean" | "date" | "checklist" | "signature" | "equipment" | "worker" | "text" | "select" | "multiselect" | "photo" | "hazard" | "risk" | "energy" | "table" | "location" | "project" | "textarea";
        id: string;
        label: string;
        options?: (string | {
            value: string;
            label: string;
        })[] | undefined;
        validation?: Record<string, unknown> | undefined;
        required?: boolean | undefined;
        conditional?: Record<string, unknown> | undefined;
        placeholder?: string | undefined;
        defaultValue?: unknown;
        helpText?: string | undefined;
    }[];
    workflow?: {
        requiresSupervisor?: boolean | undefined;
        autoGenerateCorrectiveActions?: boolean | undefined;
        autoFlagSIF?: boolean | undefined;
        autoFlagHECA?: boolean | undefined;
    } | undefined;
}>;
export declare const CreateSafetyFormBodySchema: z.ZodObject<{
    definitionId: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    formData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    companyId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodOptional<z.ZodNumber>;
    siteId: z.ZodOptional<z.ZodNumber>;
    workerId: z.ZodOptional<z.ZodNumber>;
    equipmentId: z.ZodOptional<z.ZodNumber>;
    clientSyncId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    definitionId: string;
    companyId?: number | undefined;
    projectId?: number | undefined;
    workerId?: number | undefined;
    equipmentId?: number | undefined;
    siteId?: number | undefined;
    title?: string | undefined;
    clientSyncId?: string | undefined;
    formData?: Record<string, unknown> | undefined;
}, {
    definitionId: string;
    companyId?: number | undefined;
    projectId?: number | undefined;
    workerId?: number | undefined;
    equipmentId?: number | undefined;
    siteId?: number | undefined;
    title?: string | undefined;
    clientSyncId?: string | undefined;
    formData?: Record<string, unknown> | undefined;
}>;
export declare const SubmitSafetyFormBodySchema: z.ZodObject<{
    formData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    signatures: z.ZodOptional<z.ZodArray<z.ZodObject<{
        fieldId: z.ZodOptional<z.ZodString>;
        signatureData: z.ZodString;
        signerName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        signatureData: string;
        fieldId?: string | undefined;
        signerName?: string | undefined;
    }, {
        signatureData: string;
        fieldId?: string | undefined;
        signerName?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    formData: Record<string, unknown>;
    signatures?: {
        signatureData: string;
        fieldId?: string | undefined;
        signerName?: string | undefined;
    }[] | undefined;
}, {
    formData: Record<string, unknown>;
    signatures?: {
        signatureData: string;
        fieldId?: string | undefined;
        signerName?: string | undefined;
    }[] | undefined;
}>;
export type SafetyFormDefinition = z.infer<typeof SafetyFormDefinitionSchema>;
