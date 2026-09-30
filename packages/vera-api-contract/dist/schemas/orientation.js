"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationWorkerProgressSchema = exports.OrientationPackageSchema = exports.OrientationQuizQuestionSchema = exports.OrientationSectionBlockSchema = exports.OrientationPackageTypeSchema = void 0;
const zod_1 = require("zod");
exports.OrientationPackageTypeSchema = zod_1.z.enum(["UPLOAD", "AI_GENERATED"]);
exports.OrientationSectionBlockSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
});
exports.OrientationQuizQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    prompt: zod_1.z.string(),
    choices: zod_1.z.array(zod_1.z.string()),
    answerIndex: zod_1.z.number(),
});
exports.OrientationPackageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    companyId: zod_1.z.number().nullable(),
    projectId: zod_1.z.number().nullable(),
    type: exports.OrientationPackageTypeSchema,
    title: zod_1.z.string(),
    languages: zod_1.z.array(zod_1.z.string()),
    version: zod_1.z.number(),
    isPublished: zod_1.z.boolean(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.OrientationWorkerProgressSchema = zod_1.z.object({
    id: zod_1.z.string(),
    packageId: zod_1.z.string(),
    workerId: zod_1.z.number(),
    versionNumber: zod_1.z.number(),
    languageCode: zod_1.z.string(),
    status: zod_1.z.string(),
    quizScore: zod_1.z.number().nullable().optional(),
    certificateId: zod_1.z.string().nullable().optional(),
});
