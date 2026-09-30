import type { ExtractedField, OcrResult } from "../types";
import { SERIAL_PATTERNS } from "../utils/patterns";

export type VisualDetection = {
  signatures: number;
  stamps: number;
  barcodes: number;
  qrCodes: number;
  serialNumbers: string[];
  hazards: string[];
  ppeLabels: string[];
};

export class SignatureDetectionEngine {
  detect(text: string, hint?: boolean): number {
    if (hint) return 1;
    const matches = text.match(/signature|signed\s+by|authorized\s+by/gi);
    return matches?.length ?? 0;
  }
}

export class StampSealDetectionEngine {
  detect(text: string, hint?: boolean): number {
    if (hint) return 1;
    return /seal|stamp|notary|certified\s+true\s+copy/i.test(text) ? 1 : 0;
  }
}

export class BarcodeQrDetectionEngine {
  detect(text: string, hints?: { qr?: boolean; barcode?: boolean }): { barcodes: number; qrCodes: number } {
    let qr = hints?.qr ? 1 : 0;
    let barcodes = hints?.barcode ? 1 : 0;
    if (/QR[\s-]?Code|qrcode/i.test(text)) qr += 1;
    if (/barcode|UPC|EAN|Code\s*128/i.test(text)) barcodes += 1;
    return { barcodes, qrCodes: qr };
  }
}

export class SerialNumberDetectionEngine {
  detect(text: string): string[] {
    const found = new Set<string>();
    for (const re of SERIAL_PATTERNS) {
      const m = text.match(re);
      if (m?.[1]) found.add(m[1].trim());
    }
    return [...found];
  }
}

export class PpeLabelDetectionEngine {
  detect(text: string): string[] {
    const tags: string[] = [];
    if (/expir(y|es|ation)/i.test(text)) tags.push("expiry_label");
    if (/CSA|ANSI|CE\b/i.test(text)) tags.push("rating_label");
    if (/hard\s*hat|safety\s*glasses|hi-vis|harness/i.test(text)) tags.push("ppe_type");
    return tags;
  }
}

export class EquipmentPlateReader {
  read(text: string): ExtractedField[] {
    const fields: { key: string; value: string }[] = [];
    const mfr = text.match(/manufacturer[:\s]+(.+)/i);
    if (mfr) fields.push({ key: "manufacturer", value: mfr[1]!.trim() });
    const model = text.match(/model[:\s#]+(.+)/i);
    if (model) fields.push({ key: "model", value: model[1]!.trim() });
    const load = text.match(/(?:load|rated)\s*capacity[:\s]+(.+)/i);
    if (load) fields.push({ key: "loadRating", value: load[1]!.trim() });
    const serials = new SerialNumberDetectionEngine().detect(text);
    if (serials[0]) fields.push({ key: "serialNumber", value: serials[0] });
    return fields.map((f) => ({ ...f, confidence: 0.8, source: "plate-ocr" }));
  }
}

export class ImageClassificationEngine {
  classify(
    documentType: string,
    text: string,
    hints?: { hazards?: string[]; damageTypes?: string[] }
  ): { category: string; tags: string[]; confidence: number } {
    const tags: string[] = [];
    if (hints?.hazards?.length) tags.push(...hints.hazards);
    if (hints?.damageTypes?.length) tags.push(...hints.damageTypes);

    const hazardWords = [
      { tag: "crack", re: /crack|fracture/i },
      { tag: "leak", re: /leak|fluid/i },
      { tag: "rust", re: /rust|corrosion/i },
      { tag: "missing_guard", re: /missing\s+guard|unguarded/i },
      { tag: "damaged_ppe", re: /damaged\s+ppe|torn\s+harness/i },
      { tag: "unsafe_condition", re: /unsafe|hazard|violation/i },
    ];
    for (const h of hazardWords) {
      if (h.re.test(text)) tags.push(h.tag);
    }

    return {
      category: documentType,
      tags: [...new Set(tags)],
      confidence: tags.length ? 0.72 : 0.5,
    };
  }
}

export function runVisualDetection(
  ocr: OcrResult,
  hints?: {
    hasSignature?: boolean;
    hasStamp?: boolean;
    hasQr?: boolean;
    hasBarcode?: boolean;
    hazards?: string[];
  }
): VisualDetection {
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
