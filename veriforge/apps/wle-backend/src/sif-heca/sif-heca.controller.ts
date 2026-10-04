import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  SifHecaEventStatus,
  SifHecaSourceType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { SifHecaService } from './sif-heca.service';
import { SifHecaIngestionService } from './sif-heca-ingestion.service';
import { SifHecaOrchestratorService } from './sif-heca-orchestrator.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/sif-heca`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class SifHecaController {
  constructor(
    private readonly sifHeca: SifHecaService,
    private readonly ingestion: SifHecaIngestionService,
    private readonly orchestrator: SifHecaOrchestratorService,
  ) {}

  @Get('events')
  listEvents(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: SifHecaEventStatus,
    @Query('workerId') workerId?: string,
  ) {
    return this.sifHeca.list({
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      status,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
    });
  }

  @Get('events/:id')
  getEvent(@Param('id') id: string) {
    return this.sifHeca.getEvent(id);
  }

  @Get('events/:id/orchestrator')
  orchestratorAnalysis(@Param('id') id: string) {
    return this.orchestrator.analyzeEvent(id);
  }

  @Post('evaluate')
  evaluate(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      title: string;
      description?: string;
      hazardSeverity: number;
      hazardLikelihood: number;
      energyTypes: string[];
      controls?: Array<{
        controlType: string;
        adequate?: boolean;
        effectivenessScore?: number;
        verified?: boolean;
        ppeRequired?: boolean;
      }>;
    },
  ) {
    return this.sifHeca.evaluateDryRun({
      companyId: body.companyId,
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      scoringInput: {
        hazardSeverity: body.hazardSeverity,
        hazardLikelihood: body.hazardLikelihood,
        energyTypes: body.energyTypes,
        controls: (body.controls ?? []).map((c) => ({
          controlType: c.controlType,
          adequate: c.adequate ?? null,
          effectivenessScore: c.effectivenessScore ?? null,
          verified: c.verified ?? false,
          ppeRequired: c.ppeRequired ?? false,
        })),
      },
    });
  }

  @Post('analyze-scope')
  analyzeScope(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      title: string;
      jobDescription?: string;
      workScope?: string;
      locationNote?: string;
      environmentNote?: string;
      equipmentNote?: string;
    },
  ) {
    return this.sifHeca.analyzeScope(body);
  }

  @Post('csra-assess')
  csraAssess(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      title: string;
      description?: string;
      workScope?: string;
      locationNote?: string;
      environmentNote?: string;
      equipmentNote?: string;
      energyTypes?: string[];
      exposureLevel?: 1 | 2 | 3 | 4 | 5;
      proximity?: 'contact' | 'near' | 'zone' | 'remote';
      controls?: Array<{
        description?: string;
        controlType: string;
        adequate?: boolean | null;
        effectivenessScore?: number | null;
        verified?: boolean;
        energyTypes?: string[];
      }>;
    },
  ) {
    return this.sifHeca.assessCsra(body);
  }

  @Get('energy-wheel')
  energyWheel() {
    return this.sifHeca.getEnergyWheel();
  }

  @Post('score')
  score(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      companyId: number;
      projectId: number;
      siteId?: number;
      workerId?: number;
      sourceType: SifHecaSourceType;
      sourceId: string;
      sourceItemId?: string;
      title: string;
      description?: string;
      hazardSeverity: number;
      hazardLikelihood: number;
      energyTypes: string[];
      controls?: Array<{
        controlType: string;
        adequate?: boolean;
        effectivenessScore?: number;
        verified?: boolean;
        ppeRequired?: boolean;
      }>;
    },
  ) {
    return this.sifHeca.ingest({
      companyId: body.companyId,
      projectId: body.projectId,
      siteId: body.siteId,
      workerId: body.workerId,
      sourceType: body.sourceType,
      sourceId: body.sourceId,
      sourceItemId: body.sourceItemId,
      title: body.title,
      description: body.description,
      scoringInput: {
        hazardSeverity: body.hazardSeverity,
        hazardLikelihood: body.hazardLikelihood,
        energyTypes: body.energyTypes,
        controls: (body.controls ?? []).map((c) => ({
          controlType: c.controlType,
          adequate: c.adequate ?? null,
          effectivenessScore: c.effectivenessScore ?? null,
          verified: c.verified ?? false,
          ppeRequired: c.ppeRequired ?? false,
        })),
      },
      actorId: req.user?.userId,
    });
  }

  @Post('events/:id/review')
  review(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { action: 'approve' | 'reject' | 'request_changes'; notes?: string },
  ) {
    return this.sifHeca.supervisorReview(
      id,
      body.action,
      req.user?.userId,
      body.notes,
    );
  }

  @Post('ingest/jha-flha/:jhaFlhaId')
  ingestJha(
    @Param('jhaFlhaId') jhaFlhaId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.ingestion.ingestFromJhaFlha(jhaFlhaId, req.user?.userId);
  }

  @Post('ingest/safety-form/:formId')
  ingestForm(
    @Param('formId') formId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.ingestion.ingestFromSafetyForm(formId, req.user?.userId);
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.sifHeca.projectAnalytics(parseInt(projectId, 10));
  }

  @Get('access/worker')
  accessCheck(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.sifHeca.workerAccessCheck(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Post('sync')
  sync(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.sifHeca.syncOffline({
      ...(body as Parameters<SifHecaService['syncOffline']>[0]),
      actorId: req.user?.userId,
    });
  }

  @Get('library/indicators')
  indicators(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.sifHeca.listIndicators(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('library/heca-categories')
  hecaCategories(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.sifHeca.listHecaCategories(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }
}
