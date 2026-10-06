import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { AuditLogService } from './audit-log.service';
import { CreateEquipmentDto } from './dto/configuration-instance.dto';
import { SaveWorksheetDto } from './dto/worksheet.dto';
import { EquipmentCatalogService } from './equipment-catalog.service';
import { FallClearanceService } from './fall-clearance.service';
import { StandardsLibraryService } from './standards-library.service';

const CALC_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

const REVIEW_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

type AuthReq = {
  user?: { id?: number; userId?: number | string; sub?: string; name?: string };
};

@Controller(`${API_V1_PREFIX}/fall-clearance`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CALC_ROLES)
export class FallClearanceController {
  constructor(
    private readonly clearanceService: FallClearanceService,
    private readonly equipmentService: EquipmentCatalogService,
    private readonly standardsService: StandardsLibraryService,
    private readonly auditService: AuditLogService,
  ) {}

  @Post('worksheet/save')
  async saveWorksheet(@Body() body: SaveWorksheetDto, @Req() req: AuthReq) {
    const acknowledgedBy =
      body.acknowledgedBy?.trim() ||
      (typeof req.user?.name === 'string' ? req.user.name : undefined) ||
      String(req.user?.sub ?? req.user?.userId ?? req.user?.id ?? 'user');
    return this.clearanceService.saveWorksheet({
      ...body,
      acknowledgedBy,
    });
  }

  @Get('worksheet/:id')
  async getWorksheet(@Param('id') id: string) {
    return this.clearanceService.getWorksheet(id);
  }

  @Get('worksheets')
  async listWorksheets(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.clearanceService.listWorksheets({
      companyId: companyId ? Number(companyId) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
    });
  }

  @Get('equipment')
  async listEquipment(@Query('all') all?: string) {
    return this.equipmentService.list({
      includeAllStatuses: all === 'true' || all === '1',
    });
  }

  @Get('equipment/:id')
  async getEquipment(@Param('id') id: string) {
    return this.equipmentService.get(id);
  }

  @Post('equipment')
  async createEquipment(@Body() body: CreateEquipmentDto) {
    return this.equipmentService.create(body);
  }

  @Post('equipment/:id/ingest-manual')
  async ingestManual(@Param('id') id: string, @Body() body: { text: string }) {
    return this.equipmentService.ingestManual(id, body.text);
  }

  @Post('equipment/:id/approve')
  @Roles(...REVIEW_ROLES)
  async approveEquipment(@Param('id') id: string) {
    return this.equipmentService.approve(id);
  }

  @Post('equipment/:id/reject')
  @Roles(...REVIEW_ROLES)
  async rejectEquipment(@Param('id') id: string) {
    return this.equipmentService.reject(id);
  }

  @Get('standards/csa/z259.16')
  async getStandards() {
    return this.standardsService.getCSA_Z259_16();
  }

  @Get('disclaimer')
  async getDisclaimer() {
    return { disclaimer: this.clearanceService.getDisclaimer() };
  }

  @Get('audit')
  async getAudit(
    @Query('siteId') siteId?: string,
    @Query('projectId') projectId?: string,
    @Query('equipmentId') equipmentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditService.list({
      siteId,
      projectId,
      equipmentId,
      from,
      to,
    });
  }
}
