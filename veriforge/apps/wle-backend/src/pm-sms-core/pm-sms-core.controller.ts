import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  PmEnergyControlState,
  PmSmsEntityType,
  PmSclState,
  PmSmsHecaType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { SmsRiskContextService } from './sms-risk-context.service';
import { SmsHecaLibraryService } from './sms-heca-library.service';
import { SmsEnergyWheelService } from './sms-energy-wheel.service';
import { SmsNotificationRouterService } from './sms-notification-router.service';
import { SmsInspectionIntegrationService } from './sms-inspection-integration.service';
import { SmsInvestigationIntegrationService } from './sms-investigation-integration.service';
import { SmsAnalyticsService } from './sms-analytics.service';
import type { EnergyWheelEntry } from './sms-energy-wheel.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

@Controller(`${API_V1_PREFIX}/pm/sms`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSmsCoreController {
  constructor(
    private readonly riskContext: SmsRiskContextService,
    private readonly hecaLibrary: SmsHecaLibraryService,
    private readonly energyWheel: SmsEnergyWheelService,
    private readonly notifications: SmsNotificationRouterService,
    private readonly inspection: SmsInspectionIntegrationService,
    private readonly investigation: SmsInvestigationIntegrationService,
    private readonly analytics: SmsAnalyticsService,
  ) {}

  @Get('meta')
  meta() {
    return {
      pillars: ['SCL', 'HECA', 'Energy Wheel'],
      sclStates: ['safe', 'conditional', 'loss'],
      energyCatalog: this.energyWheel.catalog(),
    };
  }

  @Get('energy-wheel/catalog')
  energyCatalog() {
    return this.energyWheel.catalog();
  }

  @Get('heca-library')
  listHeca(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hecaLibrary.list(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('heca-library/seed')
  seedHeca(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hecaLibrary.seedDefaults(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('heca-library')
  createHeca(
    @Query('companyId') companyId: string,
    @Body()
    body: {
      code: string;
      title: string;
      description?: string;
      hecaType: PmSmsHecaType;
      projectId?: number;
      requiredControls?: string[];
      verificationSteps?: string[];
      trainingCodes?: string[];
      energyTypes?: string[];
    },
  ) {
    return this.hecaLibrary.create(parseInt(companyId, 10), body);
  }

  @Get('risk-context')
  listRiskContext(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('sclState') sclState?: PmSclState,
    @Query('hecaOnly') hecaOnly?: string,
    @Query('highEnergyOnly') highEnergyOnly?: string,
  ) {
    return this.riskContext.listByCompany(parseInt(companyId, 10), {
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      sclState,
      hecaOnly: hecaOnly === 'true',
      highEnergyOnly: highEnergyOnly === 'true',
    });
  }

  @Get('risk-context/:entityType/:entityId')
  getRiskContext(
    @Param('entityType') entityType: PmSmsEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.riskContext.getForEntity(entityType, entityId);
  }

  @Put('risk-context/:entityType/:entityId')
  upsertRiskContext(
    @Param('entityType') entityType: PmSmsEntityType,
    @Param('entityId') entityId: string,
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      sclState?: PmSclState;
      sclTriggers?: string[];
      sclPrecursors?: string[];
      hecaInvolved?: boolean;
      hecaType?: PmSmsHecaType;
      hecaCategoryCode?: string;
      energyTypes?: string[];
      energyControlState?: PmEnergyControlState;
      highEnergyFlag?: boolean;
      missingControls?: string[];
      clientSyncId?: string;
    },
  ) {
    return this.riskContext.upsert({ ...body, entityType, entityId });
  }

  @Put('inspections/findings/:findingId/tags')
  tagInspectionFinding(
    @Param('findingId') findingId: string,
    @Body()
    body: {
      companyId: number;
      projectId: number;
      baseSeverity: 'low' | 'medium' | 'high' | 'critical';
      sclState?: PmSclState;
      hecaInvolved?: boolean;
      hecaType?: string;
      hecaCategoryCode?: string;
      energyTypes?: string[];
      energyControlState?: PmEnergyControlState;
      highEnergyFlag?: boolean;
    },
  ) {
    return this.inspection.applyTagsToPhotoFinding(
      findingId,
      body.companyId,
      body.projectId,
      body.baseSeverity,
      body,
    );
  }

  @Put('investigations/:eventId/scl')
  classifyInvestigationScl(
    @Param('eventId') eventId: string,
    @Body()
    body: {
      sclState: PmSclState;
      triggers?: string[];
      precursors?: string[];
      potentialSeverity?: string;
      actorId?: number;
    },
  ) {
    return this.investigation.classifyScl(eventId, body);
  }

  @Put('investigations/:eventId/energy-wheel')
  saveInvestigationEnergy(
    @Param('eventId') eventId: string,
    @Body() body: { entries: EnergyWheelEntry[] },
  ) {
    return this.investigation.saveEnergyWheel(eventId, body.entries);
  }

  @Put('investigations/:eventId/heca-verification')
  saveHecaVerification(
    @Param('eventId') eventId: string,
    @Body()
    body: {
      hecaInvolved: boolean;
      hecaCategoryCode?: string;
      verificationAnswers: Record<string, string | boolean>;
      signOffUserId?: number;
    },
  ) {
    return this.investigation.saveHecaVerification(eventId, body);
  }

  @Get('investigations/:eventId/guided-questions')
  guidedQuestions(@Param('eventId') eventId: string) {
    return this.investigation.guidedQuestionsWithSms(eventId);
  }

  @Get('analytics/leading-indicators')
  leadingIndicators(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.analytics.leadingIndicators(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('notifications/routes')
  listNotificationRoutes(@Query('companyId') companyId: string) {
    return this.notifications.listRoutes(parseInt(companyId, 10));
  }

  @Post('notifications/routes/seed')
  seedNotificationRoutes(@Query('companyId') companyId: string) {
    return this.notifications.ensureDefaultRoutes(parseInt(companyId, 10));
  }
}
