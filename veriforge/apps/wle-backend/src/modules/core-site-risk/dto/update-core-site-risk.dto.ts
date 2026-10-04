import { PartialType } from '@nestjs/mapped-types';
import { CreateCoreSiteRiskDto } from './create-core-site-risk.dto';

export class UpdateCoreSiteRiskDto extends PartialType(CreateCoreSiteRiskDto) {}
