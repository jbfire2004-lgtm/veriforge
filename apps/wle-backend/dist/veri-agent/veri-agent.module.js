"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriAgentModule = void 0;
const common_1 = require("@nestjs/common");
const audit_module_1 = require("../audit/audit.module");
const veri_agent_policy_service_1 = require("./veri-agent-policy.service");
const veri_agent_redaction_service_1 = require("./veri-agent-redaction.service");
const veri_agent_remote_client_1 = require("./veri-agent-remote.client");
const veri_agent_service_1 = require("./veri-agent.service");
let VeriAgentModule = class VeriAgentModule {
};
exports.VeriAgentModule = VeriAgentModule;
exports.VeriAgentModule = VeriAgentModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [audit_module_1.AuditModule],
        providers: [
            veri_agent_redaction_service_1.VeriAgentRedactionService,
            veri_agent_policy_service_1.VeriAgentPolicyService,
            veri_agent_remote_client_1.VeriAgentRemoteClient,
            veri_agent_service_1.VeriAgentService,
        ],
        exports: [
            veri_agent_service_1.VeriAgentService,
            veri_agent_redaction_service_1.VeriAgentRedactionService,
            veri_agent_policy_service_1.VeriAgentPolicyService,
            veri_agent_remote_client_1.VeriAgentRemoteClient,
        ],
    })
], VeriAgentModule);
//# sourceMappingURL=veri-agent.module.js.map