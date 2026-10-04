import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  PmControlledDocumentType,
  PmDocumentStatus,
  PmSdsCategory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentWorkflowEngine } from './document-workflow.engine';
import { ChemicalCompatibilityEngine } from './chemical-compatibility.engine';
import { ChemicalHazardEngine } from './chemical-hazard.engine';
import { PmDocumentCailIntelligenceService } from './pm-document-cail-intelligence.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';

@Injectable()
export class PmDocumentControlService {
  private readonly workflow = new DocumentWorkflowEngine();
  private readonly compatibility = new ChemicalCompatibilityEngine();
  private readonly hazardEngine = new ChemicalHazardEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cail: PmDocumentCailIntelligenceService,
    @Optional() private readonly capaAuto?: PmCapaAutoGenerateService,
  ) {}

  private async audit(
    entityType: string,
    entityId: string,
    eventType: string,
    actorId?: number,
    payload?: Record<string, unknown>,
  ) {
    await this.prisma.pmDocumentAuditLog.create({
      data: {
        entityType,
        entityId,
        eventType,
        actorId,
        payload: payload as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // ---------- SDS ----------

  listSds(filters: {
    companyId: number;
    projectId?: number;
    category?: PmSdsCategory;
    status?: PmDocumentStatus;
    search?: string;
    includeArchived?: boolean;
  }) {
    return this.prisma.sdsDocument.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId !== undefined
          ? {
              OR: [{ projectId: filters.projectId }, { projectId: null }],
            }
          : {}),
        category: filters.category,
        status: filters.includeArchived ? undefined : { not: 'archived' },
        ...(filters.search
          ? {
              OR: [
                {
                  productName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  manufacturer: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ status: 'asc' }, { productName: 'asc' }],
      take: 300,
      include: { attachments: { take: 5 } },
    });
  }

  async createSds(
    data: {
      companyId: number;
      projectId?: number;
      productName: string;
      manufacturer?: string;
      category?: PmSdsCategory;
      casNumbers?: string[];
      hazardClasses?: string[];
      whmisJson?: Record<string, unknown>;
      metadataJson?: Record<string, unknown>;
      storageKey?: string;
      revisionDate?: Date;
      expiresAt?: Date;
      reviewDueAt?: Date;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const doc = await this.prisma.sdsDocument.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        productName: data.productName,
        manufacturer: data.manufacturer,
        category: data.category ?? 'CHEMICAL',
        status: 'draft',
        casNumbers: (data.casNumbers ?? []) as Prisma.InputJsonValue,
        hazardClasses: (data.hazardClasses ?? []) as Prisma.InputJsonValue,
        whmisJson: (data.whmisJson ?? {}) as Prisma.InputJsonValue,
        metadataJson: (data.metadataJson ?? {}) as Prisma.InputJsonValue,
        storageKey: data.storageKey,
        revisionDate: data.revisionDate,
        expiresAt: data.expiresAt,
        reviewDueAt: data.reviewDueAt,
        clientSyncId: data.clientSyncId,
      },
    });
    await this.audit('sds', doc.id, 'created', actorId);
    return doc;
  }

  deriveSdsLifecycleStatus(doc: {
    status: string;
    expiresAt: Date | null;
  }): 'active' | 'expired' | 'superseded' {
    if (doc.status === 'superseded') return 'superseded';
    if (doc.expiresAt && doc.expiresAt < new Date()) return 'expired';
    if (doc.status === 'published') return 'active';
    return 'active';
  }

  async getSds(id: string) {
    const doc = await this.prisma.sdsDocument.findFirst({
      where: { id, deletedAt: null },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 20 },
        attachments: true,
        inventory: { include: { site: { select: { id: true, name: true } } } },
        acknowledgments: { take: 50, orderBy: { acknowledgedAt: 'desc' } },
      },
    });
    if (!doc) throw new NotFoundException('SDS not found');
    const extracted = this.hazardEngine.extract(doc);
    return {
      ...doc,
      lifecycleStatus: this.deriveSdsLifecycleStatus(doc),
      extractedHazards: extracted.hazards,
      extractedControls: extracted.controls,
      ppeRequirements: extracted.ppeRequirements,
    };
  }

  async extractSdsHazards(id: string) {
    const doc = await this.getSds(id);
    const extracted = this.hazardEngine.extract(doc);
    return {
      sdsId: id,
      ...extracted,
      suggestedControls: this.hazardEngine.suggestedControls(extracted.hazards),
    };
  }

  async scoreSds(id: string) {
    const doc = await this.prisma.sdsDocument.findFirst({
      where: { id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('SDS not found');
    const extracted = this.hazardEngine.extract(doc);
    const lifecycleStatus = this.deriveSdsLifecycleStatus(doc);
    return {
      sdsId: id,
      lifecycleStatus,
      chemicalRiskScore: extracted.chemicalRiskScore,
      hazardCount: extracted.hazards.length,
      requiresAck: doc.requiresAck,
      expiresAt: doc.expiresAt,
    };
  }

  async getWorkerSds(workerId: number, projectId?: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId) throw new NotFoundException('Worker not found');

    const requiredSds = await this.prisma.sdsDocument.findMany({
      where: {
        companyId: worker.companyId,
        status: 'published',
        deletedAt: null,
        ...(projectId !== undefined
          ? { OR: [{ projectId }, { projectId: null }] }
          : {}),
      },
      orderBy: { productName: 'asc' },
      take: 200,
    });

    const acks = await this.prisma.pmDocumentAcknowledgment.findMany({
      where: { workerId, sdsDocumentId: { not: null } },
      orderBy: { acknowledgedAt: 'desc' },
    });
    const ackBySds = new Map(acks.map((a) => [a.sdsDocumentId!, a]));

    const documents = requiredSds.map((sds) => {
      const ack = ackBySds.get(sds.id);
      const lifecycleStatus = this.deriveSdsLifecycleStatus(sds);
      return {
        id: sds.id,
        productName: sds.productName,
        manufacturer: sds.manufacturer,
        lifecycleStatus,
        requiresAck: sds.requiresAck,
        acknowledged: !!ack,
        acknowledgedAt: ack?.acknowledgedAt ?? null,
        expiresAt: sds.expiresAt,
        accessBlocked: sds.requiresAck && !ack && lifecycleStatus === 'active',
      };
    });

    const access = projectId
      ? await this.workerAccessCheck(workerId, projectId)
      : null;

    return {
      workerId,
      projectId: projectId ?? null,
      documents,
      acknowledgments: acks,
      sdsComplianceScore: this.workerSdsComplianceScore(documents),
      access,
    };
  }

  private workerSdsComplianceScore(
    documents: Array<{ requiresAck: boolean; acknowledged: boolean }>,
  ) {
    const required = documents.filter((d) => d.requiresAck);
    if (required.length === 0) return 100;
    const done = required.filter((d) => d.acknowledged).length;
    return Math.round((done / required.length) * 100);
  }

  async transitionSds(
    id: string,
    to: PmDocumentStatus,
    actorId?: number,
    extra?: { supersededById?: string },
  ) {
    const doc = await this.getSds(id);
    this.workflow.assertTransition(doc.status, to);

    const update: Prisma.SdsDocumentUpdateInput = { status: to };
    if (to === 'published') {
      Object.assign(update, this.workflow.publishFields());
      await this.prisma.sdsDocumentVersion.create({
        data: {
          sdsDocumentId: id,
          version: doc.version,
          snapshot: doc as unknown as Prisma.InputJsonValue,
          authorId: actorId,
        },
      });
    }
    if (to === 'archived') {
      update.deletedAt = new Date();
    }

    const updated = await this.prisma.sdsDocument.update({
      where: { id },
      data: update,
    });
    await this.audit('sds', id, `status_${to}`, actorId, extra);
    return updated;
  }

  async replaceSds(
    parentId: string,
    data: {
      storageKey?: string;
      revisionDate?: Date;
      expiresAt?: Date;
      metadataJson?: Record<string, unknown>;
    },
    actorId?: number,
  ) {
    const parent = await this.getSds(parentId);
    await this.transitionSds(parentId, 'superseded', actorId);

    const child = await this.prisma.sdsDocument.create({
      data: {
        companyId: parent.companyId,
        projectId: parent.projectId,
        productName: parent.productName,
        manufacturer: parent.manufacturer,
        category: parent.category,
        parentDocumentId: parentId,
        version: parent.version + 1,
        status: 'draft',
        casNumbers: parent.casNumbers as Prisma.InputJsonValue,
        hazardClasses: parent.hazardClasses as Prisma.InputJsonValue,
        whmisJson: parent.whmisJson as Prisma.InputJsonValue,
        metadataJson: (data.metadataJson ??
          parent.metadataJson) as Prisma.InputJsonValue,
        storageKey: data.storageKey ?? parent.storageKey,
        revisionDate: data.revisionDate ?? new Date(),
        expiresAt: data.expiresAt,
      },
    });
    await this.audit('sds', child.id, 'replacement_created', actorId, {
      parentId,
    });
    return child;
  }

  async addSdsAttachment(
    sdsDocumentId: string,
    data: {
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      dataUrl?: string;
      clientSyncId?: string;
    },
  ) {
    await this.getSds(sdsDocumentId);
    return this.prisma.sdsDocumentAttachment.create({
      data: { sdsDocumentId, ...data },
    });
  }

  // ---------- Chemical inventory ----------

  listChemicalInventory(filters: {
    companyId?: number;
    projectId?: number;
    siteId?: number;
  }) {
    return this.prisma.chemicalInventoryItem.findMany({
      where: {
        companyId: filters.companyId,
        projectId: filters.projectId,
        siteId: filters.siteId,
      },
      include: {
        sdsDocument: {
          select: {
            id: true,
            productName: true,
            status: true,
            expiresAt: true,
          },
        },
        site: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });
  }

  async upsertChemicalItem(
    data: {
      id?: string;
      companyId: number;
      siteId: number;
      projectId?: number;
      sdsDocumentId?: string;
      productName?: string;
      quantity?: number;
      unit?: string;
      containerSize?: string;
      locationNote?: string;
      storageClass?: string;
      incompatibleWith?: string[];
      chemicalExpiry?: Date;
    },
    actorId?: number,
  ) {
    let missingSdsFlag = !data.sdsDocumentId;
    if (data.sdsDocumentId) {
      const sds = await this.prisma.sdsDocument.findUnique({
        where: { id: data.sdsDocumentId },
      });
      if (!sds || sds.status !== 'published') {
        missingSdsFlag = true;
      }
    }

    const payload = {
      companyId: data.companyId,
      siteId: data.siteId,
      projectId: data.projectId,
      sdsDocumentId: data.sdsDocumentId,
      productName: data.productName,
      quantity: data.quantity,
      unit: data.unit,
      containerSize: data.containerSize,
      locationNote: data.locationNote,
      storageClass: data.storageClass,
      incompatibleWith: (data.incompatibleWith ?? []) as Prisma.InputJsonValue,
      chemicalExpiry: data.chemicalExpiry,
      missingSdsFlag,
    };

    const row = data.id
      ? await this.prisma.chemicalInventoryItem.update({
          where: { id: data.id },
          data: payload,
        })
      : await this.prisma.chemicalInventoryItem.create({ data: payload });

    await this.audit(
      'chemical_inventory',
      row.id,
      data.id ? 'updated' : 'created',
      actorId,
    );
    return row;
  }

  async scanChemicalDeficiencies(projectId: number, actorId?: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const now = new Date();
    const items = await this.prisma.chemicalInventoryItem.findMany({
      where: { OR: [{ projectId }, { siteId: project.siteId ?? -1 }] },
    });

    const storageIssues = this.compatibility.evaluateSiteInventory(items);
    const capas = [];

    for (const item of items) {
      if (item.chemicalExpiry && item.chemicalExpiry < now && this.capaAuto) {
        const capa = await this.capaAuto.fromDocumentDeficiency({
          companyId: project.companyId,
          projectId,
          siteId: item.siteId,
          sourceModule: 'sds_document',
          sourceId: item.sdsDocumentId ?? item.id,
          sourceItemId: item.id,
          title: `Expired chemical: ${item.productName ?? 'Unknown'}`,
          description: `Chemical expired on ${item.chemicalExpiry.toISOString()}`,
          severity: 'high',
          actorId: actorId ?? 1,
        });
        if (capa) capas.push(capa);
      }
      if (item.missingSdsFlag && this.capaAuto) {
        const capa = await this.capaAuto.fromDocumentDeficiency({
          companyId: project.companyId,
          projectId,
          siteId: item.siteId,
          sourceModule: 'sds_document',
          sourceId: item.id,
          sourceItemId: item.id,
          title: `Missing SDS: ${item.productName ?? 'Inventory item'}`,
          description: 'Chemical inventory item lacks a published SDS link',
          severity: 'high',
          actorId: actorId ?? 1,
        });
        if (capa) capas.push(capa);
      }
    }

    for (const issue of storageIssues) {
      if (this.capaAuto) {
        const capa = await this.capaAuto.fromDocumentDeficiency({
          companyId: project.companyId,
          projectId,
          sourceModule: 'sds_document',
          sourceId: issue.itemId,
          sourceItemId: issue.otherItemId,
          title: 'Incompatible chemical storage',
          description: issue.reason,
          severity: 'critical',
          actorId: actorId ?? 1,
        });
        if (capa) capas.push(capa);
      }
    }

    const expiredSds = await this.prisma.sdsDocument.findMany({
      where: {
        companyId: project.companyId,
        expiresAt: { lt: now },
        status: 'published',
        deletedAt: null,
      },
    });
    for (const sds of expiredSds) {
      if (this.capaAuto) {
        const capa = await this.capaAuto.fromDocumentDeficiency({
          companyId: project.companyId,
          projectId,
          sourceModule: 'sds_document',
          sourceId: sds.id,
          title: `Expired SDS: ${sds.productName}`,
          description: `SDS expired ${sds.expiresAt?.toISOString()}`,
          severity: 'medium',
          actorId: actorId ?? 1,
        });
        if (capa) capas.push(capa);
      }
    }

    return { storageIssues, capasCreated: capas.length, capas };
  }

  // ---------- Controlled documents ----------

  listControlledDocuments(filters: {
    companyId: number;
    projectId?: number;
    documentType?: PmControlledDocumentType;
    status?: PmDocumentStatus;
  }) {
    return this.prisma.pmControlledDocument.findMany({
      where: {
        companyId: filters.companyId,
        projectId: filters.projectId,
        documentType: filters.documentType,
        status: filters.status,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  async createControlledDocument(
    data: {
      companyId: number;
      projectId?: number;
      documentType: PmControlledDocumentType;
      title: string;
      description?: string;
      equipmentId?: number;
      requiresAck?: boolean;
      requiresAckForAccess?: boolean;
      metadataJson?: Record<string, unknown>;
      clientSyncId?: string;
    },
    actorId?: number,
  ) {
    const doc = await this.prisma.pmControlledDocument.create({
      data: {
        ...data,
        metadataJson: (data.metadataJson ?? {}) as Prisma.InputJsonValue,
        status: 'draft',
      },
    });
    await this.audit('controlled_document', doc.id, 'created', actorId);
    return doc;
  }

  async transitionControlledDocument(
    id: string,
    to: PmDocumentStatus,
    actorId?: number,
  ) {
    const doc = await this.prisma.pmControlledDocument.findFirst({
      where: { id, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');
    this.workflow.assertTransition(doc.status, to);

    const update: Prisma.PmControlledDocumentUpdateInput = { status: to };
    if (to === 'published') {
      Object.assign(update, this.workflow.publishFields());
      await this.prisma.pmDocumentVersion.create({
        data: {
          documentId: id,
          version: doc.versionNum,
          snapshot: doc as unknown as Prisma.InputJsonValue,
          authorId: actorId,
        },
      });
    }
    if (to === 'archived') update.deletedAt = new Date();

    const updated = await this.prisma.pmControlledDocument.update({
      where: { id },
      data: update,
    });
    await this.audit('controlled_document', id, `status_${to}`, actorId);
    return updated;
  }

  // ---------- Policies ----------

  listPolicies(companyId: number, projectId?: number) {
    return this.prisma.policyDocument.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(projectId !== undefined
          ? { OR: [{ projectId }, { projectId: null }] }
          : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });
  }

  async publishPolicy(id: string, actorId?: number) {
    const policy = await this.prisma.policyDocument.findUnique({
      where: { id },
    });
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.status !== 'published') {
      if (policy.status === 'draft') {
        this.workflow.assertTransition('draft', 'review');
        this.workflow.assertTransition('review', 'approved');
        this.workflow.assertTransition('approved', 'published');
      } else {
        this.workflow.assertTransition(policy.status, 'published');
      }
    }
    const updated = await this.prisma.policyDocument.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        requiresAck: true,
      },
    });
    await this.audit('policy', id, 'published', actorId);
    return updated;
  }

  async acknowledgeDocument(data: {
    workerId: number;
    sdsDocumentId?: string;
    controlledDocumentId?: string;
    policyDocumentId?: string;
    signatureData?: string;
    clientSyncId?: string;
    deviceId?: string;
  }) {
    if (
      !data.sdsDocumentId &&
      !data.controlledDocumentId &&
      !data.policyDocumentId
    ) {
      throw new BadRequestException('No document target for acknowledgment');
    }

    if (data.policyDocumentId) {
      await this.prisma.policyAcknowledgment.upsert({
        where: {
          policyDocumentId_workerId: {
            policyDocumentId: data.policyDocumentId,
            workerId: data.workerId,
          },
        },
        create: {
          policyDocumentId: data.policyDocumentId,
          workerId: data.workerId,
          signatureData: data.signatureData,
        },
        update: {
          acknowledgedAt: new Date(),
          signatureData: data.signatureData,
        },
      });
    }

    const ack = await this.prisma.pmDocumentAcknowledgment.create({
      data: {
        workerId: data.workerId,
        sdsDocumentId: data.sdsDocumentId,
        controlledDocumentId: data.controlledDocumentId,
        policyDocumentId: data.policyDocumentId,
        signatureData: data.signatureData,
        clientSyncId: data.clientSyncId,
      },
    });

    if (data.sdsDocumentId) {
      await this.audit('sds', data.sdsDocumentId, 'acknowledged', undefined, {
        workerId: data.workerId,
        deviceId: data.deviceId,
        acknowledgmentId: ack.id,
      });
    }

    return ack;
  }

  // ---------- Manufacturer instructions ----------

  listManufacturerInstructions(companyId: number, equipmentId?: number) {
    return this.prisma.pmManufacturerInstruction.findMany({
      where: { companyId, equipmentId, active: true },
      include: { equipment: { select: { id: true, name: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async createManufacturerInstruction(
    data: {
      companyId: number;
      equipmentId?: number;
      title: string;
      manufacturer?: string;
      modelNumber?: string;
      revisionDate?: Date;
      storageKey?: string;
      hazardHints?: string[];
      controlHints?: string[];
    },
    actorId?: number,
  ) {
    const doc = await this.prisma.pmControlledDocument.create({
      data: {
        companyId: data.companyId,
        documentType: 'manufacturer_instruction',
        title: data.title,
        equipmentId: data.equipmentId,
        status: 'published',
        publishedAt: new Date(),
        storageKey: data.storageKey,
      },
    });

    const mi = await this.prisma.pmManufacturerInstruction.create({
      data: {
        companyId: data.companyId,
        equipmentId: data.equipmentId,
        controlledDocId: doc.id,
        title: data.title,
        manufacturer: data.manufacturer,
        modelNumber: data.modelNumber,
        revisionDate: data.revisionDate,
        storageKey: data.storageKey,
        hazardHints: (data.hazardHints ?? []) as Prisma.InputJsonValue,
        controlHints: (data.controlHints ?? []) as Prisma.InputJsonValue,
      },
    });
    await this.audit('manufacturer_instruction', mi.id, 'created', actorId);
    return mi;
  }

  suggestControlsFromManufacturer(equipmentId: number) {
    return this.prisma.pmManufacturerInstruction.findMany({
      where: { equipmentId, active: true },
      select: { controlHints: true, hazardHints: true, title: true },
    });
  }

  // ---------- Site access ----------

  async workerAccessCheck(workerId: number, projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return { allowed: true, missingPolicyAcks: 0, missingSdsAcks: 0 };
    }

    const requiredPolicies = await this.prisma.policyDocument.findMany({
      where: {
        companyId: project.companyId,
        status: 'published',
        requiresAckForAccess: true,
        deletedAt: null,
        OR: [{ projectId }, { projectId: null }],
      },
      select: { id: true, title: true },
    });

    let missingPolicyAcks = 0;
    for (const p of requiredPolicies) {
      const ack = await this.prisma.policyAcknowledgment.findUnique({
        where: {
          policyDocumentId_workerId: {
            policyDocumentId: p.id,
            workerId,
          },
        },
      });
      if (!ack) missingPolicyAcks++;
    }

    const requiredSds = await this.prisma.sdsDocument.findMany({
      where: {
        companyId: project.companyId,
        status: 'published',
        requiresAck: true,
        deletedAt: null,
        OR: [{ projectId }, { projectId: null }],
      },
      select: { id: true },
    });

    let missingSdsAcks = 0;
    for (const sds of requiredSds) {
      const ack = await this.prisma.pmDocumentAcknowledgment.findFirst({
        where: { workerId, sdsDocumentId: sds.id },
      });
      if (!ack) missingSdsAcks++;
    }

    const allowed = missingPolicyAcks === 0 && missingSdsAcks === 0;
    return { allowed, missingPolicyAcks, missingSdsAcks };
  }

  // ---------- Analytics ----------

  async analytics(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 86400000);

    const [
      sdsTotal,
      sdsExpiringSoon,
      sdsExpired,
      inventoryCount,
      missingSds,
      expiredChemicals,
      policiesPublished,
      acks,
      controlledDocs,
      insights,
    ] = await Promise.all([
      this.prisma.sdsDocument.count({
        where: {
          companyId: project.companyId,
          deletedAt: null,
          OR: [{ projectId }, { projectId: null }],
        },
      }),
      this.prisma.sdsDocument.count({
        where: {
          companyId: project.companyId,
          expiresAt: { gte: now, lte: in30 },
          status: 'published',
        },
      }),
      this.prisma.sdsDocument.count({
        where: {
          companyId: project.companyId,
          expiresAt: { lt: now },
          status: 'published',
        },
      }),
      this.prisma.chemicalInventoryItem.count({
        where: { OR: [{ projectId }, { siteId: project.siteId ?? -1 }] },
      }),
      this.prisma.chemicalInventoryItem.count({
        where: {
          OR: [{ projectId }, { siteId: project.siteId ?? -1 }],
          missingSdsFlag: true,
        },
      }),
      this.prisma.chemicalInventoryItem.count({
        where: {
          OR: [{ projectId }, { siteId: project.siteId ?? -1 }],
          chemicalExpiry: { lt: now },
        },
      }),
      this.prisma.policyDocument.count({
        where: { companyId: project.companyId, status: 'published' },
      }),
      this.prisma.pmDocumentAcknowledgment.count(),
      this.prisma.pmControlledDocument.count({
        where: { companyId: project.companyId, deletedAt: null },
      }),
      this.cail.projectInsights(projectId),
    ]);

    const policyCompliance =
      policiesPublished > 0
        ? Math.round((acks / Math.max(1, policiesPublished * 10)) * 100)
        : 100;

    const hazardTrend = await this.prisma.sdsDocument.groupBy({
      by: ['category'],
      where: {
        companyId: project.companyId,
        deletedAt: null,
        status: 'published',
      },
      _count: true,
    });

    const sdsCompliancePct =
      sdsTotal > 0
        ? Math.round(((sdsTotal - sdsExpired) / sdsTotal) * 100)
        : 100;

    return {
      sdsTotal,
      sdsExpiringSoon,
      sdsExpired,
      inventoryCount,
      missingSds,
      expiredChemicals,
      policiesPublished,
      policyAckCompliancePct: Math.min(100, policyCompliance),
      sdsCompliancePct,
      controlledDocs,
      chemicalHazardTrend: hazardTrend,
      expiryTrends: {
        expiringSoon: sdsExpiringSoon,
        expired: sdsExpired,
      },
      leadingIndicators: {
        missingSdsRate: inventoryCount > 0 ? missingSds / inventoryCount : 0,
        expiredChemicalRate:
          inventoryCount > 0 ? expiredChemicals / inventoryCount : 0,
        sdsCompliancePct,
      },
      cailInsights: insights,
    };
  }

  // ---------- Offline sync ----------

  async syncBundle(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const [sds, inventory, policies, controlled, manufacturer] =
      await Promise.all([
        this.listSds({ companyId: project.companyId, projectId }),
        this.listChemicalInventory({ projectId }),
        this.listPolicies(project.companyId, projectId),
        this.listControlledDocuments({
          companyId: project.companyId,
          projectId,
          status: 'published',
        }),
        this.listManufacturerInstructions(project.companyId),
      ]);

    return {
      syncedAt: new Date().toISOString(),
      projectId,
      sds,
      inventory,
      policies,
      controlled,
      manufacturer,
    };
  }

  async applyOfflineSync(
    projectId: number,
    payload: {
      acknowledgments?: Array<{
        workerId: number;
        policyDocumentId?: string;
        sdsDocumentId?: string;
        controlledDocumentId?: string;
        signatureData?: string;
        clientSyncId?: string;
        acknowledgedAt?: string;
      }>;
      sdsCreates?: Array<{
        clientSyncId: string;
        productName: string;
        manufacturer?: string;
        category?: PmSdsCategory;
      }>;
    },
    actorId?: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const results: { acks: number; sds: number } = { acks: 0, sds: 0 };

    for (const ack of payload.acknowledgments ?? []) {
      const existing = ack.clientSyncId
        ? await this.prisma.pmDocumentAcknowledgment.findUnique({
            where: { clientSyncId: ack.clientSyncId },
          })
        : null;
      if (!existing) {
        await this.acknowledgeDocument(ack);
        results.acks++;
      }
    }

    for (const s of payload.sdsCreates ?? []) {
      const exists = await this.prisma.sdsDocument.findUnique({
        where: { clientSyncId: s.clientSyncId },
      });
      if (!exists) {
        await this.createSds(
          {
            companyId: project.companyId,
            projectId,
            productName: s.productName,
            manufacturer: s.manufacturer,
            category: s.category,
            clientSyncId: s.clientSyncId,
          },
          actorId,
        );
        results.sds++;
      }
    }

    return results;
  }

  /** Safety station payload: published SDS + emergency plans */
  async stationSyncPayload(companyId: number, siteId?: number) {
    const emergencyPlans = await this.prisma.pmControlledDocument.findMany({
      where: {
        companyId,
        documentType: 'emergency_plan',
        status: 'published',
        deletedAt: null,
      },
      take: 50,
    });
    const sds = await this.prisma.sdsDocument.findMany({
      where: {
        companyId,
        status: 'published',
        deletedAt: null,
      },
      include: { attachments: true },
      take: 500,
    });
    return {
      emergencyPlans,
      sds,
      siteId,
      generatedAt: new Date().toISOString(),
    };
  }
}
