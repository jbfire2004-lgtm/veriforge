import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../../db';
import { uploadToS3 } from '../../services/s3';
import { parseTrainingSpreadsheet } from '../../services/trainingImport'; // implement as needed

export const uploadRouter = createTRPCRouter({
  uploadBase64: protectedProcedure
    .input(
      z.object({
        workerId: z.string().optional(),
        companyId: z.string().optional(),
        equipmentId: z.string().optional(),
        base64: z.string(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, 'base64');
      const url = await uploadToS3(buffer, input.filename);

      return prisma.document.create({
        data: {
          name: input.filename,
          url,
          workerId: input.workerId ? Number(input.workerId) : null,
          companyId: input.companyId ? Number(input.companyId) : null,
          equipmentId: input.equipmentId ? Number(input.equipmentId) : null,
          type: 'TRAINING',
        },
      });
    }),

  uploadPDF: protectedProcedure
    .input(
      z.object({
        workerId: z.string().optional(),
        companyId: z.string().optional(),
        equipmentId: z.string().optional(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await (ctx as any).req.file();
      const buffer = await file.toBuffer();
      const url = await uploadToS3(buffer, input.filename);

      return prisma.document.create({
        data: {
          name: input.filename,
          url,
          workerId: input.workerId ? Number(input.workerId) : null,
          companyId: input.companyId ? Number(input.companyId) : null,
          equipmentId: input.equipmentId ? Number(input.equipmentId) : null,
          type: 'TRAINING',
        },
      });
    }),

  uploadScanner: protectedProcedure
    .input(
      z.object({
        workerId: z.string().optional(),
        companyId: z.string().optional(),
        equipmentId: z.string().optional(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await (ctx as any).req.file();
      const buffer = await file.toBuffer();
      const url = await uploadToS3(buffer, input.filename);

      return prisma.document.create({
        data: {
          name: input.filename,
          url,
          workerId: input.workerId ? Number(input.workerId) : null,
          companyId: input.companyId ? Number(input.companyId) : null,
          equipmentId: input.equipmentId ? Number(input.equipmentId) : null,
          type: 'TRAINING',
        },
      });
    }),

  uploadBulkTraining: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const file = await (ctx as any).req.file();
      const buffer = await file.toBuffer();

      const url = await uploadToS3(buffer, input.filename);
      const rows = await parseTrainingSpreadsheet(buffer);

      const results = await Promise.all(
        rows.map(async (row: any) => {
          const worker = await prisma.worker.findFirst({
            where: { email: row.email },
          });
          if (!worker) return null;

          const cert = await prisma.certification.findFirst({
            where: { name: { equals: row.courseName, mode: 'insensitive' } },
          });
          if (!cert) return null;

          return prisma.trainingRecord.create({
            data: {
              workerId: worker.id,
              companyId: Number(input.companyId),
              certificationId: cert.id,
              completedAt: row.completedAt ? new Date(row.completedAt) : null,
              expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
              certificateUrl: url,
            },
          });
        }),
      );

      return { uploaded: results.filter(Boolean).length };
    }),
});
