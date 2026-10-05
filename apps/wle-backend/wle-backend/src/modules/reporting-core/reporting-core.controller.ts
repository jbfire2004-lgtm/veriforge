import {
  Controller,
  Get,
  Header,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { STAFF_ROLES, SUPERVISOR_ROLES } from '../vera-core/roles';
import { ReportingQueryDto } from './dto/reporting-query.dto';
import { ReportingCoreService } from './reporting-core.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/reporting`)
export class ReportingCoreController {
  constructor(private readonly reporting: ReportingCoreService) {}

  @Get('overview')
  @Roles(...SUPERVISOR_ROLES)
  overview(@Query() query: ReportingQueryDto) {
    return this.reporting.overview(query.companyId);
  }

  @Get('workers')
  @Roles(...STAFF_ROLES)
  workers(@Query() query: ReportingQueryDto) {
    return this.reporting.workerCompliance(query.companyId, query.limit ?? 200);
  }

  @Get('equipment')
  @Roles(...STAFF_ROLES)
  equipment(@Query() query: ReportingQueryDto) {
    return this.reporting.equipmentCompliance(query.companyId);
  }

  @Get('competency')
  @Roles(...STAFF_ROLES)
  competency(@Query() query: ReportingQueryDto) {
    return this.reporting.competencyStatus(query.companyId);
  }

  @Get('inspections')
  @Roles(...STAFF_ROLES)
  inspections(@Query() query: ReportingQueryDto) {
    return this.reporting.inspectionStatus(query.companyId);
  }

  @Get('projects')
  @Roles(...SUPERVISOR_ROLES)
  projects(@Query() query: ReportingQueryDto) {
    return this.reporting.projectReadiness(query.companyId, query.projectId);
  }

  @Get('companies')
  @Roles(...SUPERVISOR_ROLES)
  companies(@Query() query: ReportingQueryDto) {
    if (query.companyId) {
      return this.reporting.companyReadiness(query.companyId);
    }
    return this.reporting.companiesReadinessSummary(query.limit ?? 25);
  }

  @Get('union-halls')
  @Roles(...STAFF_ROLES)
  unionHalls(@Query() query: ReportingQueryDto) {
    return this.reporting.unionDispatchStatus(
      query.unionHallId,
      query.companyId,
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
  }

  @Get('export/workers')
  @Roles(...SUPERVISOR_ROLES)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="worker-compliance.csv"')
  async exportWorkers(@Query() query: ReportingQueryDto) {
    const csv = await this.reporting.exportWorkersCsv(query.companyId);
    return new StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
  }

  @Get('export/equipment')
  @Roles(...SUPERVISOR_ROLES)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header(
    'Content-Disposition',
    'attachment; filename="equipment-compliance.csv"',
  )
  async exportEquipment(@Query() query: ReportingQueryDto) {
    const csv = await this.reporting.exportEquipmentCsv(query.companyId);
    return new StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
  }

  @Get('export/projects')
  @Roles(...SUPERVISOR_ROLES)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="project-readiness.csv"')
  async exportProjects(@Query() query: ReportingQueryDto) {
    const csv = await this.reporting.exportProjectsCsv(query.companyId);
    return new StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
  }

  @Get('export/union-dispatch')
  @Roles(...SUPERVISOR_ROLES)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="union-dispatch.csv"')
  async exportUnionDispatch(@Query() query: ReportingQueryDto) {
    const csv = await this.reporting.exportUnionDispatchCsv(
      query.unionHallId,
      query.companyId,
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
    return new StreamableFile(new Uint8Array(Buffer.from(csv, 'utf-8')));
  }
}
