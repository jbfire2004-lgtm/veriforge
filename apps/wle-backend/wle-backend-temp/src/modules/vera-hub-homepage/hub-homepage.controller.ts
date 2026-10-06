import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { STAFF_ROLES, UNION_HALL_ROLES } from '../vera-core/roles';
import { HomepageQueryDto } from './dto/homepage-query.dto';
import { HubHomepageService } from './hub-homepage.service';
import { HubWidgetsService } from './hub-widgets.service';

type AuthReq = { user?: { id: number; role?: string } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/hub`)
export class HubHomepageController {
  constructor(
    private readonly homepage: HubHomepageService,
    private readonly hubWidgets: HubWidgetsService,
  ) {}

  private requireUserId(req: AuthReq): number {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authenticated user id missing from JWT');
    }
    return userId;
  }

  @Get('homepage')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  getHomepage(@Query() query: HomepageQueryDto, @Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    return this.homepage.buildForUser(userId, {
      cursor: query.cursor,
      limit: query.limit,
      region: query.region,
      refresh: query.refresh,
    });
  }

  @Get('modules')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  getModules(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    return this.hubWidgets.getModulesForUser(userId);
  }

  @Get('widgets/summary')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  getWidgetsSummary(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    return this.hubWidgets.getWidgetsBundle(userId);
  }

  @Get('widgets/worker-readiness')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  async getWorkerReadiness(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    const ctx = await this.hubWidgets.resolveUserContext(userId);
    return this.hubWidgets.getWorkerReadiness(ctx);
  }

  @Get('widgets/equipment-readiness')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  async getEquipmentReadiness(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    const ctx = await this.hubWidgets.resolveUserContext(userId);
    return this.hubWidgets.getEquipmentReadiness(ctx);
  }

  @Get('widgets/training-expiring')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  async getTrainingExpiring(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    const ctx = await this.hubWidgets.resolveUserContext(userId);
    return this.hubWidgets.getTrainingExpiring(ctx);
  }

  @Get('widgets/safety-alerts')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  async getSafetyAlerts(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    const ctx = await this.hubWidgets.resolveUserContext(userId);
    return this.hubWidgets.getSafetyAlerts(ctx);
  }

  @Get('widgets/project-activity')
  @Roles(...STAFF_ROLES, ...UNION_HALL_ROLES, 'WORKER')
  async getProjectActivity(@Req() req: AuthReq) {
    const userId = this.requireUserId(req);
    const ctx = await this.hubWidgets.resolveUserContext(userId);
    return this.hubWidgets.getProjectActivity(ctx);
  }
}
