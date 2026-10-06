import type { PrismaClient } from '@prisma/client';

export async function seedSocialHomepage(
  prisma: PrismaClient,
  opts: { authorUserId: number; companyId?: number },
) {
  const { authorUserId, companyId } = opts;

  const provider = await prisma.trainingProvider.findFirst({
    where: { active: true },
    orderBy: { id: 'asc' },
  });

  if (provider) {
    await prisma.providerProfile.upsert({
      where: { trainingProviderId: provider.id },
      create: {
        trainingProviderId: provider.id,
        displayName: provider.name,
        bio: 'Accredited safety and trade training across Western Canada. Browse courses, schedules, and digital credentials.',
        logoUrl: provider.logoUrl,
        websiteUrl: provider.website ?? 'https://example.com',
        links: {
          linkedin: 'https://linkedin.com',
          courses: '/training',
        },
      },
      update: {
        displayName: provider.name,
        bio: 'Accredited safety and trade training across Western Canada. Browse courses, schedules, and digital credentials.',
      },
    });
  }

  const adExists = await prisma.sponsoredAd.findFirst({
    where: { title: 'Fall protection gear — member pricing' },
  });
  if (!adExists) {
    await prisma.sponsoredAd.create({
      data: {
        title: 'Fall protection gear — member pricing',
        body: 'CSA-compliant harnesses and lanyards. Free shipping on orders over $500 for Verus members.',
        ctaUrl: 'https://example.com/shop',
        ctaLabel: 'Shop now',
        imageUrl: null,
        targetingRules: { regions: ['CA-AB', 'CA-BC'] },
        active: true,
      },
    });
    await prisma.sponsoredAd.create({
      data: {
        title: 'Hire certified crane operators',
        body: 'Post jobs to thousands of verified operators on the Verus network.',
        ctaUrl: '/jobs',
        ctaLabel: 'Post a job',
        active: true,
      },
    });
  }

  const samplePosts = [
    {
      postType: 'SAFETY_BULLETIN' as const,
      title: 'Heat stress advisory — adjust work-rest cycles',
      body: 'When humidex exceeds 32°C, supervisors must enforce 15-minute rest breaks per hour in direct sun. Hydration stations are mandatory on all active sites.',
    },
    {
      postType: 'COMPANY_ANNOUNCEMENT' as const,
      title: 'New digital sign-off on mobile',
      body: 'Workers can complete toolbox talks and equipment sign-offs from the field app starting Monday. Training video is in your learning library.',
    },
    {
      postType: 'TRAINING_UPLOAD' as const,
      title: 'Fall protection recertification now live',
      body: 'Updated CSA Z259 course modules are available. This is a new course upload — not an expiry reminder. Book through your training provider.',
      metadata: { announcement: true, upload: true },
    },
    {
      postType: 'WORKER_MILESTONE' as const,
      title: '1,000 incident-free days',
      body: 'Congratulations to the Site C balance-of-plant crew for 1,000 days without a recordable incident.',
    },
    {
      postType: 'JOB_POSTING' as const,
      title: 'Journeyman millwright — 6-month project',
      body: 'Fort McMurray turnaround starting June. LOA, PPE allowance, valid Red Seal required. Apply via the job board.',
    },
    {
      postType: 'PROVIDER_POST' as const,
      title: 'Confined space entry — April sessions',
      body: provider
        ? `${provider.name} has open seats for confined space monitor and entrant training in Calgary and Edmonton.`
        : 'Open seats for confined space training in Calgary and Edmonton.',
      trainingProviderId: provider?.id,
    },
  ];

  for (const sample of samplePosts) {
    const exists = await prisma.socialPost.findFirst({
      where: { title: sample.title, authorUserId },
    });
    if (exists) continue;

    const post = await prisma.socialPost.create({
      data: {
        authorUserId,
        postType: sample.postType,
        title: sample.title,
        body: sample.body,
        companyId: companyId ?? null,
        trainingProviderId: sample.trainingProviderId ?? null,
        visibility: 'PUBLIC',
        metadata: sample.metadata ?? {},
      },
    });

    if (sample.postType === 'SAFETY_BULLETIN') {
      const pinned = await prisma.pinnedPost.findUnique({ where: { postId: post.id } });
      if (!pinned) {
        await prisma.pinnedPost.create({
          data: {
            postId: post.id,
            pinnedByUserId: authorUserId,
            scope: 'global',
          },
        });
      }
    }
  }

  console.log('  ✓ Social homepage sample posts, ads, and provider profile');
}
