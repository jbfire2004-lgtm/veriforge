import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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
import {
  CreateCalibrationRecordDto,
  CreateCalibrationScheduleDto,
  CreateMaintenanceRecordDto,
  CreateMaintenanceScheduleDto,
} from './dto/maintenance-calibration.dto';
import { MaintenanceCalibrationCoreService } from './maintenance-calibration-core.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/maintenance-calibration`)
export class MaintenanceCalibrationCoreController {
  constructor(private readonly svc: MaintenanceCalibrationCoreService) {}

  @Get('dashboard')
  @Roles(...SUPERVISOR_ROLES)
  dashboard(@Query('companyId') companyId?: string) {
    return this.svc.dashboard(companyId ? Number(companyId) : undefined);
  }

  @Post('notify-due')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  notifyDue(
    @Query('companyId') companyId?: string,
    @Query('withinDays') withinDays?: string,
  ) {
    return this.svc.notifyDue(
      companyId ? Number(companyId) : undefined,
      withinDays ? Number(withinDays) : 14,
    );
  }

  @Get('maintenance-records')
  @Roles(...STAFF_ROLES)
  listMaintenanceRecords(
    @Query('equipmentId') equipmentId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.svc.listMaintenanceRecords(
      equipmentId ? Number(equipmentId) : undefined,
      companyId ? Number(companyId) : undefined,
    );
  }

  @Post('maintenance-records')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createMaintenanceRecord(
    @Body() dto: CreateMaintenanceRecordDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.svc.createMaintenanceRecord(dto, req.user.id);
  }

  @Get('maintenance-schedules')
  @Roles(...STAFF_ROLES)
  listMaintenanceSchedules(
    @Query('equipmentId') equipmentId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.svc.listMaintenanceSchedules(
      equipmentId ? Number(equipmentId) : undefined,
      companyId ? Number(companyId) : undefined,
    );
  }

  @Post('maintenance-schedules')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createMaintenanceSchedule(@Body() dto: CreateMaintenanceScheduleDto) {
    return this.svc.createMaintenanceSchedule(dto);
  }

  @Get('calibration-records')
  @Roles(...STAFF_ROLES)
  listCalibrationRecords(
    @Query('equipmentId') equipmentId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.svc.listCalibrationRecords(
      equipmentId ? Number(equipmentId) : undefined,
      companyId ? Number(companyId) : undefined,
    );
  }

  @Post('calibration-records')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createCalibrationRecord(
    @Body() dto: CreateCalibrationRecordDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.svc.createCalibrationRecord(dto, req.user.id);
  }

  @Get('calibration-schedules')
  @Roles(...STAFF_ROLES)
  listCalibrationSchedules(
    @Query('equipmentId') equipmentId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.svc.listCalibrationSchedules(
      equipmentId ? Number(equipmentId) : undefined,
      companyId ? Number(companyId) : undefined,
    );
  }

  @Post('calibration-schedules')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createCalibrationSchedule(@Body() dto: CreateCalibrationScheduleDto) {
    return this.svc.createCalibrationSchedule(dto);
  }

  @Get('equipment/:equipmentId/summary')
  @Roles(...STAFF_ROLES)
  equipmentSummary(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.svc.getEquipmentSummary(equipmentId);
  }
}
