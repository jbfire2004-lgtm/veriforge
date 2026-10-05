import { type ControlClass } from '../jha-flha/jha-control-class';
export type CsraProximity = 'contact' | 'near' | 'zone' | 'remote';
export type CsraExposureLevel = 1 | 2 | 3 | 4 | 5;
export type CsraControlInput = {
    description?: string;
    controlType: string;
    adequate?: boolean | null;
    effectivenessScore?: number | null;
    verified?: boolean;
    energyTypes?: string[];
};
export type CsraAssessmentInput = {
    title: string;
    description?: string;
    workScope?: string;
    locationNote?: string;
    environmentNote?: string;
    equipmentNote?: string;
    energyTypes?: string[];
    exposureLevel?: CsraExposureLevel;
    proximity?: CsraProximity;
    controls?: CsraControlInput[];
    sifHint?: {
        score?: number;
        category?: string;
        indicators?: string[];
    };
};
export type CsraEnergySource = {
    type: string;
    label: string;
    highEnergy: boolean;
    magnitude: number;
    evidence: string[];
};
export type CsraClassifiedControl = {
    description: string;
    controlType: string;
    controlClass: ControlClass;
    adequate: boolean;
    verified: boolean;
    linkedEnergies: string[];
};
export type CsraRecommendation = {
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    controlClass: ControlClass;
    controlType: string;
    description: string;
    energyType: string;
    reason: string;
};
export type HecaAssessmentDocumentSection = {
    id: string;
    title: string;
    body: string;
    bullets?: string[];
};
export type HecaAssessmentDocument = {
    documentType: 'HECA_CSRA';
    title: string;
    generatedAt: string;
    methodology: 'CSRA';
    revision: string;
    summary: {
        highEnergy: boolean;
        sifApplies: boolean;
        sifCategory: string;
        sifScore: number;
        directControlCount: number;
        alternativeControlCount: number;
        missingDirectControls: number;
        supervisorReviewRequired: boolean;
        readyForWork: boolean;
    };
    sections: HecaAssessmentDocumentSection[];
};
export type CsraAssessmentOutput = {
    methodology: 'CSRA';
    highEnergySources: CsraEnergySource[];
    exposure: {
        level: CsraExposureLevel;
        proximity: CsraProximity;
        score: number;
        narrative: string;
    };
    controls: {
        classified: CsraClassifiedControl[];
        directCount: number;
        alternativeCount: number;
        hasDirectForHighEnergy: boolean;
        adequate: boolean;
        findings: string[];
    };
    sifPotential: {
        applies: boolean;
        category: 'low' | 'medium' | 'high' | 'critical';
        score: number;
        indicators: string[];
        narrative: string;
        requiresSupervisorReview: boolean;
    };
    recommendations: CsraRecommendation[];
    document: HecaAssessmentDocument;
};
export declare class CsraHecaEngine {
    assess(input: CsraAssessmentInput): CsraAssessmentOutput;
    private identifyHighEnergySources;
    private evaluateExposure;
    private classifyControls;
    private assessSifPotential;
    private recommendMissingControls;
    private buildDocument;
}
