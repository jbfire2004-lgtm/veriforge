import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HubConnectionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  HubProfileCardDto,
  HubProfileDto,
  UpdateHubProfileDto,
} from './hub-profile.types';

@Injectable()
export class HubProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateForUser(userId: number) {
    const existing = await this.prisma.hubWorkerProfile.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        worker: {
          include: { jobBoardProfile: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const worker = user.worker;
    let jobBoardProfileId = worker?.jobBoardProfile?.id ?? null;

    if (worker && !jobBoardProfileId) {
      const created = await this.prisma.jobBoardWorkerProfile.create({
        data: { workerId: worker.id },
      });
      jobBoardProfileId = created.id;
    }

    return this.prisma.hubWorkerProfile.create({
      data: {
        userId,
        workerId: worker?.id,
        jobBoardProfileId,
        headline: worker?.jobBoardProfile?.headline ?? null,
        about: worker?.jobBoardProfile?.bio ?? null,
        photoUrl: worker?.photoUrl ?? null,
        locationCity: worker?.jobBoardProfile?.locationCity ?? null,
        locationRegion: worker?.jobBoardProfile?.locationRegion ?? null,
        primaryTrade: worker?.jobBoardProfile?.primaryTrade ?? null,
        profileCompleteness: this.computeCompleteness({
          headline: worker?.jobBoardProfile?.headline,
          about: worker?.jobBoardProfile?.bio,
          photoUrl: worker?.photoUrl,
          primaryTrade: worker?.jobBoardProfile?.primaryTrade,
        }),
      },
    });
  }

  async getProfile(
    viewerUserId: number,
    targetUserId: number,
  ): Promise<HubProfileDto> {
    const profile = await this.getOrCreateForUser(targetUserId);
    await this.assertCanView(viewerUserId, targetUserId, profile.visibility);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: targetUserId },
      include: {
        worker: {
          include: {
            jobBoardProfile: {
              include: {
                skills: true,
                workHistory: true,
                endorsements: true,
              },
            },
            trainingRecords: {
              include: { certification: { select: { name: true } } },
              take: 12,
              orderBy: { expiresAt: 'asc' },
            },
            projectAssignments: {
              where: { status: 'ACTIVE' },
              include: { project: { select: { id: true, name: true } } },
              take: 10,
            },
          },
        },
      },
    });

    const worker = user.worker;
    const jb = worker?.jobBoardProfile;
    const connection = await this.connectionRow(viewerUserId, targetUserId);
    const connectionStatus = this.mapConnectionStatus(
      viewerUserId,
      targetUserId,
      connection,
    );

    const skills =
      jb?.skills.map((s) => ({
        skill: s.skill,
        level: s.level,
        endorsementCount: jb.endorsements.filter((e) => e.skill === s.skill)
          .length,
      })) ?? [];

    const training =
      worker?.trainingRecords.map((t) => ({
        name: t.certification?.name ?? 'Training',
        status: t.expiresAt && t.expiresAt < new Date() ? 'expired' : 'valid',
        expiresAt: t.expiresAt?.toISOString() ?? null,
      })) ?? [];

    const experienceFromProjects =
      worker?.projectAssignments.map((a) => ({
        projectId: a.project.id,
        projectName: a.project.name,
        startDate: a.assignedAt?.toISOString() ?? null,
        endDate: a.endedAt?.toISOString() ?? null,
      })) ?? [];

    const experienceFromHistory =
      jb?.workHistory.map((w) => ({
        projectName: w.employer,
        role: w.role,
        startDate: w.startDate?.toISOString() ?? null,
        endDate: w.endDate?.toISOString() ?? null,
      })) ?? [];

    const completeness = this.computeCompleteness({
      headline: profile.headline,
      about: profile.about,
      photoUrl: profile.photoUrl,
      primaryTrade: profile.primaryTrade,
      skillsCount: skills.length,
      trainingCount: training.length,
    });

    if (completeness !== profile.profileCompleteness) {
      await this.prisma.hubWorkerProfile.update({
        where: { id: profile.id },
        data: { profileCompleteness: completeness },
      });
    }

    return {
      id: profile.id,
      userId: targetUserId,
      workerId: profile.workerId,
      displayName: this.displayName(user.username, user.email, worker),
      headline: profile.headline,
      about: profile.about,
      photoUrl: profile.photoUrl,
      location: {
        city: profile.locationCity,
        region: profile.locationRegion,
      },
      primaryTrade: profile.primaryTrade,
      visibility: profile.visibility,
      profileCompleteness: completeness,
      reputationScore: profile.reputationScore,
      skills,
      training,
      experience: [...experienceFromProjects, ...experienceFromHistory].slice(
        0,
        12,
      ),
      connectionStatus,
      pendingConnectionId:
        connection?.status === HubConnectionStatus.PENDING
          ? connection.id
          : null,
      incomingConnectionRequest:
        connection?.status === HubConnectionStatus.PENDING &&
        connection.addresseeUserId === viewerUserId,
      openToWork: jb?.openToWork,
    };
  }

  async getProfileCard(userId: number): Promise<HubProfileCardDto> {
    const profile = await this.getOrCreateForUser(userId);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { worker: true },
    });
    return {
      userId,
      displayName: this.displayName(user.username, user.email, user.worker),
      headline: profile.headline,
      photoUrl: profile.photoUrl,
      primaryTrade: profile.primaryTrade,
    };
  }

  async updateMyProfile(userId: number, dto: UpdateHubProfileDto) {
    const profile = await this.getOrCreateForUser(userId);
    const updated = await this.prisma.hubWorkerProfile.update({
      where: { id: profile.id },
      data: {
        ...(dto.headline !== undefined
          ? { headline: dto.headline.trim() }
          : {}),
        ...(dto.about !== undefined ? { about: dto.about.trim() } : {}),
        ...(dto.photoUrl !== undefined ? { photoUrl: dto.photoUrl } : {}),
        ...(dto.locationCity !== undefined
          ? { locationCity: dto.locationCity }
          : {}),
        ...(dto.locationRegion !== undefined
          ? { locationRegion: dto.locationRegion }
          : {}),
        ...(dto.primaryTrade !== undefined
          ? { primaryTrade: dto.primaryTrade }
          : {}),
        ...(dto.visibility !== undefined ? { visibility: dto.visibility } : {}),
        profileCompleteness: this.computeCompleteness({
          headline: dto.headline ?? profile.headline,
          about: dto.about ?? profile.about,
          photoUrl: dto.photoUrl ?? profile.photoUrl,
          primaryTrade: dto.primaryTrade ?? profile.primaryTrade,
        }),
      },
    });

    if (profile.jobBoardProfileId) {
      await this.prisma.jobBoardWorkerProfile.update({
        where: { id: profile.jobBoardProfileId },
        data: {
          ...(dto.headline !== undefined
            ? { headline: dto.headline.trim() }
            : {}),
          ...(dto.about !== undefined ? { bio: dto.about.trim() } : {}),
          ...(dto.locationCity !== undefined
            ? { locationCity: dto.locationCity }
            : {}),
          ...(dto.locationRegion !== undefined
            ? { locationRegion: dto.locationRegion }
            : {}),
          ...(dto.primaryTrade !== undefined
            ? { primaryTrade: dto.primaryTrade }
            : {}),
        },
      });
    }

    if (profile.workerId && dto.photoUrl !== undefined) {
      await this.prisma.worker.update({
        where: { id: profile.workerId },
        data: { photoUrl: dto.photoUrl },
      });
    }

    return updated;
  }

  private async assertCanView(
    viewerUserId: number,
    targetUserId: number,
    visibility: string,
  ) {
    if (viewerUserId === targetUserId) return;

    if (visibility === 'PUBLIC') return;

    const viewer = await this.prisma.user.findUnique({
      where: { id: viewerUserId },
      select: { companyId: true },
    });
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { companyId: true },
    });

    if (
      visibility === 'COMPANY' &&
      viewer?.companyId &&
      viewer.companyId === target?.companyId
    ) {
      return;
    }

    if (visibility === 'CONNECTIONS') {
      const connected = await this.prisma.hubConnection.findFirst({
        where: {
          status: HubConnectionStatus.ACCEPTED,
          OR: [
            { requesterUserId: viewerUserId, addresseeUserId: targetUserId },
            { requesterUserId: targetUserId, addresseeUserId: viewerUserId },
          ],
        },
      });
      if (connected) return;
    }

    throw new ForbiddenException('Profile is not visible to you');
  }

  private async connectionRow(viewerUserId: number, targetUserId: number) {
    if (viewerUserId === targetUserId) return null;
    return this.prisma.hubConnection.findFirst({
      where: {
        OR: [
          { requesterUserId: viewerUserId, addresseeUserId: targetUserId },
          { requesterUserId: targetUserId, addresseeUserId: viewerUserId },
        ],
      },
    });
  }

  private mapConnectionStatus(
    viewerUserId: number,
    targetUserId: number,
    row: Awaited<ReturnType<HubProfileService['connectionRow']>>,
  ): HubProfileDto['connectionStatus'] {
    if (viewerUserId === targetUserId) return 'self';
    if (!row) return 'none';
    if (row.status === HubConnectionStatus.ACCEPTED) return 'connected';
    if (row.status === HubConnectionStatus.PENDING) return 'pending';
    return 'none';
  }

  private displayName(
    username: string,
    email: string,
    worker?: { firstName: string; lastName: string } | null,
  ) {
    if (worker) return `${worker.firstName} ${worker.lastName}`.trim();
    if (username?.trim()) return username;
    return email.split('@')[0];
  }

  private computeCompleteness(fields: {
    headline?: string | null;
    about?: string | null;
    photoUrl?: string | null;
    primaryTrade?: string | null;
    skillsCount?: number;
    trainingCount?: number;
  }): number {
    let score = 0;
    if (fields.headline?.trim()) score += 20;
    if (fields.about?.trim()) score += 20;
    if (fields.photoUrl?.trim()) score += 15;
    if (fields.primaryTrade?.trim()) score += 15;
    if ((fields.skillsCount ?? 0) > 0) score += 15;
    if ((fields.trainingCount ?? 0) > 0) score += 15;
    return Math.min(100, score);
  }
}
