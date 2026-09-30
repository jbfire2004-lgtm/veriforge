"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDocumentPipeline = runDocumentPipeline;
const visual_detectors_1 = require("../engines/visual-detectors");
const TYPE_TO_MODULE = {
    training_certificate: "training",
    inspection_form: "inspection",
    equipment_plate: "equipment",
    worker_id: "worker",
    union_card: "worker",
    operator_card: "worker",
    provider_approval: "provider",
    instructor_qualification: "provider",
    project_safety_form: "project",
    ppe_label: "equipment",
    generic: "dashboard",
};
async function runDocumentPipeline(input, engines) {
    const ocr = await engines.ocr.extract({
        text: input.ocrText,
        blocks: input.ocrBlocks,
    });
    const layout = engines.layout.analyze(ocr);
    let fields = extractFieldsForType(input.documentType, ocr, engines);
    const visual = (0, visual_detectors_1.runVisualDetection)(ocr, input.imageHints);
    const fraud = engines.fraud.analyze(ocr.fullText, fields);
    const mappings = engines.mapping.map(fields, input);
    const validation = engines.validation.validate(input.documentType, fields, mappings);
    const classification = engines.classify.classify(input.documentType, ocr.fullText, { hazards: input.imageHints?.hazards, damageTypes: input.imageHints?.damageTypes });
    const summary = engines.summarize.summarize(labelForType(input.documentType), fields, fraud, mappings, validation.standards.length ? [`Standards: ${validation.standards.join(", ")}`] : undefined);
    const reviewRequired = fraud.score >= 40 ||
        !validation.valid ||
        mappings.length === 0 ||
        ocr.engine === "image-pending";
    return {
        documentType: input.documentType,
        module: TYPE_TO_MODULE[input.documentType],
        ocr,
        fields,
        layout: { sections: layout.sections, formFields: layout.formFields },
        fraud,
        mappings,
        validation,
        summary,
        classification,
        visual: {
            signatures: visual.signatures,
            stamps: visual.stamps,
            barcodes: visual.barcodes,
            qrCodes: visual.qrCodes,
            serialNumbers: visual.serialNumbers,
            hazards: visual.hazards,
        },
        reviewRequired,
        generatedAt: new Date().toISOString(),
    };
}
function extractFieldsForType(type, ocr, engines) {
    switch (type) {
        case "training_certificate":
        case "provider_approval":
        case "instructor_qualification":
            return engines.certificate.extractFields(ocr.fullText);
        case "equipment_plate":
        case "ppe_label":
            return engines.plate.read(ocr.fullText);
        case "inspection_form":
        case "project_safety_form":
            return [
                ...engines.certificate.extractFields(ocr.fullText),
                ...engines.form.extract({ fullText: ocr.fullText, blocks: [], engine: "merge" }),
            ];
        default:
            return [
                ...engines.certificate.extractFields(ocr.fullText),
                ...engines.form.extract({ fullText: ocr.fullText, blocks: [], engine: "merge" }),
            ];
    }
}
function labelForType(type) {
    return type.replace(/_/g, " ");
}
//# sourceMappingURL=document-pipeline.js.map