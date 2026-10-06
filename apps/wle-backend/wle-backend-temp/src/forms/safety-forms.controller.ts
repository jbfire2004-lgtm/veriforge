import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SafetyFormStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { API_V1_PREFIX } from '../config/routes';
import { rolesFor } from '../security/rbac';
import { DefinitionsService } from './definitions/definitions.service';
import { SafetyFormSubmissionsService } from './submissions/submissions.service';
import { SafetyFormWorkflowsService } from './workflows/workflows.service';
import { SafetyFormAttachmentsService } from './attachments/attachments.service';
import { SafetyFormAnalyticsService } from './analytics/analytics.service';
import { AutoPopulateService } from './integration/auto-populate.service';
import { SafetyFormCorrectiveActionsService } from './corrective-actions/corrective-actions.service';
import {
  AddAttachmentDto,
  CreateSafetyFormDto,
  OfflineSyncDto,
  SaveSafetyFormDraftDto,
  SubmitSafetyFormDto,
  TransitionSafetyFormDto,
} from './dto/safety-forms.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
)
@Controller(`${API_V1_PREFIX}/pm/safety-forms`)
export class SafetyFormsController {
  constructor(
    private readonly definitions: DefinitionsService,
    private readonly submissions: SafetyFormSubmissionsService,
    private readonly workflows: SafetyFormWorkflowsService,
    private readonly attachments: SafetyFormAttachmentsService,
    private readonly analytics: SafetyFormAnalyticsService,
    private readonly autoPopulate: AutoPopulateService,
    private readonly correctiveActions: SafetyFormCorrectiveActionsService,
  ) {}

  @Get('workflow/definition')
  workflowDefinition() {
    return this.workflows.getDefinition();
  }

  @Get('definitions')
  listDefinitions(@Query('category') category?: string) {
    return this.definitions.listDefinitions(category);
  }

  @Get('definitions/:id')
  getDefinition(@Param('id') id: string) {
    const def = this.definitions.getDefinition(id);
    if (!def) throw new NotFoundException(`Form definition "${id}" not found`);
    return def;
  }

  @Get('auto-populate')
  autoPopulateContext(
    @Query('workerId') workerId?: string,
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.autoPopulate.buildContext({
      workerId: workerId ? parseInt(workerId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
    });
  }

  @Get('analytics/dashboard')
  dashboard(@Query('companyId') companyId?: string) {
    const cid = companyId ? parseInt(companyId, 10) : undefined;
    return this.analytics.dashboard(Number.isFinite(cid) ? cid : undefined);
  }

  @Get('analytics/indicators')
  indicators(@Query('companyId') companyId?: string) {
    const cid = companyId ? parseInt(companyId, 10) : undefined;
    return this.analytics.leadingLagging(
      Number.isFinite(cid) ? cid : undefined,
    );
  }

  @Get()
  list(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('definitionId') definitionId?: string,
    @Query('status') status?: string,
    @Query('workerId') workerId?: string,
  ) {
    const parse = (v?: string) => {
      const n = v ? parseInt(v, 10) : NaN;
      return Number.isFinite(n) ? n : undefined;
    };
    const st = Object.values(SafetyFormStatus).includes(
      status as SafetyFormStatus,
    )
      ? (status as SafetyFormStatus)
      : undefined;
    return this.submissions.list({
      companyId: parse(companyId),
      projectId: parse(projectId),
      definitionId,
      status: st,
      workerId: parse(workerId),
    });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.submissions.getById(id);
  }

  @Get(':id/actions')
  listActions(@Param('id') id: string) {
    return this.correctiveActions.listForForm(id);
  }

  @Post()
  create(
    @Body() dto: CreateSafetyFormDto,
    @Req() req: { user?: { id: number } },
  ) {
    return this.submissions.create({
      ...dto,
      createdById: req.user?.id,
    });
  }

  @Post('sync')
  offlineSync(
    @Body() dto: OfflineSyncDto,
    @Req() req: { user?: { id: number } },
  ) {
    return this.submissions.syncOffline({
      ...dto,
      actorId: req.user?.id,
    });
  }

  @Put(':id/draft')
  saveDraft(
    @Param('id') id: string,
    @Body() dto: SaveSafetyFormDraftDto,
    @Req() req: { user?: { id: number } },
  ) {
    return this.submissions.saveDraft(id, dto.formData, req.user?.id);
  }

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitSafetyFormDto,
    @Req() req: { user?: { id: number } },
  ) {
    return this.submissions.submit(
      id,
      dto.formData,
      req.user?.id,
      dto.signatures,
    );
  }

  @Post(':id/transition')
  @Roles(...rolesFor('approveSafetyForms'))
  transition(
    @Param('id') id: string,
    @Body() dto: TransitionSafetyFormDto,
    @Req() req: { user?: { id: number } },
  ) {
    return this.workflows.transition(id, dto.status, req.user?.id, dto.note);
  }

  @Post(':id/attachments')
  addAttachment(@Param('id') id: string, @Body() dto: AddAttachmentDto) {
    return this.attachments.add(id, dto);
  }
}
