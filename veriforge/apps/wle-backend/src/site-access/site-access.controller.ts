import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { SiteAccessService } from './site-access.service';

@Controller('site-access')
export class SiteAccessController {
  constructor(private readonly service: SiteAccessService) {}

  // CHECK ACCESS
  @Get('check/:workerId/:siteId')
  check(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Param('siteId', ParseIntPipe) siteId: number,
  ) {
    return this.service.checkAccess(workerId, siteId);
  }

  // APPROVE ACCESS
  @Post('approve')
  approve(@Body() body: { workerId: number; siteId: number; notes?: string }) {
    return this.service.approve(body.workerId, body.siteId, body.notes);
  }

  // DENY ACCESS
  @Post('deny')
  deny(@Body() body: { workerId: number; siteId: number; notes?: string }) {
    return this.service.deny(body.workerId, body.siteId, body.notes);
  }

  // LIST FOR WORKER
  @Get('worker/:id')
  listWorker(@Param('id', ParseIntPipe) id: number) {
    return this.service.listForWorker(id);
  }

  // LIST FOR SITE
  @Get('site/:id')
  listSite(@Param('id', ParseIntPipe) id: number) {
    return this.service.listForSite(id);
  }
}
