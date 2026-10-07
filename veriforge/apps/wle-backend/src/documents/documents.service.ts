import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private readonly monitoring: Phase1MonitoringService,
  ) {}

  // ---------------------------------------------------------
  // UPLOAD DOCUMENT
  // ---------------------------------------------------------
  async upload(data: {
    type: string;
    name: string;
    url: string;
    description?: string;
    tags?: string[];
    workerId?: number;
    equipmentId?: number;
    companyId?: number;
  }) {
    const doc = await this.prisma.document.create({
      data: {
        type: data.type,
        name: data.name,
        url: data.url,
        description: data.description ?? null,
        tags: data.tags ?? [],
        workerId: data.workerId ?? null,
        equipmentId: data.equipmentId ?? null,
        companyId: data.companyId ?? null,
      },
    });
    this.monitoring.processing('documents', 'document.upload', {
      documentId: doc.id,
      type: data.type,
      workerId: data.workerId ?? null,
      equipmentId: data.equipmentId ?? null,
      companyId: data.companyId ?? null,
    });
    await this.monitoring.persistAudit({
      action: 'document.create',
      entity: 'Document',
      entityId: doc.id,
      metadata: {
        type: data.type,
        workerId: data.workerId ?? null,
        equipmentId: data.equipmentId ?? null,
        companyId: data.companyId ?? null,
      },
    });
    return doc;
  }

  // ---------------------------------------------------------
  // GET DOCUMENT
  // ---------------------------------------------------------
  async findOne(id: number) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        worker: true,
        equipment: true,
        company: true,
      },
    });

    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  // ---------------------------------------------------------
  // LIST DOCUMENTS (GLOBAL)
  // ---------------------------------------------------------
  async findAll() {
    return this.prisma.document.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // LIST BY WORKER
  // ---------------------------------------------------------
  async forWorker(workerId: number) {
    return this.prisma.document.findMany({
      where: { workerId, deleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // LIST BY EQUIPMENT
  // ---------------------------------------------------------
  async forEquipment(equipmentId: number) {
    return this.prisma.document.findMany({
      where: { equipmentId, deleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // LIST BY COMPANY
  // ---------------------------------------------------------
  async forCompany(companyId: number) {
    return this.prisma.document.findMany({
      where: { companyId, deleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // UPDATE DOCUMENT (VERSIONING)
  // ---------------------------------------------------------
  async update(
    id: number,
    data: Partial<{ name: string; description: string; tags: string[] }>,
  ) {
    const existing = await this.prisma.document.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        tags: data.tags ?? existing.tags,
        version: existing.version + 1,
      },
    });
  }

  // ---------------------------------------------------------
  // SOFT DELETE
  // ---------------------------------------------------------
  async softDelete(id: number) {
    const existing = await this.prisma.document.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id },
      data: { deleted: true },
    });
  }

  // ---------------------------------------------------------
  // RESTORE
  // ---------------------------------------------------------
  async restore(id: number) {
    const existing = await this.prisma.document.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Document not found');

    return this.prisma.document.update({
      where: { id },
      data: { deleted: false },
    });
  }

  // ---------------------------------------------------------
  // SEARCH DOCUMENTS
  // ---------------------------------------------------------
  async search(query: string) {
    return this.prisma.document.findMany({
      where: {
        deleted: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // PHASE 1: UNASSIGNED DOCUMENT QUEUE
  // ---------------------------------------------------------
  async getUnassigned(companyId: number) {
    return this.prisma.document.findMany({
      where: {
        companyId,
        workerId: null,
        equipmentId: null,
        deleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // PHASE 1: ASSIGN DOCUMENT TO WORKER
  // ---------------------------------------------------------
  async assignToWorker(documentId: number, workerId: number) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        workerId,
        equipmentId: null, // ensure clean assignment
      },
    });
  }

  // ---------------------------------------------------------
  // OPTIONAL: ASSIGN DOCUMENT TO EQUIPMENT
  // ---------------------------------------------------------
  async assignToEquipment(documentId: number, equipmentId: number) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    if (!equipment) throw new NotFoundException('Equipment not found');

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        equipmentId,
        workerId: null, // ensure clean assignment
      },
    });
  }
}
