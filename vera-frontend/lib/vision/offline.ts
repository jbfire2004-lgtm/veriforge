import { VeraVisionEngine } from "@vera/vision";
import type { DocumentType, VisionAnalysisInput } from "@vera/vision";

const engine = new VeraVisionEngine();

export async function analyzeDocumentOffline(
  input: VisionAnalysisInput
) {
  return engine.analyze({ ...input, offline: true });
}

export async function ocrFromText(text: string, documentType: DocumentType) {
  return engine.analyze({
    documentType,
    ocrText: text,
    offline: true,
  });
}
