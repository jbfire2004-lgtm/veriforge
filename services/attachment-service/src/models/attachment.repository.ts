import { prisma } from '../db/prisma';

export interface CreateAttachmentInput {
  id?: string;
  companyId: string;
  projectId?: string;
  moduleType: string;
  moduleRecordId: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  thumbnailPath?: string;
  uploadedBy: string;
}

function toDto(row: {
  id: string;
  companyId: string;
  projectId: string | null;
  moduleType: string;
  moduleRecordId: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}) {
  return {
    id: row.id,
    companyId: row.companyId,
    projectId: row.projectId,
    moduleType: row.moduleType,
    moduleRecordId: row.moduleRecordId,
    fileType: row.fileType,
    fileSize: row.fileSize,
    uploadedBy: row.uploadedBy,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

export const attachmentRepository = {
  create(input: CreateAttachmentInput) {
    const { id, ...data } = input;
    return prisma.attachment.create({
      data: id ? { id, ...data } : data,
    });
  },

  async findById(id: string, companyId: string) {
    const row = await prisma.attachment.findFirst({ where: { id, companyId } });
    return row;
  },

  toDto,
};
