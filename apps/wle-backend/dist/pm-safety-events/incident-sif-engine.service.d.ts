import { PmSafetyEventType } from '@prisma/client';
import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';
import type { IncidentSifEngineInput, IncidentSifEngineOutput } from './incident-sif-engine.types';
export declare class IncidentSifEngineService {
    private readonly classifier;
    private readonly risk;
    private readonly rca;
    constructor(classifier: EventClassificationEngine, risk: SeverityRiskEngine, rca: RcaEngine);
    inputFromEvent(event: {
        companyId: number;
        projectId: number;
        eventType: PmSafetyEventType;
        severity: string;
        description?: string | null;
        title: string;
        occurredAt: Date;
        locationNote?: string | null;
        sifEventId?: string | null;
        sclPotentialSeverity?: string | null;
        injuries?: Array<{
            workerId?: number | null;
        }>;
        people?: Array<{
            name?: string | null;
            role: string;
            workerId?: number | null;
        }>;
        attachments?: Array<{
            fileName?: string | null;
        }>;
        investigation?: {
            immediateActions?: string | null;
            narrative?: string | null;
        } | null;
        rootCauses?: Array<{
            description: string;
        }>;
    }): IncidentSifEngineInput;
    generate(input: IncidentSifEngineInput): IncidentSifEngineOutput;
    private fullText;
    private resolveEventType;
    private assessSif;
    private buildClassification;
    private buildNarrative;
    private buildRca;
    private buildCapa;
    private buildLearning;
    private buildClientReport;
}
