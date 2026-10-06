import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmControlledDocumentType,
  PmDocumentStatus,
  PmSdsCategory,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmDocumentControlService } from './pm-document-control.service';
import { PmDocumentCailIntelligenceService } from './pm-document-cail-intelligence.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/document-control`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmDocumentControlController {
  constructor(
    private readonly docs: PmDocumentControlService,
    private readonly cail: PmDocumentCailIntelligenceService,
  ) {}

  @Get('sds')
  listSds(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: PmSdsCategory,
    @Query('status') status?: PmDocumentStatus,
    @Query('search') search?: string,
  ) {
    return this.docs.listSds({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      category,
      status,
      search,
    });
  }

  @Post('sds')
  createSds(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.createSds(
      body as Parameters<PmDocumentControlService['createSds']>[0],
      req.user.id,
    );
  }

  @Get('sds/:id')
  getSds(@Param('id') id: string) {
    return this.docs.getSds(id);
  }

  @Put('sds/:id/status')
  @Roles(...SUPERVISOR_ROLES)
  transitionSds(
    @Param('id') id: string,
    @Body('status') status: PmDocumentStatus,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.transitionSds(id, status, req.user.id);
  }

  @Post('sds/:id/replace')
  @Roles(...SUPERVISOR_ROLES)
  replaceSds(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.replaceSds(
      id,
      body as Parameters<PmDocumentControlService['replaceSds']>[1],
      req.user.id,
    );
  }

  @Post('sds/:id/attachments')
  addSdsAttachment(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.docs.addSdsAttachment(
      id,
      body as Parameters<PmDocumentControlService['addSdsAttachment']>[1],
    );
  }

  @Get('chemical-inventory')
  listInventory(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('siteId') siteId?: string,
  ) {
    return this.docs.listChemicalInventory({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      siteId: siteId ? parseInt(siteId, 10) : undefined,
    });
  }

  @Post('chemical-inventory')
  upsertInventory(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.upsertChemicalItem(
      body as Parameters<PmDocumentControlService['upsertChemicalItem']>[0],
      req.user.id,
    );
  }

  @Post('chemical-inventory/scan/:projectId')
  @Roles(...SUPERVISOR_ROLES)
  scanDeficiencies(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.scanChemicalDeficiencies(
      parseInt(projectId, 10),
      req.user.id,
    );
  }

  @Get('controlled')
  listControlled(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('documentType') documentType?: PmControlledDocumentType,
    @Query('status') status?: PmDocumentStatus,
  ) {
    return this.docs.listControlledDocuments({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      documentType,
      status,
    });
  }

  @Post('controlled')
  @Roles(...SUPERVISOR_ROLES)
  createControlled(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.createControlledDocument(
      body as Parameters<
        PmDocumentControlService['createControlledDocument']
      >[0],
      req.user.id,
    );
  }

  @Put('controlled/:id/status')
  @Roles(...SUPERVISOR_ROLES)
  transitionControlled(
    @Param('id') id: string,
    @Body('status') status: PmDocumentStatus,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.transitionControlledDocument(id, status, req.user.id);
  }

  @Get('policies')
  listPolicies(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.docs.listPolicies(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('policies/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishPolicy(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.docs.publishPolicy(id, req.user.id);
  }

  @Post('acknowledge')
  acknowledge(@Body() body: Record<string, unknown>) {
    return this.docs.acknowledgeDocument(
      body as Parameters<PmDocumentControlService['acknowledgeDocument']>[0],
    );
  }

  @Get('manufacturer-instructions')
  listManufacturer(
    @Query('companyId') companyId: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.docs.listManufacturerInstructions(
      parseInt(companyId, 10),
      equipmentId ? parseInt(equipmentId, 10) : undefined,
    );
  }

  @Post('manufacturer-instructions')
  @Roles(...SUPERVISOR_ROLES)
  createManufacturer(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.createManufacturerInstruction(
      body as Parameters<
        PmDocumentControlService['createManufacturerInstruction']
      >[0],
      req.user.id,
    );
  }

  @Get('manufacturer-instructions/equipment/:equipmentId/suggest-controls')
  suggestControls(@Param('equipmentId') equipmentId: string) {
    return this.docs.suggestControlsFromManufacturer(parseInt(equipmentId, 10));
  }

  @Get('access/worker')
  workerAccess(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.docs.workerAccessCheck(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.docs.analytics(parseInt(projectId, 10));
  }

  @Get('intelligence/project/:projectId')
  intelligence(@Param('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @Post('intelligence/suggest-sds')
  suggestSds(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      taskKeywords: string[];
      equipmentIds?: number[];
    },
  ) {
    return this.cail.suggestSdsForTask(body);
  }

  @Get('sync/project/:projectId')
  syncBundle(@Param('projectId') projectId: string) {
    return this.docs.syncBundle(parseInt(projectId, 10));
  }

  @Post('sync/project/:projectId')
  applySync(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.applyOfflineSync(
      parseInt(projectId, 10),
      body as Parameters<PmDocumentControlService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('station/:companyId')
  stationPayload(
    @Param('companyId') companyId: string,
    @Query('siteId') siteId?: string,
  ) {
    return this.docs.stationSyncPayload(
      parseInt(companyId, 10),
      siteId ? parseInt(siteId, 10) : undefined,
    );
  }
}
