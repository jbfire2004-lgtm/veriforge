import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmAttachmentsMediaController } from './pm-attachments-media.controller';
import { PmAttachmentController } from './pm-attachment.controller';
import { PmAttachmentsMediaService } from './pm-attachments-media.service';
import { PmAttachmentsCailIntelligenceService } from './pm-attachments-cail-intelligence.service';

@Module({
  imports: [PrismaModule],
  controllers: [PmAttachmentsMediaController, PmAttachmentController],
  providers: [PmAttachmentsMediaService, PmAttachmentsCailIntelligenceService],
  exports: [PmAttachmentsMediaService, PmAttachmentsCailIntelligenceService],
})
export class PmAttachmentsMediaModule {}
