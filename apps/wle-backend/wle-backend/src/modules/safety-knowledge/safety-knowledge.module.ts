import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SafetyKnowledgeController } from './safety-knowledge.controller';
import { SafetyKnowledgeService } from './safety-knowledge.service';

@Module({
  imports: [PrismaModule],
  controllers: [SafetyKnowledgeController],
  providers: [SafetyKnowledgeService],
  exports: [SafetyKnowledgeService],
})
export class SafetyKnowledgeModule {}
