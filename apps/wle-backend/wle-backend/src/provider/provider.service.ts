import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProviderService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // PROVIDER ACCOUNT
  // ---------------------------------------------------------
  async register(data: { name: string; email: string; password: string }) {
    const hash = await bcrypt.hash(data.password, 10);

    return this.prisma.trainingProvider.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
      },
    });
  }

  async login(email: string, password: string) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { email },
    });

    if (!provider) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, provider.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return provider;
  }

  // ---------------------------------------------------------
  // PROGRAM UPLOAD
  // ---------------------------------------------------------
  async uploadProgram(providerId: number, data: { name: string; description?: string; content: any }) {
    return this.prisma.trainingProgram.create({
      data: {
        providerId,
        name: data.name,
        description: data.description ?? null,
        content: data.content,
      },
    });
  }

  // ---------------------------------------------------------
  // LIST PROVIDER PROGRAMS
  // ---------------------------------------------------------
  async listPrograms(providerId: number) {
    return this.prisma.trainingProgram.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------
  // CREATE CLASS
  // ---------------------------------------------------------
  async createClass(providerId: number, data: { programId: number; date: Date; location?: string; capacity?: number }) {
    return this.prisma.trainingClass.create({
      data: {
        providerId,
        programId: data.programId,
        date: data.date,
        location: data.location ?? null,
        capacity: data.capacity ?? null,
      },
    });
  }

  // ---------------------------------------------------------
  // LIST CLASSES
  // ---------------------------------------------------------
  async listClasses(providerId: number) {
    return this.prisma.trainingClass.findMany({
      where: { providerId },
      include: { program: true },
      orderBy: { date: 'asc' },
    });
  }

  // ---------------------------------------------------------
  // ISSUE CREDENTIAL
  // ---------------------------------------------------------
  async issueCredential(providerId: number, data: { workerId: number; programId: number; expiresAt?: Date }) {
    return this.prisma.issuedCredential.create({
      data: {
        providerId,
        workerId: data.workerId,
        programId: data.programId,
        expiresAt: data.expiresAt ?? null,
      },
    });
  }

  // ---------------------------------------------------------
  // PROVIDER DASHBOARD SUMMARY
  // ---------------------------------------------------------
  async dashboard(providerId: number) {
    const [programs, classes, credentials] = await Promise.all([
      this.prisma.trainingProgram.count({ where: { providerId } }),
      this.prisma.trainingClass.count({ where: { providerId } }),
      this.prisma.issuedCredential.count({ where: { providerId } }),
    ]);

    return {
      programs,
      classes,
      credentials,
    };
  }
}
