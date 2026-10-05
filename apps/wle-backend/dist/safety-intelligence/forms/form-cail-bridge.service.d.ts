import type { SafetyFormDefinitionJson } from '../../forms/engine/form-engine.types';
import { CailEmitterService } from '../cail/cail-emitter.service';
import { CailCopilotEnrichmentService } from '../cail/cail-copilot-enrichment.service';
export declare class FormCailBridgeService {
    private readonly emitter;
    private readonly copilotEnrich;
    constructor(emitter: CailEmitterService, copilotEnrich: CailCopilotEnrichmentService);
    private resolveSourceType;
    private shouldEmit;
    private collectTitles;
    emitFromSafetyForm(formId: string, def: SafetyFormDefinitionJson, formData: Record<string, unknown>, ctx: {
        projectId?: number | null;
        companyId?: number | null;
        siteId?: number | null;
        workerId?: number | null;
        equipmentId?: number | null;
        createdById?: number;
    }): Promise<any[]>;
}
