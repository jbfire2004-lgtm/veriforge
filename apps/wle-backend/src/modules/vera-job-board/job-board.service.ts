import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  JobBoardApplication as ApplicationDto,
  JobBoardJobDetail,
  JobBoardJobList,
  JobBoardJobSummary,
} from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';
import { formatPayRange, slugifyJob } from './job-board.utils';
import { JobBoardWorkerService } from './job-board-worker.service';

const JOB_INCLUDE = {
  tickets: true,
  project: true,
  _count: { select: { applications: true } },
} satisfies Prisma.JobPostInclude;

@Injectable()
export class JobBoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workers: JobBoardWorkerService,
  ) {}

  async search(query: {
    page?: number;
    pageSize?: number;
    trade?: string;
    location?: string;
    payMin?: number;
    payMax?: number;
    experienceLevel?: string;
    ticket?: string;
    q?: string;
  }): Promise<JobBoardJobList> {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 50);
    const where: Prisma.JobPostWhereInput = {
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      ...(query.trade
        ? { trade: { equals: query.trade, mode: 'insensitive' } }
        : {}),
      ...(query.experienceLevel
        ? { experienceLevel: query.experienceLevel as never }
        : {}),
      ...(query.location
        ? {
            OR: [
              { location: { contains: query.location, mode: 'insensitive' } },
              {
                locationCity: { contains: query.location, mode: 'insensitive' },
              },
              {
                locationRegion: {
                  contains: query.location,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(query.payMin != null ? { payMax: { gte: query.payMin } } : {}),
      ...(query.payMax != null ? { payMin: { lte: query.payMax } } : {}),
      ...(query.ticket
        ? {
            tickets: {
              some: {
                ticketName: { contains: query.ticket, mode: 'insensitive' },
              },
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { companyName: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.jobPost.count({ where }),
      this.prisma.jobPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tickets: true, project: true },
      }),
    ]);

    return {
      items: rows.map((r) => this.toSummary(r)),
      total,
      page,
      pageSize,
    };
  }

  async getBySlug(slug: string): Promise<JobBoardJobDetail> {
    const row = await this.prisma.jobPost.findFirst({
      where: {
        slug,
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      include: JOB_INCLUDE,
    });
    if (!row) throw new NotFoundException('Job not found');
    return this.toDetail(row);
  }

  async createJob(input: Record<string, unknown>): Promise<JobBoardJobDetail> {
    const title = String(input.title);
    const slug = slugifyJob(title);
    const payMin = input.payMin as number | undefined;
    const payMax = input.payMax as number | undefined;
    const payPeriod = (input.payPeriod as string) ?? 'hourly';

    const row = await this.prisma.jobPost.create({
      data: {
        slug,
        title,
        companyName: String(input.companyName),
        description: String(input.description),
        summary:
          (input.summary as string) ?? String(input.description).slice(0, 280),
        location: input.location as string | undefined,
        locationCity: input.locationCity as string | undefined,
        locationRegion: input.locationRegion as string | undefined,
        trade: input.trade as string | undefined,
        payMin,
        payMax,
        payPeriod,
        payRange: formatPayRange(
          payMin,
          payMax,
          payPeriod,
          input.payRange as string | undefined,
        ),
        experienceLevel: input.experienceLevel as never,
        companyId: input.companyId as number | undefined,
        projectId: input.projectId as number | undefined,
        expiresAt: input.expiresAt
          ? new Date(input.expiresAt as string)
          : undefined,
        url: `/jobs/${slug}`,
      },
      include: JOB_INCLUDE,
    });

    await this.syncTickets(
      row.id,
      input.requiredTickets as string[] | undefined,
    );
    return this.toDetail(
      await this.prisma.jobPost.findUniqueOrThrow({
        where: { id: row.id },
        include: JOB_INCLUDE,
      }),
    );
  }

  async apply(
    userId: number,
    jobId: string,
    coverMessage?: string,
  ): Promise<ApplicationDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { worker: true },
    });
    if (!user.worker) throw new ForbiddenException('Worker profile required');

    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job?.active) throw new NotFoundException('Job not found');

    const existing = await this.prisma.jobBoardApplication.findUnique({
      where: {
        jobId_workerId: { jobId, workerId: user.worker.id },
      },
    });
    if (existing) throw new ConflictException('Already applied');

    await this.workers.upsertProfile(user.worker.id, {});

    const room = await this.prisma.chatRoom.create({
      data: {
        name: `Application: ${job.title}`,
        type: 'job_application',
      },
    });

    const memberIds = new Set<number>([userId]);
    if (job.companyId) {
      const companyUsers = await this.prisma.user.findMany({
        where: { companyId: job.companyId },
        take: 3,
      });
      for (const u of companyUsers) memberIds.add(u.id);
    }

    await this.prisma.chatMember.createMany({
      data: [...memberIds].map((uid) => ({ roomId: room.id, userId: uid })),
      skipDuplicates: true,
    });

    if (coverMessage?.trim()) {
      await this.prisma.chatMessage.create({
        data: {
          roomId: room.id,
          senderId: userId,
          content: coverMessage.trim(),
        },
      });
    }

    const app = await this.prisma.jobBoardApplication.create({
      data: {
        jobId,
        workerId: user.worker.id,
        applicantUserId: userId,
        coverMessage,
        chatRoomId: room.id,
        status: 'PENDING',
      },
      include: {
        worker: true,
      },
    });

    return {
      id: app.id,
      jobId: app.jobId,
      workerId: app.workerId,
      status: app.status,
      coverMessage: app.coverMessage,
      chatRoomId: app.chatRoomId,
      createdAt: app.createdAt.toISOString(),
      workerName: `${app.worker.firstName} ${app.worker.lastName}`,
    };
  }

  async listApplicationsForJob(
    jobId: string,
    reviewerUserId: number,
  ): Promise<ApplicationDto[]> {
    const job = await this.prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerUserId },
    });
    if (job.companyId && reviewer?.companyId !== job.companyId) {
      throw new ForbiddenException('Not authorized');
    }

    const apps = await this.prisma.jobBoardApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: { worker: true },
    });

    return apps.map((a) => ({
      id: a.id,
      jobId: a.jobId,
      workerId: a.workerId,
      status: a.status,
      coverMessage: a.coverMessage,
      chatRoomId: a.chatRoomId,
      createdAt: a.createdAt.toISOString(),
      workerName: `${a.worker.firstName} ${a.worker.lastName}`,
    }));
  }

  async updateApplicationStatus(
    applicationId: string,
    reviewerUserId: number,
    status: string,
  ): Promise<void> {
    const app = await this.prisma.jobBoardApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerUserId },
    });
    if (app.job.companyId && reviewer?.companyId !== app.job.companyId) {
      throw new ForbiddenException('Not authorized');
    }
    await this.prisma.jobBoardApplication.update({
      where: { id: applicationId },
      data: { status: status as never },
    });
  }

  async sitemapSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
    const rows = await this.prisma.jobPost.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    return rows.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  private async syncTickets(jobId: string, tickets?: string[]): Promise<void> {
    await this.prisma.jobBoardJobTicket.deleteMany({ where: { jobId } });
    if (!tickets?.length) return;
    await this.prisma.jobBoardJobTicket.createMany({
      data: tickets.map((ticketName) => ({ jobId, ticketName })),
      skipDuplicates: true,
    });
  }

  private toSummary(
    row: Prisma.JobPostGetPayload<{
      include: { tickets: true; project: true };
    }>,
  ): JobBoardJobSummary {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      companyName: row.companyName,
      location: row.location,
      locationCity: row.locationCity,
      locationRegion: row.locationRegion,
      trade: row.trade,
      payRange: row.payRange,
      payMin: row.payMin,
      payMax: row.payMax,
      payPeriod: row.payPeriod,
      experienceLevel: row.experienceLevel,
      summary: row.summary,
      publishedAt: row.publishedAt.toISOString(),
      ticketNames: row.tickets.map((t) => t.ticketName),
      projectName: row.project?.name ?? null,
    };
  }

  private toDetail(
    row: Prisma.JobPostGetPayload<{ include: typeof JOB_INCLUDE }>,
  ): JobBoardJobDetail {
    return {
      ...this.toSummary(row),
      description: row.description,
      companyId: row.companyId,
      projectId: row.projectId,
      applicationCount: row._count.applications,
    };
  }
}
