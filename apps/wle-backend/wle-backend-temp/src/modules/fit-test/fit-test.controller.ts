import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { FitTestResult, UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { RolesGuard } from '../../auth/roles.guard';

import { Roles } from '../../auth/roles.decorator';

import { API_V1_PREFIX } from '../../config/routes';

import { FitTestService } from './fit-test.service';

const STAFF: UserRole[] = [
  UserRole.SUPERVISOR,

  UserRole.ADMIN,

  UserRole.SUPER_ADMIN,

  UserRole.COMPANY_ADMIN,

  UserRole.PROJECT_MANAGER,
];

/** Legacy routes — prefer `/api/v1/assessment-engines/fit-test/...`. */

@Controller(`${API_V1_PREFIX}/fit-tests`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF)
export class FitTestController {
  constructor(private readonly fitTests: FitTestService) {}

  @Post('evaluate')
  evaluate(
    @Body()
    body: {
      result?: FitTestResult;

      outcome?: FitTestResult;

      performedAt?: string;

      testedAt?: string;

      expiresAt?: string | null;

      nextDueAt?: string | null;

      validityYears?: number;
    },
  ) {
    return this.fitTests.evaluate({
      result: body.result ?? body.outcome ?? 'CONDITIONAL',

      performedAt: body.performedAt ?? body.testedAt,

      expiresAt: body.expiresAt ?? body.nextDueAt,

      validityYears: body.validityYears,
    });
  }

  @Get('worker/:workerId')
  list(@Param('workerId') workerId: string) {
    return this.fitTests.listHistory(parseInt(workerId, 10));
  }

  @Get('worker/:workerId/latest')
  latest(@Param('workerId') workerId: string) {
    return this.fitTests.summary(parseInt(workerId, 10));
  }

  @Get('worker/:workerId/export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(
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

  @Get('company/:companyId/summary')
  companySummary(@Param('companyId') companyId: string) {
    return this.fitTests.companySummary(parseInt(companyId, 10));
  }

  @Post('worker/:workerId')
  record(
    @Param('workerId') workerId: string,

    @Req() req: { user?: { userId?: number } },

    @Body()
    body: {
      testType?: string;

      respiratorType?: string;

      testMethod?: string;

      result?: FitTestResult;

      outcome?: FitTestResult;

      performedAt?: string;

      testedAt?: string;

      expiresAt?: string | null;

      nextDueAt?: string | null;

      notes?: string;

      evidenceNotes?: string;

      evidenceFilesJson?: unknown;

      validityYears?: number;

      tenantId?: number;

      companyId?: number;
    },
  ) {
    return this.fitTests.run(parseInt(workerId, 10), {
      tenantId: body.tenantId ?? body.companyId,

      testType: body.testType ?? body.respiratorType,

      testMethod: body.testMethod,

      result: body.result ?? body.outcome ?? 'CONDITIONAL',

      performedAt:
        body.performedAt ?? body.testedAt
          ? new Date(body.performedAt ?? body.testedAt!)
          : undefined,

      expiresAt:
        (body.expiresAt ?? body.nextDueAt) === null
          ? null
          : body.expiresAt ?? body.nextDueAt
          ? new Date(body.expiresAt ?? body.nextDueAt!)
          : undefined,

      notes: body.notes ?? body.evidenceNotes,

      evidenceFilesJson: body.evidenceFilesJson as never,

      validityYears: body.validityYears,

      createdById: req.user?.userId,
    });
  }
}
