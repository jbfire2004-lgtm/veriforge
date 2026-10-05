import type { VeriAgentCompleteRequest, VeriAgentCompleteResult, VeriAgentEmbedRequest, VeriAgentEmbedResult, VeriAgentMultimodalRequest } from './veri-agent.types';
type RemoteTransportError = {
    kind: 'transport';
    status?: number;
    message: string;
};
export declare class VeriAgentRemoteClient {
    private readonly logger;
    isEnabled(): boolean;
    isStrict(): boolean;
    completeJson<T extends Record<string, unknown>>(req: VeriAgentCompleteRequest): Promise<VeriAgentCompleteResult<T> | RemoteTransportError>;
    completeMultimodalJson<T extends Record<string, unknown>>(req: VeriAgentMultimodalRequest): Promise<VeriAgentCompleteResult<T> | RemoteTransportError>;
    embed(req: VeriAgentEmbedRequest): Promise<VeriAgentEmbedResult | RemoteTransportError>;
    private baseUrl;
    private serviceToken;
    private postComplete;
}
export declare function isRemoteTransportError(v: unknown): v is RemoteTransportError;
export {};
