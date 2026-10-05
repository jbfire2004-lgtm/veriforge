import { DigitalTwinService } from './digital-twin.service';
import type { TwinEventPayload, TwinType } from '@vera/digital-twin';
export declare class DigitalTwinController {
    private readonly twins;
    constructor(twins: DigitalTwinService);
    hydrate(companyId: string): Promise<DigitalTwin[]>;
    dashboard(): TwinDashboardBundle;
    getTwin(type: TwinType, id: string): any;
    timeline(type: TwinType, id: string): any;
    history(type: TwinType, id: string): any;
    applyEvent(body: TwinEventPayload): any;
    offlineEvent(body: TwinEventPayload & {
        clientVersion: number;
    }): {
        ok: boolean;
    };
    sync(type: TwinType, id: string): any;
}
