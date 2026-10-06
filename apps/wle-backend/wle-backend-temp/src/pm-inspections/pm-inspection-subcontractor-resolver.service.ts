import { Injectable } from '@nestjs/common';
import { PmInspectionFindingCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Resolves subcontractor company for contractor-assigned findings. */
@Injectable()
export class PmInspectionSubcontractorResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async listSubcontractorIds(projectId: number): Promise<number[]> {
    const [config, profile] = await Promise.all([
      this.prisma.pmProjectConfig.findUnique({
        where: { projectId },
        select: { subcontractorIds: true },
      }),
      this.prisma.pmProjectSafetyProfile.findFirst({
        where: { projectId, publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        select: { subcontractorIds: true },
      }),
    ]);

    const fromProfile = parseSubcontractorIds(profile?.subcontractorIds);
    if (fromProfile.length) return fromProfile;

    return parseSubcontractorIds(config?.subcontractorIds);
  }

  async resolveForFinding(
    projectId: number,
    category: PmInspectionFindingCategory,
    overrideId?: number,
  ): Promise<number | undefined> {
    if (overrideId) return overrideId;

    const ids = await this.listSubcontractorIds(projectId);
    if (!ids.length) return undefined;

    return pickSubcontractorForCategory(ids, category);
  }

  async listWithNames(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });
    if (!project) return [];

    const ids = new Set<number>(await this.listSubcontractorIds(projectId));
    ids.add(project.companyId);

    const assignmentCompanies = await this.prisma.projectAssignment.findMany({
      where: { projectId, status: 'ACTIVE' },
      select: { companyId: true },
      distinct: ['companyId'],
    });
    for (const row of assignmentCompanies) ids.add(row.companyId);

    const portalMembers =
      await this.prisma.pmContractorPortalMembership.findMany({
        where: { projectId, active: true },
        select: { contractorCompanyId: true },
        distinct: ['contractorCompanyId'],
      });
    for (const row of portalMembers) ids.add(row.contractorCompanyId);

    if (!ids.size) return [];

    return this.prisma.company.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}

function parseSubcontractorIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => (typeof v === 'number' ? v : parseInt(String(v), 10)))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/**
 * Map finding category to subcontractor when multiple are on the project.
 * equipment_defect → first sub; housekeeping → second if present; else first.
 */
function pickSubcontractorForCategory(
  ids: number[],
  category: PmInspectionFindingCategory,
): number {
  if (ids.length === 1) return ids[0]!;
  switch (category) {
    case 'equipment_defect':
      return ids[0]!;
    case 'housekeeping':
      return ids[1] ?? ids[0]!;
    case 'unsafe_condition':
      return ids[0]!;
    default:
      return ids[0]!;
  }
}
