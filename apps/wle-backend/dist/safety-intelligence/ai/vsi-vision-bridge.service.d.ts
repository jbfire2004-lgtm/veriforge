import { VisionService } from '../../modules/vision/vision.service';
export declare class VsiVisionBridgeService {
    private readonly vision;
    constructor(vision: VisionService);
    analyzeSafetyPhoto(input: {
        caption?: string;
        ocrText?: string;
        imageUrl?: string;
        companyId?: number;
        projectId?: number;
    }): Promise<{
        engine: "vera-vision";
        vision: any;
        hazards: any[];
        suggestedPolarity: "safe" | "at_risk";
        suggestedSeverity: "medium" | "low" | "high" | "critical";
        ocrFullText: any;
        suggestedCaption: any;
        riskCategory: string;
    }>;
}
