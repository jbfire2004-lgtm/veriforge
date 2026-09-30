"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraVisionEngine = void 0;
const ocr_engine_1 = require("../engines/ocr-engine");
const layout_analyzer_1 = require("../engines/layout-analyzer");
const certificate_analyzer_1 = require("../engines/certificate-analyzer");
const form_field_extractor_1 = require("../engines/form-field-extractor");
const fraud_detection_1 = require("../engines/fraud-detection");
const auto_mapping_1 = require("../engines/auto-mapping");
const auto_validation_1 = require("../engines/auto-validation");
const summarization_1 = require("../engines/summarization");
const visual_detectors_1 = require("../engines/visual-detectors");
const document_pipeline_1 = require("../modules/document-pipeline");
const dashboard_vision_1 = require("../modules/dashboard-vision");
const offline_vision_1 = require("../modules/offline-vision");
/**
 * Vera Vision Engine (VVE) — unified document & image intelligence.
 */
class VeraVisionEngine {
    constructor() {
        this.ocr = new ocr_engine_1.OcrEngine();
        this.layout = new layout_analyzer_1.DocumentLayoutAnalyzer();
        this.certificate = new certificate_analyzer_1.CertificateStructureAnalyzer();
        this.form = new form_field_extractor_1.FormFieldExtractionEngine();
        this.fraud = new fraud_detection_1.FraudDetectionEngine();
        this.mapping = new auto_mapping_1.AutoMappingEngine();
        this.validation = new auto_validation_1.AutoValidationEngine();
        this.summarize = new summarization_1.VisionSummarizationEngine();
        this.plate = new visual_detectors_1.EquipmentPlateReader();
        this.classify = new visual_detectors_1.ImageClassificationEngine();
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
    analyze(input) {
        if (input.offline)
            return (0, offline_vision_1.analyzeOffline)(input, this.pipeline);
        return (0, document_pipeline_1.runDocumentPipeline)(input, this.pipeline);
    }
    analyzeCertificate(input) {
        return this.analyze({ ...input, documentType: "training_certificate" });
    }
    analyzeInspection(input) {
        return this.analyze({ ...input, documentType: "inspection_form" });
    }
    analyzeEquipmentPlate(input) {
        return this.analyze({ ...input, documentType: "equipment_plate" });
    }
    analyzeWorkerDocument(input) {
        const documentType = input.subtype ?? "worker_id";
        return this.analyze({ ...input, documentType });
    }
    analyzeProviderDocument(input) {
        const documentType = input.subtype ?? "provider_approval";
        return this.analyze({ ...input, documentType });
    }
    analyzeProjectForm(input) {
        return this.analyze({ ...input, documentType: "project_safety_form" });
    }
    buildDashboard(recent) {
        return (0, dashboard_vision_1.buildVisionDashboard)(recent);
    }
    registerOcrProvider(fn) {
        this.ocr.registerProvider(fn);
    }
}
exports.VeraVisionEngine = VeraVisionEngine;
//# sourceMappingURL=vera-vision-engine.js.map