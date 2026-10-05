export type ExtractedSdsHazards = {
    hazards: string[];
    controls: string[];
    ppeRequirements: string[];
    firstAid: Record<string, unknown>;
    handlingStorage: Record<string, unknown>;
    whmisClassification: Record<string, unknown>;
    chemicalRiskScore: number;
};
export declare class ChemicalHazardEngine {
    extract(doc: {
        hazardClasses?: unknown;
        whmisJson?: unknown;
        metadataJson?: unknown;
        casNumbers?: unknown;
    }): ExtractedSdsHazards;
    suggestedControls(hazards: string[]): string[];
}
