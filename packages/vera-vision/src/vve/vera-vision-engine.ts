import { OcrEngine } from "../engines/ocr-engine";
import { DocumentLayoutAnalyzer } from "../engines/layout-analyzer";
import { CertificateStructureAnalyzer } from "../engines/certificate-analyzer";
import { FormFieldExtractionEngine } from "../engines/form-field-extractor";
import { FraudDetectionEngine } from "../engines/fraud-detection";
import { AutoMappingEngine } from "../engines/auto-mapping";
import { AutoValidationEngine } from "../engines/auto-validation";
import { VisionSummarizationEngine } from "../engines/summarization";
import { EquipmentPlateReader, ImageClassificationEngine } from "../engines/visual-detectors";
import { runDocumentPipeline, type PipelineEngines } from "../modules/document-pipeline";
import { buildVisionDashboard } from "../modules/dashboard-vision";
import { analyzeOffline } from "../modules/offline-vision";
import type { DocumentType, VisionAnalysisInput, VisionAnalysisResult, VisionDashboardBundle } from "../types";

/**
 * Vera Vision Engine (VVE) — unified document & image intelligence.
 */
export class VeraVisionEngine {
  readonly ocr = new OcrEngine();
  readonly layout = new DocumentLayoutAnalyzer();
  readonly certificate = new CertificateStructureAnalyzer();
  readonly form = new FormFieldExtractionEngine();
  readonly fraud = new FraudDetectionEngine();
  readonly mapping = new AutoMappingEngine();
  readonly validation = new AutoValidationEngine();
  readonly summarize = new VisionSummarizationEngine();
  readonly plate = new EquipmentPlateReader();
  readonly classify = new ImageClassificationEngine();

  private readonly pipeline: PipelineEngines;

  constructor() {
    this.pipeline = {
      ocr: this.ocr,
      layout: this.layout,
      certificate: this.certificate,
      form: this.form,
      fraud: this.fraud,
      mapping: this.mapping,
      validation: this.validation,
      summarize: this.summarize,
      plate: this.plate,
      classify: this.classify,
    };
  }

  analyze(input: VisionAnalysisInput): Promise<VisionAnalysisResult> {
    if (input.offline) return analyzeOffline(input, this.pipeline);
    return runDocumentPipeline(input, this.pipeline);
  }

  analyzeCertificate(input: Omit<VisionAnalysisInput, "documentType">) {
    return this.analyze({ ...input, documentType: "training_certificate" });
  }

  analyzeInspection(input: Omit<VisionAnalysisInput, "documentType">) {
    return this.analyze({ ...input, documentType: "inspection_form" });
  }

  analyzeEquipmentPlate(input: Omit<VisionAnalysisInput, "documentType">) {
    return this.analyze({ ...input, documentType: "equipment_plate" });
  }

  analyzeWorkerDocument(input: Omit<VisionAnalysisInput, "documentType"> & { subtype?: "worker_id" | "union_card" | "operator_card" }) {
    const documentType = input.subtype ?? "worker_id";
    return this.analyze({ ...input, documentType });
  }

  analyzeProviderDocument(input: Omit<VisionAnalysisInput, "documentType"> & { subtype?: "provider_approval" | "instructor_qualification" }) {
    const documentType = input.subtype ?? "provider_approval";
    return this.analyze({ ...input, documentType });
  }

  analyzeProjectForm(input: Omit<VisionAnalysisInput, "documentType">) {
    return this.analyze({ ...input, documentType: "project_safety_form" });
  }

  buildDashboard(recent: VisionAnalysisResult[]): VisionDashboardBundle {
    return buildVisionDashboard(recent);
  }

  registerOcrProvider(fn: Parameters<OcrEngine["registerProvider"]>[0]): void {
    this.ocr.registerProvider(fn);
  }
}
