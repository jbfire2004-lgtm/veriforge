import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // CREATE INSPECTION
  // ---------------------------------------------------------
  async createInspection(data: {
    equipmentId: number;
    supervisorId: number;
    checklist: { item: string; passed: boolean }[];
  }) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: data.equipmentId },
    });

    if (!equipment) throw new NotFoundException('Equipment not found');

    const failed = data.checklist.filter((c) => !c.passed);

    const inspection = await this.prisma.inspection.create({
      data: {
        equipmentId: data.equipmentId,
        supervisorId: data.supervisorId,
        status: failed.length === 0 ? 'PASSED' : 'FAILED',
        notes: JSON.stringify(data.checklist),
      },
    });

    // Auto‑generate incident if failed
    if (failed.length > 0) {
      await this.prisma.incident.create({
        data: {
          equipmentId: data.equipmentId,
          title: 'Failed Pre‑Use Inspection',
          description: `Failed items: ${failed.map((f) => f.item).join(', ')}`,
          severity: 'MEDIUM',
        },
      });
    }

    return inspection;
  }

  // ---------------------------------------------------------
  // LIST INSPECTIONS FOR EQUIPMENT
  // ---------------------------------------------------------
  async getEquipmentInspections(equipmentId: number) {
    return this.prisma.inspection.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
