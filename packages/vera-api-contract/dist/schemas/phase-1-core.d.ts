import { z } from 'zod';
export declare const AuthLoginBodySchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const AuthSessionSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodNumber;
        username: z.ZodString;
        email: z.ZodString;
        role: z.ZodString;
        trainingProviderId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        instructorId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        role: string;
        email: string;
        username: string;
        instructorId?: number | null | undefined;
        trainingProviderId?: number | null | undefined;
    }, {
        id: number;
        role: string;
        email: string;
        username: string;
        instructorId?: number | null | undefined;
        trainingProviderId?: number | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
        id: number;
        role: string;
        email: string;
        username: string;
        instructorId?: number | null | undefined;
        trainingProviderId?: number | null | undefined;
    };
}, {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: {
        id: number;
        role: string;
        email: string;
        username: string;
        instructorId?: number | null | undefined;
        trainingProviderId?: number | null | undefined;
    };
}>;
export declare const RefreshTokenBodySchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const ForgotPasswordBodySchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const ResetPasswordBodySchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export declare const OcrExtractedFieldsSchema: z.ZodObject<{
    workerName: z.ZodOptional<z.ZodString>;
    certificationName: z.ZodOptional<z.ZodString>;
    certificationCode: z.ZodOptional<z.ZodString>;
    issuedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    certificateNumber: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
    fieldConfidence: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    fieldConfidence: Record<string, number>;
    expiresAt?: string | undefined;
    certificateNumber?: string | undefined;
    issuedAt?: string | undefined;
    workerName?: string | undefined;
    certificationName?: string | undefined;
    certificationCode?: string | undefined;
}, {
    confidence: number;
    fieldConfidence: Record<string, number>;
    expiresAt?: string | undefined;
    certificateNumber?: string | undefined;
    issuedAt?: string | undefined;
    workerName?: string | undefined;
    certificationName?: string | undefined;
    certificationCode?: string | undefined;
}>;
export declare const TrainingIngestionRunSchema: z.ZodObject<{
    id: z.ZodNumber;
    companyId: z.ZodNumber;
    status: z.ZodString;
    sourceChannel: z.ZodString;
    sourceMime: z.ZodString;
    originalFilename: z.ZodString;
    sizeBytes: z.ZodNumber;
    ocrText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ocrExtracted: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        workerName: z.ZodOptional<z.ZodString>;
        certificationName: z.ZodOptional<z.ZodString>;
        certificationCode: z.ZodOptional<z.ZodString>;
        issuedAt: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        certificateNumber: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        fieldConfidence: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        fieldConfidence: Record<string, number>;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        issuedAt?: string | undefined;
        workerName?: string | undefined;
        certificationName?: string | undefined;
        certificationCode?: string | undefined;
    }, {
        confidence: number;
        fieldConfidence: Record<string, number>;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        issuedAt?: string | undefined;
        workerName?: string | undefined;
        certificationName?: string | undefined;
        certificationCode?: string | undefined;
    }>>>;
    ocrConfidence: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    createdAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    companyId: number;
    id: number;
    createdAt: Date;
    sizeBytes: number;
    sourceChannel: string;
    sourceMime: string;
    originalFilename: string;
    completedAt?: Date | null | undefined;
    ocrText?: string | null | undefined;
    ocrExtracted?: {
        confidence: number;
        fieldConfidence: Record<string, number>;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        issuedAt?: string | undefined;
        workerName?: string | undefined;
        certificationName?: string | undefined;
        certificationCode?: string | undefined;
    } | null | undefined;
    ocrConfidence?: number | null | undefined;
}, {
    status: string;
    companyId: number;
    id: number;
    createdAt: Date;
    sizeBytes: number;
    sourceChannel: string;
    sourceMime: string;
    originalFilename: string;
    completedAt?: Date | null | undefined;
    ocrText?: string | null | undefined;
    ocrExtracted?: {
        confidence: number;
        fieldConfidence: Record<string, number>;
        expiresAt?: string | undefined;
        certificateNumber?: string | undefined;
        issuedAt?: string | undefined;
        workerName?: string | undefined;
        certificationName?: string | undefined;
        certificationCode?: string | undefined;
    } | null | undefined;
    ocrConfidence?: number | null | undefined;
}>;
export declare const TrainingVerificationQueueItemSchema: z.ZodObject<{
    id: z.ZodNumber;
    outcome: z.ZodString;
    trainingRecordId: z.ZodNullable<z.ZodNumber>;
    validatedAt: z.ZodDate;
    trainingRecord: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        workerId: z.ZodNumber;
        worker: z.ZodObject<{
            id: z.ZodNumber;
            firstName: z.ZodString;
            lastName: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            firstName: string;
            lastName: string;
            id: number;
        }, {
            firstName: string;
            lastName: string;
            id: number;
        }>;
        certification: z.ZodObject<{
            id: z.ZodNumber;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: number;
            name: string;
        }, {
            id: number;
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        workerId: number;
        worker: {
            firstName: string;
            lastName: string;
            id: number;
        };
        certification: {
            id: number;
            name: string;
        };
    }, {
        id: number;
        workerId: number;
        worker: {
            firstName: string;
            lastName: string;
            id: number;
        };
        certification: {
            id: number;
            name: string;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    id: number;
    trainingRecordId: number | null;
    outcome: string;
    validatedAt: Date;
    trainingRecord?: {
        id: number;
        workerId: number;
        worker: {
            firstName: string;
            lastName: string;
            id: number;
        };
        certification: {
            id: number;
            name: string;
        };
    } | undefined;
}, {
    id: number;
    trainingRecordId: number | null;
    outcome: string;
    validatedAt: Date;
    trainingRecord?: {
        id: number;
        workerId: number;
        worker: {
            firstName: string;
            lastName: string;
            id: number;
        };
        certification: {
            id: number;
            name: string;
        };
    } | undefined;
}>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type TrainingIngestionRun = z.infer<typeof TrainingIngestionRunSchema>;
