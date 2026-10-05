import { VsiCopilotEngineService } from '../safety-intelligence/ai/copilot/vsi-copilot-engine.service';
import type { SifHecaAssessmentCopilotOutput } from '../safety-intelligence/ai/copilot/vsi-copilot.types';
export type SifHecaScopeInput = {
    companyId: number;
    projectId: number;
    title: string;
    jobDescription?: string;
    workScope?: string;
    locationNote?: string;
    environmentNote?: string;
    equipmentNote?: string;
};
export type SifHecaScopeAnalysisResult = SifHecaAssessmentCopilotOutput & {
    engine: string[];
    combined_text: string;
    max_severity: number;
    max_likelihood: number;
};
export declare class SifHecaScopeAnalysisService {
    private readonly copilot?;
    constructor(copilot?: VsiCopilotEngineService);
    analyze(input: SifHecaScopeInput): Promise<SifHecaScopeAnalysisResult>;
    private heuristicAnalyze;
    private inferStepsFromText;
    private finalize;
}
