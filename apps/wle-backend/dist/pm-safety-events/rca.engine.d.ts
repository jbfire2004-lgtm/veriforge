import { PmSafetyEventType } from '@prisma/client';
export declare const TAPROOT_PATHWAYS: readonly ["human_factors", "equipment_failure", "procedures", "training_gaps", "management_systems", "environmental_conditions"];
export type TaprootPathway = (typeof TAPROOT_PATHWAYS)[number];
export type CausalTreeNode = {
    id: string;
    label: string;
    type: 'event' | 'contributing' | 'root' | 'pathway';
    pathway?: TaprootPathway;
    children?: CausalTreeNode[];
};
export type GuidedQuestion = {
    id: string;
    prompt: string;
    pathway?: TaprootPathway;
    required?: boolean;
};
export declare class RcaEngine {
    taprootPathways(): {
        key: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
        label: string;
        description: string;
    }[];
    guidedQuestions(eventType: PmSafetyEventType | string): GuidedQuestion[];
    suggestRootCauses(input: {
        description: string;
        eventType: string;
        contributingFactors: string[];
        guidedAnswers?: Record<string, string>;
        library: Array<{
            code: string;
            label: string;
            category?: string | null;
        }>;
        historicalCodes?: string[];
    }): any[];
    suggestContributingFactors(input: {
        eventType: string;
        description: string;
        guidedAnswers?: Record<string, string>;
    }): Array<{
        label: string;
        pathway: TaprootPathway;
        confidence: number;
    }>;
    buildTaprootPathway(input: {
        pathway: TaprootPathway;
        description: string;
        contributingFactors?: string[];
    }): {
        pathway: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
        label: string;
        causalFactors: string[];
        rootCauseStatement: string;
        snapCharT: {
            sequenceOfEvents: any[];
            changeAnalysis: string[];
            correctiveActions: any[];
        };
    };
    buildFiveWhyChain(problemStatement: string, rootCause: string): string[];
    fishboneCategories(): {
        key: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
        label: string;
    }[];
    buildCausalTree(input: {
        eventTitle: string;
        rootCauses: Array<{
            id: string;
            description: string;
            category?: string | null;
            pathway?: string;
        }>;
        contributingFactors: Array<{
            label: string;
            category?: string | null;
        }>;
    }): CausalTreeNode;
}
