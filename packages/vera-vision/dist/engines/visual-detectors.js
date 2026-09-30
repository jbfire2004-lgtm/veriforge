"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageClassificationEngine = exports.EquipmentPlateReader = exports.PpeLabelDetectionEngine = exports.SerialNumberDetectionEngine = exports.BarcodeQrDetectionEngine = exports.StampSealDetectionEngine = exports.SignatureDetectionEngine = void 0;
exports.runVisualDetection = runVisualDetection;
const patterns_1 = require("../utils/patterns");
class SignatureDetectionEngine {
    detect(text, hint) {
        if (hint)
            return 1;
        const matches = text.match(/signature|signed\s+by|authorized\s+by/gi);
        return matches?.length ?? 0;
    }
}
exports.SignatureDetectionEngine = SignatureDetectionEngine;
class StampSealDetectionEngine {
    detect(text, hint) {
        if (hint)
            return 1;
        return /seal|stamp|notary|certified\s+true\s+copy/i.test(text) ? 1 : 0;
    }
}
exports.StampSealDetectionEngine = StampSealDetectionEngine;
class BarcodeQrDetectionEngine {
    detect(text, hints) {
        let qr = hints?.qr ? 1 : 0;
        let barcodes = hints?.barcode ? 1 : 0;
        if (/QR[\s-]?Code|qrcode/i.test(text))
            qr += 1;
        if (/barcode|UPC|EAN|Code\s*128/i.test(text))
            barcodes += 1;
        return { barcodes, qrCodes: qr };
    }
}
exports.BarcodeQrDetectionEngine = BarcodeQrDetectionEngine;
class SerialNumberDetectionEngine {
    detect(text) {
        const found = new Set();
        for (const re of patterns_1.SERIAL_PATTERNS) {
            const m = text.match(re);
            if (m?.[1])
                found.add(m[1].trim());
        }
        return [...found];
    }
}
exports.SerialNumberDetectionEngine = SerialNumberDetectionEngine;
class PpeLabelDetectionEngine {
    detect(text) {
        const tags = [];
        if (/expir(y|es|ation)/i.test(text))
            tags.push("expiry_label");
        if (/CSA|ANSI|CE\b/i.test(text))
            tags.push("rating_label");
        if (/hard\s*hat|safety\s*glasses|hi-vis|harness/i.test(text))
            tags.push("ppe_type");
        return tags;
    }
}
exports.PpeLabelDetectionEngine = PpeLabelDetectionEngine;
class EquipmentPlateReader {
    read(text) {
        const fields = [];
        const mfr = text.match(/manufacturer[:\s]+(.+)/i);
        if (mfr)
            fields.push({ key: "manufacturer", value: mfr[1].trim() });
        const model = text.match(/model[:\s#]+(.+)/i);
        if (model)
            fields.push({ key: "model", value: model[1].trim() });
        const load = text.match(/(?:load|rated)\s*capacity[:\s]+(.+)/i);
        if (load)
            fields.push({ key: "loadRating", value: load[1].trim() });
        const serials = new SerialNumberDetectionEngine().detect(text);
        if (serials[0])
            fields.push({ key: "serialNumber", value: serials[0] });
        return fields.map((f) => ({ ...f, confidence: 0.8, source: "plate-ocr" }));
    }
}
exports.EquipmentPlateReader = EquipmentPlateReader;
class ImageClassificationEngine {
    classify(documentType, text, hints) {
        const tags = [];
        if (hints?.hazards?.length)
            tags.push(...hints.hazards);
        if (hints?.damageTypes?.length)
            tags.push(...hints.damageTypes);
        const hazardWords = [
            { tag: "crack", re: /crack|fracture/i },
            { tag: "leak", re: /leak|fluid/i },
            { tag: "rust", re: /rust|corrosion/i },
            { tag: "missing_guard", re: /missing\s+guard|unguarded/i },
            { tag: "damaged_ppe", re: /damaged\s+ppe|torn\s+harness/i },
            { tag: "unsafe_condition", re: /unsafe|hazard|violation/i },
        ];
        for (const h of hazardWords) {
            if (h.re.test(text))
                tags.push(h.tag);
        }
        return {
            category: documentType,
            tags: [...new Set(tags)],
            confidence: tags.length ? 0.72 : 0.5,
        };
    }
}
exports.ImageClassificationEngine = ImageClassificationEngine;
function runVisualDetection(ocr, hints) {
    const text = ocr.fullText;
    const sig = new SignatureDetectionEngine().detect(text, hints?.hasSignature);
    const stamp = new StampSealDetectionEngine().detect(text, hints?.hasStamp);
    const codes = new BarcodeQrDetectionEngine().detect(text, {
        qr: hints?.hasQr,
        barcode: hints?.hasBarcode,
    });
    const serials = new SerialNumberDetectionEngine().detect(text);
    const ppe = new PpeLabelDetectionEngine().detect(text);
    const hazards = [
        ...(hints?.hazards ?? []),
        ...new ImageClassificationEngine().classify("inspection", text, { hazards: hints?.hazards }).tags,
    ];
    return {
        signatures: sig,
        stamps: stamp,
        barcodes: codes.barcodes,
        qrCodes: codes.qrCodes,
        serialNumbers: serials,
        hazards: [...new Set(hazards)],
        ppeLabels: ppe,
    };
}
//# sourceMappingURL=visual-detectors.js.map