import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import {
  COMPANY_ADMIN_ROLES,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
} from '../vera-core/roles';
import { CompetencyService } from './competency.service';
import {
  CheckCompetencyDto,
  EvaluateCompetencyDto,
  UpsertCompetencyRequirementDto,
} from './dto/evaluate-competency.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/competency`)
export class CompetencyController {
  constructor(private readonly competency: CompetencyService) {}

  @Get('dashboard')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  dashboard(@Query('companyId') companyId?: string) {
    return this.competency.dashboard(companyId ? Number(companyId) : undefined);
  }

  @Post('evaluate')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  evaluate(
    @Body() dto: EvaluateCompetencyDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.competency.evaluate({
      ...dto,
      evaluatorUserId: req.user.id,
      evaluationDate: dto.evaluationDate
        ? new Date(dto.evaluationDate)
        : undefined,
    });
  }

  @Post('check')
  @Roles(...STAFF_ROLES)
  @HttpCode(HttpStatus.OK)
  check(@Body() dto: CheckCompetencyDto) {
    return this.competency.checkWorkerEquipment(dto.workerId, dto.equipmentId);
  }

  @Get('workers/:workerId')
  @Roles(...STAFF_ROLES)
  workerHistory(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.competency.listForWorker(workerId);
  }

  @Get('equipment/:equipmentId')
  @Roles(...STAFF_ROLES)
  equipmentEvaluations(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ) {
    return this.competency.listForEquipment(equipmentId);
  }

  @Get('equipment/:equipmentId/requirements')
  @Roles(...STAFF_ROLES)
  equipmentRequirements(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ) {
    return this.competency.getEquipmentRequirements(equipmentId);
  }

  @Put('equipment/:equipmentId/requirements')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  upsertEquipmentRequirements(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Body() dto: UpsertCompetencyRequirementDto,
  ) {
    return this.competency.upsertEquipmentRequirement(equipmentId, dto);
  }

  @Put('types/:typeId/requirements')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  upsertTypeRequirements(
    @Param('typeId', ParseIntPipe) typeId: number,
    @Body() dto: UpsertCompetencyRequirementDto,
  ) {
    return this.competency.upsertTypeRequirement(typeId, dto);
  }
}
