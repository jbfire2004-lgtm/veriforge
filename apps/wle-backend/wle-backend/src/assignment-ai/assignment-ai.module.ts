import { Module } from '@nestjs/common';
import { AssignmentAIController } from './assignment-ai.controller';
import { AssignmentAIService } from './assignment-ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AssignmentAIController],
  providers: [AssignmentAIService, PrismaService],
  exports: [AssignmentAIService],
})
export class AssignmentAIModule {}
