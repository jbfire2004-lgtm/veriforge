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
} from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { CoreMeetingRecordService } from './core-meeting-record.service';
import { CreateCoreMeetingRecordDto } from './dto/create-core-meeting-record.dto';
import { ListCoreMeetingRecordQueryDto } from './dto/list-core-meeting-record.query.dto';
import { SummaryCoreMeetingRecordQueryDto } from './dto/summary-core-meeting-record.query.dto';
import { UpdateCoreMeetingRecordDto } from './dto/update-core-meeting-record.dto';

/**
 * VERA Core — meeting records (toolbox talks, team safety, management review).
 *
 * Base: `/api/v1/core-meeting-records`
 *
 * @example POST body
 * ```json
 * {
 *   "title": "Toolbox — hot work",
 *   "body": "Reviewed fire watch requirements.",
 *   "meetingType": "TOOLBOX",
 *   "heldAt": "2026-05-03T07:15:00.000Z",
 *   "companyId": 1,
 *   "siteId": 2,
 *   "recordedByUserId": 4
 * }
 * ```
 *
 * @example PATCH body (partial)
 * ```json
 * { "title": "Toolbox — hot work (revised)", "meetingType": "TEAM_SAFETY" }
 * ```
 *
 * @example Summary — GET /core-meeting-records/summary?companyId=1&heldFrom=2026-01-01&heldTo=2026-12-31
 * Response: `{ "total": number, "byType": { ... }, "filters": { ... } }`
 */
@Controller(`${API_V1_PREFIX}/core-meeting-records`)
export class CoreMeetingRecordController {
  constructor(private readonly service: CoreMeetingRecordService) {}

  /**
   * Dashboard aggregate: counts per meeting type (optional company, site, heldAt range).
   */
  @Get('summary')
  summary(@Query() query: SummaryCoreMeetingRecordQueryDto) {
    return this.service.summarize({
      companyId: query.companyId,
      siteId: query.siteId,
      heldFrom: query.heldFrom,
      heldTo: query.heldTo,
    });
  }

  @Get()
  list(@Query() query: ListCoreMeetingRecordQueryDto) {
    return this.service.findAll({
      companyId: query.companyId,
      siteId: query.siteId,
      meetingType: query.meetingType,
      heldFrom: query.heldFrom,
      heldTo: query.heldTo,
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
  create(@Body() dto: CreateCoreMeetingRecordDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoreMeetingRecordDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
