import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SafetyIntelligenceModule } from '../safety-intelligence/safety-intelligence.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmSafetyMeetingsController } from './pm-safety-meetings.controller';
import { PmSafetyMeetingsService } from './pm-safety-meetings.service';
import { PmSafetyMeetingsTemplatesService } from './pm-safety-meetings-templates.service';
import { PmSafetyMeetingsTopicLibraryService } from './pm-safety-meetings-topic-library.service';
import { PmSafetyMeetingsIntelligenceService } from './pm-safety-meetings-intelligence.service';
import { PmSafetyMeetingsCailService } from './pm-safety-meetings-cail.service';

@Module({
  imports: [PrismaModule, SafetyIntelligenceModule, PmCorrectiveActionsModule],
  controllers: [PmSafetyMeetingsController],
  providers: [
    PmSafetyMeetingsService,
    PmSafetyMeetingsTemplatesService,
    PmSafetyMeetingsTopicLibraryService,
    PmSafetyMeetingsIntelligenceService,
    PmSafetyMeetingsCailService,
  ],
  exports: [PmSafetyMeetingsService],
})
export class PmSafetyMeetingsModule {}
