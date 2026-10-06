import { PrismaClient, FeedSource } from '@prisma/client';

export async function seedHubHomepage(prisma: PrismaClient, companyId?: number) {
  await prisma.trendingTopic.upsert({
    where: { slug: 'fall-protection-2026' },
    create: {
      slug: 'fall-protection-2026',
      title: 'Fall protection refresher',
      description: 'Updated CSA anchor requirements for residential framing.',
      category: 'fall-protection',
      viewCount: 420,
      rankScore: 10,
      companyId: companyId ?? null,
    },
    update: { viewCount: 420, rankScore: 10 },
  });

  await prisma.trendingTopic.upsert({
    where: { slug: 'heat-stress' },
    create: {
      slug: 'heat-stress',
      title: 'Heat stress on site',
      description: 'Hydration, shade, and work-rest schedules above 29°C.',
      category: 'environmental',
      viewCount: 310,
      rankScore: 8,
      companyId: companyId ?? null,
    },
    update: { viewCount: 310 },
  });

  const existingAlert = await prisma.hubWeatherAlert.findFirst({
    where: { region: 'default', title: 'High wind advisory' },
  });
  if (!existingAlert) {
    await prisma.hubWeatherAlert.create({
      data: {
        region: 'default',
        title: 'High wind advisory',
        description: 'Gusts up to 70 km/h — secure materials and suspend crane ops.',
        severity: 'WATCH',
        hazardType: 'wind',
        companyId: companyId ?? null,
      },
    });
  }

  const jobExists = await prisma.jobPost.findFirst({
    where: { slug: 'journeyman-electrician-edmonton' },
  });
  if (!jobExists) {
    await prisma.jobPost.create({
      data: {
        slug: 'journeyman-electrician-edmonton',
        title: 'Journeyman electrician',
        companyName: 'Northern Grid Contractors',
        description:
          'Commercial electrical fit-out. LOA, CSA boots, and valid trade ticket required.',
        location: 'Edmonton, AB',
        locationCity: 'Edmonton',
        locationRegion: 'AB',
        trade: 'Electrical',
        payMin: 42,
        payMax: 48,
        payPeriod: 'hourly',
        payRange: '$42–48/hr',
        summary: 'Commercial fit-out, LOA, safety boots required.',
        companyId: companyId ?? null,
        url: '/jobs/journeyman-electrician-edmonton',
      },
    });
  }

  await prisma.safetyArticle.upsert({
    where: { slug: 'pre-use-inspection-checklist' },
    create: {
      slug: 'pre-use-inspection-checklist',
      title: 'Pre-use inspection in under 60 seconds',
      excerpt: 'A field-tested flow for mobile equipment walk-arounds.',
      authorName: 'VERA Safety',
      category: 'equipment',
      readMinutes: 4,
      companyId: companyId ?? null,
    },
    update: {
      title: 'Pre-use inspection in under 60 seconds',
      excerpt: 'A field-tested flow for mobile equipment walk-arounds.',
      authorName: 'VERA Safety',
      category: 'equipment',
      readMinutes: 4,
    },
  });

  await prisma.feedItem.upsert({
    where: {
      source_externalId: {
        source: FeedSource.COMPANY_ANNOUNCEMENT,
        externalId: 'announcement-welcome-hub',
      },
    },
    create: {
      source: FeedSource.COMPANY_ANNOUNCEMENT,
      externalId: 'announcement-welcome-hub',
      title: 'Welcome to Vera Hub',
      summary: 'Your personalized dashboard for daily safety and workforce updates.',
      companyId: companyId ?? null,
      rankScore: 1,
    },
    update: {
      title: 'Welcome to Vera Hub',
      summary: 'Your personalized dashboard for daily safety and workforce updates.',
      rankScore: 1,
    },
  });
}
