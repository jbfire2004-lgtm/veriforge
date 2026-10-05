export type VeriAgentPurpose = 'vsi_copilot' | 'safety_photo_classify' | 'inspection_photo_findings' | 'equipment_inspection_photo_findings' | 'lesson_embedding' | 'sms_inference' | 'generic_json';
export type VeriAgentActor = {
    userId?: number;
    role?: string;
    companyId?: number;
};
export type VeriAgentTenant = {
    companyId: number;
    projectId?: number;
};
export type VeriAgentTextMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};
export type VeriAgentMultimodalPart = {
    type: 'text';
    text: string;
} | {
    type: 'image_url';
    image_url: {
        url: string;
    };
};
export type VeriAgentMultimodalMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string | VeriAgentMultimodalPart[];
};
export type VeriAgentModeOverride = 'manufacturing' | 'construction' | 'mining' | 'telecom' | 'power' | 'nuclear' | 'multi' | 'none';
export type VeriAgentCompleteRequest = {
    purpose: VeriAgentPurpose;
    tenant: VeriAgentTenant;
    actor?: VeriAgentActor;
    messages: VeriAgentTextMessage[];
    temperature?: number;
    model?: string;
    requireCleanRedaction?: boolean;
    mode?: VeriAgentModeOverride;
};
export type VeriAgentMultimodalRequest = {
    purpose: VeriAgentPurpose;
    tenant: VeriAgentTenant;
    actor?: VeriAgentActor;
    system: string;
    userText: string;
    imageBase64?: string;
    imageMimeType?: string;
    temperature?: number;
    model?: string;
    requireCleanRedaction?: boolean;
    mode?: VeriAgentModeOverride;
};
export type VeriAgentCompleteResult<T = Record<string, unknown>> = {
    ok: true;
    data: T;
    meta: {
        purpose: VeriAgentPurpose;
        companyId: number;
        projectId?: number;
        redacted: boolean;
        imageSent: boolean;
        model: string;
    };
} | {
    ok: false;
    reason: 'llm_disabled' | 'not_configured' | 'tenant_required' | 'purpose_denied' | 'redaction_failed' | 'image_egress_denied' | 'provider_error' | 'parse_error';
    detail?: string;
};
export type VeriAgentEmbedRequest = {
    purpose: 'lesson_embedding';
    tenant: VeriAgentTenant;
    actor?: VeriAgentActor;
    text: string;
    model?: string;
    requireCleanRedaction?: boolean;
};
export type VeriAgentEmbedResult = {
    ok: true;
    embedding: number[];
    meta: {
        purpose: 'lesson_embedding';
        companyId: number;
        projectId?: number;
        redacted: boolean;
        model: string;
        dimensions: number;
    };
} | {
    ok: false;
    reason: 'llm_disabled' | 'not_configured' | 'tenant_required' | 'purpose_denied' | 'redaction_failed' | 'provider_error';
    detail?: string;
};
export type VeriAgentEgressAuditMeta = {
    purpose: VeriAgentPurpose;
    companyId: number;
    projectId?: number;
    actorUserId?: number;
    actorRole?: string;
    model: string;
    imageSent: boolean;
    redactionOk: boolean;
    promptCharCount: number;
    promptHash: string;
    outcome: 'success' | 'failure';
    reason?: string;
};
