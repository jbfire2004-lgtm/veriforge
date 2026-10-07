import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingRequirementsService {
  constructor(private prisma: PrismaService) {}

  // GET all requirements for a company
  async getCompanyRequirements(companyId: number) {
    return this.prisma.trainingRequirement.findMany({
      where: { companyId },
      orderBy: { courseName: 'asc' },
    });
  }

  // CREATE or REPLACE requirements for a company
  async setCompanyRequirements(
    companyId: number,
    requirements: { courseName: string; expiresInDays: number }[],
  ) {
    // Clear old requirements
    await this.prisma.trainingRequirement.deleteMany({
      where: { companyId },
    });

    // Insert new ones
    return this.prisma.trainingRequirement.createMany({
      data: requirements.map((r) => ({
        companyId,
        courseName: r.courseName,
        expiresInDays: r.expiresInDays,
      })),
    });
  }

  // UPDATE a single requirement
  async updateRequirement(
    id: number,
    data: Partial<{ courseName: string; expiresInDays: number }>,
  ) {
    const existing = await this.prisma.trainingRequirement.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Requirement not found');

    return this.prisma.trainingRequirement.update({
      where: { id },
      data,
    });
  }

  // DELETE a requirement
  async removeRequirement(id: number) {
    const existing = await this.prisma.trainingRequirement.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Requirement not found');

    await this.prisma.trainingRequirement.delete({ where: { id } });

    return { status: 'ok', deletedId: id };
  }
}
