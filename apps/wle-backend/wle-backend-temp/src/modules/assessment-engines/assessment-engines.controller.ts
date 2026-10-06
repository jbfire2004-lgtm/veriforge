import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserRole, VeraAssessmentEngine } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { FitTestResult } from '@prisma/client';
import { AssessmentEnginesService } from './assessment-engines.service';
import { AssessmentExportService } from './assessment-export.service';
import { FitTestService } from '../fit-test/fit-test.service';
import type { SpceAssessmentInput } from '../safety-program-compliance/safety-program-compliance.types';

const STAFF_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/assessment-engines`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class AssessmentEnginesController {
  constructor(
    private readonly engines: AssessmentEnginesService,
    private readonly exportPdf: AssessmentExportService,
    private readonly fitTests: FitTestService,
  ) {}

  @Post('training/worker/:workerId')
  runTraining(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId: string | undefined,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.engines.runTrainingAssessment(
      parseInt(workerId, 10),
      req.user?.userId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('training/worker/:workerId/latest')
  latestTraining(@Param('workerId') workerId: string) {
    return this.engines.getLatestTrainingAssessment(parseInt(workerId, 10));
  }

  @Post('safety-program/company/:companyId')
  runSpce(
    @Param('companyId') companyId: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body?: Partial<SpceAssessmentInput>,
  ) {
    return this.engines.runSafetyProgramCompliance(
      parseInt(companyId, 10),
      req.user?.userId,
      body,
    );
  }

  @Get('safety-program/company/:companyId/latest')
  latestSpce(@Param('companyId') companyId: string) {
    return this.engines.getLatestByEngine(
      VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
      { companyId: parseInt(companyId, 10) },
    );
  }

  @Get('safety-program/company/:companyId/history')
  spceHistory(
    @Param('companyId') companyId: string,
    @Query('limit') limit?: string,
  ) {
    return this.engines.listHistoryByEngine(
      VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
      { companyId: parseInt(companyId, 10) },
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('smart-gap/company/:companyId')
  runSmartGap(
    @Param('companyId') companyId: string,
    @Query('hiringClientId') hiringClientId: string,
    @Query('projectId') projectId: string | undefined,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.engines.runSmartGapAnalysis(
      parseInt(companyId, 10),
      parseInt(hiringClientId, 10) || parseInt(companyId, 10),
      req.user?.userId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('training/worker/:workerId/export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportTraining(
    @Param('workerId') workerId: string,
    @Res() res: Response,
  ) {
    const buf = await this.exportPdf.trainingPdf(parseInt(workerId, 10));
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="training-assessment-${workerId}.pdf"`,
    );
    return res.send(buf);
  }

  @Get('safety-program/company/:companyId/export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportSpce(
    @Param('companyId') companyId: string,
    @Res() res: Response,
  ) {
    const buf = await this.exportPdf.spcePdf(parseInt(companyId, 10));
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="spce-${companyId}.pdf"`,
    );
    return res.send(buf);
  }

  @Get('smart-gap/company/:companyId/export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportSmartGapPdf(
    @Param('companyId') companyId: string,
    @Query('projectId') projectId: string | undefined,
    @Res() res: Response,
  ) {
    const buf = await this.exportPdf.smartGapPdf(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="smart-gap-${companyId}.pdf"`,
    );
    return res.send(buf);
  }

  @Get('smart-gap/company/:companyId/latest')
  latestSmartGap(
    @Param('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.engines.getLatestByEngine(
      VeraAssessmentEngine.SMART_GAP_ANALYSIS,
      {
        companyId: parseInt(companyId, 10),
        projectId: projectId ? parseInt(projectId, 10) : undefined,
      },
    );
  }

  @Get('smart-gap/company/:companyId/history')
  smartGapHistory(
    @Param('companyId') companyId: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.engines.listHistoryByEngine(
      VeraAssessmentEngine.SMART_GAP_ANALYSIS,
      {
        companyId: parseInt(companyId, 10),
        projectId: projectId ? parseInt(projectId, 10) : undefined,
      },
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('fit-test/worker/:workerId')
  runFitTest(
    @Param('workerId') workerId: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      testType?: string;
      testMethod?: string;
      result: FitTestResult;
      performedAt?: string;
      expiresAt?: string | null;
      notes?: string;
      evidenceFilesJson?: unknown;
      validityYears?: number;
      tenantId?: number;
    },
  ) {
    return this.fitTests.run(parseInt(workerId, 10), {
      tenantId: body.tenantId,
      testType: body.testType,
      testMethod: body.testMethod,
      result: body.result,
      performedAt: body.performedAt ? new Date(body.performedAt) : undefined,
      expiresAt:
        body.expiresAt === null
          ? null
          : body.expiresAt
          ? new Date(body.expiresAt)
          : undefined,
      notes: body.notes,
      evidenceFilesJson: body.evidenceFilesJson as never,
      validityYears: body.validityYears,
      createdById: req.user?.userId,
    });
  }

  @Get('fit-test/worker/:workerId/latest')
  latestFitTest(@Param('workerId') workerId: string) {
    return this.fitTests.summary(parseInt(workerId, 10));
  }

  @Get('fit-test/worker/:workerId/history')
  fitTestHistory(@Param('workerId') workerId: string) {
    return this.fitTests.listHistory(parseInt(workerId, 10));
  }

  @Get('fit-test/worker/:workerId/export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportFitTestPdf(
    @Param('workerId') workerId: string,
    @Res() res: Response,
  ) {
    const buf = await this.fitTests.exportPdf(parseInt(workerId, 10));
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fit-test-${workerId}.pdf"`,
    );
    return res.send(buf);
  }
}
