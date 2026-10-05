import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EquipmentSafetyStatus,
  LinkComplianceStatus,
  Prisma,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EquipmentLinksService } from '../vera-core/equipment-links.service';
import { ProjectsService } from '../vera-core/projects.service';
import { InactivationService } from '../vera-core/inactivation.service';
import { WalletsService } from '../vera-core/wallets.service';
import { CreateEquipmentCoreDto } from './dto/create-equipment-core.dto';
import { UpdateEquipmentCoreDto } from './dto/update-equipment-core.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateCalibrationDto } from './dto/create-calibration.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { LockoutEquipmentDto } from './dto/lockout-equipment.dto';
import { CompetencyService } from '../competency/competency.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';

const equipmentInclude = {
  company: true,
  category: true,
  type: true,
  equipmentLinks: {
    orderBy: { startDate: 'desc' as const },
    include: {
      company: true,
      assignedWorkers: { include: { worker: true } },
    },
  },
  projectAssignments: {
    where: { status: 'ACTIVE' as const },
    include: { project: true },
  },
  competencyRequirements: { include: { certification: true } },
  trainingRequirements: { include: { certification: true } },
  inspections: { orderBy: { createdAt: 'desc' as const }, take: 20 },
  maintenanceRecords: { orderBy: { performedAt: 'desc' as const }, take: 20 },
  calibrations: { orderBy: { calibratedAt: 'desc' as const }, take: 20 },
  lockoutHistory: { orderBy: { lockedAt: 'desc' as const }, take: 20 },
  complianceHistory: { orderBy: { assessedAt: 'desc' as const }, take: 20 },
  attachments: { orderBy: { createdAt: 'desc' as const } },
} satisfies Prisma.EquipmentInclude;

