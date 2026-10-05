export type IncidentSifEngineInput = {
    incident_type: 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security' | 'process_upset' | string;
    severity?: 'actual' | 'potential' | string;
    SIF_potential?: 'yes' | 'no' | 'unknown' | string;
    date_time?: string;
    location?: string;
    people_involved?: Array<{
        name?: string;
        role?: string;
        worker_id?: number;
    }>;
    description_free_text: string;
    immediate_actions_taken?: string[];
    photos_and_evidence_summaries?: string[];
    similar_past_incidents?: Array<{
        title?: string;
        date?: string;
        summary?: string;
    }>;
    procedures_or_rules_relevant?: string[];
    org_root_cause_method?: '5-Why' | 'fishbone' | 'TapRooT' | string;
    constraints?: string[];
    companyId?: number;
    projectId?: number;
};
export type IncidentClassification = {
    narrative: string;
    event_types: string[];
    sif_potential: 'yes' | 'no' | 'unknown';
    sif_reasoning: string;
    impact: {
        people: boolean;
        environment: boolean;
        asset: boolean;
        reputation: boolean;
        production: boolean;
    };
    severity_assessment: string;
    requires_regulatory_attention: boolean;
};
export type IncidentRootCauseAnalysis = {
    method: string;
    five_whys: string[];
    immediate_causes: Array<{
        category: string;
        description: string;
    }>;
    underlying_causes: Array<{
        category: string;
        description: string;
    }>;
    system_causes: Array<{
        category: string;
        description: string;
    }>;
    fishbone: Record<string, string[]>;
};
export type IncidentCapaItem = {
    type: 'containment' | 'corrective' | 'preventive';
    action: string;
    owner_role: string;
    priority: 'high' | 'medium' | 'low';
    linked_cause: string;
    effectiveness_expectation: string;
};
export type IncidentSifEngineOutput = {
    classification: IncidentClassification;
    root_cause_analysis: IncidentRootCauseAnalysis;
    capa_list: IncidentCapaItem[];
    learning_summary: string[];
    client_report_summary: string;
};
