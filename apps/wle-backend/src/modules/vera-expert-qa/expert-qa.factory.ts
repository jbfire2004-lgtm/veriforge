import { PrismaClient } from '@prisma/client';
import { ExpertQaService } from './expert-qa.service';
import { ExpertProfileService } from './expert-profile.service';
import { ExpertQaFeedIntegration } from './expert-qa-feed.integration';

export function createExpertQaService(prisma: PrismaClient): ExpertQaService {
  const experts = new ExpertProfileService(prisma as never);
  const feed = new ExpertQaFeedIntegration(prisma as never);
  return new ExpertQaService(prisma as never, experts, feed);
}
