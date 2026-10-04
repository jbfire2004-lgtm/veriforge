import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { OrientationAssignmentScope, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { OrientationService } from './orientation.service';
import { OrientationAccessService } from './orientation-access.service';
import { CreateOrientationDto } from './dto/create-orientation.dto';
import { AiGenerateOrientationDto } from './dto/ai-generate-orientation.dto';

type AuthReq = { user: { id: number; role: UserRole } };

const uploadStorage = multer.memoryStorage();

@Controller('api/v1/orientation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrientationController {
  constructor(
    private readonly orientation: OrientationService,
    private readonly access: OrientationAccessService,
  ) {}

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
  )
  create(@Req() req: AuthReq, @Body() body: CreateOrientationDto) {
    return this.orientation.create({
      companyId: body.companyId,
      projectId: body.projectId,
      type: body.type,
      title: body.title,
      languages: body.languages,
      userId: req.user.id,
    });
  }

  @Get('companies/:companyId/compliance')
  companyCompliance(@Param('companyId') companyId: string) {
    return this.orientation.getComplianceForCompany(parseInt(companyId, 10));
  }

  @Get('projects/:projectId/compliance')
  projectCompliance(@Param('projectId') projectId: string) {
    return this.orientation.getComplianceForProject(parseInt(projectId, 10));
  }

  @Get('companies/:companyId')
  listCompany(@Param('companyId') companyId: string) {
    return this.orientation.listForCompany(parseInt(companyId, 10));
  }

  @Get('projects/:projectId')
  listProject(@Param('projectId') projectId: string) {
    return this.orientation.listForProject(parseInt(projectId, 10));
  }

  @Get('me/required')
  async myRequired(@Req() req: AuthReq) {
    const workerId = await this.access.resolveWorkerIdForUser(req.user.id);
    if (!workerId) return [];
    return this.orientation.requiredForWorker(workerId);
  }

  @Get('worker/:workerId/required')
  workerRequired(@Param('workerId') workerId: string) {
    return this.orientation.requiredForWorker(parseInt(workerId, 10));
  }

  @Get('worker/:workerId/access')
  workerAccess(
    @Param('workerId') workerId: string,
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.access.evaluateWorker(parseInt(workerId, 10), {
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get(':id/stats')
  stats(@Param('id') id: string) {
    return this.orientation.getStats(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orientation.getById(id);
  }

  @Put(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
  )
  update(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.orientation.update(
      id,
      {
        title: body.title as string | undefined,
        languages: body.languages as string[] | undefined,
        isPublished: body.isPublished as boolean | undefined,
      },
      req.user.id,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
  archive(@Param('id') id: string) {
    return this.orientation.archive(id);
  }

  @Post(':id/upload')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
  )
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      storage: uploadStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  upload(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @UploadedFiles() uploaded: { files?: Express.Multer.File[] },
  ) {
    const files = (uploaded.files ?? []).map((f) => ({
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      buffer: f.buffer,
    }));
    return this.orientation.uploadContent(id, files, req.user.id);
  }

  @Post(':id/ai-generate')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
  )
  aiGenerate(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: AiGenerateOrientationDto,
  ) {
    return this.orientation.aiGenerate(id, body, req.user.id);
  }

  @Post(':id/translate')
  translate(@Param('id') id: string, @Body() body: { languages: string[] }) {
    return this.orientation.translatePackage(id, body.languages ?? []);
  }

  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body() body: { scope: OrientationAssignmentScope },
  ) {
    return this.orientation.assign(id, body.scope);
  }

  @Get(':id/workers')
  workers(@Param('id') id: string) {
    return this.orientation.listWorkers(id);
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) {
    return this.orientation.listVersions(id);
  }

  @Post(':id/version/rollback')
  rollback(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: { versionNumber: number },
  ) {
    return this.orientation.rollback(id, body.versionNumber, req.user.id);
  }

  @Post(':id/progress/start')
  startProgress(@Param('id') id: string, @Body() body: { workerId: number }) {
    return this.orientation.startProgress(id, body.workerId);
  }

  @Post(':id/progress/complete')
  completeProgress(
    @Param('id') id: string,
    @Body()
    body: { workerId: number; quizScore?: number; languageCode?: string },
  ) {
    return this.orientation.completeProgress(id, body.workerId, body);
  }

  @Post('me/:id/progress/start')
  async myStart(@Req() req: AuthReq, @Param('id') id: string) {
    const workerId = await this.access.resolveWorkerIdForUser(req.user.id);
    if (!workerId) {
      throw new BadRequestException('No worker profile linked to this account');
    }
    return this.orientation.startProgress(id, workerId);
  }

  @Post('me/:id/progress/complete')
  async myComplete(
    @Req() req: AuthReq,
    @Param('id') id: string,
    @Body() body: { quizScore?: number; languageCode?: string },
  ) {
    const workerId = await this.access.resolveWorkerIdForUser(req.user.id);
    if (!workerId) {
      throw new BadRequestException('No worker profile linked to this account');
    }
    return this.orientation.completeProgress(id, workerId, body);
  }
}
