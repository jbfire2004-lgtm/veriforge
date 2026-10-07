import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RequireModule } from '../../acp/decorators/vera-access.decorator';
import { VeraModuleGuard } from '../../acp/guards/vera-module.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { CoreDailyLogService } from './core-daily-log.service';
import { CreateCoreDailyLogDto } from './dto/create-core-daily-log.dto';
import { ListCoreDailyLogQueryDto } from './dto/list-core-daily-log.query.dto';
import { SummaryCoreDailyLogQueryDto } from './dto/summary-core-daily-log.query.dto';
import { UpdateCoreDailyLogDto } from './dto/update-core-daily-log.dto';

type DailyLogActor = {
  id: number;
  companyId?: number | null;
};

/**
 * VERA Core — daily safety / operations log entries.
 *
 * Base: `/api/v1/core-daily-logs`
 *
 * Example JSON payloads: `entities/core-daily-log.entity.ts` (`CORE_DAILY_LOG_CREATE_EXAMPLE`).
 *
 * Summary: GET /core-daily-logs/summary?companyId=&siteId=&logDateFrom=&logDateTo=
 */
@Controller(`${API_V1_PREFIX}/core-daily-logs`)
@UseGuards(JwtAuthGuard, VeraModuleGuard)
@RequireModule('core')
export class CoreDailyLogController {
  constructor(private readonly service: CoreDailyLogService) {}

  /**
   * Dashboard: total logs and counts grouped by shift (optional filters).
   */
  @Get('summary')
  summary(
    @Query() query: SummaryCoreDailyLogQueryDto,
    @Req() req: { user?: DailyLogActor },
  ) {
    return this.service.summarize({
      companyId: query.companyId ?? req.user?.companyId ?? undefined,
      siteId: query.siteId,
      logDateFrom: query.logDateFrom,
      logDateTo: query.logDateTo,
    });
  }

  @Get()
  list(
    @Query() query: ListCoreDailyLogQueryDto,
    @Req() req: { user?: DailyLogActor },
  ) {
    return this.service.findAll({
      companyId: query.companyId ?? req.user?.companyId ?? undefined,
      siteId: query.siteId,
      shift: query.shift,
      skip: query.skip,
      take: query.take,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateCoreDailyLogDto,
    @Req() req: { user?: DailyLogActor },
  ) {
    return this.service.create({
      ...dto,
      companyId: dto.companyId ?? dto.company_id ?? req.user?.companyId ?? undefined,
      siteId: dto.siteId ?? dto.site_id,
      createdByUserId: dto.createdByUserId ?? req.user?.id,
      supervisorUserId:
        dto.supervisorUserId ?? dto.supervisor ?? req.user?.id,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoreDailyLogDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
