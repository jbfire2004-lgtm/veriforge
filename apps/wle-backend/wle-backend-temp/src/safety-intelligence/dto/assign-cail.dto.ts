import { IsInt, IsOptional } from 'class-validator';

export class AssignCailDto {
  @IsOptional()
  @IsInt()
  assignedUserId?: number;

  @IsOptional()
  @IsInt()
  ownerCompanyId?: number;
}
