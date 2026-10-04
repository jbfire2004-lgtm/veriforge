import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VerifyService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // USER → WORKER → CREDENTIALS + TRAINING + COMPANY
  // ---------------------------------------------------------
  async verifyUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        worker: {
          include: {
            company: true,
            credentials: {
              include: { certification: true },
            },
            trainingRecords: {
              include: { certification: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const now = new Date();

    const validCredentials =
      user.worker?.credentials.filter((c) => c.expiresAt > now) ?? [];

    const expiredCredentials =
      user.worker?.credentials.filter((c) => c.expiresAt <= now) ?? [];

    return {
      userId: user.id,
      email: user.email,
      worker: user.worker,
      validCredentials,
      expiredCredentials,
      trainingRecords: user.worker?.trainingRecords ?? [],
    };
  }

  // ---------------------------------------------------------
  // USER TRAINING RECORDS ONLY
  // ---------------------------------------------------------
  async getUserTraining(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        worker: {
          include: {
            trainingRecords: {
              include: { certification: true },
            },
          },
        },
      },
    });

    if (!user || !user.worker)
      throw new NotFoundException('Worker not found for this user');

    return {
      userId: user.id,
      workerId: user.worker.id,
      trainingRecords: user.worker.trainingRecords,
    };
  }

  // ---------------------------------------------------------
  // SINGLE CREDENTIAL LOOKUP
  // ---------------------------------------------------------
  async verifyCredential(credentialId: number) {
    const credential = await this.prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        worker: true,
        certification: true,
      },
    });

    if (!credential) throw new NotFoundException('Credential not found');

    const now = new Date();

    return {
      credentialId,
      worker: credential.worker,
      certification: credential.certification,
      issuedOn: credential.issuedAt,
      expiresOn: credential.expiresAt,
      status: credential.expiresAt > now ? 'VALID' : 'EXPIRED',
    };
  }
}
