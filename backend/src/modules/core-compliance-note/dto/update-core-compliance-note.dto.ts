import { PartialType } from '@nestjs/mapped-types';
import { CreateCoreComplianceNoteDto } from './create-core-compliance-note.dto';

export class UpdateCoreComplianceNoteDto extends PartialType(
  CreateCoreComplianceNoteDto,
) {}
