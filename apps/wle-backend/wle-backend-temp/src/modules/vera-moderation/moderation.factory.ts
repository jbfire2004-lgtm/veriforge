import { PrismaClient } from '@prisma/client';
import { ExpertProfileService } from '../vera-expert-qa/expert-profile.service';
import { ModerationAutoRulesService } from './moderation-auto-rules.service';
import { ModerationQueueService } from './moderation-queue.service';
import { ModerationReportService } from './moderation-report.service';
import { ModerationResolutionService } from './moderation-resolution.service';
import { ExpertVerificationService } from './expert-verification.service';

export function createModerationReportService(
  prisma: PrismaClient,
): ModerationReportService {
  const experts = new ExpertProfileService(prisma as never);
  const resolution = new ModerationResolutionService(prisma as never, experts);
  const autoRules = new ModerationAutoRulesService(prisma as never);
  return new ModerationReportService(prisma as never, autoRules, resolution);
}

export function createModerationQueueService(
  prisma: PrismaClient,
): ModerationQueueService {
  const experts = new ExpertProfileService(prisma as never);
  const resolution = new ModerationResolutionService(prisma as never, experts);
  return new ModerationQueueService(prisma as never, resolution);
}

export function createExpertVerificationService(
  prisma: PrismaClient,
): ExpertVerificationService {
  const experts = new ExpertProfileService(prisma as never);
  return new ExpertVerificationService(prisma as never, experts);
}
