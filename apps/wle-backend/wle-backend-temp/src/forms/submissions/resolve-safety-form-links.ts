import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type SafetyFormLinkInput = {
  companyId?: number;
  projectId?: number;
  siteId?: number;
  workerId?: number;
  equipmentId?: number;
};

export type ResolveSafetyFormLinksOptions = {
  /**
   * When false (draft/create), unknown FK ids are skipped so the form UI can load.
   * When true (submit), invalid ids raise 400 with a clear message.
   */
  strict?: boolean;
};

/**
 * Validates optional FK columns before persisting a safety form.
 */
export async function resolveSafetyFormLinks(
  prisma: PrismaService,
  input: SafetyFormLinkInput,
  options: ResolveSafetyFormLinksOptions = {},
): Promise<SafetyFormLinkInput> {
  const strict = options.strict === true;
  const resolved: SafetyFormLinkInput = {};

  if (input.companyId != null) {
    const row = await prisma.company.findUnique({
      where: { id: input.companyId },
      select: { id: true },
    });
    if (!row) {
      if (strict) {
        throw new BadRequestException(`Company ${input.companyId} not found`);
      }
    } else {
      resolved.companyId = row.id;
    }
  }

  if (input.projectId != null) {
    const row = await prisma.project.findUnique({
      where: { id: input.projectId },
      select: { id: true, companyId: true, siteId: true },
    });
    if (!row) {
      if (strict) {
        throw new BadRequestException(
          `Project ${input.projectId} not found. Choose a valid project in the form or open Safety Forms from a project that exists in the database.`,
        );
      }
    } else {
      resolved.projectId = row.id;
      resolved.companyId = resolved.companyId ?? row.companyId;
      if (row.siteId != null) resolved.siteId = row.siteId;
    }
  }

  if (input.siteId != null) {
    const row = await prisma.site.findUnique({
      where: { id: input.siteId },
      select: { id: true },
    });
    if (!row) {
      if (strict)
        throw new BadRequestException(`Site ${input.siteId} not found`);
    } else {
      resolved.siteId = row.id;
    }
  }

  if (input.workerId != null) {
    const row = await prisma.worker.findUnique({
      where: { id: input.workerId },
      select: { id: true, companyId: true },
    });
    if (!row) {
      if (strict) {
        throw new BadRequestException(`Worker ${input.workerId} not found`);
      }
    } else {
      resolved.workerId = row.id;
      if (row.companyId != null) {
        resolved.companyId = resolved.companyId ?? row.companyId;
      }
    }
  }

  if (input.equipmentId != null) {
    const row = await prisma.equipment.findUnique({
      where: { id: input.equipmentId },
      select: { id: true },
    });
    if (!row) {
      if (strict) {
        throw new BadRequestException(
          `Equipment ${input.equipmentId} not found`,
        );
      }
    } else {
      resolved.equipmentId = row.id;
    }
  }

  return resolved;
}
