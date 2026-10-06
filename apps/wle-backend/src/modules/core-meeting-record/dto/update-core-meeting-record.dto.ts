import { PartialType } from '@nestjs/mapped-types';
import { CreateCoreMeetingRecordDto } from './create-core-meeting-record.dto';

export class UpdateCoreMeetingRecordDto extends PartialType(
  CreateCoreMeetingRecordDto,
) {}
