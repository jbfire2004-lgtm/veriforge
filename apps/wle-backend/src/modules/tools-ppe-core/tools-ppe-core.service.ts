import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PpeStatus,
  PpeType,
  Prisma,
  ToolStatus,
  ToolsPpeAssignmentStatus,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AssignToProjectDto,
  AssignToWorkerDto,
  CreatePpeDto,
  CreateToolDto,
  PpeInspectDto,
  ToolInspectDto,
  UpdateToolDto,
} from './dto/tools-ppe.dto';

const PPE_DEFAULT_EXPIRY_DAYS: Record<PpeType, number> = {
  HARD_HAT: 1825,
  SAFETY_GLASSES: 365,
  GLOVES: 90,
  HARNESS: 365,
  FOOTWEAR: 180,
  HEARING: 365,
  RESPIRATOR: 30,
  COVERALL: 180,
  OTHER: 365,
};

const DEFAULT_TOOL_CHECKLIST = [
  { id: 'handle', label: 'Handle secure, no cracks', required: true },
  { id: 'head', label: 'Head / jaws / blade condition', required: true },
  { id: 'guard', label: 'Guards in place', required: true },
  { id: 'tag', label: 'Identification tag legible', required: false },
];

@Injectable()
export class ToolsPpeCoreService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(companyId?: number) {
    const where: Prisma.ToolWhereInput = companyId ? { companyId } : {};
    const ppeWhere: Prisma.PPEWhereInput = companyId ? { companyId } : {};
    const now = new Date();
    const warnDate = new Date();
    warnDate.setDate(warnDate.getDate() + 30);

    const [
      toolCount,
      toolsInspectionDue,
      ppeCount,
      ppeExpired,
      ppeExpiringSoon,
      activeToolAssignments,
      activePpeAssignments,
    ] = await Promise.all([
      this.prisma.tool.count({ where }),
      this.prisma.tool.count({
        where: {
          ...where,
          OR: [
            { status: ToolStatus.INSPECTION_DUE },
            { nextInspectionAt: { lte: now } },
          ],
        },
      }),
      this.prisma.pPE.count({ where: ppeWhere }),
      this.prisma.pPE.count({
        where: { ...ppeWhere, status: PpeStatus.EXPIRED },
      }),
      this.prisma.pPE.count({
        where: {
          ...ppeWhere,
          status: PpeStatus.ACTIVE,
          expiresAt: { lte: warnDate, gte: now },
        },
      }),
      this.prisma.toolAssignment.count({
        where: {
          status: ToolsPpeAssignmentStatus.ACTIVE,
          ...(companyId ? { companyId } : {}),
        },
      }),
      this.prisma.pPEAssignment.count({
        where: {
          status: ToolsPpeAssignmentStatus.ACTIVE,
          ...(companyId ? { companyId } : {}),
        },
      }),
    ]);

