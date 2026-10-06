import { PrismaClient } from '@prisma/client';

export async function seedSafetyBlog(prisma: PrismaClient, companyId?: number) {
  const equipment = await prisma.safetyBlogCategory.upsert({
    where: { slug: 'equipment' },
    create: {
      slug: 'equipment',
      name: 'Equipment safety',
      description: 'Pre-use inspections, lockouts, and mobile equipment.',
      sortOrder: 1,
    },
    update: {},
  });

  const fall = await prisma.safetyBlogCategory.upsert({
    where: { slug: 'fall-protection' },
    create: {
      slug: 'fall-protection',
      name: 'Fall protection',
      description: 'Anchors, harnesses, and leading-edge work.',
      sortOrder: 2,
    },
    update: {},
  });

  const tagInspection = await prisma.safetyBlogTag.upsert({
    where: { slug: 'inspection' },
    create: { slug: 'inspection', name: 'Inspection' },
    update: {},
  });

  const body = `A disciplined pre-use walk-around prevents most equipment incidents before shift start.

## 60-second flow
1. Walk the full perimeter — leaks, damage, missing guards.
2. Check fluids, tires/tracks, and horn/backup alarm.
3. Verify LOTO devices are removed only after clearance.
4. Log findings in Vera before operating.

## When to stop work
- Fluid leak under pressure
- Structural crack or bent linkage
- Failed backup alarm or seat belt

Document every exception — photos help supervisors approve repairs faster.`;

  const article = await prisma.safetyArticle.upsert({
    where: { slug: 'pre-use-inspection-checklist' },
    create: {
      slug: 'pre-use-inspection-checklist',
      title: 'Pre-use inspection in under 60 seconds',
      body,
      excerpt: 'A field-tested flow for mobile equipment walk-arounds.',
      metaDescription:
        'Learn a 60-second pre-use equipment inspection checklist for construction crews — leaks, guards, LOTO, and when to stop work.',
      authorName: 'VERA Safety',
      authorType: 'EXPERT',
      category: 'equipment',
      categoryId: equipment.id,
      safetyLevel: 'HIGH',
      readMinutes: 4,
      featured: true,
      status: 'PUBLISHED',
      active: true,
      companyId: companyId ?? null,
    },
    update: {
      body,
      metaDescription:
        'Learn a 60-second pre-use equipment inspection checklist for construction crews.',
      featured: true,
      status: 'PUBLISHED',
      active: true,
    },
  });

  await prisma.safetyBlogPostTag.upsert({
    where: { postId_tagId: { postId: article.id, tagId: tagInspection.id } },
    create: { postId: article.id, tagId: tagInspection.id },
    update: {},
  });

  const heatBody = `Heat stress kills more construction workers than many visible hazards. Plan work-rest cycles before the mercury climbs.

- Schedule heavy lifts for morning hours
- Shade break areas with hydration within 30 m
- Watch for confusion or clammy skin — stop work immediately`;

  await prisma.safetyArticle.upsert({
    where: { slug: 'heat-stress-field-guide' },
    create: {
      slug: 'heat-stress-field-guide',
      title: 'Heat stress field guide',
      body: heatBody,
      excerpt: 'Hydration, shade, and work-rest schedules above 29°C.',
      metaDescription: 'Heat stress prevention for construction sites: hydration, shade, and work-rest schedules.',
      authorName: 'VERA Safety',
      category: 'environmental',
      categoryId: fall.id,
      safetyLevel: 'MEDIUM',
      readMinutes: 3,
      status: 'PUBLISHED',
      active: true,
      companyId: companyId ?? null,
    },
    update: { body: heatBody, status: 'PUBLISHED', active: true },
  });
}
