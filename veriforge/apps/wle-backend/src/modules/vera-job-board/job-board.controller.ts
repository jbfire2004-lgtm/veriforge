import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { JobBoardService } from './job-board.service';
import { JobBoardWorkerService } from './job-board-worker.service';

@Controller('api/v1/job-board')
export class JobBoardController {
  constructor(
    private readonly jobs: JobBoardService,
    private readonly workers: JobBoardWorkerService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('jobs')
  search(@Query() query: Record<string, string>) {
    return this.jobs.search({
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
      trade: query.trade,
      location: query.location,
      payMin: query.payMin ? parseFloat(query.payMin) : undefined,
      payMax: query.payMax ? parseFloat(query.payMax) : undefined,
      experienceLevel: query.experienceLevel,
      ticket: query.ticket,
      q: query.q,
    });
  }

  @Public()
  @Get('sitemap')
  sitemap() {
    return this.jobs.sitemapSlugs();
  }

  @Public()
  @Get('jobs/:slug')
  getJob(@Param('slug') slug: string) {
    return this.jobs.getBySlug(slug);
  }

  @Public()
  @Get('workers/:workerId')
  getWorker(@Param('workerId') workerId: string) {
    return this.workers.getProfile(parseInt(workerId, 10));
  }

  @UseGuards(JwtAuthGuard)
  @Post('jobs')
  createJob(
    @Req() req: { user: { id: number; companyId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.jobs.createJob({
      ...body,
      companyId: body.companyId ?? req.user.companyId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(
    @Req() req: { user: { id: number } },
    @Body() body: { jobId: string; coverMessage?: string },
  ) {
    return this.jobs.apply(req.user.id, body.jobId, body.coverMessage);
  }

  @UseGuards(JwtAuthGuard)
  @Get('applications/job/:jobId')
  listApplications(
    @Req() req: { user: { id: number } },
    @Param('jobId') jobId: string,
  ) {
    return this.jobs.listApplicationsForJob(jobId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:id/status')
  updateStatus(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.jobs.updateApplicationStatus(id, req.user.id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('workers/me')
  async upsertProfile(
    @Req() req: { user: { id: number } },
    @Body() body: Record<string, unknown>,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { worker: true },
    });
    if (!user?.worker) throw new ForbiddenException('Worker account required');
    return this.workers.upsertProfile(user.worker.id, body);
  }
}
