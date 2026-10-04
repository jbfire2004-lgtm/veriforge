import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { SafetyKnowledgeService } from './safety-knowledge.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { SkeAssessmentResult } from './safety-knowledge.types';

const STAFF_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/safety-knowledge`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class SafetyKnowledgeController {
  constructor(
    private readonly safetyKnowledge: SafetyKnowledgeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('worker/:workerId/evaluate')
  evaluate(
    @Param('workerId') workerId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.safetyKnowledge.evaluateAndPersist(
      parseInt(workerId, 10),
      req.user?.userId,
    );
  }

  @Get('worker/:workerId/latest')
  latest(@Param('workerId') workerId: string) {
    return this.safetyKnowledge.getLatest(parseInt(workerId, 10));
  }

  @Get('worker/:workerId/history')
  history(@Param('workerId') workerId: string) {
    return this.safetyKnowledge.listHistory(parseInt(workerId, 10));
  }

  @Get('worker/:workerId/export.pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(@Param('workerId') workerId: string, @Res() res: Response) {
    const wid = parseInt(workerId, 10);
    const run = await this.safetyKnowledge.getLatest(wid);
    const worker = await this.prisma.worker.findUnique({
      where: { id: wid },
      select: { firstName: true, lastName: true },
    });
    const result = (run?.resultJson ?? null) as SkeAssessmentResult | null;

    if (!result) {
      const { result: fresh } = await this.safetyKnowledge.evaluateAndPersist(
        wid,
      );
      const buf = this.safetyKnowledge.buildPdf(
        fresh,
        worker ? `${worker.firstName} ${worker.lastName}` : `Worker ${wid}`,
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="safety-knowledge-${wid}.pdf"`,
      );
      return res.send(buf);
    }

    const buf = this.safetyKnowledge.buildPdf(
      result,
      worker ? `${worker.firstName} ${worker.lastName}` : `Worker ${wid}`,
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="safety-knowledge-${wid}.pdf"`,
    );
    return res.send(buf);
  }
}
