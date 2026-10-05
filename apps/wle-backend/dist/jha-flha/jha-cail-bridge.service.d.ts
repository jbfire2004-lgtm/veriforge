import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';
import type { JhaEvaluationResult } from './jha-scoring.service';
export declare class JhaCailBridgeService {
    private readonly emitter;
    constructor(emitter: CailEmitterService);
    emitFromEvaluation(jhaId: string, projectId: number, ownerCompanyId: number, kind: 'FLHA' | 'JHA', evaluation: JhaEvaluationResult, createdByUserId?: number, siteId?: number | null): Promise<any[]>;
}
