import { Injectable, NotFoundException } from '@nestjs/common';
import type { JobBoardWorkerProfile as WorkerProfileDto } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JobBoardWorkerService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(workerId: number): Promise<WorkerProfileDto> {
    const profile = await this.ensureProfile(workerId);
    return this.toDto(profile);
  }

  async upsertProfile(
    workerId: number,
    input: Record<string, unknown>,
  ): Promise<WorkerProfileDto> {
    await this.prisma.jobBoardWorkerProfile.upsert({
      where: { workerId },
      create: {
        workerId,
        headline: input.headline as string | undefined,
        bio: input.bio as string | undefined,
        primaryTrade: input.primaryTrade as string | undefined,
        experienceLevel: input.experienceLevel as never,
        yearsExperience: input.yearsExperience as number | undefined,
        locationCity: input.locationCity as string | undefined,
        locationRegion: input.locationRegion as string | undefined,
        openToWork: input.openToWork as boolean | undefined,
      },
      update: {
        headline: input.headline as string | undefined,
        bio: input.bio as string | undefined,
        primaryTrade: input.primaryTrade as string | undefined,
        experienceLevel: input.experienceLevel as never,
        yearsExperience: input.yearsExperience as number | undefined,
        locationCity: input.locationCity as string | undefined,
        locationRegion: input.locationRegion as string | undefined,
        openToWork: input.openToWork as boolean | undefined,
      },
    });

    if (input.skills) {
      const profile = await this.prisma.jobBoardWorkerProfile.findUniqueOrThrow(
        {
          where: { workerId },
        },
      );
      await this.prisma.jobBoardWorkerSkill.deleteMany({
        where: { profileId: profile.id },
      });
      const skills = input.skills as { skill: string; level?: string }[];
      if (skills.length) {
        await this.prisma.jobBoardWorkerSkill.createMany({
          data: skills.map((s) => ({
            profileId: profile.id,
            skill: s.skill,
            level: s.level ?? 'proficient',
          })),
        });
      }
    }

    return this.getProfile(workerId);
  }

  async addPortfolioPhoto(
    workerId: number,
    data: { imageUrl: string; caption?: string },
  ): Promise<void> {
    const profile = await this.ensureProfile(workerId);
    const max = await this.prisma.jobBoardPortfolioPhoto.aggregate({
      where: { profileId: profile.id },
      _max: { sortOrder: true },
    });
    await this.prisma.jobBoardPortfolioPhoto.create({
      data: {
        profileId: profile.id,
        imageUrl: data.imageUrl,
        caption: data.caption,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async endorse(
    endorserUserId: number,
    profileId: string,
    skill: string,
    message?: string,
  ): Promise<void> {
    await this.prisma.jobBoardWorkerEndorsement.create({
      data: { profileId, endorserUserId, skill, message },
    });
  }

  private async ensureProfile(workerId: number) {
    return this.prisma.jobBoardWorkerProfile.upsert({
      where: { workerId },
      create: { workerId },
      update: {},
      include: {
        worker: {
          include: {
            trainingRecords: {
              where: { expiresAt: { gte: new Date() } },
              include: { certification: true },
              take: 12,
            },
          },
        },
        skills: true,
        portfolio: { orderBy: { sortOrder: 'asc' } },
        workHistory: { orderBy: { startDate: 'desc' } },
        endorsements: {
          include: { endorser: { include: { worker: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  private async toDto(
    row: Awaited<ReturnType<typeof this.ensureProfile>>,
  ): Promise<WorkerProfileDto> {
    const w = row.worker;
    const displayName = `${w.firstName} ${w.lastName}`;
    const tickets = [
      ...new Set(
        w.trainingRecords.map((r) => r.certification.name).filter(Boolean),
      ),
    ];

    return {
      id: row.id,
      workerId: row.workerId,
      displayName,
      headline: row.headline,
      bio: row.bio,
      primaryTrade: row.primaryTrade,
      experienceLevel: row.experienceLevel,
      yearsExperience: row.yearsExperience,
      locationCity: row.locationCity,
      locationRegion: row.locationRegion,
      openToWork: row.openToWork,
      skills: row.skills.map((s) => ({ skill: s.skill, level: s.level })),
      portfolio: row.portfolio.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        caption: p.caption,
      })),
      workHistory: row.workHistory.map((h) => ({
        id: h.id,
        employer: h.employer,
        role: h.role,
        trade: h.trade,
        startDate: h.startDate?.toISOString() ?? null,
        endDate: h.endDate?.toISOString() ?? null,
        description: h.description,
      })),
      endorsements: row.endorsements.map((e) => ({
        id: e.id,
        skill: e.skill,
        message: e.message,
        endorserName: e.endorser.worker
          ? `${e.endorser.worker.firstName} ${e.endorser.worker.lastName}`
          : e.endorser.username,
        createdAt: e.createdAt.toISOString(),
      })),
      tickets,
    };
  }
}
