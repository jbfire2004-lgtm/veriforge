"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VeriAgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriAgentService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
const veri_agent_policy_service_1 = require("./veri-agent-policy.service");
const veri_agent_redaction_service_1 = require("./veri-agent-redaction.service");
const veri_agent_remote_client_1 = require("./veri-agent-remote.client");
let VeriAgentService = VeriAgentService_1 = class VeriAgentService {
    constructor(policy, redaction, auditLog, remote) {
        this.policy = policy;
        this.redaction = redaction;
        this.auditLog = auditLog;
        this.remote = remote;
        this.logger = new common_1.Logger(VeriAgentService_1.name);
    }
    isConfigured() {
        return this.policy.isProviderConfigured() && this.policy.isLlmEgressEnabled();
    }
    isEmbeddingConfigured() {
        return (this.policy.isEmbeddingConfigured() && this.policy.isLlmEgressEnabled());
    }
    prepareContext(context) {
        return this.redaction.redactJsonContext(context);
    }
    async embed(req) {
        if (this.remote.isEnabled()) {
            const remoteResult = await this.remote.embed(req);
            if (!(0, veri_agent_remote_client_1.isRemoteTransportError)(remoteResult)) {
                await this.auditEmbedResult(req, remoteResult);
                return remoteResult;
            }
            if (this.remote.isStrict()) {
                this.logger.warn(`VeriAgent remote embed strict failure: ${remoteResult.message}`);
                await this.auditFailure(req, 'provider_error', false, 0, '');
                return {
                    ok: false,
                    reason: 'provider_error',
                    detail: remoteResult.message,
                };
            }
            this.logger.warn(`VeriAgent remote embed failed (${remoteResult.message}); falling back in-process`);
        }
        return this.embedLocal(req);
    }
    async completeJson(req) {
        const enriched = this.applyModeToCompleteRequest(req);
        if (this.remote.isEnabled()) {
            const remoteResult = await this.remote.completeJson(enriched);
            if (!(0, veri_agent_remote_client_1.isRemoteTransportError)(remoteResult)) {
                await this.auditRemoteResult(enriched, remoteResult, false);
                return remoteResult;
            }
            if (this.remote.isStrict()) {
                this.logger.warn(`VeriAgent remote strict failure: ${remoteResult.message}`);
                await this.auditFailure(enriched, 'provider_error', false, 0, '');
                return {
                    ok: false,
                    reason: 'provider_error',
                    detail: remoteResult.message,
                };
            }
            this.logger.warn(`VeriAgent remote failed (${remoteResult.message}); falling back in-process`);
        }
        return this.completeJsonLocal(enriched);
    }
    async completeMultimodalJson(req) {
        const enriched = this.applyModeToMultimodalRequest(req);
        if (this.remote.isEnabled()) {
            const remoteResult = await this.remote.completeMultimodalJson(enriched);
            if (!(0, veri_agent_remote_client_1.isRemoteTransportError)(remoteResult)) {
                await this.auditRemoteResult(enriched, remoteResult, Boolean(enriched.imageBase64));
                return remoteResult;
            }
            if (this.remote.isStrict()) {
                this.logger.warn(`VeriAgent remote strict multimodal failure: ${remoteResult.message}`);
                await this.auditFailure(enriched, 'provider_error', false, 0, '');
                return {
                    ok: false,
                    reason: 'provider_error',
                    detail: remoteResult.message,
                };
            }
            this.logger.warn(`VeriAgent remote multimodal failed (${remoteResult.message}); falling back in-process`);
        }
        return this.completeMultimodalJsonLocal(enriched);
    }
    applyModeToCompleteRequest(req) {
        var _a;
        const modePrompt = this.policy.modeSystemPrompt(req.mode);
        if (!modePrompt)
            return req;
        const already = ((_a = req.messages[0]) === null || _a === void 0 ? void 0 : _a.role) === 'system' &&
            req.messages[0].content.startsWith('VERIAGENT OPERATING MODE:');
        if (already)
            return req;
        return Object.assign(Object.assign({}, req), { messages: [{ role: 'system', content: modePrompt }, ...req.messages] });
    }
    applyModeToMultimodalRequest(req) {
        const modePrompt = this.policy.modeSystemPrompt(req.mode);
        if (!modePrompt)
            return req;
        if (req.system.startsWith('VERIAGENT OPERATING MODE:'))
            return req;
        return Object.assign(Object.assign({}, req), { system: `${modePrompt}\n\n${req.system}` });
    }
    async embedLocal(req) {
        var _a;
        if (!this.policy.isLlmEgressEnabled()) {
            return { ok: false, reason: 'llm_disabled' };
        }
        if (!this.policy.isEmbeddingConfigured()) {
            return { ok: false, reason: 'not_configured' };
        }
        if (!this.policy.assertTenant(req.tenant)) {
            return { ok: false, reason: 'tenant_required' };
        }
        if (!this.policy.isPurposeAllowed(req.purpose)) {
            return { ok: false, reason: 'purpose_denied' };
        }
        const requireClean = req.requireCleanRedaction !== false;
        const { text, ok: redactionOk } = this.redaction.redactText(req.text);
        if (requireClean && !redactionOk) {
            await this.auditFailure(req, 'redaction_failed', false, 0, '');
            return { ok: false, reason: 'redaction_failed' };
        }
        const model = (_a = req.model) !== null && _a !== void 0 ? _a : this.policy.embeddingModel();
        try {
            const embedding = await this.providerEmbed({
                model,
                input: text.slice(0, 8000),
            });
            if (!(embedding === null || embedding === void 0 ? void 0 : embedding.length)) {
                await this.auditFailure(req, 'provider_error', true, text.length, this.redaction.hashForAudit(text));
                return { ok: false, reason: 'provider_error' };
            }
            await this.auditSuccess(req, true, false, text, model);
            return {
                ok: true,
                embedding,
                meta: {
                    purpose: 'lesson_embedding',
                    companyId: req.tenant.companyId,
                    projectId: req.tenant.projectId,
                    redacted: true,
                    model,
                    dimensions: embedding.length,
                },
            };
        }
        catch (e) {
            this.logger.warn(`VeriAgent embed error: ${e instanceof Error ? e.message : String(e)}`);
            return { ok: false, reason: 'provider_error', detail: 'fetch_failed' };
        }
    }
    async completeJsonLocal(req) {
        var _a, _b;
        const gate = this.gate(req.purpose, req.tenant);
        if (gate.ok === false)
            return gate;
        const requireClean = req.requireCleanRedaction !== false;
        let redactionOk = true;
        const cleanMessages = req.messages.map((m) => {
            if (m.role === 'system')
                return { role: m.role, content: m.content };
            const { text, ok } = this.redaction.redactText(m.content);
            if (!ok)
                redactionOk = false;
            return { role: m.role, content: text };
        });
        if (requireClean && !redactionOk) {
            await this.auditFailure(req, 'redaction_failed', false, 0, '');
            return { ok: false, reason: 'redaction_failed' };
        }
        const promptForHash = cleanMessages.map((m) => m.content).join('\n');
        const model = (_a = req.model) !== null && _a !== void 0 ? _a : this.policy.defaultModel();
        try {
            const raw = await this.providerChat({
                model,
                temperature: (_b = req.temperature) !== null && _b !== void 0 ? _b : 0.1,
                messages: cleanMessages,
            });
            if (!raw) {
                await this.auditFailure(req, 'provider_error', true, promptForHash.length, this.redaction.hashForAudit(promptForHash));
                return { ok: false, reason: 'provider_error' };
            }
            let parsed;
            try {
                parsed = JSON.parse(raw);
            }
            catch (_c) {
                await this.auditFailure(req, 'parse_error', true, promptForHash.length, this.redaction.hashForAudit(promptForHash));
                return { ok: false, reason: 'parse_error' };
            }
            const data = this.redaction.sanitizeModelJson(parsed);
            await this.auditSuccess(req, true, false, promptForHash, model);
            return {
                ok: true,
                data,
                meta: {
                    purpose: req.purpose,
                    companyId: req.tenant.companyId,
                    projectId: req.tenant.projectId,
                    redacted: true,
                    imageSent: false,
                    model,
                },
            };
        }
        catch (e) {
            this.logger.warn(`VeriAgent completeJson error: ${e instanceof Error ? e.message : String(e)}`);
            return { ok: false, reason: 'provider_error', detail: 'fetch_failed' };
        }
    }
    async completeMultimodalJsonLocal(req) {
        var _a, _b, _c;
        const gate = this.gate(req.purpose, req.tenant);
        if (gate.ok === false)
            return gate;
        const wantImage = Boolean(req.imageBase64);
        if (wantImage && !this.policy.allowImageEgress(req.purpose)) {
            await this.auditFailure(req, 'image_egress_denied', false, 0, '');
            return { ok: false, reason: 'image_egress_denied' };
        }
        const requireClean = req.requireCleanRedaction !== false;
        const redactedSystem = this.redaction.redactText(req.system);
        const redactedUser = this.redaction.redactText(req.userText);
        if (requireClean && (!redactedSystem.ok || !redactedUser.ok)) {
            await this.auditFailure(req, 'redaction_failed', false, 0, '');
            return { ok: false, reason: 'redaction_failed' };
        }
        const userContent = wantImage
            ? [
                { type: 'text', text: redactedUser.text },
                {
                    type: 'image_url',
                    image_url: {
                        url: `data:${(_a = req.imageMimeType) !== null && _a !== void 0 ? _a : 'image/jpeg'};base64,${req.imageBase64}`,
                    },
                },
            ]
            : redactedUser.text;
        const model = (_b = req.model) !== null && _b !== void 0 ? _b : this.policy.defaultModel();
        const promptForHash = `${redactedSystem.text}\n${redactedUser.text}`;
        try {
            const raw = await this.providerChat({
                model,
                temperature: (_c = req.temperature) !== null && _c !== void 0 ? _c : 0.15,
                messages: [
                    { role: 'system', content: redactedSystem.text },
                    { role: 'user', content: userContent },
                ],
            });
            if (!raw) {
                await this.auditFailure(req, 'provider_error', true, promptForHash.length, this.redaction.hashForAudit(promptForHash), wantImage);
                return { ok: false, reason: 'provider_error' };
            }
            let parsed;
            try {
                parsed = JSON.parse(raw);
            }
            catch (_d) {
                return { ok: false, reason: 'parse_error' };
            }
            const data = this.redaction.sanitizeModelJson(parsed);
            await this.auditSuccess(req, true, wantImage, promptForHash, model);
            return {
                ok: true,
                data,
                meta: {
                    purpose: req.purpose,
                    companyId: req.tenant.companyId,
                    projectId: req.tenant.projectId,
                    redacted: true,
                    imageSent: wantImage,
                    model,
                },
            };
        }
        catch (e) {
            this.logger.warn(`VeriAgent multimodal error: ${e instanceof Error ? e.message : String(e)}`);
            return { ok: false, reason: 'provider_error' };
        }
    }
    gate(purpose, tenant) {
        if (!this.policy.isLlmEgressEnabled()) {
            return { ok: false, reason: 'llm_disabled' };
        }
        if (!this.policy.isProviderConfigured()) {
            return { ok: false, reason: 'not_configured' };
        }
        if (!this.policy.assertTenant(tenant)) {
            return { ok: false, reason: 'tenant_required' };
        }
        if (!this.policy.isPurposeAllowed(purpose)) {
            return { ok: false, reason: 'purpose_denied' };
        }
        return { ok: true };
    }
    async providerChat(params) {
        var _a, _b, _c, _d;
        const res = await fetch(this.policy.endpoint(), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.policy.apiKey()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: params.model,
                temperature: params.temperature,
                response_format: { type: 'json_object' },
                messages: params.messages,
            }),
        });
        if (!res.ok) {
            this.logger.warn(`VeriAgent provider failed: ${res.status}`);
            return null;
        }
        const data = (await res.json());
        return (_d = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : null;
    }
    async providerEmbed(params) {
        var _a, _b, _c;
        const res = await fetch(this.policy.embeddingEndpoint(), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.policy.apiKey()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: params.model,
                input: params.input,
            }),
        });
        if (!res.ok) {
            this.logger.warn(`VeriAgent embedding provider failed: ${res.status}`);
            return null;
        }
        const data = (await res.json());
        return (_c = (_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.embedding) !== null && _c !== void 0 ? _c : null;
    }
    async auditEmbedResult(req, result) {
        var _a, _b;
        if (result.ok === true) {
            await this.writeAudit({
                purpose: req.purpose,
                companyId: req.tenant.companyId,
                projectId: req.tenant.projectId,
                actorUserId: (_a = req.actor) === null || _a === void 0 ? void 0 : _a.userId,
                actorRole: (_b = req.actor) === null || _b === void 0 ? void 0 : _b.role,
                model: result.meta.model,
                imageSent: false,
                redactionOk: result.meta.redacted,
                promptCharCount: 0,
                promptHash: 'remote',
                outcome: 'success',
            });
        }
        else {
            await this.auditFailure(req, result.reason, false, 0, '');
        }
    }
    async auditRemoteResult(req, result, imageSentFallback) {
        var _a, _b;
        if (result.ok === true) {
            await this.writeAudit({
                purpose: req.purpose,
                companyId: req.tenant.companyId,
                projectId: req.tenant.projectId,
                actorUserId: (_a = req.actor) === null || _a === void 0 ? void 0 : _a.userId,
                actorRole: (_b = req.actor) === null || _b === void 0 ? void 0 : _b.role,
                model: result.meta.model,
                imageSent: result.meta.imageSent,
                redactionOk: result.meta.redacted,
                promptCharCount: 0,
                promptHash: 'remote',
                outcome: 'success',
            });
        }
        else {
            await this.auditFailure(req, result.reason, false, 0, '', imageSentFallback);
        }
    }
    async auditSuccess(req, redactionOk, imageSent, promptText, model) {
        var _a, _b;
        await this.writeAudit({
            purpose: req.purpose,
            companyId: req.tenant.companyId,
            projectId: req.tenant.projectId,
            actorUserId: (_a = req.actor) === null || _a === void 0 ? void 0 : _a.userId,
            actorRole: (_b = req.actor) === null || _b === void 0 ? void 0 : _b.role,
            model,
            imageSent,
            redactionOk,
            promptCharCount: promptText.length,
            promptHash: this.redaction.hashForAudit(promptText),
            outcome: 'success',
        });
    }
    async auditFailure(req, reason, redactionOk, promptCharCount, promptHash, imageSent = false) {
        var _a, _b;
        await this.writeAudit({
            purpose: req.purpose,
            companyId: req.tenant.companyId,
            projectId: req.tenant.projectId,
            actorUserId: (_a = req.actor) === null || _a === void 0 ? void 0 : _a.userId,
            actorRole: (_b = req.actor) === null || _b === void 0 ? void 0 : _b.role,
            model: this.policy.defaultModel(),
            imageSent,
            redactionOk,
            promptCharCount,
            promptHash,
            outcome: 'failure',
            reason,
        });
    }
    async writeAudit(meta) {
        try {
            await this.auditLog.logAudit(meta.actorUserId != null
                ? {
                    id: meta.actorUserId,
                    companyId: meta.companyId,
                }
                : { companyId: meta.companyId }, audit_actions_1.AuditAction.AI_EGRESS, {
                type: audit_actions_1.AuditEntityType.VERI_AGENT,
                id: meta.purpose,
                tenantId: meta.companyId,
            }, {
                companyId: meta.companyId,
                projectId: meta.projectId,
                purpose: meta.purpose,
                actorRole: meta.actorRole,
                model: meta.model,
                imageSent: meta.imageSent,
                redactionOk: meta.redactionOk,
                promptCharCount: meta.promptCharCount,
                promptHash: meta.promptHash,
                outcome: meta.outcome,
                reason: meta.reason,
            });
        }
        catch (e) {
            this.logger.warn(`VeriAgent audit write failed: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
};
exports.VeriAgentService = VeriAgentService;
exports.VeriAgentService = VeriAgentService = VeriAgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [veri_agent_policy_service_1.VeriAgentPolicyService,
        veri_agent_redaction_service_1.VeriAgentRedactionService,
        audit_log_service_1.AuditLogService,
        veri_agent_remote_client_1.VeriAgentRemoteClient])
], VeriAgentService);
//# sourceMappingURL=veri-agent.service.js.map