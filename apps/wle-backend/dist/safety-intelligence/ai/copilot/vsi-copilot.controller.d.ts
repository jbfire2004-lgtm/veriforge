import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { VsiCopilotEngineService } from './vsi-copilot-engine.service';
import type { CopilotRunRequest, VsiCopilotModule } from './vsi-copilot.types';
declare class CopilotRunBodyDto implements CopilotRunRequest {
    module: VsiCopilotModule;
    sourceType?: CopilotRunRequest['sourceType'];
    projectId?: number;
    companyId?: number;
    context: Record<string, unknown>;
}
export declare class VsiCopilotController {
    private readonly copilot;
    private readonly tenant;
    constructor(copilot: VsiCopilotEngineService, tenant: TenantScopeService);
    run(req: {
        user: SecurityActor;
    }, body: CopilotRunBodyDto): Promise<import("./vsi-copilot.types").CopilotRunResponse>;
}
export {};
