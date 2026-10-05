import { LlmSafetyService } from '../llm-safety.service';
import { VsiVisionBridgeService } from '../vsi-vision-bridge.service';
import type { CopilotRunRequest, CopilotRunResponse, InspectionCopilotOutput, VsiCopilotModule } from './vsi-copilot.types';
export declare class VsiCopilotEngineService {
    private readonly llm;
    private readonly vision;
    private readonly logger;
    private readonly vase;
    constructor(llm: LlmSafetyService, vision: VsiVisionBridgeService);
    run(request: CopilotRunRequest): Promise<CopilotRunResponse>;
    inspectPhoto(context: {
        caption?: string;
        ocrText?: string;
        imageUrl?: string;
        imageBase64?: string;
        imageMimeType?: string;
        projectId?: number;
        companyId?: number;
    }): Promise<{
        engine: string[];
        output: InspectionCopilotOutput;
        module: VsiCopilotModule;
        cailEnvelope: import("./vsi-copilot.types").CailIntelligenceEnvelope;
        generatedAt: string;
    }>;
    analyzeBbo(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    investigateIncident(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    analyzeEquipment(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    analyzeFormHazard(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    analyzeSifHecaScope(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    generateLesson(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    generatePresentation(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    predictRisk(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    analyzeCail(context: Record<string, unknown>): Promise<CopilotRunResponse>;
    private vaseContext;
    private heuristicRun;
}
