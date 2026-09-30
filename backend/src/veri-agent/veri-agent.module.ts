import { Global, Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { VeriAgentPolicyService } from './veri-agent-policy.service';
import { VeriAgentRedactionService } from './veri-agent-redaction.service';
import { VeriAgentRemoteClient } from './veri-agent-remote.client';
import { VeriAgentService } from './veri-agent.service';

/**
 * VeriAgent — platform AI orchestration & privacy firewall.
 * Import once from AppModule; @Global so domain modules can inject VeriAgentService.
 */
@Global()
@Module({
  imports: [AuditModule],
  providers: [
    VeriAgentRedactionService,
    VeriAgentPolicyService,
    VeriAgentRemoteClient,
    VeriAgentService,
  ],
  exports: [
    VeriAgentService,
    VeriAgentRedactionService,
    VeriAgentPolicyService,
    VeriAgentRemoteClient,
  ],
})
export class VeriAgentModule {}
