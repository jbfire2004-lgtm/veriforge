import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  PM_SAFETY_ACTIONS,
  type PmSafetyAction,
} from '../pm-safety-workflow.types';

export class TransitionPmSafetyWorkflowDto {
  @IsIn([...PM_SAFETY_ACTIONS])
  action!: PmSafetyAction;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
