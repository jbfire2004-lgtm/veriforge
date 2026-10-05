import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';
export declare class SifHecaCailService {
    private readonly emitter;
    constructor(emitter: CailEmitterService);
    emitCorrectiveActions(eventId: string, projectId: number, ownerCompanyId: number, items: Array<{
        title: string;
        description?: string;
        severity?: 'high' | 'critical';
    }>, createdByUserId?: number, siteId?: number, workerId?: number): Promise<any[]>;
}
