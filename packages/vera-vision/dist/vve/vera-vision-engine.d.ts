import { OcrEngine } from "../engines/ocr-engine";
import { DocumentLayoutAnalyzer } from "../engines/layout-analyzer";
import { CertificateStructureAnalyzer } from "../engines/certificate-analyzer";
import { FormFieldExtractionEngine } from "../engines/form-field-extractor";
import { FraudDetectionEngine } from "../engines/fraud-detection";
import { AutoMappingEngine } from "../engines/auto-mapping";
import { AutoValidationEngine } from "../engines/auto-validation";
import { VisionSummarizationEngine } from "../engines/summarization";
import { EquipmentPlateReader, ImageClassificationEngine } from "../engines/visual-detectors";
import type { VisionAnalysisInput, VisionAnalysisResult, VisionDashboardBundle } from "../types";
/**
 * Vera Vision Engine (VVE) — unified document & image intelligence.
 */
export declare class VeraVisionEngine {
    readonly ocr: OcrEngine;
    readonly layout: DocumentLayoutAnalyzer;
    readonly certificate: CertificateStructureAnalyzer;
    readonly form: FormFieldExtractionEngine;
    readonly fraud: FraudDetectionEngine;
    readonly mapping: AutoMappingEngine;
    readonly validation: AutoValidationEngine;
    readonly summarize: VisionSummarizationEngine;
    readonly plate: EquipmentPlateReader;
    readonly classify: ImageClassificationEngine;
    private readonly pipeline;
    constructor();
    analyze(input: VisionAnalysisInput): Promise<VisionAnalysisResult>;
    analyzeCertificate(input: Omit<VisionAnalysisInput, "documentType">): Promise<VisionAnalysisResult>;
    analyzeInspection(input: Omit<VisionAnalysisInput, "documentType">): Promise<VisionAnalysisResult>;
    analyzeEquipmentPlate(input: Omit<VisionAnalysisInput, "documentType">): Promise<VisionAnalysisResult>;
    analyzeWorkerDocument(input: Omit<VisionAnalysisInput, "documentType"> & {
        subtype?: "worker_id" | "union_card" | "operator_card";
    }): Promise<VisionAnalysisResult>;
    analyzeProviderDocument(input: Omit<VisionAnalysisInput, "documentType"> & {
        subtype?: "provider_approval" | "instructor_qualification";
    }): Promise<VisionAnalysisResult>;
    analyzeProjectForm(input: Omit<VisionAnalysisInput, "documentType">): Promise<VisionAnalysisResult>;
    buildDashboard(recent: VisionAnalysisResult[]): VisionDashboardBundle;
    registerOcrProvider(fn: Parameters<OcrEngine["registerProvider"]>[0]): void;
}
//# sourceMappingURL=vera-vision-engine.d.ts.map