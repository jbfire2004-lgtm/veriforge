import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { TrainingRequirementsService } from './training-requirements.service';

@Controller('training-requirements')
export class TrainingRequirementsController {
  constructor(
    private readonly trainingRequirementsService: TrainingRequirementsService,
  ) {}

  // GET /training-requirements/company/:companyId
  @Get('company/:companyId')
  getCompanyRequirements(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.trainingRequirementsService.getCompanyRequirements(companyId);
  }

  // POST /training-requirements/company/:companyId
  @Post('company/:companyId')
  setCompanyRequirements(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body()
    body: {
      requirements: { courseName: string; expiresInDays: number }[];
    },
  ) {
    return this.trainingRequirementsService.setCompanyRequirements(
      companyId,
      body.requirements,
    );
  }

  // PATCH /training-requirements/:id
  @Patch(':id')
  updateRequirement(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{ courseName: string; expiresInDays: number }>,
  ) {
    return this.trainingRequirementsService.updateRequirement(id, body);
  }

  // DELETE /training-requirements/:id
  @Delete(':id')
  removeRequirement(@Param('id', ParseIntPipe) id: number) {
    return this.trainingRequirementsService.removeRequirement(id);
  }
}
