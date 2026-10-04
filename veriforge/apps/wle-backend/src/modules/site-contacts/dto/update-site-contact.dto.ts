import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSiteContactDto } from './create-site-contact.dto';

/** Site cannot be moved via PATCH — omit siteId from partial update */
export class UpdateSiteContactDto extends PartialType(
  OmitType(CreateSiteContactDto, ['siteId'] as const),
) {}
