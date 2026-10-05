import type { CailIntelligenceEnvelope, VsiCopilotModule } from './vsi-copilot.types';
export declare function severityToScore(severity?: string): number;
export declare function scoreToSeverity(score: number): 'low' | 'medium' | 'high' | 'critical';
export declare function toCailEnvelope(module: VsiCopilotModule, output: unknown): CailIntelligenceEnvelope;
