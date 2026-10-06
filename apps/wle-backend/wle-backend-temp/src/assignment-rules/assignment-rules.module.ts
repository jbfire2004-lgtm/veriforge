import { Module } from '@nestjs/common';
import { AssignmentRulesController } from './assignment-rules.controller';
import { AssignmentRulesService } from './assignment-rules.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AssignmentRulesController],
  providers: [AssignmentRulesService, PrismaService],
  exports: [AssignmentRulesService],
})
export class AssignmentRulesModule {}