    return {
      toolCount,
      toolsInspectionDue,
      ppeCount,
      ppeExpired,
      ppeExpiringSoon,
      activeToolAssignments,
      activePpeAssignments,
    };
  }

  async listTools(companyId?: number) {
    return this.prisma.tool.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        assignments: {
          where: { status: ToolsPpeAssignmentStatus.ACTIVE },
          include: { worker: true, project: true },
          take: 1,
        },
      },
    });
  }

  async createTool(dto: CreateToolDto) {
    const qrToken = `t-${randomBytes(8).toString('hex')}`;
    return this.prisma.tool.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        serialNumber: dto.serialNumber,
        assetTag: dto.assetTag,
        category: dto.category,
        inspectionIntervalDays: dto.inspectionIntervalDays ?? 90,
        notes: dto.notes,
        qrToken,
      },
    });
  }

  async getTool(id: number) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      include: {
        inspections: { orderBy: { completedAt: 'desc' }, take: 25 },
        assignments: {
          orderBy: { assignedAt: 'desc' },
          include: { worker: true, project: true },
        },
      },
    });
    if (!tool) throw new NotFoundException('Tool not found');
    return { ...tool, defaultChecklist: DEFAULT_TOOL_CHECKLIST };
  }

  async updateTool(id: number, dto: UpdateToolDto) {
    await this.getTool(id);
    return this.prisma.tool.update({
      where: { id },
      data: {
        name: dto.name,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async inspectTool(
    toolId: number,
    dto: ToolInspectDto,
    inspectorUserId: number,
  ) {
    const tool = await this.getTool(toolId);
    const completedAt = new Date();
    const nextInspectionDate = new Date(completedAt);
    nextInspectionDate.setDate(
      nextInspectionDate.getDate() + tool.inspectionIntervalDays,
    );

    const inspection = await this.prisma.toolInspection.create({
      data: {
        toolId,
        inspectorUserId,
        workerId: dto.workerId,
        passed: dto.passed,
        checklist: dto.checklist as Prisma.InputJsonValue,
        notes: dto.notes,
        completedAt,
        nextInspectionDate: dto.passed ? nextInspectionDate : null,
      },
    });

    await this.prisma.tool.update({
      where: { id: toolId },
      data: {
        lastInspectionAt: completedAt,
        nextInspectionAt: dto.passed
          ? nextInspectionDate
          : tool.nextInspectionAt,
        status: dto.passed ? ToolStatus.ACTIVE : ToolStatus.INSPECTION_DUE,
      },
    });

    if (dto.workerId) {
      await this.syncWorkerWalletItem(
        dto.workerId,
        tool.companyId,
        `tool:${toolId}`,
        dto.passed ? 'ACTIVE' : 'FAILED',
        `Tool inspection ${dto.passed ? 'passed' : 'failed'}`,
      );
    }

    return inspection;
  }

  async assignToolToWorker(
    toolId: number,
    dto: AssignToWorkerDto,
    assignedBy?: number,
  ) {
    const tool = await this.getTool(toolId);
    await this.closeActiveToolAssignments(toolId);

    const assignment = await this.prisma.toolAssignment.create({
      data: {
        toolId,
        workerId: dto.workerId,
        projectId: dto.projectId,
        companyId: tool.companyId,
        assignedBy,
      },
      include: { worker: true, project: true },
    });

    await this.syncWorkerWalletItem(
      dto.workerId,
      tool.companyId,
      `tool:${toolId}`,
      'ACTIVE',
      `Assigned tool: ${tool.name}`,
    );

    return assignment;
  }

  async assignToolToProject(
    toolId: number,
    dto: AssignToProjectDto,
    assignedBy?: number,
  ) {
    const tool = await this.getTool(toolId);
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    await this.closeActiveToolAssignments(toolId);

    return this.prisma.toolAssignment.create({
      data: {
        toolId,
        workerId: dto.workerId,
        projectId: dto.projectId,
        companyId: project.companyId,
        assignedBy,
      },
      include: { worker: true, project: true },
    });
  }

  async returnTool(toolId: number) {
    await this.closeActiveToolAssignments(toolId);
    return { toolId, returned: true };
  }

  async listPpe(companyId?: number) {
    await this.processPpeExpiry(companyId);
    return this.prisma.pPE.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { expiresAt: 'asc' },
      include: {
        assignments: {
          where: { status: ToolsPpeAssignmentStatus.ACTIVE },
          include: { worker: true, project: true },
          take: 1,
        },
      },
    });
  }

  async createPpe(dto: CreatePpeDto) {
    const issuedAt = dto.issuedAt ? new Date(dto.issuedAt) : new Date();
    const expiresAt = dto.expiresAt
      ? new Date(dto.expiresAt)
      : this.defaultPpeExpiry(issuedAt, dto.ppeType);

    return this.prisma.pPE.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        ppeType: dto.ppeType,
        serialNumber: dto.serialNumber,
        condition: dto.condition,
        notes: dto.notes,
        issuedAt,
        expiresAt,
        status: expiresAt < new Date() ? PpeStatus.EXPIRED : PpeStatus.ACTIVE,
      },
    });
  }

  async getPpe(id: number) {
    const ppe = await this.prisma.pPE.findUnique({
      where: { id },
      include: {
        inspections: { orderBy: { completedAt: 'desc' }, take: 25 },
        assignments: {
          orderBy: { assignedAt: 'desc' },
          include: { worker: true, project: true },
        },
      },
    });
    if (!ppe) throw new NotFoundException('PPE not found');
    return ppe;
  }

  async inspectPpe(ppeId: number, dto: PpeInspectDto, inspectorUserId: number) {
    const ppe = await this.getPpe(ppeId);
    const completedAt = new Date();

    let extendedExpiresAt: Date | null = null;
    if (dto.passed) {
      extendedExpiresAt = dto.extendedExpiresAt
        ? new Date(dto.extendedExpiresAt)
        : this.defaultPpeExpiry(completedAt, ppe.ppeType);
    }

    const inspection = await this.prisma.pPEInspection.create({
      data: {
        ppeId,
        inspectorUserId,
        workerId: dto.workerId,
        passed: dto.passed,
        checklist: dto.checklist as Prisma.InputJsonValue,
        notes: dto.notes,
        completedAt,
        extendedExpiresAt,
      },
    });

    if (dto.passed && extendedExpiresAt) {
      await this.prisma.pPE.update({
        where: { id: ppeId },
        data: {
          expiresAt: extendedExpiresAt,
          status: PpeStatus.ACTIVE,
        },
      });
    } else if (!dto.passed) {
      await this.prisma.pPE.update({
        where: { id: ppeId },
        data: { status: PpeStatus.EXPIRED },
      });
    }

    if (dto.workerId) {
      await this.syncWorkerWalletItem(
        dto.workerId,
        ppe.companyId,
        `ppe:${ppeId}`,
        dto.passed ? 'ACTIVE' : 'FAILED',
        `PPE inspection ${dto.passed ? 'passed' : 'failed'}`,
      );
    }

    return inspection;
  }

  async assignPpeToWorker(
    ppeId: number,
    dto: AssignToWorkerDto,
    assignedBy?: number,
  ) {
    const ppe = await this.getPpe(ppeId);
    if (ppe.status === PpeStatus.EXPIRED) {
      throw new BadRequestException('Cannot assign expired PPE');
    }
    await this.closeActivePpeAssignments(ppeId);

    const assignment = await this.prisma.pPEAssignment.create({
      data: {
        ppeId,
        workerId: dto.workerId,
        projectId: dto.projectId,
        companyId: ppe.companyId,
        assignedBy,
      },
      include: { worker: true, project: true },
    });

    await this.syncWorkerWalletItem(
      dto.workerId,
      ppe.companyId,
      `ppe:${ppeId}`,
      'ACTIVE',
      `Assigned PPE: ${ppe.name}`,
    );

    return assignment;
  }

  async assignPpeToProject(
    ppeId: number,
    dto: AssignToProjectDto,
    assignedBy?: number,
  ) {
    const ppe = await this.getPpe(ppeId);
    if (!dto.workerId) {
      throw new BadRequestException(
        'workerId required for PPE project assignment',
      );
    }
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.assignPpeToWorker(
      ppeId,
      { workerId: dto.workerId, projectId: dto.projectId },
      assignedBy,
    );
  }

  async returnPpe(ppeId: number) {
    await this.closeActivePpeAssignments(ppeId);
    return { ppeId, returned: true };
  }

  async processPpeExpiry(companyId?: number) {
    const now = new Date();
    const expired = await this.prisma.pPE.updateMany({
      where: {
        ...(companyId ? { companyId } : {}),
        status: PpeStatus.ACTIVE,
        expiresAt: { lt: now },
      },
      data: { status: PpeStatus.EXPIRED },
    });

    const dueTools = await this.prisma.tool.updateMany({
      where: {
        ...(companyId ? { companyId } : {}),
        status: ToolStatus.ACTIVE,
        nextInspectionAt: { lt: now },
      },
      data: { status: ToolStatus.INSPECTION_DUE },
    });

    return { ppeExpired: expired.count, toolsMarkedDue: dueTools.count };
  }

  async getWorkerToolsPpe(workerId: number) {
    const [tools, ppe] = await Promise.all([
      this.prisma.toolAssignment.findMany({
        where: { workerId, status: ToolsPpeAssignmentStatus.ACTIVE },
        include: { tool: true, project: true },
      }),
      this.prisma.pPEAssignment.findMany({
        where: { workerId, status: ToolsPpeAssignmentStatus.ACTIVE },
        include: { ppe: true, project: true },
      }),
    ]);
    return { tools, ppe };
  }

  private defaultPpeExpiry(from: Date, ppeType: PpeType) {
    const d = new Date(from);
    d.setDate(d.getDate() + (PPE_DEFAULT_EXPIRY_DAYS[ppeType] ?? 365));
    return d;
  }

  private async closeActiveToolAssignments(toolId: number) {
    await this.prisma.toolAssignment.updateMany({
      where: { toolId, status: ToolsPpeAssignmentStatus.ACTIVE },
      data: {
        status: ToolsPpeAssignmentStatus.RETURNED,
        returnedAt: new Date(),
      },
    });
  }

  private async closeActivePpeAssignments(ppeId: number) {
    await this.prisma.pPEAssignment.updateMany({
      where: { ppeId, status: ToolsPpeAssignmentStatus.ACTIVE },
      data: {
        status: ToolsPpeAssignmentStatus.RETURNED,
        returnedAt: new Date(),
      },
    });
  }

  private async syncWorkerWalletItem(
    workerId: number,
    companyId: number,
    catalogTypeKey: string,
    status: string,
    notes: string,
  ) {
    const existing = await this.prisma.workerWalletItem.findFirst({
      where: { workerId, catalogTypeKey },
    });
    if (existing) {
      await this.prisma.workerWalletItem.update({
        where: { id: existing.id },
        data: { status, notes, updatedAt: new Date() },
      });
    } else {
      await this.prisma.workerWalletItem.create({
        data: { workerId, companyId, catalogTypeKey, status, notes },
      });
    }
  }
}
