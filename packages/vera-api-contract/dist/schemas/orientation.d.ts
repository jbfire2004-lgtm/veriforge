import { z } from "zod";
export declare const OrientationPackageTypeSchema: z.ZodEnum<["UPLOAD", "AI_GENERATED"]>;
export declare const OrientationSectionBlockSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    body: string;
    title: string;
}, {
    type: string;
    id: string;
    body: string;
    title: string;
}>;
export declare const OrientationQuizQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    prompt: z.ZodString;
    choices: z.ZodArray<z.ZodString, "many">;
    answerIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompt: string;
    choices: string[];
    answerIndex: number;
}, {
    id: string;
    prompt: string;
    choices: string[];
    answerIndex: number;
}>;
export declare const OrientationPackageSchema: z.ZodObject<{
    id: z.ZodString;
    companyId: z.ZodNullable<z.ZodNumber>;
    projectId: z.ZodNullable<z.ZodNumber>;
    type: z.ZodEnum<["UPLOAD", "AI_GENERATED"]>;
    title: z.ZodString;
    languages: z.ZodArray<z.ZodString, "many">;
    version: z.ZodNumber;
    isPublished: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "UPLOAD" | "AI_GENERATED";
    companyId: number | null;
    id: string;
    projectId: number | null;
    createdAt: string;
    updatedAt: string;
    title: string;
    version: number;
    languages: string[];
    isPublished: boolean;
}, {
    type: "UPLOAD" | "AI_GENERATED";
    companyId: number | null;
    id: string;
    projectId: number | null;
    createdAt: string;
    updatedAt: string;
    title: string;
    version: number;
    languages: string[];
    isPublished: boolean;
}>;
export declare const OrientationWorkerProgressSchema: z.ZodObject<{
    id: z.ZodString;
    packageId: z.ZodString;
    workerId: z.ZodNumber;
    versionNumber: z.ZodNumber;
    languageCode: z.ZodString;
    status: z.ZodString;
    quizScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    certificateId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    id: string;
    workerId: number;
    packageId: string;
    versionNumber: number;
    languageCode: string;
    quizScore?: number | null | undefined;
    certificateId?: string | null | undefined;
}, {
    status: string;
    id: string;
    workerId: number;
    packageId: string;
    versionNumber: number;
    languageCode: string;
    quizScore?: number | null | undefined;
    certificateId?: string | null | undefined;
}>;
export type OrientationPackage = z.infer<typeof OrientationPackageSchema>;
export type OrientationSectionBlock = z.infer<typeof OrientationSectionBlockSchema>;
