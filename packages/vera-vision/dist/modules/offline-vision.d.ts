import type { VisionAnalysisInput, VisionAnalysisResult } from "../types";
import { type PipelineEngines } from "./document-pipeline";
/** Offline vision — same pipeline, marks OCR source as offline-capable */
export declare function analyzeOffline(input: VisionAnalysisInput, engines: PipelineEngines): Promise<VisionAnalysisResult>;
//# sourceMappingURL=offline-vision.d.ts.map