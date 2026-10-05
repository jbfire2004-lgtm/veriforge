import { JhaFlhaService } from './jha-flha.service';
export type VeraOrchestratorSection = {
    facts: string[];
    analysis: string[];
    actions: string[];
};
export declare class JhaFlhaOrchestratorService {
    private readonly jha;
    constructor(jha: JhaFlhaService);
    analyze(id: string): Promise<VeraOrchestratorSection & {
        moduleType: string;
        recordId: string;
    }>;
}
