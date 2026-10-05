import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { InvestigationsModule } from '../investigations/investigations.module';
import { SafetyWorkflowController } from './safety-workflow.controller';
import { SafetyWorkflowService } from './safety-workflow.service';

@Module({
  imports: [IncidentsModule, InvestigationsModule],
  controllers: [SafetyWorkflowController],
  providers: [SafetyWorkflowService],
  exports: [SafetyWorkflowService],
})
export class SafetyWorkflowModule {}
