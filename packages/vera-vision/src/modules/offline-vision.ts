import type { VisionAnalysisInput, VisionAnalysisResult } from "../types";
import { runDocumentPipeline, type PipelineEngines } from "./document-pipeline";

/** Offline vision — same pipeline, marks OCR source as offline-capable */
export async function analyzeOffline(
  input: VisionAnalysisInput,
  engines: PipelineEngines
): Promise<VisionAnalysisResult> {
  const result = await runDocumentPipeline(
    { ...input, offline: true },
    engines
  );
  return {
    ...result,
    ocr: { ...result.ocr, engine: `offline:${result.ocr.engine}` },
  };
}
