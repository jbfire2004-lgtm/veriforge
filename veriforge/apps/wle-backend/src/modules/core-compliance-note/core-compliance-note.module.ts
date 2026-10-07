import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreComplianceNoteController } from './core-compliance-note.controller';
import { CoreComplianceNoteService } from './core-compliance-note.service';

@Module({
  controllers: [CoreComplianceNoteController],
  providers: [CoreComplianceNoteService, PrismaService],
  exports: [CoreComplianceNoteService],
})
export class CoreComplianceNoteModule {}
