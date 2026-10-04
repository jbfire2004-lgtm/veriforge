import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SafetyFormStatus, SafetyFormType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditLogService } from '../audit/audit-log.service';
import { API_V1_PREFIX } from '../config/routes';
import { rolesFor } from '../security/rbac';
import { AddAttachmentDto } from './dto/safety-forms.dto';
import { SafetyFormTransitionDto } from './dto/safety-form-transition.dto';
import {
  CreateSafetyWorkflowFormDto,
  SaveSafetyWorkflowDraftDto,
  SubmitSafetyWorkflowFormDto,
} from './dto/safety-workflow.dto';
import { SafetyWorkflowEngineService } from './workflows/safety-workflow-engine.service';

type AuthReq = { user?: { id: number; role: UserRole } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...rolesFor('submitSafetyForms'))
@Controller(`${API_V1_PREFIX}/safety`)
export class SafetyWorkflowController {
  constructor(
    private readonly engine: SafetyWorkflowEngineService,
    private readonly audit: AuditLogService,
  ) {}

  @Get('forms')
  list(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('workerId') workerId?: string,
    @Query('formType') formType?: SafetyFormType,
    @Query('status') status?: SafetyFormStatus,
    @Query('awaitingReview') awaitingReview?: string,
  ) {
    const parse = (v?: string) => {
      const n = v ? parseInt(v, 10) : NaN;
      return Number.isFinite(n) ? n : undefined;
    };
    return this.engine.listForms({
      companyId: parse(companyId),
      projectId: parse(projectId),
      workerId: parse(workerId),
      formType,
      status,
      awaitingReview: awaitingReview === 'true',
    });
  }

  @Get('forms/:formId')
  getOne(@Param('formId') formId: string) {
    return this.engine.getForm(formId);
  }

  @Post('forms')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() body: CreateSafetyWorkflowFormDto, @Req() req: AuthReq) {
    return this.engine.createForm(body, {
      id: req.user!.id,
      role: req.user!.role,
    });
  }

  @Put('forms/:formId/draft')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  saveDraft(
    @Param('formId') formId: string,
    @Body() body: SaveSafetyWorkflowDraftDto,
    @Req() req: AuthReq,
  ) {
    return this.engine.saveDraft(formId, body.formData, {
      id: req.user!.id,
      role: req.user!.role,
    });
  }

  @Post('forms/:formId/submit')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  submit(
    @Param('formId') formId: string,
    @Body() body: SubmitSafetyWorkflowFormDto,
    @Req() req: AuthReq,
  ) {
    return this.engine.submit(
      formId,
      body.formData,
      {
        id: req.user!.id,
        role: req.user!.role,
      },
      body.signatures,
    );
  }

  @Post('forms/:formId/transition')
  @Roles(...rolesFor('approveSafetyForms'))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async transition(
    @Param('formId') formId: string,
    @Body() body: SafetyFormTransitionDto,
    @Req() req: AuthReq,
  ) {
    const result = await this.engine.transition(
      formId,
      body.status,
      {
        id: req.user!.id,
        role: req.user!.role,
      },
      body.note,
    );

    if (['APPROVED', 'REJECTED', 'CLOSED'].includes(body.status)) {
      await this.audit.logAudit(
        { id: req.user!.id },
        'safety_form.transition',
        { type: 'SafetyForm', id: formId },
        { status: body.status, note: body.note ?? null },
      );
    }

    return result;
  }

  @Get('forms/:formId/attachments')
  listAttachments(@Param('formId') formId: string) {
    return this.engine.listAttachments(formId);
  }

  @Post('forms/:formId/attachments')
  addAttachment(
    @Param('formId') formId: string,
    @Body() dto: AddAttachmentDto,
    @Req() req: AuthReq,
  ) {
    return this.engine.addAttachment(formId, dto, {
      id: req.user!.id,
      role: req.user!.role,
    });
  }

  @Delete('forms/:formId/attachments/:attachmentId')
  removeAttachment(
    @Param('formId') formId: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: AuthReq,
  ) {
    return this.engine.removeAttachment(formId, attachmentId, {
      id: req.user!.id,
      role: req.user!.role,
    });
  }
}
