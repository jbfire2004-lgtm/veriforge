import type { VisionAnalysisResult } from '@vera/vision';
export type VisionAnalysisMode = 'full' | 'vision_rules' | 'rules_only' | 'caption_fallback';
export type VisionCapabilities = {
    ocrEnabled: boolean;
    llmEnabled: boolean;
    externalOcrConfigured: boolean;
    recommendedMode: VisionAnalysisMode;
    messages: string[];
};
export declare function resolveVisionCapabilities(opts: {
    ocrTextProvided: boolean;
    llmConfigured: boolean;
    ocrDisabledByEnv: boolean;
    externalOcrUrl?: string | null;
}): VisionCapabilities;
export declare function attachAnalysisMeta(result: VisionAnalysisResult, mode: VisionAnalysisMode, capabilities: VisionCapabilities): VisionAnalysisResult & {
    analysisMode: VisionAnalysisMode;
    capabilities: VisionCapabilities;
};
