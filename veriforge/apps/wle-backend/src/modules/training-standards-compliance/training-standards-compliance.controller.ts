import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TrainingValidationOutcome } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { PublicRateLimited } from '../../security/decorators/public-rate-limit.decorator';
import {
  COMPANY_ADMIN_ROLES,
  STAFF_ROLES,
  TRAINING_INSTRUCTOR_ROLES,
  TRAINING_PROVIDER_ADMIN_ROLES,
} from '../vera-core/roles';
import {
  ApprovalWorkflowDto,
  RejectionWorkflowDto,
  ValidateCertificateDto,
  ValidateInstructorDto,
  ValidateProviderDto,
  ValidateTrainingDto,
} from './dto/training-standards.dto';
import { TrainingStandardsComplianceService } from './training-standards-compliance.service';
import { StandardsCatalogService } from './standards-catalog.service';
import { RegulatoryDecisionService } from './regulatory/regulatory-decision.service';
import { RegulatoryEquivalencyService } from './regulatory/regulatory-equivalency.service';
import { RegulatoryDecisionBodyDto } from './dto/regulatory-decision.dto';

type ReqUser = { user?: { id: number } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/training-standards`)
export class TrainingStandardsComplianceController {
  constructor(
    private readonly svc: TrainingStandardsComplianceService,
    private readonly catalog: StandardsCatalogService,
    private readonly regulatoryDecision: RegulatoryDecisionService,
    private readonly regulatoryEquivalency: RegulatoryEquivalencyService,
  ) {}

  @Get('dashboard')
  @Roles(...STAFF_ROLES)
  dashboard() {
    return this.svc.dashboard();
  }

  @Get('standards')
  @Roles(...STAFF_ROLES)
  listStandards() {
    return this.catalog.listStandards();
  }

  @Get('rejection-reasons')
  @Roles(...STAFF_ROLES)
  rejectionReasons() {
    return this.catalog.listRejectionReasons();
  }

  @Post('validate/training')
  @Roles(...TRAINING_INSTRUCTOR_ROLES, ...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  validateTraining(@Body() dto: ValidateTrainingDto, @Req() req: ReqUser) {
    return this.svc.validateTraining(
      dto.trainingRecordId,
      dto.jurisdictionCode,
      req.user?.id,
    );
  }

  /** Regulatory decision layer (additive; delegates to standards + equivalency). */
  @Post('regulatory/decision')
  @Roles(...TRAINING_INSTRUCTOR_ROLES, ...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  postRegulatoryDecision(
    @Body() dto: RegulatoryDecisionBodyDto,
    @Req() req: ReqUser,
  ) {
    return this.regulatoryDecision.verifyTrainingAgainstRegulations(
      {
        trainingRecordId: dto.trainingRecordId,
        jurisdictionCode: dto.jurisdictionCode,
      },
      req.user?.id,
    );
  }

  @Get('regulatory/decision/:trainingRecordId')
  @Roles(...STAFF_ROLES)
  latestRegulatoryDecision(
    @Param('trainingRecordId', ParseIntPipe) trainingRecordId: number,
  ) {
    return this.regulatoryDecision.getLatestDecision(trainingRecordId);
  }

  @Get('regulatory/equivalencies')
  @Roles(...STAFF_ROLES)
  listRegulatoryEquivalencies() {
    return this.regulatoryEquivalency.listActive();
  }

  @Post('validate/provider')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  validateProvider(@Body() dto: ValidateProviderDto, @Req() req: ReqUser) {
    return this.svc.validateProvider(
      dto.trainingProviderId,
      dto.jurisdictionCode,
      req.user?.id,
    );
  }

  @Post('validate/instructor')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  validateInstructor(@Body() dto: ValidateInstructorDto, @Req() req: ReqUser) {
    return this.svc.validateInstructor(
      dto.instructorId,
      dto.courseCode,
      dto.jurisdictionCode,
      req.user?.id,
    );
  }

  @PublicRateLimited(30, 60_000)
  @Post('validate/certificate')
  @HttpCode(HttpStatus.OK)
  validateCertificate(
    @Body() dto: ValidateCertificateDto,
    @Req() req: ReqUser,
  ) {
    return this.svc.validateCertificate(
      dto.certificateQrToken,
      dto.trainingRecordId,
      req.user?.id,
    );
  }

  @Get('results')
  @Roles(...STAFF_ROLES)
  getResults(
    @Query('trainingRecordId') trainingRecordId?: string,
    @Query('trainingProviderId') trainingProviderId?: string,
    @Query('outcome') outcome?: TrainingValidationOutcome,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getValidationResults({
      trainingRecordId: trainingRecordId ? Number(trainingRecordId) : undefined,
      trainingProviderId: trainingProviderId
        ? Number(trainingProviderId)
        : undefined,
      outcome,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('results/:id')
  @Roles(...STAFF_ROLES)
  async getResult(@Param('id', ParseIntPipe) id: number) {
    const row = await this.svc.getValidationResult(id);
    if (!row) throw new NotFoundException('Validation result not found');
    return row;
  }

  @Post('workflow/approve')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  approve(@Body() dto: ApprovalWorkflowDto, @Req() req: ReqUser) {
    return this.svc.approveValidation(
      dto.validationResultId,
      req.user!.id,
      dto.notes,
    );
  }

  @Post('workflow/reject')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  reject(@Body() dto: RejectionWorkflowDto, @Req() req: ReqUser) {
    return this.svc.rejectValidation(
      dto.validationResultId,
      dto.rejectionCodes,
      req.user!.id,
      dto.notes,
    );
  }
}
