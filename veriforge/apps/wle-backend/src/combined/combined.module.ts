import { Module, forwardRef } from '@nestjs/common';
import { CombinedController } from './combined.controller';
import { CombinedService } from './combined.service';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngineModule } from '../rules/rule-engine.module';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [RuleEngineModule, forwardRef(() => VerificationModule)],
  controllers: [CombinedController],
  providers: [CombinedService, PrismaService],
  exports: [CombinedService],
})
export class CombinedModule {}
