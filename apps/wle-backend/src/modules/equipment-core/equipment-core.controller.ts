import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinkComplianceStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import {
  COMPANY_ADMIN_ROLES,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
} from '../vera-core/roles';
import { EquipmentCoreService } from './equipment-core.service';
import { CreateEquipmentCoreDto } from './dto/create-equipment-core.dto';
import { UpdateEquipmentCoreDto } from './dto/update-equipment-core.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateCalibrationDto } from './dto/create-calibration.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { LockoutEquipmentDto } from './dto/lockout-equipment.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { ScanEquipmentQrDto } from './dto/scan-qr.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/equipment`)
export class EquipmentCoreController {
  constructor(private readonly equipment: EquipmentCoreService) {}

  @Get()
  @Roles(...STAFF_ROLES)
  list(
    @Query('companyId') companyId?: string,
    @Query('q') q?: string,
    @Query('activeOnly') activeOnly?: string,
    @Query('limit') limit?: string,
    @Query('complianceStatus') complianceStatus?: LinkComplianceStatus,
    @Query('compliant') compliant?: string,
  ) {
    return this.equipment.list({
      companyId: companyId ? Number(companyId) : undefined,
      q,
      activeOnly: activeOnly !== 'false',
      limit: limit ? Number(limit) : undefined,
      complianceStatus,
      compliant:
        compliant === 'true' ? true : compliant === 'false' ? false : undefined,
    });
  }

  @Get('dashboard')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  dashboard(@Query('companyId') companyId?: string) {
    return this.equipment.dashboard(companyId ? Number(companyId) : undefined);
  }

  @Get('search')
  @Roles(...STAFF_ROLES)
  search(
    @Query('q') q?: string,
    @Query('serial') serial?: string,
    @Query('assetTag') assetTag?: string,
    @Query('qr') qr?: string,
    @Query('limit') limit?: string,
  ) {
    return this.equipment.search({
      q,
      serial,
      assetTag,
      qr,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('categories')
  @Roles(...STAFF_ROLES)
  categories() {
    return this.equipment.listCategories();
  }

  @Post()
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateEquipmentCoreDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.create(dto, req.user.id);
  }

  @Post('scan')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  scanQr(@Body() dto: ScanEquipmentQrDto) {
    return this.equipment.scanQr(dto.qrToken, dto.companyId);
  }

  @Get(':id')
  @Roles(...STAFF_ROLES)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipment.findOne(id);
  }

  @Patch(':id')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentCoreDto,
  ) {
    return this.equipment.update(id, dto);
  }

  @Get(':id/timeline')
  @Roles(...STAFF_ROLES)
  timeline(@Param('id', ParseIntPipe) id: number) {
    return this.equipment.getTimeline(id);
  }

  @Get(':id/qr')
  @Roles(...STAFF_ROLES)
  qr(@Param('id', ParseIntPipe) id: number) {
    return this.equipment.getQr(id);
  }

  @Post(':id/link-company')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  linkCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { companyId: number },
  ) {
    return this.equipment.linkToCompany(id, body.companyId);
  }

  @Post(':id/end-company')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  endCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { companyId: number },
  ) {
    return this.equipment.endCompanyAssignment(id, body.companyId);
  }

  @Post(':id/assign-project')
  @Roles(...SUPERVISOR_ROLES)
  assignProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProjectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.assignToProject(id, dto.projectId, req.user.id);
  }

  @Post(':id/remove-project')
  @Roles(...SUPERVISOR_ROLES)
  removeProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProjectDto,
  ) {
    return this.equipment.removeFromProject(id, dto.projectId);
  }

  @Post(':id/assign-worker')
  @Roles(...SUPERVISOR_ROLES)
  assignWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignWorkerDto,
  ) {
    return this.equipment.assignWorker(id, dto.workerId, dto.companyId);
  }

  @Post(':id/remove-worker')
  @Roles(...SUPERVISOR_ROLES)
  removeWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignWorkerDto,
  ) {
    return this.equipment.removeWorker(id, dto.workerId, dto.companyId);
  }

  @Post(':id/lockout')
  @Roles(...SUPERVISOR_ROLES)
  lockout(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LockoutEquipmentDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.lockout(id, dto, req.user.id);
  }

  @Post(':id/unlock')
  @Roles(...SUPERVISOR_ROLES)
  unlock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { notes?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.unlock(id, req.user.id, body.notes);
  }

  @Post(':id/maintenance')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  maintenance(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMaintenanceDto,
  ) {
    return this.equipment.addMaintenance(id, dto);
  }

  @Post(':id/calibration')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  calibration(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCalibrationDto,
  ) {
    return this.equipment.addCalibration(id, dto);
  }

  @Post(':id/attachments')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  attachment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.equipment.addAttachment(id, dto);
  }
}
