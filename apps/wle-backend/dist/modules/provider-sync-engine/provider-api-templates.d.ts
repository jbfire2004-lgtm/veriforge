export type ProviderCompletionRow = {
    workerEmail?: string;
    workerPhone?: string;
    workerExternalId?: string;
    certificationCode?: string;
    certificationName?: string;
    certificateNumber?: string;
    issuedAt?: string;
    expiresAt?: string;
    companyExternalId?: string;
    projectExternalId?: string;
};
export type ProviderApiTemplate = {
    key: string;
    label: string;
    description: string;
    completionsPath: string;
    fieldMap: Record<keyof ProviderCompletionRow, string>;
    pollMethod: 'GET' | 'POST';
    authHeader?: string;
    sinceQueryParam?: string;
};
export declare const PROVIDER_API_TEMPLATES: ProviderApiTemplate[];
export declare function getProviderTemplate(key: string): ProviderApiTemplate | undefined;
export declare function mapProviderPayload(template: ProviderApiTemplate, body: unknown): ProviderCompletionRow[];
