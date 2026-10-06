import { PrismaClient } from '@prisma/client';

export async function seedExpertQa(prisma: PrismaClient, opts?: {
  authorUserId?: number;
  expertUserId?: number;
  companyId?: number;
}) {
  const tag = await prisma.expertQaTag.upsert({
    where: { slug: 'fall-protection' },
    create: { slug: 'fall-protection', name: 'Fall protection' },
    update: {},
  });

  const question = await prisma.expertQaQuestion.upsert({
    where: { slug: 'anchor-spacing-residential-framing-abc12' },
    create: {
      slug: 'anchor-spacing-residential-framing-abc12',
      title: 'What is the minimum anchor spacing for residential framing crews?',
      body: 'We are on a 4-storey wood frame with leading-edge work. The GC cites CSA but our crew is unsure about horizontal spacing when using retractable lanyards. What spacing do you enforce on similar jobs?',
      trade: 'Carpentry',
      companyId: opts?.companyId ?? null,
      authorUserId: opts?.authorUserId ?? null,
      anonymous: false,
      moderationStatus: 'VISIBLE',
      status: 'OPEN',
    },
    update: { moderationStatus: 'VISIBLE' },
  });

  await prisma.expertQaQuestionTag.upsert({
    where: { questionId_tagId: { questionId: question.id, tagId: tag.id } },
    create: { questionId: question.id, tagId: tag.id },
    update: {},
  });

  if (opts?.expertUserId) {
    const profile = await prisma.expertProfile.upsert({
      where: { userId: opts.expertUserId },
      create: {
        userId: opts.expertUserId,
        verifiedAt: new Date(),
        reputationScore: 120,
        badgeLevel: 'SILVER',
        trade: 'Safety',
        headline: 'Fall protection specialist',
      },
      update: { verifiedAt: new Date(), badgeLevel: 'SILVER' },
    });

    const existingAnswer = await prisma.expertQaAnswer.findFirst({
      where: { questionId: question.id, authorUserId: opts.expertUserId },
    });

    const answer =
      existingAnswer ??
      (await prisma.expertQaAnswer.create({
        data: {
          questionId: question.id,
          authorUserId: opts.expertUserId,
          expertProfileId: profile.id,
          body: 'For retractable lanyards on wood frame, we enforce anchor spacing that keeps max free fall under 1.2 m and limits swing hazard. Typical rule: anchors at max 3 m horizontal spacing along the leading edge, with a dedicated anchor within 1.5 m of any unprotected edge corner. Always follow manufacturer specs for your SRL and document in the site-specific fall protection plan.',
          isExpertAnswer: true,
          voteScore: 8,
          moderationStatus: 'VISIBLE',
        },
      }));

    await prisma.expertQaQuestion.update({
      where: { id: question.id },
      data: {
        acceptedAnswerId: answer.id,
        status: 'CLOSED',
      },
    });
  }
}
