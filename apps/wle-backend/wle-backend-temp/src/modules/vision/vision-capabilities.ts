import type { VisionAnalysisResult } from '@vera/vision';

export type VisionAnalysisMode =
  | 'full'
  | 'vision_rules'
  | 'rules_only'
  | 'caption_fallback';

export type VisionCapabilities = {
  ocrEnabled: boolean;
  llmEnabled: boolean;
  externalOcrConfigured: boolean;
  recommendedMode: VisionAnalysisMode;
  messages: string[];
};

export function resolveVisionCapabilities(opts: {
  ocrTextProvided: boolean;
  llmConfigured: boolean;
  ocrDisabledByEnv: boolean;
  externalOcrUrl?: string | null;
}): VisionCapabilities {
  const messages: string[] = [];
  const ocrEnabled = !opts.ocrDisabledByEnv;
  const llmEnabled = opts.llmConfigured;
  const externalOcrConfigured = Boolean(opts.externalOcrUrl?.trim());

  let recommendedMode: VisionAnalysisMode = 'full';
  if (!ocrEnabled && !llmEnabled) {
    recommendedMode = 'caption_fallback';
    messages.push(
      'Vision OCR disabled and LLM not configured — using caption/rules fallback only.',
    );
  } else if (!llmEnabled && !opts.ocrTextProvided) {
    recommendedMode = ocrEnabled ? 'vision_rules' : 'caption_fallback';
    messages.push(
      'LLM not configured — hazard detection uses Vera Vision rules engine.',
    );
  } else if (!opts.ocrTextProvided && !externalOcrConfigured) {
    recommendedMode = 'vision_rules';
    messages.push(
      'No OCR text supplied — analysis uses image hints and rule-based extraction.',
    );
  }

  return {
    ocrEnabled,
    llmEnabled,
    externalOcrConfigured,
    recommendedMode,
    messages,
  };
}

export function attachAnalysisMeta(
  result: VisionAnalysisResult,
  mode: VisionAnalysisMode,
  capabilities: VisionCapabilities,
): VisionAnalysisResult & {
  analysisMode: VisionAnalysisMode;
  capabilities: VisionCapabilities;
} {
  return {
    ...result,
    analysisMode: mode,
    capabilities,
  };
}
