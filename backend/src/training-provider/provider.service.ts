import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingLegislationEngine } from './provider.legislation';

@Injectable()
export class ProviderService {
  private legislation = new TrainingLegislationEngine();

  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // UPLOAD TRAINING PROGRAM
  // ---------------------------------------------------------
  async uploadProgram(data: {
    providerName: string;
    programName: string;
    description?: string;
    content: string; // raw text or extracted PDF text
  }) {
    return this.prisma.document.create({
      data: {
        type: 'TRAINING_PROGRAM',
        name: data.programName,
        description: data.description ?? null,
        url: '',

        // FIXED: cannot use connectOrCreate because name is not unique
        company: {
          create: {
            name: data.providerName,
          },
        },
      },
    });
  }

  // ---------------------------------------------------------
  // LIST PROVIDER PROGRAMS
  // ---------------------------------------------------------
  async listPrograms(providerName: string) {
    return this.prisma.document.findMany({
      where: {
        type: 'TRAINING_PROGRAM',
        company: { name: providerName },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // GET PROGRAM DETAILS
  // ---------------------------------------------------------
  async getProgram(id: number) {
    const program = await this.prisma.document.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  // ---------------------------------------------------------
  // RUN LEGISLATION COMPLIANCE CHECK
  // ---------------------------------------------------------
  async assessProgram(content: string) {
    return this.legislation.assessProgram(content);
  }

  // ---------------------------------------------------------
  // FULL GAP REPORT
  // ---------------------------------------------------------
  async generateGapReport(programId: number, content: string) {
    const program = await this.getProgram(programId);
    const assessment = this.legislation.assessProgram(content);

    return {
      program,
      assessment,
      status: assessment.passed ? 'APPROVED' : 'REQUIRES_CHANGES',
    };
  }
}
