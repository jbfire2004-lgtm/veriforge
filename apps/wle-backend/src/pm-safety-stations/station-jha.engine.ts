import { PrismaService } from '../prisma/prisma.service';

export type JhaStationValidation = {
  valid: boolean;
  jhaFlhaId?: string;
  denialReasons: string[];
  checks: Record<string, boolean>;
  requiredPpe: string[];
};

export class StationJhaEngine {
  constructor(private readonly prisma: PrismaService) {}

  async validateForStation(input: {
    workerId: number;
    projectId: number;
    zoneCode: string;
    requiresJha: boolean;
    flhaHours: number;
    equipmentId?: number;
  }): Promise<JhaStationValidation> {
    const denialReasons: string[] = [];
    const checks: Record<string, boolean> = {};
    const requiredPpe: string[] = [];

    const hours = input.flhaHours || 24;
    const flhaSince = new Date(Date.now() - hours * 60 * 60 * 1000);

    const flha = await this.prisma.jhaFlha.findFirst({
      where: {
        projectId: input.projectId,
        kind: 'FLHA',
        status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED', 'UNDER_REVIEW'] },
        workers: { some: { workerId: input.workerId } },
        OR: [
          { approvedAt: { gte: flhaSince } },
          { submittedAt: { gte: flhaSince } },
        ],
      },
      include: { controls: true },
    });

    checks.flha = !!flha;
    if (!checks.flha) {
      denialReasons.push(`FLHA not completed within last ${hours} hours`);
    }

    let jhaFlhaId = flha?.id;

    if (input.requiresJha) {
      const jha = await this.prisma.jhaFlha.findFirst({
        where: {
          projectId: input.projectId,
          kind: 'JHA',
          status: { in: ['APPROVED', 'LOCKED'] },
          workers: { some: { workerId: input.workerId } },
          ...(input.equipmentId
            ? {
                equipmentLinks: {
                  some: { equipmentId: input.equipmentId, authorized: true },
                },
              }
            : {}),
        },
        include: { signatures: true, controls: true, workers: true },
        orderBy: { approvedAt: 'desc' },
      });

      checks.jha = !!jha;
      if (!jha) {
        denialReasons.push('Approved JHA required');
      } else {
        jhaFlhaId = jha.id;
        const workerSig =
          jha.workers.some(
            (w) => w.workerId === input.workerId && w.signedAt,
          ) || jha.signatures.some((s) => s.role === 'WORKER');
        checks.workerSignedJha = workerSig;
        if (!workerSig) denialReasons.push('Worker JHA signature missing');

        const supervisorSig = jha.signatures.some(
          (s) => s.role === 'SUPERVISOR',
        );
        checks.supervisorApproved = supervisorSig;
        if (!supervisorSig)
          denialReasons.push('Supervisor JHA approval missing');

        const controlsInPlace = (jha.controls?.length ?? 0) > 0;
        checks.controlsInPlace = controlsInPlace;
        if (!controlsInPlace) denialReasons.push('JHA controls not documented');

        for (const c of jha.controls ?? []) {
          if (c.ppeRequired) requiredPpe.push(c.controlType || 'ppe');
        }
        checks.requiredPpe = requiredPpe.length === 0 || requiredPpe.length > 0;
      }
    }

    return {
      valid: denialReasons.length === 0,
      jhaFlhaId,
      denialReasons,
      checks,
      requiredPpe: [...new Set(requiredPpe)],
    };
  }

  async syncPayload(projectId: number) {
    const jhas = await this.prisma.jhaFlha.findMany({
      where: {
        projectId,
        status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED'] },
      },
      select: {
        id: true,
        kind: true,
        status: true,
        taskDescription: true,
        approvedAt: true,
        workers: { select: { workerId: true } },
        signatures: {
          select: { signerUserId: true, role: true, signedAt: true },
        },
      },
      take: 200,
    });

    const rules = await this.prisma.siteAccessRule.findMany({
      where: { projectId },
      select: { zoneCode: true, requiresJha: true, requiresFlhaHours: true },
    });

    return { activeJhas: jhas, zoneJhaRules: rules };
  }
}