@Injectable()
export class EquipmentCoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly equipmentLinks: EquipmentLinksService,
    private readonly projects: ProjectsService,
    private readonly inactivation: InactivationService,
    private readonly wallets: WalletsService,
    private readonly competency: CompetencyService,
    private readonly compliance: EquipmentComplianceService,
  ) {}

  private qrToken() {
    return `e-${randomBytes(8).toString('hex')}`;
  }

  async list(query: {
    companyId?: number;
    q?: string;
    activeOnly?: boolean;
    limit?: number;
    complianceStatus?: LinkComplianceStatus;
    compliant?: boolean;
  }) {
    const limit = Math.min(query.limit ?? 50, 200);
    const where: Prisma.EquipmentWhereInput = {};

    if (query.companyId) {
      if (query.activeOnly !== false) {
        where.equipmentLinks = {
          some: { companyId: query.companyId, active: true },
        };
      } else {
        where.OR = [
          { companyId: query.companyId },
          { equipmentLinks: { some: { companyId: query.companyId } } },
        ];
      }
    }

    if (query.q?.trim()) {
      const q = query.q.trim();
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
          ? [where.AND]
          : []),
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { serialNumber: { contains: q, mode: 'insensitive' } },
            { assetTag: { contains: q, mode: 'insensitive' } },
            { qrToken: q },
          ],
        },
      ];
    }

    if (query.complianceStatus) {
      where.complianceStatus = query.complianceStatus;
    } else if (query.compliant === true) {
      where.complianceStatus = LinkComplianceStatus.COMPLIANT;
    } else if (query.compliant === false) {
      where.complianceStatus = {
        in: [
          LinkComplianceStatus.NON_COMPLIANT,
          LinkComplianceStatus.NEEDS_ATTENTION,
          LinkComplianceStatus.LOCKED_OUT,
        ],
      };
    }

    return this.prisma.equipment.findMany({
      where,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        company: true,
        category: true,
        type: true,
        equipmentLinks: {
          where: query.companyId
            ? { companyId: query.companyId, active: true }
            : { active: true },
          take: 1,
        },
      },
    });
  }

  async search(query: {
    q?: string;
    serial?: string;
    assetTag?: string;
    qr?: string;
    limit?: number;
  }) {
    const limit = Math.min(query.limit ?? 25, 100);
    const where: Prisma.EquipmentWhereInput = { AND: [] };
    const and = where.AND as Prisma.EquipmentWhereInput[];

    if (query.serial) {
      and.push({
        serialNumber: { contains: query.serial, mode: 'insensitive' },
      });
    }
    if (query.assetTag) {
      and.push({ assetTag: { contains: query.assetTag, mode: 'insensitive' } });
    }
    if (query.qr) {
      and.push({
        OR: [
          { qrToken: query.qr },
          { id: Number.isFinite(Number(query.qr)) ? Number(query.qr) : -1 },
        ],
      });
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { serialNumber: { contains: q, mode: 'insensitive' } },
          { assetTag: { contains: q, mode: 'insensitive' } },
        ],
      });
    }
    if (and.length === 0) delete where.AND;

    return this.prisma.equipment.findMany({
      where,
      take: limit,
      include: { company: true, category: true, type: true },
    });
  }

  async dashboard(companyId?: number) {
    const compliance = await this.compliance.dashboard(companyId);
    const recent = await this.list({ companyId, limit: 8 });

    return {
      total: compliance.total,
      lockedOut: compliance.lockedOut,
      nonCompliant: compliance.nonCompliant + compliance.needsAttention,
      needsInspection: compliance.overdueInspection,
      compliant: compliance.compliant,
      needsAttention: compliance.needsAttention,
      recent,
      atRisk: compliance.recent,
    };
  }

  async create(dto: CreateEquipmentCoreDto, userId?: number) {
    const equipment = await this.prisma.equipment.create({
      data: {
        name: dto.name,
        serialNumber: dto.serialNumber ?? null,
        assetTag: dto.assetTag ?? null,
        safetyStatus: dto.safetyStatus ?? EquipmentSafetyStatus.OK,
        companyId: dto.companyId ?? null,
        categoryId: dto.categoryId ?? null,
        typeId: dto.typeId ?? null,
        photoUrl: dto.photoUrl ?? null,
        description: dto.description ?? null,
        manufacturer: dto.manufacturer ?? null,
        model: dto.model ?? null,
        yearMade: dto.yearMade ?? null,
        catalogCategory: dto.catalogCategory ?? null,
        catalogTypeKey: dto.catalogTypeKey ?? null,
        meterHours: dto.meterHours ?? 0,
        qrToken: this.qrToken(),
      },
      include: equipmentInclude,
    });

    if (dto.companyId) {
      await this.equipmentLinks.linkEquipment(equipment.id, dto.companyId, {
        deactivateOtherCompanies: false,
      });
      await this.compliance.recalculate(equipment.id, {
        trigger: 'MANUAL',
        assessedByUserId: userId,
        notes: 'Equipment created and linked',
      });
    }

    return this.findOne(equipment.id);
  }

  async findOne(id: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: equipmentInclude,
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    const activeLink = equipment.equipmentLinks.find((l) => l.active);
    return {
      ...equipment,
      isLockedOut: Boolean(equipment.lockedOutAt),
      isSafe: equipment.safetyStatus === 'OK' && !equipment.lockedOutAt,
      activeCompanyLink: activeLink ?? null,
      assignedOperators: activeLink?.assignedWorkers ?? [],
    };
  }

  async update(id: number, dto: UpdateEquipmentCoreDto) {
    await this.findOne(id);
    await this.prisma.equipment.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.serialNumber !== undefined
          ? { serialNumber: dto.serialNumber }
          : {}),
        ...(dto.assetTag !== undefined ? { assetTag: dto.assetTag } : {}),
        ...(dto.safetyStatus !== undefined
          ? { safetyStatus: dto.safetyStatus }
          : {}),
        ...(dto.companyId !== undefined ? { companyId: dto.companyId } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.typeId !== undefined ? { typeId: dto.typeId } : {}),
        ...(dto.photoUrl !== undefined ? { photoUrl: dto.photoUrl } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.manufacturer !== undefined
          ? { manufacturer: dto.manufacturer }
          : {}),
        ...(dto.model !== undefined ? { model: dto.model } : {}),
        ...(dto.yearMade !== undefined ? { yearMade: dto.yearMade } : {}),
        ...(dto.meterHours !== undefined ? { meterHours: dto.meterHours } : {}),
        ...(dto.catalogCategory !== undefined
          ? { catalogCategory: dto.catalogCategory }
          : {}),
        ...(dto.catalogTypeKey !== undefined
          ? { catalogTypeKey: dto.catalogTypeKey }
          : {}),
      },
    });
    return this.findOne(id);
  }

  async scanQr(qrToken: string, companyId: number) {
    const link = await this.equipmentLinks.linkByQrToken(qrToken, companyId);
    const wallet = await this.wallets.getEquipmentWallet(link.equipmentId);
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: link.equipmentId },
      select: { name: true },
    });
    return {
      linked: true,
      equipmentId: link.equipmentId,
      companyId: link.companyId,
      linkId: link.id,
      complianceStatus: wallet.complianceStatus,
      equipmentName: equipment?.name ?? null,
      walletUrl: `/equipment/${link.equipmentId}/wallet`,
    };
  }

  async getQr(id: number) {
    const e = await this.findOne(id);
    const token = e.qrToken ?? this.qrToken();
    if (!e.qrToken) {
      await this.prisma.equipment.update({
        where: { id },
        data: { qrToken: token },
      });
    }
    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://app.vera.local';
    return {
      equipmentId: id,
      qrToken: token,
      content: JSON.stringify({ type: 'equipment', id, token }),
      url: `${baseUrl}/verify/equipment?id=${id}`,
    };
  }

  async linkToCompany(equipmentId: number, companyId: number) {
    const link = await this.equipmentLinks.linkEquipment(
      equipmentId,
      companyId,
    );
    await this.compliance.recalculate(equipmentId, {
      trigger: 'MANUAL',
      notes: 'Linked to company',
    });
    return link;
  }

  async endCompanyAssignment(equipmentId: number, companyId: number) {
    return this.equipmentLinks.endAssignment(equipmentId, companyId);
  }

  async assignToProject(
    equipmentId: number,
    projectId: number,
    assignedBy?: number,
  ) {
    return this.projects.assignEquipment(projectId, equipmentId, assignedBy);
  }

  async removeFromProject(equipmentId: number, projectId: number) {
    return this.projects.removeEquipment(projectId, equipmentId);
  }

  async assignWorker(
    equipmentId: number,
    workerId: number,
    companyId?: number,
  ) {
    const equipment = await this.findOne(equipmentId);
    const cid =
      companyId ??
      equipment.activeCompanyLink?.companyId ??
      equipment.companyId;
    if (!cid) {
      throw new BadRequestException('Equipment must be linked to a company');
    }
    const link = await this.prisma.equipmentLink.findFirst({
      where: { equipmentId, companyId: cid, active: true },
    });
    if (!link) {
      throw new NotFoundException('No active equipment link for company');
    }
    await this.competency.assertEligible(workerId, equipmentId);
    return this.equipmentLinks.assignWorkerToEquipmentLink(link.id, workerId);
  }

  async removeWorker(
    equipmentId: number,
    workerId: number,
    companyId?: number,
  ) {
    const equipment = await this.findOne(equipmentId);
    const cid =
      companyId ??
      equipment.activeCompanyLink?.companyId ??
      equipment.companyId;
    if (!cid) throw new BadRequestException('Company context required');

    const link = await this.prisma.equipmentLink.findFirst({
      where: { equipmentId, companyId: cid, active: true },
    });
    if (!link) throw new NotFoundException('Equipment link not found');

    await this.prisma.equipmentLinkWorker.deleteMany({
      where: { equipmentLinkId: link.id, workerId },
    });
    return { equipmentId, workerId, removed: true };
  }

  async lockout(
    equipmentId: number,
    dto: LockoutEquipmentDto,
    userId?: number,
  ) {
    const equipment = await this.findOne(equipmentId);
    const companyId =
      dto.companyId ??
      equipment.activeCompanyLink?.companyId ??
      equipment.companyId ??
      undefined;

    await this.inactivation.lockoutEquipment(equipmentId, dto.reason);

    const lockout = await this.prisma.equipmentLockout.create({
      data: {
        equipmentId,
        companyId: companyId ?? null,
        reason: dto.reason,
        lockedByUserId: userId ?? null,
      },
    });

    if (companyId) {
      await this.compliance.recalculate(equipmentId, {
        trigger: 'LOCKOUT',
        assessedByUserId: userId,
        notes: dto.reason,
        forceStatus: LinkComplianceStatus.LOCKED_OUT,
      });
    }

    return lockout;
  }

  async unlock(equipmentId: number, userId?: number, notes?: string) {
    const equipment = await this.findOne(equipmentId);
    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        lockedOutAt: null,
        lockoutReason: null,
        safetyStatus: EquipmentSafetyStatus.OK,
      },
    });

    await this.prisma.equipmentLockout.updateMany({
      where: { equipmentId, unlockedAt: null },
      data: { unlockedAt: new Date(), unlockedByUserId: userId ?? null },
    });

    const companyId =
      equipment.activeCompanyLink?.companyId ?? equipment.companyId;
    if (companyId) {
      await this.compliance.recalculate(equipmentId, {
        trigger: 'UNLOCK',
        assessedByUserId: userId,
        notes: notes ?? 'Unlocked',
      });
    }

    return { equipmentId, unlocked: true };
  }

  async addMaintenance(equipmentId: number, dto: CreateMaintenanceDto) {
    await this.findOne(equipmentId);
    const record = await this.prisma.equipmentMaintenance.create({
      data: {
        equipmentId,
        type: dto.type,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
        performedBy: dto.performedBy,
        notes: dto.notes,
        nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : null,
        meterHours: dto.meterHours,
      },
    });
    await this.compliance.recalculate(equipmentId, {
      trigger: 'MAINTENANCE',
      assessedByUserId: dto.performedBy,
      notes: `Maintenance (${dto.type})`,
    });
    return record;
  }

  async addCalibration(equipmentId: number, dto: CreateCalibrationDto) {
    await this.findOne(equipmentId);
    const record = await this.prisma.equipmentCalibration.create({
      data: {
        equipmentId,
        calibratedAt: dto.calibratedAt ? new Date(dto.calibratedAt) : undefined,
        calibratedBy: dto.calibratedBy,
        certificateNumber: dto.certificateNumber,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        passed: dto.passed ?? true,
        notes: dto.notes,
      },
    });

    await this.compliance.recalculate(equipmentId, {
      trigger: 'CALIBRATION',
      assessedByUserId: dto.calibratedBy,
      notes:
        dto.passed === false ? 'Calibration failed' : 'Calibration recorded',
      ...(dto.passed === false
        ? { forceStatus: LinkComplianceStatus.NEEDS_ATTENTION }
        : {}),
    });

    return record;
  }

  async addAttachment(equipmentId: number, dto: CreateAttachmentDto) {
    await this.findOne(equipmentId);
    return this.prisma.equipmentAttachment.create({
      data: {
        equipmentId,
        type: dto.type,
        name: dto.name,
        url: dto.url,
        notes: dto.notes,
      },
    });
  }

  async getTimeline(equipmentId: number) {
    const equipment = await this.findOne(equipmentId);
    type TimelineEvent = {
      at: Date;
      type: string;
      title: string;
      detail?: string;
    };
    const events: TimelineEvent[] = [];

    for (const link of equipment.equipmentLinks) {
      events.push({
        at: link.startDate,
        type: 'company_link',
        title: link.active ? 'Linked to company' : 'Company link ended',
        detail: link.company?.name,
      });
      if (link.endDate) {
        events.push({
          at: link.endDate,
          type: 'company_unlink',
          title: 'Left company',
          detail: link.company?.name,
        });
      }
    }

    for (const pa of equipment.projectAssignments) {
      events.push({
        at: pa.assignedAt,
        type: 'project',
        title: `Assigned to project`,
        detail: pa.project?.name,
      });
    }

    for (const i of equipment.inspections) {
      events.push({
        at: i.createdAt,
        type: 'inspection',
        title: i.passed ? 'Inspection passed' : 'Inspection failed',
        detail: i.inspectionType ?? i.kind,
      });
    }

    for (const m of equipment.maintenanceRecords) {
      events.push({
        at: m.performedAt,
        type: 'maintenance',
        title: `Maintenance (${m.type})`,
        detail: m.notes ?? undefined,
      });
    }

    for (const c of equipment.calibrations) {
      events.push({
        at: c.calibratedAt,
        type: 'calibration',
        title: c.passed ? 'Calibration passed' : 'Calibration failed',
      });
    }

    for (const l of equipment.lockoutHistory) {
      events.push({
        at: l.lockedAt,
        type: 'lockout',
        title: 'Locked out',
        detail: l.reason,
      });
      if (l.unlockedAt) {
        events.push({
          at: l.unlockedAt,
          type: 'unlock',
          title: 'Unlocked',
        });
      }
    }

    for (const cs of equipment.complianceHistory) {
      events.push({
        at: cs.assessedAt,
        type: 'compliance',
        title: `Compliance: ${cs.status}`,
        detail: cs.notes ?? undefined,
      });
    }

    events.sort((a, b) => b.at.getTime() - a.at.getTime());
    return events.map((e) => ({
      ...e,
      at: e.at.toISOString(),
    }));
  }

  async getWallet(equipmentId: number) {
    return this.wallets.getEquipmentWallet(equipmentId);
  }

  async listCategories() {
    return this.prisma.equipmentCategory.findMany({
      include: { types: { orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }
}
