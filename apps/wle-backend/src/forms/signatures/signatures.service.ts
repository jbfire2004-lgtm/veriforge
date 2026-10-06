import { Injectable } from '@nestjs/common';
import { SafetyFormSignatureRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SafetyFormSignaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async capture(
    formId: string,
    input: {
      fieldId?: string;
      role?: SafetyFormSignatureRole;
      signerName?: string;
      signerUserId?: number;
      signatureData: string;
    },
  ) {
    return this.prisma.safetyFormSignature.create({
      data: {
        formId,
        fieldId: input.fieldId,
        role: input.role ?? 'WORKER',
        signerName: input.signerName,
        signerUserId: input.signerUserId,
        signatureData: input.signatureData,
      },
    });
  }

  async list(formId: string) {
    return this.prisma.safetyFormSignature.findMany({
      where: { formId },
      orderBy: { signedAt: 'asc' },
    });
  }
}
