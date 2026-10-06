import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreMeetingRecordController } from './core-meeting-record.controller';
import { CoreMeetingRecordService } from './core-meeting-record.service';

@Module({
  controllers: [CoreMeetingRecordController],
  providers: [CoreMeetingRecordService, PrismaService],
  exports: [CoreMeetingRecordService],
})
export class CoreMeetingRecordModule {}
