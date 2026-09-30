import type { VisionAnalysisInput, VisionAnalysisResult } from "../types";
import { OcrEngine } from "../engines/ocr-engine";
import { DocumentLayoutAnalyzer } from "../engines/layout-analyzer";
import { CertificateStructureAnalyzer } from "../engines/certificate-analyzer";
import { FormFieldExtractionEngine } from "../engines/form-field-extractor";
import { FraudDetectionEngine } from "../engines/fraud-detection";
import { AutoMappingEngine } from "../engines/auto-mapping";
import { AutoValidationEngine } from "../engines/auto-validation";
import { VisionSummarizationEngine } from "../engines/summarization";
import { EquipmentPlateReader, ImageClassificationEngine } from "../engines/visual-detectors";
export type PipelineEngines = {
    ocr: OcrEngine;
    layout: DocumentLayoutAnalyzer;
    certificate: CertificateStructureAnalyzer;
    form: FormFieldExtractionEngine;
    fraud: FraudDetectionEngine;
    mapping: AutoMappingEngine;
    validation: AutoValidationEngine;
    summarize: VisionSummarizationEngine;
    plate: EquipmentPlateReader;
    classify: ImageClassificationEngine;
};
export declare function runDocumentPipeline(input: VisionAnalysisInput, engines: PipelineEngines): Promise<VisionAnalysisResult>;
//# sourceMappingURL=document-pipeline.d.ts.map