import { PartialType } from '@nestjs/mapped-types';
import { CreateSafetyObservationDto } from './create-safety-observation.dto';

export class UpdateSafetyObservationDto extends PartialType(
  CreateSafetyObservationDto,
) {}
