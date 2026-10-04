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
import {
  InspectionChecklistCategory,
  InspectionType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { COMPANY_ADMIN_ROLES, SUPERVISOR_ROLES } from '../vera-core/roles';
import { CreateChecklistDto, UpdateChecklistDto } from './dto/checklist.dto';
import {
  CreateInspectionDto,
  UnlockAfterInspectionDto,
} from './dto/create-inspection.dto';
import { InspectionCoreService } from './inspection-core.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/inspections`)
export class InspectionCoreController {
  constructor(private readonly inspections: InspectionCoreService) {}

  @Get('dashboard')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  dashboard(@Query('companyId') companyId?: string) {
    return this.inspections.dashboard(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('due')
  @Roles(...SUPERVISOR_ROLES)
  listDue(
    @Query('companyId') companyId?: string,
    @Query('withinDays') withinDays?: string,
  ) {
    return this.inspections.listDue(
      companyId ? Number(companyId) : undefined,
      withinDays ? Number(withinDays) : 7,
    );
  }

  @Post('notify-due')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  notifyDue(
    @Query('companyId') companyId?: string,
    @Query('withinDays') withinDays?: string,
  ) {
    return this.inspections.notifyDueInspections(
      companyId ? Number(companyId) : undefined,
      withinDays ? Number(withinDays) : 7,
    );
  }

  @Get('checklists')
  @Roles(...SUPERVISOR_ROLES)
  listChecklists(
    @Query('inspectionType') inspectionType?: InspectionType,
    @Query('category') category?: InspectionChecklistCategory,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.inspections.listChecklists({
      inspectionType,
      category,
      activeOnly: activeOnly !== 'false',
    });
  }

  @Post('checklists')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createChecklist(@Body() dto: CreateChecklistDto) {
    return this.inspections.createChecklist(dto);
  }

  @Get('checklists/:id(\\d+)')
  @Roles(...SUPERVISOR_ROLES)
  getChecklist(@Param('id', ParseIntPipe) id: number) {
    return this.inspections.getChecklist(id);
  }

  @Put('checklists/:id(\\d+)')
  @Roles(...COMPANY_ADMIN_ROLES)
  updateChecklist(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChecklistDto,
  ) {
    return this.inspections.updateChecklist(id, dto);
  }

  @Get('equipment/:equipmentId')
  @Roles(...SUPERVISOR_ROLES)
  listForEquipment(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.inspections.listForEquipment(equipmentId);
  }

  @Post('equipment/:equipmentId/unlock')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.OK)
  unlock(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
    @Body() body: UnlockAfterInspectionDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.inspections.unlockEquipment(
      equipmentId,
      req.user.id,
      body.notes,
    );
  }

  @Post()
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER)
  @HttpCode(HttpStatus.CREATED)
  submit(
    @Body() dto: CreateInspectionDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.inspections.submitInspection(dto, req.user.id);
  }

  // Digits-only so static PM catalog routes (`/templates`, `/smart`, …) on the
  // same `/api/v1/inspections` prefix are not swallowed by this param route.
  @Get(':id(\\d+)')
  @Roles(...SUPERVISOR_ROLES)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.inspections.getInspection(id);
  }
}
