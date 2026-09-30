import { z } from "zod";

export const OrientationPackageTypeSchema = z.enum(["UPLOAD", "AI_GENERATED"]);

export const OrientationSectionBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
});

export const OrientationQuizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()),
  answerIndex: z.number(),
});

export const OrientationPackageSchema = z.object({
  id: z.string(),
  companyId: z.number().nullable(),
  projectId: z.number().nullable(),
  type: OrientationPackageTypeSchema,
  title: z.string(),
  languages: z.array(z.string()),
  version: z.number(),
  isPublished: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OrientationWorkerProgressSchema = z.object({
  id: z.string(),
  packageId: z.string(),
  workerId: z.number(),
  versionNumber: z.number(),
  languageCode: z.string(),
  status: z.string(),
  quizScore: z.number().nullable().optional(),
  certificateId: z.string().nullable().optional(),
});

export type OrientationPackage = z.infer<typeof OrientationPackageSchema>;
export type OrientationSectionBlock = z.infer<typeof OrientationSectionBlockSchema>;
