import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class SafetyFormAttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async add(
    formId: string,
    input: {
      fieldId?: string;
      fileName: string;
      mimeType?: string;
      dataUrl?: string;
      storageKey?: string;
      sizeBytes?: number;
    },
  ) {
    return this.prisma.safetyFormAttachment.create({
      data: { formId, ...input },
    });
  }

  async list(formId: string) {
    return this.prisma.safetyFormAttachment.findMany({
      where: { formId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(formId: string, attachmentId: string) {
    const row = await this.prisma.safetyFormAttachment.findFirst({
      where: { id: attachmentId, formId },
    });
    if (!row) {
      throw new NotFoundException('Attachment not found');
    }
    await this.prisma.safetyFormAttachment.delete({
      where: { id: attachmentId },
    });
    return { ok: true, id: attachmentId };
  }
}
