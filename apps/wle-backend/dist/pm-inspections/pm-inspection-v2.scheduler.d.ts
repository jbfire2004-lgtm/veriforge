import { PmInspectionContractorDispatchService } from './pm-inspection-contractor-dispatch.service';
export declare class PmInspectionV2Scheduler {
    private readonly dispatch?;
    private readonly logger;
    constructor(dispatch?: PmInspectionContractorDispatchService);
    markOverdueContractorDispatches(): Promise<void>;
}
