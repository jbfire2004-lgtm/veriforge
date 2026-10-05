import { SifHecaService } from './sif-heca.service';
export type VeraOrchestratorSection = {
    facts: string[];
    analysis: string[];
    actions: string[];
};
export declare class SifHecaOrchestratorService {
    private readonly sifHeca;
    constructor(sifHeca: SifHecaService);
    analyzeEvent(eventId: string): Promise<VeraOrchestratorSection & {
        moduleType: string;
        recordId: string;
    }>;
}
