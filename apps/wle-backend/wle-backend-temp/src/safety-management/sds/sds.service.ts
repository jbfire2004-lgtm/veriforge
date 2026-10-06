import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SdsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDocuments(companyId: number, search?: string) {
    return this.prisma.sdsDocument.findMany({
      where: {
        companyId,
        ...(search
          ? { productName: { contains: search, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { productName: 'asc' },
      take: 200,
    });
  }

  async createDocument(data: {
    companyId: number;
    productName: string;
    manufacturer?: string;
    casNumbers?: string[];
    hazardClasses?: string[];
    storageKey?: string;
    revisionDate?: Date;
    expiresAt?: Date;
  }) {
    return this.prisma.sdsDocument.create({
      data: {
        companyId: data.companyId,
        productName: data.productName,
        manufacturer: data.manufacturer,
        casNumbers: (data.casNumbers ?? []) as Prisma.InputJsonValue,
        hazardClasses: (data.hazardClasses ?? []) as Prisma.InputJsonValue,
        storageKey: data.storageKey,
        revisionDate: data.revisionDate,
        expiresAt: data.expiresAt,
      },
    });
  }

  async getDocument(id: string) {
    const doc = await this.prisma.sdsDocument.findUnique({
      where: { id },
      include: {
        inventory: { include: { site: { select: { id: true, name: true } } } },
      },
    });
    if (!doc) throw new NotFoundException('SDS document not found');
    return doc;
  }

  async addInventoryItem(data: {
    companyId: number;
    siteId: number;
    projectId?: number;
    sdsDocumentId?: string;
    productName?: string;
    quantity?: number;
    unit?: string;
    locationNote?: string;
    containerSize?: string;
    storageClass?: string;
    chemicalExpiry?: Date;
  }) {
    let missingSdsFlag = !data.sdsDocumentId;
    if (data.sdsDocumentId) {
      const sds = await this.prisma.sdsDocument.findUnique({
        where: { id: data.sdsDocumentId },
      });
      if (!sds || sds.status !== 'published') missingSdsFlag = true;
    }
    return this.prisma.chemicalInventoryItem.create({
      data: {
        companyId: data.companyId,
        siteId: data.siteId,
        projectId: data.projectId,
        sdsDocumentId: data.sdsDocumentId,
        productName: data.productName,
        quantity: data.quantity,
        unit: data.unit,
        locationNote: data.locationNote,
        containerSize: data.containerSize,
        storageClass: data.storageClass,
        chemicalExpiry: data.chemicalExpiry,
        missingSdsFlag,
      },
    });
  }

  async listPolicies(companyId: number) {
    return this.prisma.policyDocument.findMany({
      where: { companyId },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    });
  }

  async createPolicy(data: {
    companyId: number;
    title: string;
    version?: string;
    storageKey?: string;
    category?: string;
  }) {
    return this.prisma.policyDocument.create({ data });
  }

  async acknowledgePolicy(data: {
    policyDocumentId: string;
    workerId: number;
    signatureData?: string;
  }) {
    return this.prisma.policyAcknowledgment.upsert({
      where: {
        policyDocumentId_workerId: {
          policyDocumentId: data.policyDocumentId,
          workerId: data.workerId,
        },
      },
      create: data,
      update: {
        acknowledgedAt: new Date(),
        signatureData: data.signatureData,
      },
    });
  }
}
