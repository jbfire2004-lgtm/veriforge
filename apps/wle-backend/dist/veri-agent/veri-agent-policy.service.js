"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VeriAgentPolicyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriAgentPolicyService = void 0;
const common_1 = require("@nestjs/common");
const veri_agent_modes_1 = require("./veri-agent-modes");
const IMAGE_PURPOSES = new Set([
    'safety_photo_classify',
    'inspection_photo_findings',
    'equipment_inspection_photo_findings',
]);
let VeriAgentPolicyService = VeriAgentPolicyService_1 = class VeriAgentPolicyService {
    constructor() {
        this.logger = new common_1.Logger(VeriAgentPolicyService_1.name);
    }
    isLlmEgressEnabled() {
        var _a;
        const flag = (_a = process.env.VERA_AGENT_LLM_ENABLED) !== null && _a !== void 0 ? _a : process.env.SMS_LLM_ENABLED;
        if (flag === '0' || flag === 'false' || flag === 'off')
            return false;
        if (flag === '1' || flag === 'true' || flag === 'on')
            return true;
        return true;
    }
    isProviderConfigured() {
        return Boolean(process.env.VERA_LLM_ENDPOINT &&
            (process.env.OPENAI_API_KEY || process.env.VERA_LLM_API_KEY));
    }
    isEmbeddingConfigured() {
        var _a;
        if ((_a = process.env.VERA_EMBEDDING_ENDPOINT) === null || _a === void 0 ? void 0 : _a.trim()) {
            return Boolean(process.env.OPENAI_API_KEY || process.env.VERA_LLM_API_KEY);
        }
        return Boolean(process.env.OPENAI_API_KEY || process.env.VERA_LLM_API_KEY);
    }
    embeddingEndpoint() {
        var _a;
        if ((_a = process.env.VERA_EMBEDDING_ENDPOINT) === null || _a === void 0 ? void 0 : _a.trim()) {
            return process.env.VERA_EMBEDDING_ENDPOINT.trim();
        }
        return 'https://api.openai.com/v1/embeddings';
    }
    embeddingModel() {
        var _a;
        return (_a = process.env.VERA_EMBEDDING_MODEL) !== null && _a !== void 0 ? _a : 'text-embedding-3-small';
    }
    assertTenant(tenant) {
        return (!!tenant &&
            typeof tenant.companyId === 'number' &&
            Number.isFinite(tenant.companyId) &&
            tenant.companyId > 0);
    }
    isPurposeAllowed(purpose) {
        var _a;
        const deny = ((_a = process.env.VERA_AGENT_DENIED_PURPOSES) !== null && _a !== void 0 ? _a : '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        return !deny.includes(purpose);
    }
    allowImageEgress(purpose) {
        const flag = process.env.VERA_AGENT_ALLOW_IMAGE_EGRESS;
        if (flag === '0' || flag === 'false' || flag === 'off') {
            this.logger.warn(`Image egress disabled by policy (purpose=${purpose})`);
            return false;
        }
        return IMAGE_PURPOSES.has(purpose);
    }
    defaultModel() {
        var _a;
        return (_a = process.env.VERA_LLM_MODEL) !== null && _a !== void 0 ? _a : 'gpt-4o-mini';
    }
    endpoint() {
        var _a;
        return (_a = process.env.VERA_LLM_ENDPOINT) !== null && _a !== void 0 ? _a : '';
    }
    apiKey() {
        var _a, _b;
        return (_b = (_a = process.env.OPENAI_API_KEY) !== null && _a !== void 0 ? _a : process.env.VERA_LLM_API_KEY) !== null && _b !== void 0 ? _b : '';
    }
    resolveMode(override) {
        if (override !== undefined)
            return (0, veri_agent_modes_1.resolveVeriAgentMode)(override);
        return (0, veri_agent_modes_1.activeModeFromEnv)();
    }
    modeSystemPrompt(override) {
        var _a;
        const mode = (0, veri_agent_modes_1.getVeriAgentMode)(this.resolveMode(override));
        return (_a = mode === null || mode === void 0 ? void 0 : mode.systemPrompt) !== null && _a !== void 0 ? _a : null;
    }
};
exports.VeriAgentPolicyService = VeriAgentPolicyService;
exports.VeriAgentPolicyService = VeriAgentPolicyService = VeriAgentPolicyService_1 = __decorate([
    (0, common_1.Injectable)()
], VeriAgentPolicyService);
//# sourceMappingURL=veri-agent-policy.service.js.map