import { z } from "zod";
export declare const DocumentTypeSchema: z.ZodEnum<["training_certificate", "inspection_form", "equipment_plate", "worker_id", "union_card", "operator_card", "provider_approval", "instructor_qualification", "project_safety_form", "ppe_label", "generic"]>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export declare const VisionModuleSchema: z.ZodEnum<["training", "inspection", "equipment", "worker", "provider", "project", "offline", "dashboard"]>;
export type VisionModule = z.infer<typeof VisionModuleSchema>;
export type OcrBlock = {
    text: string;
    confidence: number;
    bbox?: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
};
export type OcrResult = {
    fullText: string;
    blocks: OcrBlock[];
    language?: string;
    engine: string;
};
export type ExtractedField = {
    key: string;
    value: string;
    confidence: number;
    source?: string;
};
export type FraudSignal = {
    code: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    confidence: number;
};
export type MappingCandidate = {
    entityType: "worker" | "equipment" | "provider" | "course" | "project" | "company" | "standard";
    entityId?: string;
    label: string;
    score: number;
};
export type VisionAnalysisInput = {
    documentType: DocumentType;
    ocrText?: string;
    ocrBlocks?: OcrBlock[];
    imageHints?: {
        hasSignature?: boolean;
        hasStamp?: boolean;
        hasQr?: boolean;
        hasBarcode?: boolean;
        hazards?: string[];
        damageTypes?: string[];
    };
    candidates?: {
        workers?: {
            id: string;
            name: string;
        }[];
        equipment?: {
            id: string;
            name: string;
            serial?: string;
        }[];
        providers?: {
            id: string;
            name: string;
        }[];
        courses?: {
            id: string;
            name: string;
        }[];
        projects?: {
            id: string;
            name: string;
        }[];
        companies?: {
            id: string;
            name: string;
        }[];
    };
    offline?: boolean;
};
export type VisionAnalysisResult = {
    documentType: DocumentType;
    module: VisionModule;
    ocr: OcrResult;
    fields: ExtractedField[];
    layout: {
        sections: string[];
        formFields: string[];
    };
    fraud: {
        score: number;
        signals: FraudSignal[];
    };
    mappings: MappingCandidate[];
    validation: {
        valid: boolean;
        issues: string[];
        standards: string[];
    };
    summary: {
        text: string;
        bullets: string[];
    };
    classification: {
        category: string;
        tags: string[];
        confidence: number;
    };
    visual: {
        signatures: number;
        stamps: number;
        barcodes: number;
        qrCodes: number;
        serialNumbers: string[];
        hazards: string[];
    };
    reviewRequired: boolean;
    generatedAt: string;
};
export type VisionDashboardBundle = {
    generatedAt: string;
    documentBacklog: number;
    fraudAlerts: number;
    expiredDocuments: number;
    highRiskInspections: number;
    missingDocuments: number;
    autoMapped: number;
    requiresReview: number;
    recent: VisionAnalysisResult[];
};
//# sourceMappingURL=types.d.ts.map