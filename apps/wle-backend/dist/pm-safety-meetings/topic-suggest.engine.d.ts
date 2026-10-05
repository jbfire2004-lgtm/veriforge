export type TopicSuggestionInput = {
    recentIncidents: {
        id: string;
        title: string;
        severity?: string;
    }[];
    recentDeficiencies: {
        id: string;
        title: string;
        score?: number;
    }[];
    highRiskJhas: {
        id: string;
        title: string;
        sifScore?: number;
    }[];
    equipmentFailures: {
        id: string;
        title: string;
    }[];
    sifTrendTags: string[];
    weatherAlerts?: string[];
    projectRiskScore?: number;
};
export type TopicSuggestion = {
    title: string;
    categoryCode: string;
    reason: string;
    sourceModule: string;
    sourceId: string;
    priority: number;
    isHighRisk: boolean;
};
export declare class TopicSuggestEngine {
    suggest(input: TopicSuggestionInput): TopicSuggestion[];
}
