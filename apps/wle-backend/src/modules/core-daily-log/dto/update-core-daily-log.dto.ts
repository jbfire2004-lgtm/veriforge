import { PartialType } from '@nestjs/mapped-types';
import { CreateCoreDailyLogDto } from './create-core-daily-log.dto';

export class UpdateCoreDailyLogDto extends PartialType(CreateCoreDailyLogDto) {}
