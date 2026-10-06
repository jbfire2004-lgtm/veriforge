import { IsInt } from 'class-validator';

export class AssignProjectDto {
  @IsInt()
  projectId!: number;
}
