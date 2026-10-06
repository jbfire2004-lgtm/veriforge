import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { PublicRateLimited } from '../../security/decorators/public-rate-limit.decorator';
import { rolesFor } from '../../security/rbac';
import {
  COMPANY_ADMIN_ROLES,
  SUPER_ADMIN_ROLES,
  TRAINING_INSTRUCTOR_ROLES,
  TRAINING_PROVIDER_ADMIN_ROLES,
} from '../vera-core/roles';
import {
  CertificateUploadDto,
  CreateTrainingCourseDto,
  CreateTrainingInstructorDto,
  CreateTrainingProviderDto,
  InstructorOnboardingDto,
  IssueCertificateDto,
  ProviderApprovalDto,
  ProviderOnboardingDto,
  RequestApprovalDto,
  SignCertificateDto,
  UpdateTrainingProviderProfileDto,
  UploadClassListDto,
  UploadTrainingDto,
} from './dto/training-provider.dto';
import { TrainingProviderPermission } from './training-provider-permissions';
import {
  TrainingProviderAccessService,
  PortalUser,
} from './training-provider-access.service';
import { TrainingProviderCoreService } from './training-provider-core.service';

type ReqUser = { user?: PortalUser };

function portalUser(req: ReqUser): PortalUser {
  return req.user as PortalUser;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/training-providers`)
export class TrainingProviderCoreController {
  constructor(
    private readonly svc: TrainingProviderCoreService,
    private readonly access: TrainingProviderAccessService,
  ) {}

  @Get('portal/me')
  @Roles(...TRAINING_INSTRUCTOR_ROLES)
  portalMe(@Req() req: ReqUser) {
    return this.access.getPortalContext(portalUser(req));
  }

  @PublicRateLimited(10, 60_000)
  @Post('onboarding/provider')
  onboardProvider(@Body() dto: ProviderOnboardingDto) {
    return this.access.onboardProvider(dto);
  }

  @Post('onboarding/provider/:providerId/instructor')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  onboardInstructor(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: InstructorOnboardingDto,
    @Req() req: ReqUser,
  ) {
    return this.access.onboardInstructor(providerId, dto, portalUser(req));
  }

  @Get('providers')
  @Roles(...SUPER_ADMIN_ROLES, ...COMPANY_ADMIN_ROLES)
  listProviders() {
    return this.svc.listProviders();
  }

  @Post('providers')
  @Roles(...SUPER_ADMIN_ROLES)
  createProvider(@Body() dto: CreateTrainingProviderDto) {
    return this.svc.createProvider(dto);
  }

  @Get('providers/:id')
  @Roles(...TRAINING_INSTRUCTOR_ROLES, ...COMPANY_ADMIN_ROLES)
  async getProvider(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), id);
    return this.svc.getProvider(id);
  }

  @Get('dashboard')
  @Roles(...TRAINING_INSTRUCTOR_ROLES, ...SUPER_ADMIN_ROLES)
  async dashboard(
    @Req() req: ReqUser,
    @Query('providerId') providerId?: string,
  ) {
    const pid = await this.access.resolveProviderId(
      portalUser(req),
      providerId ? Number(providerId) : undefined,
    );
    return this.svc.dashboard(pid);
  }

  @Patch('providers/:id/profile')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingProviderProfileDto,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), id);
    return this.svc.updateProfile(id, dto);
  }

  @Get('providers/:id/approval-status')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES, ...COMPANY_ADMIN_ROLES)
  approvalStatus(@Param('id', ParseIntPipe) id: number, @Req() req: ReqUser) {
    return this.access.getApprovalStatus(id, portalUser(req));
  }

  @Post('providers/:id/request-approval')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  requestApproval(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RequestApprovalDto,
    @Req() req: ReqUser,
  ) {
    return this.access.requestApproval(id, dto, portalUser(req));
  }

  @Post('providers/:id/approve')
  @Roles(...COMPANY_ADMIN_ROLES)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProviderApprovalDto,
    @Req() req: ReqUser,
  ) {
    return this.svc.approveProvider(id, dto, req.user!.id);
  }

  @Get('providers/:id/compliance')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES, ...COMPANY_ADMIN_ROLES)
  async compliance(@Param('id', ParseIntPipe) id: number, @Req() req: ReqUser) {
    await this.svc.assertAccess(portalUser(req), id);
    return this.svc.getComplianceHistory(id);
  }

  @Post('providers/:id/compliance/assess')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES, ...COMPANY_ADMIN_ROLES)
  async assessCompliance(
    @Param('id', ParseIntPipe) id: number,
    @Body('notes') notes: string | undefined,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), id);
    return this.svc.assessCompliance(id, notes);
  }

  @Get('providers/:providerId/courses')
  @Roles(...TRAINING_INSTRUCTOR_ROLES)
  async listCourses(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), providerId);
    return this.svc.listCourses(providerId);
  }

  @Post('providers/:providerId/courses')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  async addCourse(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: CreateTrainingCourseDto,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), providerId);
    return this.svc.addCourse(providerId, dto);
  }

  @Get('providers/:providerId/instructors')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  async listInstructors(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), providerId);
    return this.svc.listInstructors(providerId);
  }

  @Post('providers/:providerId/instructors')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  async addInstructor(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: CreateTrainingInstructorDto,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), providerId);
    return this.svc.addInstructor(providerId, dto);
  }

  @Get('instructor/me')
  @Roles(UserRole.TRAINING_INSTRUCTOR, ...SUPER_ADMIN_ROLES)
  instructorMe(@Req() req: ReqUser) {
    return this.access.instructorProfile(portalUser(req));
  }

  @Post('instructors/:id/validate-qualification')
  @Roles(...TRAINING_PROVIDER_ADMIN_ROLES)
  validateInstructor(@Param('id', ParseIntPipe) id: number) {
    return this.svc.validateInstructorQualification(id);
  }

  @Post('providers/:providerId/training/upload')
  @Roles(...TRAINING_INSTRUCTOR_ROLES)
  uploadTraining(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: UploadTrainingDto,
    @Req() req: ReqUser,
  ) {
    return this.access.uploadTrainingForActor(providerId, dto, portalUser(req));
  }

  @Post('providers/:providerId/class-lists/upload')
  @Roles(...TRAINING_INSTRUCTOR_ROLES)
  uploadClassList(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: UploadClassListDto,
    @Req() req: ReqUser,
  ) {
    return this.access.uploadClassList(providerId, dto, portalUser(req));
  }

  @Post('providers/:providerId/certificates/issue')
  @Roles(...rolesFor('issueCredentials'))
  async issueCertificate(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() dto: IssueCertificateDto,
    @Req() req: ReqUser,
  ) {
    await this.svc.assertAccess(portalUser(req), providerId);
    return this.svc.issueCertificate(providerId, dto, req.user.id);
  }

  @Post('records/:recordId/certificate-upload')
  @Roles(...rolesFor('issueCredentials'))
  attachCertificate(
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: CertificateUploadDto,
    @Req() req: ReqUser,
  ) {
    this.access.requirePermission(
      portalUser(req),
      TrainingProviderPermission.UPLOAD_CERTIFICATES,
    );
    return this.svc.attachCertificateUrl(recordId, dto.certificateUrl);
  }

  @Post('records/:recordId/sign')
  @Roles(...rolesFor('issueCredentials'))
  signCertificate(
    @Param('recordId', ParseIntPipe) recordId: number,
    @Body() dto: SignCertificateDto,
    @Req() req: ReqUser,
  ) {
    return this.access.signCertificate(recordId, dto, portalUser(req));
  }

  @PublicRateLimited(30, 60_000)
  @Get('certificates/validate/:token')
  validateCertificate(@Param('token') token: string) {
    return this.svc.validateCertificate(token);
  }

  @Get('records/:recordId/certificate')
  @Roles(...TRAINING_INSTRUCTOR_ROLES, ...SUPER_ADMIN_ROLES)
  certificateBundle(@Param('recordId', ParseIntPipe) recordId: number) {
    return this.svc.certificateBundle(recordId);
  }

  @Get('providers/:providerId/history')
  @Roles(...TRAINING_INSTRUCTOR_ROLES)
  history(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('limit') limit?: string,
    @Req() req?: ReqUser,
  ) {
    return this.access.trainingHistoryForActor(
      providerId,
      portalUser(req!),
      limit ? Number(limit) : 50,
    );
  }
}
