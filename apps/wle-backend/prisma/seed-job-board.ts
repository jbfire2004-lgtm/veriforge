import { PrismaClient, JobBoardExperienceLevel } from '@prisma/client';

export async function seedJobBoard(
  prisma: PrismaClient,
  companyId?: number | null,
) {
  const existing = await prisma.jobPost.findFirst({
    where: { slug: 'journeyman-electrician-edmonton' },
  });
  if (existing) return;

  const job = await prisma.jobPost.create({
    data: {
      slug: 'journeyman-electrician-edmonton',
      title: 'Journeyman electrician',
      companyName: 'Northern Grid Contractors',
      description:
        'Commercial electrical fit-out on a 12-storey tower. LOA, CSA boots, and valid trade ticket required. Shift starts 7:00 AM.',
      location: 'Edmonton, AB',
      locationCity: 'Edmonton',
      locationRegion: 'AB',
      trade: 'Electrical',
      payMin: 42,
      payMax: 48,
      payPeriod: 'hourly',
      payRange: '$42–48/hr',
      experienceLevel: JobBoardExperienceLevel.JOURNEYMAN,
      summary: 'Commercial fit-out, LOA, safety boots required.',
      companyId: companyId ?? null,
      url: '/jobs/journeyman-electrician-edmonton',
      tickets: {
        create: [
          { ticketName: 'Journeyman Electrician' },
          { ticketName: 'WHMIS' },
        ],
      },
    },
  });

  await prisma.jobPost.create({
    data: {
      slug: 'pipefitter-fort-mcmurray',
      title: 'Pipefitter — SAGD turnaround',
      companyName: 'Prairie Industrial Services',
      description:
        '2-week turnaround on SAGD facility. Experience with high-pressure steam systems preferred. Camp LOA.',
      location: 'Fort McMurray, AB',
      locationCity: 'Fort McMurray',
      locationRegion: 'AB',
      trade: 'Pipefitting',
      payMin: 48,
      payMax: 55,
      payPeriod: 'hourly',
      payRange: '$48–55/hr',
      experienceLevel: JobBoardExperienceLevel.JOURNEYMAN,
      summary: 'Turnaround pipefitting, camp LOA, steam experience.',
      companyId: companyId ?? null,
      url: '/jobs/pipefitter-fort-mcmurray',
      tickets: {
        create: [{ ticketName: 'Red Seal Pipefitter' }],
      },
    },
  });

  const worker = await prisma.worker.findFirst({
    where: companyId ? { companyId } : undefined,
    orderBy: { id: 'asc' },
  });
  if (!worker) return;

  await prisma.jobBoardWorkerProfile.upsert({
    where: { workerId: worker.id },
    create: {
      workerId: worker.id,
      headline: 'Journeyman electrician · open to camp & urban',
      primaryTrade: 'Electrical',
      experienceLevel: JobBoardExperienceLevel.JOURNEYMAN,
      yearsExperience: 8,
      locationCity: 'Edmonton',
      locationRegion: 'AB',
      openToWork: true,
      skills: {
        create: [
          { skill: 'Commercial wiring', level: 'expert' },
          { skill: 'Motor controls', level: 'proficient' },
        ],
      },
    },
    update: {},
  });

  return job;
}
